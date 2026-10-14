const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { syncCrmEventToGoogle } = require("../google-calendar");
const { ensureTodoistSchema } = require("../ensure-schema");
const { syncCrmEventToTodoist, applyTodoistEventChange } = require("../todoist");
const Interlocutors = require("../../../js/crm-dossier-interlocutors");

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
  await ensureTodoistSchema(sql);
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
          eventTime: r.event_time || extra.eventTime || null,
          eventEndTime: extra.eventEndTime || null,
          location: extra.location || "",
          mode: extra.mode || "",
          propertyId: extra.propertyId || "",
          reminderMinutes: extra.reminderMinutes != null ? extra.reminderMinutes : null,
          confidential: !!extra.confidential,
          status: r.status,
          priority: r.priority,
          createdAt: r.created_at,
          googleEventId: r.google_event_id,
          googleSyncStatus: r.google_sync_status,
          todoistTaskId: r.todoist_task_id || null,
          todoistSyncStatus: r.todoist_sync_status || null,
          participants: extra.participants || [],
          interlocutors: Interlocutors.normalizeList(extra.interlocutors || extra.participants || []),
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
      const eventTime = body.eventTime || null;
      const extra = JSON.stringify({
        participants: body.participants || [],
        interlocutors: Interlocutors.normalizeList(body.interlocutors || body.participants || []),
        attachments: body.attachments || [],
        source: body.source || "crm-event-create",
        eventTime: eventTime,
        eventEndTime: body.eventEndTime || null,
        location: body.location || "",
        mode: body.mode || "",
        propertyId: body.propertyId || "",
        reminderMinutes:
          body.reminderMinutes != null && body.reminderMinutes !== ""
            ? Number(body.reminderMinutes)
            : 60,
        confidential: !!body.confidential,
      });

      await sql`
        INSERT INTO crm_events (
          id, contact_id, event_type, title, description, event_date, event_time,
          status, priority, user_id, extra_data
        ) VALUES (
          ${evtId}, ${contactId},
          ${body.eventType || "meeting"},
          ${title},
          ${body.description || null},
          ${eventDate},
          ${eventTime},
          ${body.status || "pending"},
          ${body.priority || "medium"},
          ${user.id},
          ${extra}
        )
      `;
      await touchContact(sql, contactId);

      var syncResult = null;
      try {
        syncResult = await syncCrmEventToGoogle(user.id, evtId);
      } catch (err) {
        console.error("[crm/events] calendar sync:", err);
        syncResult = { ok: false, error: err.message };
      }

      var todoistSync = null;
      try {
        todoistSync = await syncCrmEventToTodoist(user.id, evtId);
      } catch (err) {
        console.error("[crm/events] todoist sync:", err);
        todoistSync = { ok: false, error: err.message };
      }

      return res.status(201).json({
        ok: true,
        id: evtId,
        eventId: evtId,
        googleSync: syncResult,
        todoistSync: todoistSync,
      });
    } catch (e) {
      console.error("[crm/events POST]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "PATCH") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const eventId = body.id || body.eventId;
    if (!eventId) return res.status(400).json({ error: "id requis" });
    try {
      const rows = await sql`
        SELECT e.* FROM crm_events e
        INNER JOIN crm_contacts c ON c.id = e.contact_id
        WHERE e.id = ${eventId}
          AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
        LIMIT 1
      `;
      if (!rows.length) return res.status(404).json({ error: "Événement introuvable" });
      var extra = {};
      try {
        extra = rows[0].extra_data ? JSON.parse(rows[0].extra_data) : {};
      } catch (e) {
        extra = {};
      }
      if (body.interlocutors) extra.interlocutors = Interlocutors.normalizeList(body.interlocutors);
      if (body.location != null) extra.location = body.location;
      if (body.mode != null) extra.mode = body.mode;
      var status = body.status || rows[0].status;
      var priority = body.priority || rows[0].priority;
      var title = body.title || rows[0].title;
      var description = body.description != null ? body.description : rows[0].description;
      var extraStr = JSON.stringify(extra);
      await sql`
        UPDATE crm_events
        SET title = ${title},
            description = ${description},
            status = ${status},
            priority = ${priority},
            extra_data = ${extraStr},
            updated_at = NOW()
        WHERE id = ${eventId}
      `;

      var todoistSync = null;
      try {
        todoistSync = await applyTodoistEventChange(user.id, eventId, status);
      } catch (err) {
        console.error("[crm/events] todoist patch:", err);
        todoistSync = { ok: false, error: err.message };
      }

      return res.status(200).json({ ok: true, id: eventId, todoistSync: todoistSync });
    } catch (e) {
      console.error("[crm/events PATCH]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
