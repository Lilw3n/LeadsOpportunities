/**
 * GET /api/crm/resume-link?leadId=&contactId=&hat=
 * Génère un lien de reprise signé (sans e-mail / téléphone dans l’URL).
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { signResumeToken, tokenExpiresAt, buildPublicResumeUrl, resumeLandingFromVertical } = require("../resume-link-token");

module.exports = async function crmResumeLink(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  var leadId = req.query.leadId ? String(req.query.leadId).trim() : "";
  var contactId = req.query.contactId ? String(req.query.contactId).trim() : "";
  var hat = req.query.hat ? String(req.query.hat).trim() : "";
  if (!leadId) return res.status(400).json({ error: "leadId requis" });

  var sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données indisponible" });

  try {
    var rows = await sql`
      SELECT id, vertical, payload
      FROM site_leads
      WHERE id = ${leadId}
      LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: "Dossier introuvable" });

    var lead = rows[0];
    var landing = resumeLandingFromVertical(lead.vertical, hat);
    var token = signResumeToken({
      leadId: lead.id,
      contactId: contactId || null,
      hat: landing.hat || hat || null,
      purpose: "conseiller",
    });
    var url = buildPublicResumeUrl(token, {
      purpose: "conseiller",
      vertical: lead.vertical,
      hat: landing.hat || hat,
    });
    return res.status(200).json({
      ok: true,
      url: url,
      expiresAt: tokenExpiresAt(token),
      hat: landing.hat || null,
    });
  } catch (e) {
    console.error("[crm/resume-link]", e);
    return res.status(500).json({ error: "Impossible de générer le lien de reprise" });
  }
};
