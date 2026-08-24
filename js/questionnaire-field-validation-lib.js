/**
 * Validation champ par champ — copie vendeur vs baseline admin (tous questionnaires).
 * Navigateur + Node.
 */
(function (root) {
  var Dossier = function () {
    return root.InterlocuteurDossier;
  };

  var META_KEYS = {
    vendorSubmission: 1,
    adminBaseline: 1,
    fieldValidation: 1,
    validationMeta: 1,
    vendorSubmissions: 1,
    adminEdits: 1,
    adminFieldComments: 1,
    adminEditedAt: 1,
    adminEditedBy: 1,
    adminQuestionnaireNotes: 1,
    questionnaireDraft: 1,
    custom_answers: 1,
    funnel: 1,
    payload: 1,
    duplicate_of: 1,
    parent_lead_id: 1,
    _crmContactId: 1,
  };

  function parsePayload(raw) {
    if (!raw) return {};
    if (typeof raw === "object") return Object.assign({}, raw);
    try {
      return JSON.parse(String(raw));
    } catch (e) {
      return {};
    }
  }

  function normalizeValue(v) {
    if (v == null) return "";
    if (typeof v === "boolean") return v ? "1" : "0";
    if (Array.isArray(v)) return v.map(normalizeValue).filter(Boolean).join(", ");
    if (typeof v === "object") {
      try {
        return JSON.stringify(v);
      } catch (e2) {
        return String(v);
      }
    }
    return String(v).trim().replace(/\s+/g, " ");
  }

  function valuesEqual(a, b) {
    return normalizeValue(a).toLowerCase() === normalizeValue(b).toLowerCase();
  }

  function labelOf(key) {
    var D = Dossier();
    if (D && D.labelOf) return D.labelOf(key);
    return key;
  }

  function isComparableKey(key) {
    if (!key || typeof key !== "string") return false;
    if (META_KEYS[key]) return false;
    if (key.indexOf("utm_") === 0 || key.indexOf("attr_") === 0 || key.indexOf("meta_") === 0) return false;
    if (key.indexOf("seo_") === 0 || key.indexOf("landing_") === 0 || key.indexOf("parcours_") === 0) return false;
    if (key.indexOf("__") === 0) return false;
    return true;
  }

  function extractComparableFields(payload) {
    var p = parsePayload(payload);
    var out = {};
    Object.keys(p).forEach(function (key) {
      if (!isComparableKey(key)) return;
      var v = p[key];
      if (v == null || v === "") return;
      if (typeof v === "object" && !Array.isArray(v)) return;
      out[key] = v;
    });
    return out;
  }

  function snapshotVendorSubmission(payload, meta) {
    meta = meta || {};
    return {
      fields: extractComparableFields(payload),
      submittedAt: meta.submittedAt || new Date().toISOString(),
      source: meta.source || "questionnaire",
      leadId: meta.leadId || null,
      contactId: meta.contactId || null,
    };
  }

  function buildFieldDiffs(baselineFields, vendorFields) {
    var diffs = [];
    var keys = {};
    Object.keys(baselineFields || {}).forEach(function (k) {
      keys[k] = true;
    });
    Object.keys(vendorFields || {}).forEach(function (k) {
      keys[k] = true;
    });
    Object.keys(keys).forEach(function (field) {
      var adminValue = baselineFields[field];
      var vendorValue = vendorFields[field];
      var hasAdmin = adminValue != null && adminValue !== "";
      var hasVendor = vendorValue != null && vendorValue !== "";
      if (!hasAdmin && !hasVendor) return;
      if (hasAdmin && hasVendor && valuesEqual(adminValue, vendorValue)) return;
      diffs.push({
        field: field,
        label: labelOf(field),
        adminValue: hasAdmin ? String(adminValue) : "",
        vendorValue: hasVendor ? String(vendorValue) : "",
        status: "pending",
        resolvedValue: null,
        resolvedAt: null,
        resolvedBy: null,
      });
    });
    return diffs.sort(function (a, b) {
      return a.label.localeCompare(b.label, "fr", { sensitivity: "base" });
    });
  }

  function diffsToValidationMap(diffs) {
    var map = {};
    (diffs || []).forEach(function (d) {
      map[d.field] = Object.assign({}, d);
    });
    return map;
  }

  function countPending(fieldValidation) {
    var n = 0;
    Object.keys(fieldValidation || {}).forEach(function (k) {
      if (fieldValidation[k] && fieldValidation[k].status === "pending") n++;
    });
    return n;
  }

  function initValidationState(baselinePayload, vendorPayload, meta) {
    meta = meta || {};
    var baselineFields = extractComparableFields(baselinePayload);
    var vendorFields = extractComparableFields(vendorPayload);
    var diffs = buildFieldDiffs(baselineFields, vendorFields);
    var fieldValidation = diffsToValidationMap(diffs);
    var pending = countPending(fieldValidation);
    return {
      vendorSubmission: snapshotVendorSubmission(vendorPayload, meta),
      adminBaseline: {
        fields: baselineFields,
        capturedAt: meta.capturedAt || new Date().toISOString(),
        sourceLeadId: meta.baselineLeadId || null,
        contactId: meta.contactId || null,
      },
      fieldValidation: fieldValidation,
      validationMeta: {
        requiresReview: pending > 0,
        pendingCount: pending,
        createdAt: meta.capturedAt || new Date().toISOString(),
        resolvedAt: pending > 0 ? null : new Date().toISOString(),
      },
    };
  }

  function choiceToStatus(choice) {
    if (choice === "admin") return "accepted_admin";
    if (choice === "vendor") return "accepted_vendor";
    if (choice === "custom") return "accepted_custom";
    return "pending";
  }

  function resolveField(entry, choice, customValue) {
    entry = Object.assign({}, entry);
    entry.status = choiceToStatus(choice);
    if (entry.status === "accepted_admin") entry.resolvedValue = entry.adminValue;
    else if (entry.status === "accepted_vendor") entry.resolvedValue = entry.vendorValue;
    else if (entry.status === "accepted_custom") entry.resolvedValue = customValue == null ? "" : String(customValue);
    entry.resolvedAt = new Date().toISOString();
    return entry;
  }

  function applyValidationChoices(payload, choices, opts) {
    opts = opts || {};
    var p = parsePayload(payload);
    var fv = Object.assign({}, p.fieldValidation || {});
    var editorId = opts.userId || opts.by || null;
    var now = new Date().toISOString();

    Object.keys(choices || {}).forEach(function (field) {
      if (!fv[field]) return;
      var choice = choices[field];
      var customValues = opts.customValues || {};
      var entry = resolveField(fv[field], choice, customValues[field]);
      entry.resolvedBy = editorId;
      entry.resolvedAt = now;
      fv[field] = entry;
      if (entry.resolvedValue != null && entry.resolvedValue !== "") {
        p[field] = entry.resolvedValue;
      }
    });

    p.fieldValidation = fv;
    var pending = countPending(fv);
    p.validationMeta = Object.assign({}, p.validationMeta || {}, {
      pendingCount: pending,
      requiresReview: pending > 0,
      resolvedAt: pending > 0 ? p.validationMeta && p.validationMeta.resolvedAt : now,
      lastValidatedAt: now,
      lastValidatedBy: editorId,
    });
    return p;
  }

  function getEffectivePayload(payload) {
    var p = parsePayload(payload);
    var fv = p.fieldValidation || {};
    var baseline = (p.adminBaseline && p.adminBaseline.fields) || {};
    var effective = Object.assign({}, p);

    Object.keys(baseline).forEach(function (field) {
      if (effective[field] == null || effective[field] === "") effective[field] = baseline[field];
    });

    Object.keys(fv).forEach(function (field) {
      var entry = fv[field];
      if (!entry) return;
      if (entry.status === "pending") {
        if (entry.adminValue !== "" && entry.adminValue != null) effective[field] = entry.adminValue;
        return;
      }
      if (entry.resolvedValue != null && entry.resolvedValue !== "") {
        effective[field] = entry.resolvedValue;
      }
    });

    if (p.vendorSubmission && p.vendorSubmission.fields) {
      effective._vendorFields = p.vendorSubmission.fields;
    }
    return effective;
  }

  function listPendingFields(payload) {
    var fv = (parsePayload(payload).fieldValidation) || {};
    return Object.keys(fv)
      .filter(function (k) {
        return fv[k] && fv[k].status === "pending";
      })
      .map(function (k) {
        return fv[k];
      })
      .sort(function (a, b) {
        return a.label.localeCompare(b.label, "fr", { sensitivity: "base" });
      });
  }

  function mergeValidationIntoPayload(payload, validationState) {
    var p = parsePayload(payload);
    if (validationState.vendorSubmission) p.vendorSubmission = validationState.vendorSubmission;
    if (validationState.adminBaseline) p.adminBaseline = validationState.adminBaseline;
    if (validationState.fieldValidation) p.fieldValidation = validationState.fieldValidation;
    if (validationState.validationMeta) p.validationMeta = validationState.validationMeta;
    return p;
  }

  var api = {
    META_KEYS: META_KEYS,
    parsePayload: parsePayload,
    normalizeValue: normalizeValue,
    valuesEqual: valuesEqual,
    extractComparableFields: extractComparableFields,
    snapshotVendorSubmission: snapshotVendorSubmission,
    buildFieldDiffs: buildFieldDiffs,
    initValidationState: initValidationState,
    applyValidationChoices: applyValidationChoices,
    getEffectivePayload: getEffectivePayload,
    listPendingFields: listPendingFields,
    countPending: countPending,
    mergeValidationIntoPayload: mergeValidationIntoPayload,
    choiceToStatus: choiceToStatus,
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  root.QuestionnaireFieldValidation = api;
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
