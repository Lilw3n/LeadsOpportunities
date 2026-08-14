const { getSql } = require("./db");
const { refreshGoogleAccessToken } = require("./google-oauth");
const { ensureCalendarSchema } = require("./ensure-schema");

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
const TIMEZONE = "Europe/Paris";
const GOOGLE_AGENDA_CONTACT_ID = "ct_google_agenda";

async function getCalendarAccessToken(userId) {
  const sql = getSql();
  if (!sql || !userId) return null;
  await ensureCalendarSchema(sql);

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

function pad2(n) {
  return String(n).padStart(2, "0");
}

function normalizeTime(t, fallback) {
  var raw = String(t || "").trim();
  if (/^\d{1,2}:\d{2}/.test(raw)) return raw.slice(0, 5);
  return fallback || "09:00";
}

function addMinutes(timeStr, mins) {
  var parts = normalizeTime(timeStr, "09:00").split(":").map(Number);
  var total = (parts[0] || 0) * 60 + (parts[1] || 0) + (mins || 60);
  if (total < 0) total = 0;
  if (total >= 24 * 60) total = 24 * 60 - 1;
  return pad2(Math.floor(total / 60)) + ":" + pad2(total % 60);
}

function buildEventDateTime(eventDate, eventTime, eventEndTime) {
  const dateStr = String(eventDate || new Date().toISOString().slice(0, 10)).slice(0, 10);
  const timeStr = normalizeTime(eventTime, "09:00");
  const endStr = eventEndTime ? normalizeTime(eventEndTime, null) : addMinutes(timeStr, 60);
  return {
    dateStr: dateStr,
    timeStr: timeStr,
    endTimeStr: endStr,
    start: dateStr + "T" + timeStr + ":00",
    end: dateStr + "T" + endStr + ":00",
  };
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

  const dt = buildEventDateTime(evt.eventDate, evt.eventTime, evt.eventEndTime);
  const appUrl = getAppUrl();
  const description = [
    evt.description || "",
    evt.contactName ? "Contact : " + evt.contactName : "",
    evt.contactId ? "Fiche CRM : " + appUrl + "/crm-contact.html?id=" + encodeURIComponent(evt.contactId) : "",
    evt.propertyId
      ? "Bien immo : " + appUrl + "/crm-immo-property.html?id=" + encodeURIComponent(evt.propertyId)
      : "",
    evt.mode ? "Mode RDV : " + evt.mode : "",
    "Source : LeadsOpportunities CRM",
  ]
    .filter(Boolean)
    .join("\n");

  const body = {
    summary: evt.title || "RDV client",
    description: description,
    location: evt.location || undefined,
    start: { dateTime: dt.start, timeZone: TIMEZONE },
    end: { dateTime: dt.end, timeZone: TIMEZONE },
    extendedProperties: {
      private: {
        loEventId: evt.id || "",
        loContactId: evt.contactId || "",
        loPropertyId: evt.propertyId || "",
        loEventType: evt.eventType || "",
        loSource: "crm",
      },
    },
  };

  if (evt.reminderMinutes != null && Number(evt.reminderMinutes) >= 0) {
    body.reminders = {
      useDefault: false,
      overrides: [{ method: "popup", minutes: Number(evt.reminderMinutes) || 60 }],
    };
  }

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
    throw new Error((data.error && data.error.message) || "Calendar insert failed");
  }
  return { ok: true, googleEventId: data.id, htmlLink: data.htmlLink };
}

function parseExtra(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw) || {};
  } catch (e) {
    return {};
  }
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

  const extra = parseExtra(r.extra_data);

  try {
    const contactName =
      ((r.first_name || "") + " " + (r.last_name || "")).trim() || r.contact_email || "";
    const result = await createGoogleCalendarEvent(userId, {
      id: r.id,
      title: r.title,
      description: r.description,
      eventDate: r.event_date,
      eventTime: r.event_time || extra.eventTime || null,
      eventEndTime: extra.eventEndTime || null,
      location: extra.location || "",
      mode: extra.mode || "",
      propertyId: extra.propertyId || "",
      eventType: r.event_type,
      reminderMinutes: extra.reminderMinutes,
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
  await ensureCalendarSchema(sql);
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

async function ensureGoogleAgendaContact(sql, userId) {
  const existing = await sql`
    SELECT id FROM crm_contacts WHERE id = ${GOOGLE_AGENDA_CONTACT_ID} LIMIT 1
  `;
  if (existing.length) return GOOGLE_AGENDA_CONTACT_ID;
  await sql`
    INSERT INTO crm_contacts (
      id, contact_type, first_name, last_name, email, company, status, source, assigned_to, notes, last_activity_at
    ) VALUES (
      ${GOOGLE_AGENDA_CONTACT_ID},
      ${"prospect"},
      ${"Agenda"},
      ${"Google"},
      ${"agenda-google@leadsopportunities.fr"},
      ${"Google Calendar"},
      ${"active"},
      ${"google_calendar"},
      ${userId || null},
      ${"Fiche technique : RDV importés depuis Google Calendar sans contact CRM."},
      NOW()
    )
    ON CONFLICT (id) DO NOTHING
  `;
  return GOOGLE_AGENDA_CONTACT_ID;
}

async function pushUnsyncedCrmEvents(userId) {
  const sql = getSql();
  if (!sql) return { ok: false, error: "no_db", pushed: 0 };
  await ensureCalendarSchema(sql);
  const auth = await getCalendarAccessToken(userId);
  if (!auth) return { ok: false, error: "Agenda Google non connecté", pushed: 0, skipped: true };

  const rows = await sql`
    SELECT e.id
    FROM crm_events e
    WHERE (e.google_event_id IS NULL OR e.google_event_id = '')
      AND (e.google_sync_status IS NULL OR e.google_sync_status IN ('pending', 'error', 'skipped', ''))
    ORDER BY e.event_date DESC NULLS LAST
    LIMIT 100
  `;

  var pushed = 0;
  var errors = 0;
  var skipped = 0;
  for (var i = 0; i < rows.length; i++) {
    var result = await syncCrmEventToGoogle(userId, rows[i].id);
    if (result && result.ok && !result.skipped) pushed++;
    else if (result && result.skipped) skipped++;
    else errors++;
  }
  return { ok: true, pushed: pushed, scanned: rows.length, errors: errors, skipped: skipped };
}

module.exports = {
  CALENDAR_SCOPE,
  GOOGLE_AGENDA_CONTACT_ID,
  createGoogleCalendarEvent,
  syncCrmEventToGoogle,
  getCalendarConnectionStatus,
  getCalendarAccessToken,
  buildEventDateTime,
  ensureGoogleAgendaContact,
  pushUnsyncedCrmEvents,
};
