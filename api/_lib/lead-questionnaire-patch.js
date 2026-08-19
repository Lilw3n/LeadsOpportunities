/**
 * Patch admin questionnaire → site_leads.payload + sync fiche interlocuteur.
 */
const crypto = require("crypto");
const { hydrateInterlocuteurFromLead } = require("./hydrate-interlocuteur");

function parsePayload(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function normalizePatch(obj) {
  var out = {};
  if (!obj || typeof obj !== "object") return out;
  Object.keys(obj).forEach(function (k) {
    if (k.indexOf("__") === 0) return;
    var v = obj[k];
    if (v === undefined) return;
    out[String(k).slice(0, 120)] = v == null ? "" : String(v).slice(0, 4000);
  });
  return out;
}

async function patchLeadQuestionnaire(sql, opts) {
  opts = opts || {};
  var leadId = opts.leadId;
  if (!leadId || !sql) return { ok: false, error: "leadId requis" };

  var rows = await sql`
    SELECT id, email, phone, vertical, payload, contact_id
    FROM site_leads WHERE id = ${leadId} LIMIT 1
  `;
  if (!rows.length) return { ok: false, error: "Lead introuvable" };
  var lead = rows[0];
  var payload = parsePayload(lead.payload);
  var patch = normalizePatch(opts.payloadPatch || opts.fields || {});
  var fieldComments = opts.fieldComments && typeof opts.fieldComments === "object" ? opts.fieldComments : {};
  var adminNotes =
    opts.adminQuestionnaireNotes != null
      ? String(opts.adminQuestionnaireNotes).slice(0, 8000)
      : opts.adminComment != null
        ? String(opts.adminComment).slice(0, 8000)
        : undefined;

  var adminEdits = Array.isArray(payload.adminEdits) ? payload.adminEdits.slice() : [];
  var now = new Date().toISOString();
  var editorId = opts.user && opts.user.id ? opts.user.id : null;

  Object.keys(patch).forEach(function (key) {
    var prev = payload[key];
    if (String(prev == null ? "" : prev) === String(patch[key])) return;
    adminEdits.push({
      field: key,
      previous: prev == null ? "" : String(prev),
      value: patch[key],
      by: editorId,
      at: now,
    });
    payload[key] = patch[key];
  });

  if (Object.keys(fieldComments).length) {
    payload.adminFieldComments = Object.assign({}, payload.adminFieldComments || {}, fieldComments);
  }
  if (adminNotes !== undefined) {
    payload.adminQuestionnaireNotes = adminNotes;
  }
  if (adminEdits.length) {
    payload.adminEdits = adminEdits.slice(-80);
    payload.adminEditedAt = now;
    payload.adminEditedBy = editorId;
  }

  var email = lead.email;
  var phone = lead.phone;
  if (patch.email) email = String(patch.email).trim().toLowerCase().slice(0, 320);
  if (patch.phone || patch.telephone) phone = String(patch.phone || patch.telephone).trim().slice(0, 40);

  await sql`
    UPDATE site_leads SET
      payload = ${JSON.stringify(payload)},
      email = COALESCE(${email || null}, email),
      phone = COALESCE(${phone || null}, phone),
      updated_at = NOW(),
      last_activity_at = NOW()
    WHERE id = ${leadId}
  `;

  var contactId = lead.contact_id || opts.contactId || null;
  var syncContact = opts.syncContact !== false;
  var hydrated = null;

  if (syncContact && contactId) {
    try {
      var leadForHydrate = Object.assign({}, lead, {
        email: email || lead.email,
        phone: phone || lead.phone,
        payload: JSON.stringify(payload),
      });
      hydrated = await hydrateInterlocuteurFromLead(sql, opts.user || null, leadForHydrate, contactId);
    } catch (e) {
      console.warn("[lead-questionnaire-patch] hydrate", e.message);
    }
  }

  if (contactId && adminNotes) {
    try {
      var actId = "act_" + crypto.randomUUID();
      await sql`
        INSERT INTO crm_activities (id, contact_id, lead_id, user_id, activity_type, title, body)
        VALUES (
          ${actId}, ${contactId}, ${leadId}, ${editorId},
          'note', ${"Commentaire admin — questionnaire"},
          ${JSON.stringify({ adminQuestionnaireNotes: adminNotes, source: "questionnaire_edit" })}
        )
      `;
    } catch (e) {
      console.warn("[lead-questionnaire-patch] activity", e.message);
    }
  }

  return {
    ok: true,
    leadId: leadId,
    contactId: contactId,
    payload: payload,
    dossierFilled: hydrated && hydrated.dossierFilled,
    syncedInterlocuteur: !!hydrated,
  };
}

module.exports = { patchLeadQuestionnaire, parsePayload, normalizePatch };
