/**
 * POST /api/external/upload-init — émet un jeton d'upload après vérification email (+ lead/contact).
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const { createUploadToken } = require("../upload-token");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("ext-upload-init:" + ip, 20, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const email = body.email ? String(body.email).trim().toLowerCase() : "";
  const leadId = body.leadId || body.lead_id || null;
  const contactId = body.contactId || body.contact_id || null;

  if (!email) return res.status(400).json({ error: "email requis" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    var contact = null;
    if (contactId) {
      const rows = await sql`
        SELECT id, email FROM crm_contacts WHERE id = ${contactId} LIMIT 1
      `;
      contact = rows[0] || null;
      if (contact && String(contact.email).toLowerCase() !== email) {
        return res.status(403).json({ error: "Email et contact incoherents" });
      }
    } else {
      const rows = await sql`
        SELECT id, email FROM crm_contacts WHERE LOWER(email) = ${email} LIMIT 1
      `;
      contact = rows[0] || null;
    }

    if (!contact && leadId) {
      const leads = await sql`
        SELECT id, email, contact_id FROM site_leads WHERE id = ${leadId} LIMIT 1
      `;
      if (leads.length && String(leads[0].email || "").toLowerCase() === email) {
        if (leads[0].contact_id) {
          const c2 = await sql`SELECT id, email FROM crm_contacts WHERE id = ${leads[0].contact_id} LIMIT 1`;
          contact = c2[0] || null;
        }
      }
    }

    if (!contact) {
      return res.status(404).json({
        error: "dossier_introuvable",
        message: "Aucun dossier pour cet e-mail. Envoyez d'abord le formulaire de simulation avec votre e-mail.",
      });
    }

    const token = createUploadToken({
      email: contact.email,
      contactId: contact.id,
      leadId: leadId,
      need: body.need || body.vertical,
    });

    return res.status(200).json({
      ok: true,
      uploadToken: token,
      contactId: contact.id,
      email: contact.email,
      expiresIn: "72h",
    });
  } catch (e) {
    console.error("[external/upload-init]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
