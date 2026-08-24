/**
 * Préparation validation champ par champ à l'ingestion questionnaire.
 */
const Validation = require("../../js/questionnaire-field-validation-lib");
const Dossier = require("../../js/interlocuteur-dossier-lib");

function parsePayload(raw) {
  return Validation.parsePayload(raw);
}

function parseMeta(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function dossierToFields(meta) {
  var d = meta && meta.dossier;
  if (!d) return {};
  var out = {};
  function rows(list) {
    (list || []).forEach(function (row) {
      if (row && row.key && row.value != null && row.value !== "") out[row.key] = row.value;
    });
  }
  rows(d.perso);
  rows(d.pro);
  rows(d.projet);
  if (d.biens) {
    rows(d.biens.vehicules);
    rows(d.biens.immobilier);
    rows(d.biens.autres);
  }
  return out;
}

async function loadAdminBaseline(sql, contactId, leadId) {
  var baselinePayload = {};
  var baselineLeadId = null;

  if (sql && contactId) {
    const prior = await sql`
      SELECT id, payload FROM site_leads
      WHERE contact_id = ${contactId}
        AND id != ${leadId}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (prior.length) {
      baselineLeadId = prior[0].id;
      var priorPayload = parsePayload(prior[0].payload);
      baselinePayload = Validation.getEffectivePayload(priorPayload);
    }

    const contacts = await sql`
      SELECT metadata FROM crm_contacts WHERE id = ${contactId} LIMIT 1
    `;
    if (contacts.length) {
      var meta = parseMeta(contacts[0].metadata);
      var fromDossier = dossierToFields(meta);
      baselinePayload = Object.assign({}, fromDossier, baselinePayload);
    }
  }

  return {
    payload: baselinePayload,
    baselineLeadId: baselineLeadId,
  };
}

/**
 * Compare la soumission à la baseline admin ; enregistre copie vendeur + file de validation.
 */
async function prepareQuestionnaireValidation(sql, opts) {
  opts = opts || {};
  var leadId = opts.leadId;
  var contactId = opts.contactId;
  var incomingPayload = parsePayload(opts.incomingPayload || opts.payload);
  if (!leadId || !sql) return { ok: false, error: "leadId requis" };

  var now = new Date().toISOString();
  var vendorOnly = Validation.snapshotVendorSubmission(incomingPayload, {
    submittedAt: now,
    leadId: leadId,
    contactId: contactId || null,
    source: opts.source || "questionnaire",
  });

  if (!contactId) {
    var outNew = Object.assign({}, incomingPayload, {
      vendorSubmission: vendorOnly,
      validationMeta: {
        requiresReview: false,
        pendingCount: 0,
        createdAt: now,
        resolvedAt: now,
        note: "nouveau_contact",
      },
    });
    await sql`
      UPDATE site_leads SET payload = ${JSON.stringify(outNew)}, updated_at = NOW()
      WHERE id = ${leadId}
    `;
    return {
      ok: true,
      leadId: leadId,
      requiresReview: false,
      pendingCount: 0,
      payload: outNew,
    };
  }

  var baseline = await loadAdminBaseline(sql, contactId, leadId);
  var baselineFields = Object.assign({}, baseline.payload);
  var hasBaseline = Object.keys(Validation.extractComparableFields(baselineFields)).length > 0;

  if (!hasBaseline) {
    var outFirst = Object.assign({}, incomingPayload, {
      vendorSubmission: vendorOnly,
      validationMeta: {
        requiresReview: false,
        pendingCount: 0,
        createdAt: now,
        resolvedAt: now,
        note: "premier_questionnaire_contact",
      },
    });
    await sql`
      UPDATE site_leads SET payload = ${JSON.stringify(outFirst)}, updated_at = NOW()
      WHERE id = ${leadId}
    `;
    return {
      ok: true,
      leadId: leadId,
      requiresReview: false,
      pendingCount: 0,
      payload: outFirst,
    };
  }

  var state = Validation.initValidationState(baselineFields, incomingPayload, {
    capturedAt: now,
    baselineLeadId: baseline.baselineLeadId,
    contactId: contactId,
    leadId: leadId,
    source: opts.source || "questionnaire",
  });

  var merged = Validation.mergeValidationIntoPayload(incomingPayload, state);
  var history = Array.isArray(merged.vendorSubmissions) ? merged.vendorSubmissions.slice() : [];
  history.push(vendorOnly);
  merged.vendorSubmissions = history.slice(-12);

  await sql`
    UPDATE site_leads SET payload = ${JSON.stringify(merged)}, updated_at = NOW()
    WHERE id = ${leadId}
  `;

  var pending = Validation.countPending(merged.fieldValidation);
  if (pending > 0 && contactId) {
    try {
      const crypto = require("crypto");
      var actId = "act_" + crypto.randomUUID();
      await sql`
        INSERT INTO crm_activities (id, contact_id, lead_id, activity_type, title, body)
        VALUES (
          ${actId}, ${contactId}, ${leadId}, 'note',
          ${"Questionnaire — différences à valider (" + pending + ")"},
          ${JSON.stringify({
            source: "questionnaire_validation",
            pendingCount: pending,
            pendingFields: Validation.listPendingFields(merged).map(function (f) {
              return f.field;
            }),
          })}
        )
      `;
    } catch (actErr) {
      console.warn("[questionnaire-validation] activity", actErr.message);
    }
  }

  return {
    ok: true,
    leadId: leadId,
    contactId: contactId,
    requiresReview: pending > 0,
    pendingCount: pending,
    pendingFields: Validation.listPendingFields(merged),
    payload: merged,
  };
}

async function applyQuestionnaireValidation(sql, opts) {
  opts = opts || {};
  var leadId = opts.leadId;
  if (!leadId || !sql) return { ok: false, error: "leadId requis" };

  const rows = await sql`
    SELECT id, payload, contact_id, email, phone, vertical FROM site_leads
    WHERE id = ${leadId} LIMIT 1
  `;
  if (!rows.length) return { ok: false, error: "Lead introuvable" };

  var lead = rows[0];
  var payload = parsePayload(lead.payload);
  var choices = opts.choices || {};
  if (!Object.keys(choices).length) return { ok: false, error: "choices requis" };

  payload = Validation.applyValidationChoices(payload, choices, {
    userId: opts.userId || null,
    customValues: opts.customValues || {},
  });

  await sql`
    UPDATE site_leads SET
      payload = ${JSON.stringify(payload)},
      updated_at = NOW(),
      last_activity_at = NOW()
    WHERE id = ${leadId}
  `;

  var pending = Validation.countPending(payload.fieldValidation);
  var hydrated = null;
  if (opts.syncContact !== false && lead.contact_id && pending === 0) {
    try {
      const { hydrateInterlocuteurFromLead } = require("./hydrate-interlocuteur");
      var effective = Validation.getEffectivePayload(payload);
      var leadForHydrate = Object.assign({}, lead, {
        payload: JSON.stringify(effective),
      });
      hydrated = await hydrateInterlocuteurFromLead(sql, opts.user || null, leadForHydrate, lead.contact_id);
    } catch (e) {
      console.warn("[questionnaire-validation] hydrate", e.message);
    }
  }

  return {
    ok: true,
    leadId: leadId,
    contactId: lead.contact_id,
    pendingCount: pending,
    requiresReview: pending > 0,
    payload: payload,
    syncedInterlocuteur: !!hydrated,
    dossierFilled: hydrated && hydrated.dossierFilled,
  };
}

function validationSummary(payload) {
  var p = parsePayload(payload);
  return {
    requiresReview: !!(p.validationMeta && p.validationMeta.requiresReview),
    pendingCount: Validation.countPending(p.fieldValidation),
    pendingFields: Validation.listPendingFields(p),
    vendorSubmittedAt: p.vendorSubmission && p.vendorSubmission.submittedAt,
    adminBaselineAt: p.adminBaseline && p.adminBaseline.capturedAt,
  };
}

module.exports = {
  prepareQuestionnaireValidation,
  applyQuestionnaireValidation,
  validationSummary,
  loadAdminBaseline,
  parsePayload,
  Dossier: Dossier,
};
