/**
 * PATCH /api/crm/lead-questionnaire — admin : modifier réponses questionnaire + sync interlocuteur
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, isSiteAdmin, effectiveCrmRole } = require("../rbac");
const { getSql } = require("../db");
const { patchLeadQuestionnaire } = require("../lead-questionnaire-patch");

function canEditQuestionnaire(user) {
  if (!user) return false;
  if (isSiteAdmin(user)) return true;
  return effectiveCrmRole(user) === "admin";
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "PATCH" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireCrm(req, res);
  if (!user) return;
  if (!canEditQuestionnaire(user)) {
    return res.status(403).json({ error: "Modification questionnaire : administrateur uniquement" });
  }

  const parsed = parseJsonBody(req, 256 * 1024);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  const url = new URL(req.url, "http://localhost");
  var leadId = body.leadId || url.searchParams.get("leadId") || url.searchParams.get("id");
  if (!leadId && body.contactId) {
    const sql = getSql();
    if (sql) {
      const rows = await sql`
        SELECT id FROM site_leads WHERE contact_id = ${body.contactId} ORDER BY created_at DESC LIMIT 1
      `;
      if (rows.length) leadId = rows[0].id;
    }
  }
  if (!leadId) return res.status(400).json({ error: "leadId requis (ou contactId avec lead lié)" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const out = await patchLeadQuestionnaire(sql, {
      leadId: leadId,
      contactId: body.contactId || null,
      payloadPatch: body.payloadPatch || body.fields,
      fieldComments: body.fieldComments,
      adminQuestionnaireNotes: body.adminQuestionnaireNotes,
      adminComment: body.adminComment,
      syncContact: body.syncContact !== false,
      user: user,
    });
    if (!out.ok) return res.status(400).json(out);
    return res.status(200).json(out);
  } catch (e) {
    console.error("[crm/lead-questionnaire]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};
