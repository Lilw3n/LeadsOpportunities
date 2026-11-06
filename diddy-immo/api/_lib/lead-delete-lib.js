/**
 * Suppression d'un enregistrement site_leads — sans toucher à crm_contacts (fiche interlocuteur).
 * Un lead rattaché à une fiche interlocuteur (contact_id) ne peut pas être supprimé.
 */
const { ensureSiteLeadsSchema, ensureLeadWorkflowSchema } = require("./ensure-schema");

function LeadDeleteBlockedError(message, contactId) {
  this.name = "LeadDeleteBlockedError";
  this.message = message || "Ce lead est rattaché à une fiche interlocuteur — suppression impossible.";
  this.code = "LEAD_LINKED_CONTACT";
  this.contactId = contactId || null;
}

async function safe(sql, fn) {
  try {
    await fn();
  } catch (e) {
    console.warn("[lead-delete]", e.message);
  }
}

async function loadLeadForDelete(sql, leadId) {
  var rows = await sql`SELECT id, contact_id, email, phone FROM site_leads WHERE id = ${leadId} LIMIT 1`;
  return rows[0] || null;
}

async function assertLeadDeletable(sql, leadId, opts) {
  opts = opts || {};
  var row = await loadLeadForDelete(sql, leadId);
  if (!row) return null;
  if (row.contact_id && !opts.allowLinkedContact) {
    var err = new LeadDeleteBlockedError(undefined, row.contact_id);
    throw err;
  }
  return row;
}

async function deleteLeadById(sql, leadId, opts) {
  opts = opts || {};
  if (!sql || !leadId) return false;

  await ensureSiteLeadsSchema(sql);
  await ensureLeadWorkflowSchema(sql);

  await assertLeadDeletable(sql, leadId, opts);

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
    return sql`UPDATE crm_activities SET lead_id = NULL WHERE lead_id = ${leadId}`;
  });
  await safe(sql, function () {
    return sql`DELETE FROM crm_activities WHERE lead_id = ${leadId} AND contact_id IS NULL`;
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
  await safe(sql, function () {
    return sql`DELETE FROM lead_funnel_events WHERE lead_id::text = ${String(leadId)}`;
  });

  await sql`DELETE FROM site_leads WHERE id = ${leadId}`;
  return true;
}

module.exports = {
  LeadDeleteBlockedError,
  loadLeadForDelete,
  assertLeadDeletable,
  deleteLeadById,
};
