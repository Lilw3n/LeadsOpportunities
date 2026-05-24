/**
 * Sync inverse Google Calendar -> CRM (evenements externes)
 * GET /api/crm/calendar-sync?action=pull
 */
const crypto = require("crypto");
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getCalendarAccessToken } = require("../google-calendar");
const { getSql } = require("../db");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const url = new URL(req.url, "http://localhost");
  if (url.searchParams.get("action") !== "pull") {
    return res.status(400).json({ error: "Utiliser action=pull" });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const auth = await getCalendarAccessToken(user.id);
    if (!auth) {
      return res.status(400).json({ error: "Agenda Google non connecte" });
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
      "&singleEvents=true&maxResults=50";

    const resp = await fetch(listUrl, {
      headers: { Authorization: "Bearer " + auth.accessToken },
    });
    const data = await resp.json();
    if (!resp.ok) {
      return res.status(502).json({ error: data.error?.message || "Calendar list failed" });
    }

    var imported = 0;
    var items = data.items || [];

    var external = [];

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
      var contactId = priv && priv.loContactId ? priv.loContactId : null;

      if (contactId) {
        var cOk = await sql`SELECT id FROM crm_contacts WHERE id = ${contactId} LIMIT 1`;
        if (!cOk.length) contactId = null;
      }

      if (contactId) {
        await sql`
          INSERT INTO crm_events (
            id, contact_id, event_type, title, description, event_date, event_time,
            status, priority, user_id, google_event_id, google_sync_status
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
            ${"imported"}
          )
        `;
        imported++;
      } else {
        external.push({
          googleEventId: ev.id,
          title: ev.summary,
          start: start,
          htmlLink: ev.htmlLink,
        });
      }
    }

    return res.status(200).json({
      ok: true,
      imported: imported,
      scanned: items.length,
      externalEvents: external.slice(0, 20),
    });
  } catch (e) {
    console.error("[crm/calendar-pull]", e);
    return res.status(500).json({ error: "Erreur sync agenda" });
  }
};
