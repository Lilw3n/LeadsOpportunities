/**
 * Sync inverse Google Calendar -> CRM (evenements externes)
 * GET /api/crm/calendar-sync?action=pull
 */
const crypto = require("crypto");
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getCalendarAccessToken, ensureGoogleAgendaContact } = require("../google-calendar");
const { getSql } = require("../db");
const { ensureCalendarSchema } = require("../ensure-schema");

async function runCalendarPull(user) {
  const sql = getSql();
  if (!sql) return { ok: false, status: 500, error: "Base de donnees non configuree" };
  await ensureCalendarSchema(sql);

  const auth = await getCalendarAccessToken(user.id);
  if (!auth) {
    return { ok: false, status: 400, error: "Agenda Google non connecte" };
  }

  const now = new Date();
  const timeMin = new Date(now.getTime() - 7 * 86400000).toISOString();
  const timeMax = new Date(now.getTime() + 60 * 86400000).toISOString();
  const calId = encodeURIComponent(auth.calendarId);

  const listUrl =
    "https://www.googleapis.com/calendar/v3/calendars/" +
    calId +
    "/events?timeMin=" +
    encodeURIComponent(timeMin) +
    "&timeMax=" +
    encodeURIComponent(timeMax) +
    "&singleEvents=true&maxResults=250";

  const resp = await fetch(listUrl, {
    headers: { Authorization: "Bearer " + auth.accessToken },
  });
  const data = await resp.json();
  if (!resp.ok) {
    return { ok: false, status: 502, error: (data.error && data.error.message) || "Calendar list failed" };
  }

  var imported = 0;
  var items = data.items || [];
  var placeholderId = await ensureGoogleAgendaContact(sql, user.id);

  for (var i = 0; i < items.length; i++) {
    var ev = items[i];
    var priv = ev.extendedProperties && ev.extendedProperties.private;
    if (priv && priv.loSource === "crm" && priv.loEventId) continue;

    var existing = await sql`
      SELECT id FROM crm_events WHERE google_event_id = ${ev.id} LIMIT 1
    `;
    if (existing.length) continue;

    var start = ev.start && (ev.start.dateTime || ev.start.date);
    var eventDate = start ? String(start).slice(0, 10) : null;
    var eventTime = start && ev.start.dateTime ? String(start).slice(11, 16) : null;
    var endRaw = ev.end && (ev.end.dateTime || ev.end.date);
    var eventEndTime = endRaw && ev.end.dateTime ? String(endRaw).slice(11, 16) : null;
    var contactId = priv && priv.loContactId ? priv.loContactId : null;

    if (contactId) {
      var cOk = await sql`SELECT id FROM crm_contacts WHERE id = ${contactId} LIMIT 1`;
      if (!cOk.length) contactId = null;
    }
    if (!contactId) contactId = placeholderId;

    var extra = JSON.stringify({
      source: "google_calendar",
      eventTime: eventTime,
      eventEndTime: eventEndTime,
      location: ev.location || "",
      htmlLink: ev.htmlLink || "",
    });

    await sql`
      INSERT INTO crm_events (
        id, contact_id, event_type, title, description, event_date, event_time,
        status, priority, user_id, google_event_id, google_sync_status, extra_data
      ) VALUES (
        ${"evt_" + crypto.randomUUID()},
        ${contactId},
        ${"rdv"},
        ${(ev.summary || "RDV Google").slice(0, 200)},
        ${(ev.description || "").slice(0, 2000)},
        ${eventDate},
        ${eventTime},
        ${"pending"},
        ${"medium"},
        ${user.id},
        ${ev.id},
        ${"imported"},
        ${extra}
      )
    `;
    imported++;
  }

  return { ok: true, imported: imported, scanned: items.length };
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Utilisez GET" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const url = new URL(req.url, "http://localhost");
  if (url.searchParams.get("action") !== "pull") {
    return res.status(400).json({ error: "Utiliser action=pull" });
  }

  try {
    const result = await runCalendarPull(user);
    return res.status(result.status || (result.ok ? 200 : 500)).json(result);
  } catch (e) {
    console.error("[crm/calendar-pull]", e);
    return res.status(500).json({ error: "Erreur sync agenda", detail: e.message });
  }
};

module.exports.runCalendarPull = runCalendarPull;
