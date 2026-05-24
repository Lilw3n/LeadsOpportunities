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

  const url = new URL(req.url, "http://localhost");
  const type = url.searchParams.get("type") || "vehicles";
  const scope = contactScopeFilter(user);

  try {
    var rows = [];
    if (type === "vehicles") {
      rows = await sql`
        SELECT v.*, c.first_name, c.last_name, c.email AS contact_email
        FROM crm_vehicles v
        INNER JOIN crm_contacts c ON c.id = v.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        ORDER BY v.updated_at DESC
        LIMIT 300
      `;
    } else if (type === "drivers") {
      rows = await sql`
        SELECT d.*, c.first_name, c.last_name, c.email AS contact_email
        FROM crm_drivers d
        INNER JOIN crm_contacts c ON c.id = d.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        ORDER BY d.updated_at DESC
        LIMIT 300
      `;
    } else if (type === "claims") {
      rows = await sql`
        SELECT cl.*, c.first_name, c.last_name, c.email AS contact_email
        FROM crm_claims cl
        INNER JOIN crm_contacts c ON c.id = cl.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        ORDER BY cl.claim_date DESC NULLS LAST, cl.created_at DESC
        LIMIT 300
      `;
    } else if (type === "contracts") {
      rows = await sql`
        SELECT ct.*, c.first_name, c.last_name, c.email AS contact_email
        FROM crm_contracts ct
        INNER JOIN crm_contacts c ON c.id = ct.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        ORDER BY ct.updated_at DESC
        LIMIT 300
      `;
    } else {
      return res.status(400).json({ error: "type invalide (vehicles, drivers, claims, contracts)" });
    }

    const items = rows.map(function (r) {
      return Object.assign({}, r, {
        contactId: r.contact_id,
        contactName: ((r.first_name || "") + " " + (r.last_name || "")).trim() || r.contact_email,
      });
    });
    return res.status(200).json({ ok: true, type: type, items: items });
  } catch (e) {
    console.error("[crm/modules-global]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
