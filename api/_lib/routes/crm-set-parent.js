const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { touchContact } = require("../crm-modules-lib");

const TABLE = {
  claims: "crm_claims",
  vehicles: "crm_vehicles",
  "insurance-requests": "crm_insurance_requests",
};

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
  const parentId = body.parentId || body.parent_id || null;

  if (!TABLE[resource]) return res.status(400).json({ error: "resource invalide" });
  if (!itemId) return res.status(400).json({ error: "itemId requis" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  const scope = contactScopeFilter(user);

  try {
    let rows;
    if (resource === "claims") {
      rows = await sql`
        SELECT m.id, m.contact_id FROM crm_claims m
        INNER JOIN crm_contacts c ON c.id = m.contact_id
        WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
        LIMIT 1
      `;
    } else if (resource === "vehicles") {
      rows = await sql`
        SELECT m.id, m.contact_id FROM crm_vehicles m
        INNER JOIN crm_contacts c ON c.id = m.contact_id
        WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
        LIMIT 1
      `;
    } else {
      rows = await sql`
        SELECT m.id, m.contact_id FROM crm_insurance_requests m
        INNER JOIN crm_contacts c ON c.id = m.contact_id
        WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
        LIMIT 1
      `;
    }
    if (!rows.length) return res.status(404).json({ error: "Element introuvable" });

    if (resource === "claims") {
      await sql`UPDATE crm_claims SET parent_id = ${parentId}, updated_at = NOW() WHERE id = ${itemId}`;
    } else if (resource === "vehicles") {
      await sql`UPDATE crm_vehicles SET parent_id = ${parentId}, updated_at = NOW() WHERE id = ${itemId}`;
    } else {
      await sql`UPDATE crm_insurance_requests SET parent_id = ${parentId}, updated_at = NOW() WHERE id = ${itemId}`;
    }
    await touchContact(sql, rows[0].contact_id);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("[crm/set-parent]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
