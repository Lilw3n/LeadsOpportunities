const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { touchContact } = require("../crm-modules-lib");
const { syncCrmEventToTodoist } = require("../todoist");

function addDays(dateStr, days) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const eventId = parsed.body?.eventId || parsed.body?.event_id;
  if (!eventId) return res.status(400).json({ error: "eventId requis" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const scope = contactScopeFilter(user);

  try {
    const rows = await sql`
      SELECT e.* FROM crm_events e
      INNER JOIN crm_contacts c ON c.id = e.contact_id
      WHERE e.id = ${eventId}
        AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: "Evenement introuvable" });

    const src = rows[0];
    const newId = "evt_" + crypto.randomUUID();
    const newDate = addDays(src.event_date, 7);
    await sql`
      INSERT INTO crm_events (
        id, contact_id, event_type, title, description, event_date, event_time,
        status, priority, user_id, extra_data
      ) VALUES (
        ${newId}, ${src.contact_id},
        ${src.event_type}, ${(src.title || "") + " (Copie)"},
        ${src.description}, ${newDate}, ${src.event_time},        'pending', ${src.priority}, ${user.id}, ${src.extra_data}
      )
    `;
    await touchContact(sql, src.contact_id);
    var todoistSync = null;
    try {
      todoistSync = await syncCrmEventToTodoist(user.id, newId);
    } catch (err) {
      console.error("[crm/duplicate-event] todoist:", err);
      todoistSync = { ok: false, error: err.message };
    }
    const created = await sql`SELECT * FROM crm_events WHERE id = ${newId} LIMIT 1`;
    return res.status(201).json({ ok: true, item: created[0], todoistSync: todoistSync });
  } catch (e) {
    console.error("[crm/duplicate-event]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
