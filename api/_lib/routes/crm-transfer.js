const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { assertContactAccess, touchContact, RESOURCES } = require("../crm-modules-lib");

async function getModuleRow(sql, resource, itemId, scope) {
  if (resource === "events") {
    return sql`
      SELECT m.id, m.contact_id FROM crm_events m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope}) LIMIT 1
    `;
  }
  if (resource === "claims") {
    return sql`
      SELECT m.id, m.contact_id FROM crm_claims m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope}) LIMIT 1
    `;
  }
  if (resource === "vehicles") {
    return sql`
      SELECT m.id, m.contact_id FROM crm_vehicles m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope}) LIMIT 1
    `;
  }
  if (resource === "drivers") {
    return sql`
      SELECT m.id, m.contact_id FROM crm_drivers m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope}) LIMIT 1
    `;
  }
  if (resource === "contracts") {
    return sql`
      SELECT m.id, m.contact_id FROM crm_contracts m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope}) LIMIT 1
    `;
  }
  if (resource === "insurance-requests") {
    return sql`
      SELECT m.id, m.contact_id FROM crm_insurance_requests m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope}) LIMIT 1
    `;
  }
  return [];
}

async function updateModuleContact(sql, resource, itemId, targetContactId) {
  if (resource === "events") {
    return sql`UPDATE crm_events SET contact_id = ${targetContactId}, updated_at = NOW() WHERE id = ${itemId}`;
  }
  if (resource === "claims") {
    return sql`UPDATE crm_claims SET contact_id = ${targetContactId}, updated_at = NOW() WHERE id = ${itemId}`;
  }
  if (resource === "vehicles") {
    return sql`UPDATE crm_vehicles SET contact_id = ${targetContactId}, updated_at = NOW() WHERE id = ${itemId}`;
  }
  if (resource === "drivers") {
    return sql`UPDATE crm_drivers SET contact_id = ${targetContactId}, updated_at = NOW() WHERE id = ${itemId}`;
  }
  if (resource === "contracts") {
    return sql`UPDATE crm_contracts SET contact_id = ${targetContactId}, updated_at = NOW() WHERE id = ${itemId}`;
  }
  if (resource === "insurance-requests") {
    return sql`UPDATE crm_insurance_requests SET contact_id = ${targetContactId}, updated_at = NOW() WHERE id = ${itemId}`;
  }
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  const resource = body.resource;
  const itemId = body.itemId || body.item_id;
  const targetContactId = body.targetContactId || body.target_contact_id;

  if (!RESOURCES[resource]) {
    return res.status(400).json({ error: "resource invalide" });
  }
  if (!itemId || !targetContactId) {
    return res.status(400).json({ error: "itemId et targetContactId requis" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const scope = contactScopeFilter(user);

  try {
    const sourceRows = await getModuleRow(sql, resource, itemId, scope);
    if (!sourceRows.length) {
      return res.status(404).json({ error: "Element introuvable" });
    }

    const okTarget = await assertContactAccess(sql, targetContactId, scope);
    if (!okTarget) return res.status(404).json({ error: "Contact cible introuvable" });

    const sourceContactId = sourceRows[0].contact_id;
    if (sourceContactId === targetContactId) {
      return res.status(400).json({ error: "Deja sur ce contact" });
    }

    await updateModuleContact(sql, resource, itemId, targetContactId);
    await touchContact(sql, sourceContactId);
    await touchContact(sql, targetContactId);

    return res.status(200).json({ ok: true, contactId: targetContactId });
  } catch (e) {
    console.error("[crm/transfer]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
