/**
 * Recherche leads (dont UUID Slack) — partagé dashboard / CRM / Slack.
 */
const LEAD_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isLeadUuid(value) {
  return LEAD_UUID_RE.test(String(value || "").trim());
}

function normalizeLeadId(value) {
  return String(value || "").trim();
}

function leadHaystack(lead) {
  var l = lead || {};
  var payload = l.payload_obj || {};
  if (!l.payload_obj && l.payload) {
    try {
      payload = typeof l.payload === "object" ? l.payload : JSON.parse(l.payload);
    } catch (e) {
      payload = {};
    }
  }
  return [
    l.id,
    l.email,
    l.phone,
    l.full_name,
    l.vertical,
    l.source,
    l.contact_id,
    l.visitor_id,
    l.notes,
    l.devis_summary,
    l.client_ip,
    payload.firstName,
    payload.lastName,
    payload.fullName,
    payload.city,
    payload.phone,
    payload.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function leadMatchesQuery(lead, q) {
  var needle = String(q || "")
    .trim()
    .toLowerCase();
  if (!needle) return true;
  if (isLeadUuid(needle) && String(lead && lead.id ? lead.id : "").toLowerCase() === needle) {
    return true;
  }
  return leadHaystack(lead).indexOf(needle) >= 0;
}

/**
 * Clause SQL (Neon tagged template) : email, tél, vertical, source, IP, ID, contact, visiteur, notes, payload.
 */
function leadListSearchMatch(sql, searchPattern) {
  return sql`(
    LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(source, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(client_ip, '')) LIKE LOWER(${searchPattern})
    OR LOWER(id) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(contact_id, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(visitor_id, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(notes, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(
      CASE
        WHEN payload IS NULL OR trim(payload) = '' THEN NULL
        WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'clientIp')
        ELSE NULL
      END, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(
      CASE
        WHEN payload IS NULL OR trim(payload) = '' THEN NULL
        WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'firstName')
        ELSE NULL
      END, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(
      CASE
        WHEN payload IS NULL OR trim(payload) = '' THEN NULL
        WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'lastName')
        ELSE NULL
      END, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(
      CASE
        WHEN payload IS NULL OR trim(payload) = '' THEN NULL
        WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'fullName')
        ELSE NULL
      END, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(
      CASE
        WHEN payload IS NULL OR trim(payload) = '' THEN NULL
        WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'city')
        ELSE NULL
      END, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(
      CASE
        WHEN payload IS NULL OR trim(payload) = '' THEN NULL
        WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'email')
        ELSE NULL
      END, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(
      CASE
        WHEN payload IS NULL OR trim(payload) = '' THEN NULL
        WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'phone')
        ELSE NULL
      END, '')) LIKE LOWER(${searchPattern})
  )`;
}

function leadListSearchMatchMinimal(sql, searchPattern) {
  return sql`(
    LOWER(COALESCE(email, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(phone, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(vertical, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(source, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(client_ip, '')) LIKE LOWER(${searchPattern})
    OR LOWER(id) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(
      CASE
        WHEN payload IS NULL OR trim(payload) = '' THEN NULL
        WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'clientIp')
        ELSE NULL
      END, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(
      CASE
        WHEN payload IS NULL OR trim(payload) = '' THEN NULL
        WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'firstName')
        ELSE NULL
      END, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(
      CASE
        WHEN payload IS NULL OR trim(payload) = '' THEN NULL
        WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'lastName')
        ELSE NULL
      END, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(
      CASE
        WHEN payload IS NULL OR trim(payload) = '' THEN NULL
        WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'fullName')
        ELSE NULL
      END, '')) LIKE LOWER(${searchPattern})
    OR LOWER(COALESCE(
      CASE
        WHEN payload IS NULL OR trim(payload) = '' THEN NULL
        WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'city')
        ELSE NULL
      END, '')) LIKE LOWER(${searchPattern})
  )`;
}

function crmLeadDetailPath(leadId) {
  return "/crm-lead-detail.html?id=" + encodeURIComponent(normalizeLeadId(leadId));
}

function dashboardLeadPath(leadId) {
  return "/dashboard.html?section=leads&lead=" + encodeURIComponent(normalizeLeadId(leadId));
}

module.exports = {
  LEAD_UUID_RE,
  isLeadUuid,
  normalizeLeadId,
  leadHaystack,
  leadMatchesQuery,
  leadListSearchMatch,
  leadListSearchMatchMinimal,
  crmLeadDetailPath,
  dashboardLeadPath,
};
