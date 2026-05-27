const { getSql } = require("./db");
const { refreshGoogleAccessToken } = require("./google-oauth");

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
const TIMEZONE = "Europe/Paris";

async function getCalendarAccessToken(userId) {
  const sql = getSql();
  if (!sql || !userId) return null;

  const rows = await sql`
    SELECT google_refresh_token, google_calendar_id
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  if (!rows.length || !rows[0].google_refresh_token) return null;

  const tokens = await refreshGoogleAccessToken(rows[0].google_refresh_token);
  return {
    accessToken: tokens.access_token,
    calendarId: rows[0].google_calendar_id || process.env.GOOGLE_CALENDAR_DEFAULT_ID || "primary",
  };
}

function buildEventDateTime(eventDate, eventTime) {
  const dateStr = String(eventDate || new Date().toISOString().slice(0, 10));
  const timeStr = eventTime && /^\d{1,2}:\d{2}/.test(String(eventTime)) ? String(eventTime).slice(0, 5) : "09:00";
  return { dateStr, timeStr, start: dateStr + "T" + timeStr + ":00", endTime: addOneHour(timeStr) };
}

function addOneHour(timeStr) {
  const parts = timeStr.split(":").map(Number);
  let h = (parts[0] || 9) + 1;
  const m = parts[1] || 0;
  if (h >= 24) h = 23;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":00";
}

function getAppUrl() {
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.leadsopportunities.fr"
  ).replace(/\/$/, "");
}

async function createGoogleCalendarEvent(userId, evt) {
  const auth = await getCalendarAccessToken(userId);
  if (!auth) return { ok: false, skipped: true, reason: "calendar_not_connected" };

  const dt = buildEventDateTime(evt.eventDate, evt.eventTime);
  const appUrl = getAppUrl();
  const description = [
    evt.description || "",
    evt.contactName ? "Contact : " + evt.contactName : "",
    evt.contactId ? "Fiche CRM : " + appUrl + "/crm-contact.html?id=" + encodeURIComponent(evt.contactId) : "",
    "Source : LeadsOpportunities CRM",
  ]
    .filter(Boolean)
    .join("\n");

  const body = {
    summary: evt.title || "RDV client",
    description: description,
    start: { dateTime: dt.start, timeZone: TIMEZONE },
    end: { dateTime: dt.dateStr + "T" + dt.endTime, timeZone: TIMEZONE },
    extendedProperties: {
      private: {
        loEventId: evt.id || "",
        loContactId: evt.contactId || "",
        loSource: "crm",
      },
    },
  };

  const calId = encodeURIComponent(auth.calendarId);
  const resp = await fetch("https://www.googleapis.com/calendar/v3/calendars/" + calId + "/events", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + auth.accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.error?.message || "Calendar insert failed");
  }
  return { ok: true, googleEventId: data.id, htmlLink: data.htmlLink };
}

async function syncCrmEventToGoogle(userId, eventId) {
  const sql = getSql();
  if (!sql) return { ok: false, error: "no_db" };

  const rows = await sql`
    SELECT e.*, c.first_name, c.last_name, c.email AS contact_email
    FROM crm_events e
    INNER JOIN crm_contacts c ON c.id = e.contact_id
    WHERE e.id = ${eventId}
    LIMIT 1
  `;
  if (!rows.length) return { ok: false, error: "event_not_found" };

  const r = rows[0];
  if (r.google_event_id) {
    return { ok: true, skipped: true, googleEventId: r.google_event_id };
  }

  try {
    const contactName =
      ((r.first_name || "") + " " + (r.last_name || "")).trim() || r.contact_email || "";
    const result = await createGoogleCalendarEvent(userId, {
      id: r.id,
      title: r.title,
      description: r.description,
      eventDate: r.event_date,
      eventTime: r.event_time,
      contactId: r.contact_id,
      contactName: contactName,
    });

    if (result.skipped) {
      await sql`
        UPDATE crm_events SET google_sync_status = 'skipped', google_updated_at = NOW()
        WHERE id = ${eventId}
      `;
      return result;
    }

    await sql`
      UPDATE crm_events SET
        google_event_id = ${result.googleEventId},
        google_sync_status = 'synced',
        google_updated_at = NOW()
      WHERE id = ${eventId}
    `;
    return result;
  } catch (e) {
    console.error("[google-calendar] sync:", e);
    await sql`
      UPDATE crm_events SET google_sync_status = 'error', google_updated_at = NOW()
      WHERE id = ${eventId}
    `;
    return { ok: false, error: e.message };
  }
}

async function getCalendarConnectionStatus(userId) {
  const sql = getSql();
  if (!sql) return { connected: false };
  const rows = await sql`
    SELECT google_refresh_token, google_calendar_id, google_calendar_connected_at
    FROM users WHERE id = ${userId} LIMIT 1
  `;
  if (!rows.length) return { connected: false };
  const u = rows[0];
  return {
    connected: !!(u.google_refresh_token && u.google_refresh_token.length > 10),
    calendarId: u.google_calendar_id || "primary",
    connectedAt: u.google_calendar_connected_at,
  };
}

module.exports = {
  CALENDAR_SCOPE,
  createGoogleCalendarEvent,
  syncCrmEventToGoogle,
  getCalendarConnectionStatus,
  getCalendarAccessToken,
};
