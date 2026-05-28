const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { syncCrmEventToGoogle } = require("../google-calendar");

async function touchContact(sql, contactId) {
  await sql`UPDATE crm_contacts SET updated_at = NOW() WHERE id = ${contactId}`;
}

function normalizeEventDateInput(input) {
  var raw = String(input || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  var m = raw.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (!m) return "";
  var d = Number(m[1]);
  var mo = Number(m[2]);
  var y = Number(m[3]);
  if (!d || !mo || !y || mo < 1 || mo > 12 || d < 1 || d > 31) return "";
  var dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return "";
  return y + "-" + String(mo).padStart(2, "0") + "-" + String(d).padStart(2, "0");
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  const scope = contactScopeFilter(user);

  if (req.method === "GET") {
    try {
      const rows = await sql`
        SELECT
          e.*,
          c.first_name,
          c.last_name,
          c.email AS contact_email,
          c.contact_type
        FROM crm_events e
        INNER JOIN crm_contacts c ON c.id = e.contact_id
        WHERE (${scope}::text IS NULL OR c.assigned_to = ${scope})
        ORDER BY e.event_date DESC NULLS LAST, e.created_at DESC
        LIMIT 500
      `;

      const events = rows.map(function (r) {
        var extra = {};
        if (r.extra_data) {
          try {
            extra = JSON.parse(r.extra_data);
          } catch (e) {}
        }
        return {
          id: r.id,
          contactId: r.contact_id,
          contactName: ((r.first_name || "") + " " + (r.last_name || "")).trim() || r.contact_email,
          contactType: r.contact_type,
          eventType: r.event_type,
          title: r.title,
          description: r.description,
          eventDate: r.event_date,
          eventTime: r.event_time,
          status: r.status,
          priority: r.priority,
          createdAt: r.created_at,
          googleEventId: r.google_event_id,
          googleSyncStatus: r.google_sync_status,
          participants: extra.participants || [],
          attachments: extra.attachments || [],
        };
      });

      return res.status(200).json({ ok: true, events });
    } catch (e) {
      console.error("[crm/events GET]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "POST") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const contactId = body.contactId;
    const title = body.title;
    const eventDate =
      normalizeEventDateInput(body.eventDate) || new Date().toISOString().slice(0, 10);

    if (!contactId || !title) {
      return res.status(400).json({ error: "contactId et title requis" });
    }

    try {
      const contacts = await sql`
        SELECT id FROM crm_contacts
        WHERE id = ${contactId}
          AND (${scope}::text IS NULL OR assigned_to = ${scope})
        LIMIT 1
      `;
      if (!contacts.length) return res.status(404).json({ error: "Contact introuvable" });

      const evtId = "evt_" + crypto.randomUUID();
      const extra = JSON.stringify({
        participants: body.participants || [],
        attachments: body.attachments || [],
        source: "crm-event-create",
      });

      await sql`
        INSERT INTO crm_events (
          id, contact_id, event_type, title, description, event_date, event_time,
          status, priority, user_id, extra_data
        ) VALUES (
          ${evtId}, ${contactId},
          ${body.eventType || "rdv"},
          ${title},
          ${body.description || null},
          ${eventDate},
          ${body.eventTime || null},
          ${body.status || "pending"},
          ${body.priority || "medium"},
          ${user.id},
          ${extra}
        )
      `;
      await touchContact(sql, contactId);

      syncCrmEventToGoogle(user.id, evtId).catch(function (err) {
        console.error("[crm/events] calendar sync:", err);
      });

      return res.status(201).json({ ok: true, id: evtId, eventId: evtId });
    } catch (e) {
      console.error("[crm/events POST]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
