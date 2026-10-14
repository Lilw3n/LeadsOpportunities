const crypto = require("crypto");

const RESOURCES = {
  events: {
    table: "crm_events",
    prefix: "evt_",
    createFields: [
      "event_type",
      "title",
      "description",
      "event_date",
      "event_time",
      "status",
      "priority",
    ],
  },
  claims: {
    table: "crm_claims",
    prefix: "clm_",
    createFields: [
      "vehicle_id",
      "driver_id",
      "claim_type",
      "claim_date",
      "amount",
      "description",
      "insurer",
      "status",
      "responsible",
      "percentage",
      "parent_id",
    ],
  },
  vehicles: {
    table: "crm_vehicles",
    prefix: "veh_",
    createFields: ["registration", "brand", "model", "year", "vehicle_type", "status", "parent_id"],
  },
  drivers: {
    table: "crm_drivers",
    prefix: "drv_",
    createFields: ["first_name", "last_name", "license_number", "license_type", "status"],
  },
  contracts: {
    table: "crm_contracts",
    prefix: "ctr_",
    createFields: [
      "contract_type",
      "status",
      "start_date",
      "end_date",
      "premium",
      "insurer",
      "policy_number",
      "description",
    ],
  },
  "insurance-requests": {
    table: "crm_insurance_requests",
    prefix: "req_",
    createFields: [
      "request_type",
      "status",
      "vehicle_id",
      "driver_id",
      "requested_date",
      "processed_date",
      "amount",
      "description",
      "priority",
      "assigned_to",
      "parent_id",
    ],
  },
};

function pickBody(body, fields) {
  const out = {};
  for (const f of fields) {
    const camel = f.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    if (body[f] !== undefined) out[f] = body[f];
    else if (body[camel] !== undefined) out[f] = body[camel];
  }
  return out;
}

async function assertContactAccess(sql, contactId, scope) {
  const rows = await sql`
    SELECT id FROM crm_contacts
    WHERE id = ${contactId}
      AND (${scope}::text IS NULL OR assigned_to = ${scope})
    LIMIT 1
  `;
  return rows.length > 0;
}

async function touchContact(sql, contactId) {
  await sql`
    UPDATE crm_contacts SET last_activity_at = NOW(), updated_at = NOW()
    WHERE id = ${contactId}
  `;
}

async function loadAllModules(sql, contactId) {
  const [events, claims, vehicles, drivers, contracts, insuranceRequests] =
    await Promise.all([
      sql`SELECT * FROM crm_events WHERE contact_id = ${contactId} ORDER BY event_date DESC NULLS LAST, created_at DESC`,
      sql`SELECT * FROM crm_claims WHERE contact_id = ${contactId} ORDER BY created_at DESC`,
      sql`SELECT * FROM crm_vehicles WHERE contact_id = ${contactId} ORDER BY created_at DESC`,
      sql`SELECT * FROM crm_drivers WHERE contact_id = ${contactId} ORDER BY created_at DESC`,
      sql`SELECT * FROM crm_contracts WHERE contact_id = ${contactId} ORDER BY created_at DESC`,
      sql`SELECT * FROM crm_insurance_requests WHERE contact_id = ${contactId} ORDER BY created_at DESC`,
    ]);
  return { events, claims, vehicles, drivers, contracts, insuranceRequests };
}

/** Événements d’autres dossiers où ce contact est cité comme interlocuteur. */
async function loadLinkedEvents(sql, contactId) {
  const like = "%" + String(contactId) + "%";
  return sql`
    SELECT
      e.id,
      e.contact_id,
      e.event_type,
      e.title,
      e.description,
      e.event_date,
      e.event_time,
      e.status,
      e.priority,
      e.extra_data,
      e.created_at,
      c.first_name AS dossier_first_name,
      c.last_name AS dossier_last_name
    FROM crm_events e
    INNER JOIN crm_contacts c ON c.id = e.contact_id
    WHERE e.contact_id <> ${contactId}
      AND e.extra_data IS NOT NULL
      AND e.extra_data LIKE ${like}
    ORDER BY e.event_date DESC NULLS LAST, e.created_at DESC
    LIMIT 80
  `;
}

module.exports = {
  RESOURCES,
  pickBody,
  assertContactAccess,
  touchContact,
  loadAllModules,
  loadLinkedEvents,
  newId(prefix) {
    return prefix + crypto.randomUUID();
  },
};
