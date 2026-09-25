const crypto = require("crypto");

const IMPORTANT_EVENTS = [
  "lead_updated",
  "lead_converted",
  "call_completed",
  "summary_ready",
  "transcript_ready",
  "callback_scheduled",
  "meeting_booked",
  "lead_interested",
  "payment_received",
  "document_uploaded",
];

function stringifyPayload(payload) {
  try {
    return JSON.stringify(payload || {});
  } catch {
    return "{}";
  }
}

async function recordLeadEvent(sql, options) {
  if (!sql || !options || !options.leadId) return null;
  const eventType = options.eventType || "lead_event";
  const important = options.important !== false && IMPORTANT_EVENTS.indexOf(eventType) >= 0;
  const eventId = "lev_" + crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await sql`
      INSERT INTO lead_events (
        id, lead_id, contact_id, event_type, source, title, body, payload, actor_id
      ) VALUES (
        ${eventId},
        ${options.leadId},
        ${options.contactId || null},
        ${eventType},
        ${options.source || "crm"},
        ${options.title || null},
        ${options.body || null},
        ${stringifyPayload(options.payload)},
        ${options.actorId || null}
      )
    `;
  } catch (e) {
    if (e.code !== "42P01") console.warn("[lead-workflow] event insert skipped", e.message);
  }

  try {
    if (important) {
      await sql`
        UPDATE site_leads
        SET last_event_at = NOW(),
            last_event_type = ${eventType},
            archived_at = NULL,
            archived_by = NULL,
            archive_reason = NULL,
            last_activity_at = NOW(),
            updated_at = NOW()
        WHERE id = ${options.leadId}
      `;
    } else {
      await sql`
        UPDATE site_leads
        SET last_event_at = COALESCE(last_event_at, ${now}),
            last_event_type = COALESCE(last_event_type, ${eventType}),
            updated_at = NOW()
        WHERE id = ${options.leadId}
      `;
    }
  } catch (e) {
    console.warn("[lead-workflow] lead update skipped", e.message);
  }

  return eventId;
}

async function markLeadOpened(sql, leadId, actorId) {
  if (!sql || !leadId) return;
  try {
    await sql`
      UPDATE site_leads
      SET opened_at = COALESCE(opened_at, NOW()),
          opened_by = COALESCE(opened_by, ${actorId || null}),
          updated_at = NOW()
      WHERE id = ${leadId}
    `;
  } catch (e) {
    console.warn("[lead-workflow] opened skipped", e.message);
  }
}

async function archiveLead(sql, leadId, actorId, reason) {
  if (!sql || !leadId) return;
  try {
    await sql`
      UPDATE site_leads
      SET archived_at = NOW(),
          archived_by = ${actorId || null},
          archive_reason = ${reason || "Archive manuel"},
          updated_at = NOW()
      WHERE id = ${leadId}
    `;
  } catch (e) {
    console.error("[lead-workflow] archive", e.message);
    throw e;
  }
  await recordLeadEvent(sql, {
    leadId,
    actorId,
    eventType: "lead_archived",
    source: "crm",
    title: "Lead archive",
    body: reason || "Archive manuel",
    important: false,
  });
}

async function assignLead(sql, leadId, actorId, assignedTo, sharedWith) {
  if (!sql || !leadId) return;
  await sql`
    UPDATE site_leads
    SET assigned_to = ${assignedTo || null},
        shared_with = ${JSON.stringify(sharedWith || [])},
        updated_at = NOW()
    WHERE id = ${leadId}
  `;
  await recordLeadEvent(sql, {
    leadId,
    actorId,
    eventType: "lead_assigned",
    source: "crm",
    title: assignedTo ? "Lead assigne" : "Lead remis dans le pool",
    payload: { assignedTo, sharedWith },
    important: false,
  });
}

module.exports = {
  IMPORTANT_EVENTS,
  recordLeadEvent,
  markLeadOpened,
  archiveLead,
  assignLead,
};
