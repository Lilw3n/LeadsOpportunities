const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const ids = parsed.body?.ids || parsed.body?.eventIds;
  if (!Array.isArray(ids) || !ids.length) {
    return res.status(400).json({ error: "ids[] requis" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const scope = contactScopeFilter(user);

  try {
    let deleted = 0;
    for (const id of ids.slice(0, 50)) {
      const rows = await sql`
        SELECT e.id FROM crm_events e
        INNER JOIN crm_contacts c ON c.id = e.contact_id
        WHERE e.id = ${id}
          AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
        LIMIT 1
      `;
      if (rows.length) {
        await sql`DELETE FROM crm_events WHERE id = ${id}`;
        deleted++;
      }
    }
    return res.status(200).json({ ok: true, deleted });
  } catch (e) {
    console.error("[crm/bulk-events]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
