/**
 * GET /api/crm/export?entity=contacts|quotes
 */
const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  const scope = contactScopeFilter(user);
  const url = new URL(req.url, "http://localhost");
  const entity = url.searchParams.get("entity") || "contacts";

  try {
    if (entity === "quotes") {
      const rows = await sql`
        SELECT q.id, q.title, q.product_type, q.status, q.premium_estimate, q.contact_id,
          c.first_name, c.last_name, c.email
        FROM crm_quotes q
        INNER JOIN crm_contacts c ON c.id = q.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        ORDER BY q.updated_at DESC LIMIT 200
      `;
      return res.status(200).json({ ok: true, entity: "quotes", count: rows.length, data: rows });
    }
    if (entity === "contracts") {
      const rows = await sql`
        SELECT ct.id, ct.contract_type, ct.status, ct.premium, ct.insurer, ct.policy_number,
          ct.start_date, ct.end_date, ct.contact_id, c.first_name, c.last_name
        FROM crm_contracts ct
        INNER JOIN crm_contacts c ON c.id = ct.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        ORDER BY ct.updated_at DESC LIMIT 200
      `;
      return res.status(200).json({ ok: true, entity: "contracts", count: rows.length, data: rows });
    }
    if (entity === "claims") {
      const rows = await sql`
        SELECT cl.id, cl.claim_type, cl.claim_date, cl.amount, cl.status, cl.insurer, cl.contact_id,
          c.first_name, c.last_name
        FROM crm_claims cl
        INNER JOIN crm_contacts c ON c.id = cl.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        ORDER BY cl.created_at DESC LIMIT 200
      `;
      return res.status(200).json({ ok: true, entity: "claims", count: rows.length, data: rows });
    }
    if (entity === "events") {
      const rows = await sql`
        SELECT e.id, e.event_type, e.title, e.event_date, e.status, e.priority, e.contact_id,
          c.first_name, c.last_name
        FROM crm_events e
        INNER JOIN crm_contacts c ON c.id = e.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        ORDER BY e.event_date DESC NULLS LAST LIMIT 300
      `;
      return res.status(200).json({ ok: true, entity: "events", count: rows.length, data: rows });
    }
    const rows = await sql`
      SELECT id, contact_type, first_name, last_name, email, phone, company, status, created_at
      FROM crm_contacts
      WHERE (${scope}::text IS NULL OR assigned_to = ${scope})
      ORDER BY updated_at DESC LIMIT 500
    `;
    return res.status(200).json({ ok: true, entity: "contacts", count: rows.length, data: rows });
  } catch (e) {
    console.error("[crm/export]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
