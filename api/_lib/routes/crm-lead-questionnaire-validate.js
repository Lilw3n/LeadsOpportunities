/**
 * GET  /api/crm/lead-questionnaire-validate?leadId=
 * POST /api/crm/lead-questionnaire-validate — valider champ par champ (admin vs vendeur)
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, isSiteAdmin, effectiveCrmRole } = require("../rbac");
const { getSql } = require("../db");
const Validation = require("../../../js/questionnaire-field-validation-lib");
const {
  applyQuestionnaireValidation,
  validationSummary,
  parsePayload,
} = require("../questionnaire-field-validation");

function canValidate(user) {
  if (!user) return false;
  if (isSiteAdmin(user)) return true;
  return effectiveCrmRole(user) === "admin";
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;
  if (!canValidate(user)) {
    return res.status(403).json({ error: "Validation questionnaire : administrateur uniquement" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET") {
    var leadId = url.searchParams.get("leadId") || url.searchParams.get("id");
    if (!leadId) return res.status(400).json({ error: "leadId requis" });
    try {
      const rows = await sql`
        SELECT id, payload, contact_id FROM site_leads WHERE id = ${leadId} LIMIT 1
      `;
      if (!rows.length) return res.status(404).json({ error: "Lead introuvable" });
      var payload = parsePayload(rows[0].payload);
      return res.status(200).json({
        ok: true,
        leadId: leadId,
        contactId: rows[0].contact_id,
        summary: validationSummary(payload),
        fieldValidation: payload.fieldValidation || {},
        vendorSubmission: payload.vendorSubmission || null,
        adminBaseline: payload.adminBaseline || null,
        effectivePreview: Validation.getEffectivePayload(payload),
      });
    } catch (e) {
      console.error("[crm/lead-questionnaire-validate GET]", e);
      return res.status(500).json({ error: "Erreur serveur", detail: e.message });
    }
  }

  if (req.method !== "POST" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const parsed = parseJsonBody(req, 128 * 1024);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  var postLeadId = body.leadId || url.searchParams.get("leadId");
  if (!postLeadId) return res.status(400).json({ error: "leadId requis" });

  try {
    const out = await applyQuestionnaireValidation(sql, {
      leadId: postLeadId,
      choices: body.choices || {},
      customValues: body.customValues || {},
      syncContact: body.syncContact !== false,
      user: user,
      userId: user.id,
    });
    if (!out.ok) return res.status(400).json(out);
    return res.status(200).json(Object.assign({}, out, { summary: validationSummary(out.payload) }));
  } catch (e) {
    console.error("[crm/lead-questionnaire-validate POST]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};
