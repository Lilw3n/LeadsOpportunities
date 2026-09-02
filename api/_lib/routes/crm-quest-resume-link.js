/**
 * POST /api/crm/quest-resume-link
 * Génère un lien client (JWT 14 j) et optionnellement l’envoie par e-mail.
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const {
  signResumeToken,
  publicResumeUrl,
  sendQuestionnaireResumeEmail,
} = require("../quest-resume");

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

  const user = await requireCrm(req, res);
  if (!user) return;

  const parsed = parseJsonBody(req, 32 * 1024);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données non configurée" });

  var leadId = body.leadId || body.lead_id || null;
  var contactId = body.contactId || body.contact_id || null;

  try {
    var lead = null;
    if (leadId) {
      var rows = await sql`
        SELECT id, email, phone, vertical, payload, contact_id
        FROM site_leads WHERE id = ${leadId} LIMIT 1
      `;
      if (rows.length) lead = rows[0];
    }
    if (!lead && contactId) {
      var byCt = await sql`
        SELECT id, email, phone, vertical, payload, contact_id
        FROM site_leads WHERE contact_id = ${contactId}
        ORDER BY updated_at DESC NULLS LAST, created_at DESC
        LIMIT 1
      `;
      if (byCt.length) lead = byCt[0];
    }
    if (!lead) {
      return res.status(404).json({ error: "Questionnaire introuvable pour ce contact" });
    }

    leadId = lead.id;
    contactId = contactId || lead.contact_id || null;
    var payload = parsePayload(lead.payload);
    var vertical = lead.vertical || payload.vertical || payload.need || "";
    var email = String(body.email || lead.email || payload.email || "").trim().toLowerCase();
    var firstName = payload.firstName || payload.first_name || payload.prenom || "";

    var token = signResumeToken({
      leadId: leadId,
      contactId: contactId,
      vertical: vertical,
    });
    var url = publicResumeUrl({ token: token, vertical: vertical, leadId: leadId, contactId: contactId });

    var emailed = false;
    var emailReason = null;
    if (body.sendEmail === true || body.sendEmail === "1") {
      if (!email) {
        emailReason = "no_email";
      } else {
        var sent = await sendQuestionnaireResumeEmail({
          email: email,
          firstName: firstName,
          url: url,
          token: token,
          vertical: vertical,
        });
        emailed = !!sent.ok;
        emailReason = sent.ok ? null : sent.reason || "send_failed";
      }
    }

    return res.status(200).json({
      ok: true,
      url: url,
      leadId: leadId,
      contactId: contactId,
      emailed: emailed,
      emailReason: emailReason,
      expiresInDays: 14,
    });
  } catch (e) {
    console.error("[crm/quest-resume-link]", e);
    return res.status(500).json({ error: "Impossible de créer le lien" });
  }
};
