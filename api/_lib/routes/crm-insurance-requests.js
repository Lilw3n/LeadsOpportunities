/**
 * GET /api/crm/insurance-requests — liste globale demandes assurance
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
  const status = url.searchParams.get("status");

  try {
    const rows = await sql`
      SELECT r.id, r.request_type, r.product_type, r.status, r.description, r.created_at, r.contact_id,
        c.first_name, c.last_name, c.email AS contact_email
      FROM crm_insurance_requests r
      INNER JOIN crm_contacts c ON c.id = r.contact_id
      WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        AND (${status}::text IS NULL OR r.status = ${status})
      ORDER BY r.created_at DESC
      LIMIT 100
    `;
    return res.status(200).json({ ok: true, requests: rows });
  } catch (e) {
    console.error("[crm/insurance-requests]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
