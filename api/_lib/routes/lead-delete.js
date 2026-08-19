const { getAuthUser } = require("../auth");
const { applyApiGuards, parseJsonBody } = require("../security");
const { getSql } = require("../db");
const { deleteLeadById, LeadDeleteBlockedError, loadLeadForDelete } = require("../lead-delete-lib");

function canDeleteLeads(user) {
  return !!(user && (user.role === "admin" || user.crmRole === "admin"));
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getAuthUser(req);
  if (!canDeleteLeads(user)) {
    return res.status(403).json({ error: "Accès refusé — admin requis" });
  }

  var body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "JSON invalide" });
    }
  }
  if (!body || typeof body !== "object") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    body = parsed.body || {};
  }

  var ids = [];
  if (body.leadId) ids.push(String(body.leadId).trim().slice(0, 120));
  if (Array.isArray(body.leadIds)) {
    body.leadIds.forEach(function (id) {
      var s = String(id || "")
        .trim()
        .slice(0, 120);
      if (s) ids.push(s);
    });
  }
  ids = ids
    .filter(function (id, i, arr) {
      return id && arr.indexOf(id) === i;
    })
    .slice(0, 80);

  if (!ids.length) {
    return res.status(400).json({ error: "leadId ou leadIds requis" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    var deleted = [];
    var missing = [];
    var blocked = [];
    var errors = [];

    for (var i = 0; i < ids.length; i++) {
      var leadId = ids[i];
      var existing = await loadLeadForDelete(sql, leadId);
      if (!existing) {
        missing.push(leadId);
        continue;
      }
      if (existing.contact_id) {
        blocked.push({
          id: leadId,
          contactId: existing.contact_id,
          message:
            "Lead rattaché à une fiche interlocuteur — supprimez le contact depuis la fiche CRM si besoin, pas le lead seul.",
        });
        continue;
      }
      try {
        await deleteLeadById(sql, leadId);
        deleted.push(leadId);
      } catch (oneErr) {
        if (oneErr instanceof LeadDeleteBlockedError || oneErr.code === "LEAD_LINKED_CONTACT") {
          blocked.push({
            id: leadId,
            contactId: oneErr.contactId,
            message: oneErr.message,
          });
          continue;
        }
        console.error("[dashboard/lead-delete] one", leadId, oneErr);
        errors.push({ id: leadId, message: oneErr.message });
      }
    }

    if (!deleted.length && blocked.length && !errors.length) {
      return res.status(409).json({
        ok: false,
        error: blocked[0].message,
        blocked: blocked,
        hint: "La fiche interlocuteur est conservée — seuls les leads sans fiche peuvent être supprimés ici.",
      });
    }

    if (!deleted.length && errors.length) {
      return res.status(500).json({
        error: "Erreur serveur",
        detail: errors[0].message,
        failed: errors,
        blocked: blocked,
      });
    }

    return res.status(200).json({
      ok: true,
      message: deleted.length > 1 ? deleted.length + " leads supprimés" : "Lead supprimé",
      leadId: deleted[0] || null,
      deleted: deleted,
      missing: missing,
      blocked: blocked,
      failed: errors,
    });
  } catch (e) {
    console.error("[dashboard/lead-delete]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};
