/**
 * POST /api/external/quest-resume
 * Reprise questionnaire via jeton + confirmation e-mail ou téléphone.
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const { verifyResumeToken, identityMatches, identityOnFile } = require("../quest-resume");
const resumeDeposit = require("./external-resume-deposit");

function parsePayload(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("ext-quest-resume:" + ip, 20, 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de tentatives — réessayez dans un instant." });

  const parsed = parseJsonBody(req, 16 * 1024);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const token = body.token || body.qr || "";
  const decoded = verifyResumeToken(token);
  if (!decoded) {
    return res.status(400).json({ ok: false, error: "Lien invalide ou expiré. Demandez un nouveau lien à votre conseiller." });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données indisponible" });

  try {
    const rows = await sql`
      SELECT id, email, phone, vertical, payload, contact_id
      FROM site_leads WHERE id = ${decoded.leadId} LIMIT 1
    `;
    if (!rows.length) {
      return res.status(404).json({ ok: false, error: "Dossier introuvable." });
    }
    const lead = rows[0];
    const payload = parsePayload(lead.payload);
    const fileEmail = lead.email || payload.email || "";
    const filePhone = lead.phone || payload.phone || "";
    const needsIdentity = identityOnFile({ email: fileEmail, phone: filePhone });

    if (needsIdentity && !identityMatches({ email: fileEmail, phone: filePhone }, { email: body.email, phone: body.phone })) {
      return res.status(403).json({
        ok: false,
        code: "identity_mismatch",
        needsIdentity: true,
        error: "E-mail ou téléphone ne correspondent pas à ce dossier. Vérifiez que vous ouvrez le bon lien.",
      });
    }

    var draft = null;
    if (typeof resumeDeposit.buildDraftFromLeadPayload === "function") {
      draft = resumeDeposit.buildDraftFromLeadPayload(payload, lead);
    }

    return res.status(200).json({
      ok: true,
      found: true,
      leadId: lead.id,
      contactId: lead.contact_id || decoded.contactId || null,
      email: fileEmail || "",
      phone: filePhone || "",
      firstName: payload.firstName || payload.first_name || payload.prenom || "",
      lastName: payload.lastName || payload.last_name || payload.nom || "",
      vertical: lead.vertical || payload.vertical || payload.need || decoded.vertical || "",
      payload: payload,
      draft: draft,
      message: "Dossier repris — confirmez les informations puis continuez.",
    });
  } catch (e) {
    console.error("[external/quest-resume]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
