/**
 * Suppression cascade d'un lead site_leads + dépendances connues.
 */
const { ensureSiteLeadsSchema } = require("./ensure-schema");

async function safe(sql, fn) {
  try {
    await fn();
  } catch (e) {
    console.warn("[lead-delete]", e.message);
  }
}

async function deleteLeadById(sql, leadId) {
  if (!sql || !leadId) return false;

  await ensureSiteLeadsSchema(sql);

  await safe(sql, function () {
    return sql`UPDATE site_leads SET parent_lead_id = NULL WHERE parent_lead_id = ${leadId}`;
  });

  await safe(sql, function () {
    return sql`DELETE FROM lead_events WHERE lead_id = ${leadId}`;
  });
  await safe(sql, function () {
    return sql`DELETE FROM lead_touchpoints WHERE lead_id = ${leadId}`;
  });
  await safe(sql, function () {
    return sql`DELETE FROM crm_activities WHERE lead_id = ${leadId}`;
  });
  await safe(sql, function () {
    return sql`DELETE FROM partner_dispatch_log WHERE lead_id = ${leadId}`;
  });
  await safe(sql, function () {
    return sql`DELETE FROM journey_events WHERE lead_id = ${leadId}`;
  });
  await safe(sql, function () {
    return sql`UPDATE mailbox_messages SET lead_id = NULL WHERE lead_id = ${leadId}`;
  });
  await safe(sql, function () {
    return sql`UPDATE crm_immo_properties SET lead_id = NULL WHERE lead_id = ${leadId}`;
  });
  await safe(sql, function () {
    return sql`UPDATE crm_immo_buyer_criteria SET lead_id = NULL WHERE lead_id = ${leadId}`;
  });

  await sql`DELETE FROM site_leads WHERE id = ${leadId}`;
  return true;
}

module.exports = {
  deleteLeadById,
};
