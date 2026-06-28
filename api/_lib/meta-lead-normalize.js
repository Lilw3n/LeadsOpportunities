const { loadFormConfig } = require("./meta-lead-ads");

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function resolveCanonicalField(questionKey, cfg) {
  var key = normalizeKey(questionKey);
  if (cfg.field_map && cfg.field_map[key]) return cfg.field_map[key];
  if (/^[a-z][a-zA-Z0-9_]*$/.test(String(questionKey || ""))) {
    return String(questionKey).trim();
  }
  return null;
}

function mapServiceNeedToVertical(value, cfg) {
  var k = normalizeKey(value);
  var map = cfg.service_need_map || {};
  if (map[k]) return map[k];
  for (var label in map) {
    if (k.indexOf(normalizeKey(label)) >= 0) return map[label];
  }
  return null;
}

function findTemplate(cfg, formId, vertical) {
  if (formId && cfg.forms && cfg.forms[String(formId)] && cfg.forms[String(formId)].template) {
    return cfg.form_templates[cfg.forms[String(formId)].template] || null;
  }
  if (formId && cfg.forms && cfg.forms[String(formId)]) {
    return cfg.forms[String(formId)];
  }
  var templates = cfg.form_templates || {};
  var keys = Object.keys(templates);
  if (vertical) {
    var match = keys.find(function (k) {
      return templates[k].vertical === vertical;
    });
    if (match) return templates[match];
  }
  return null;
}

function flattenMetaLead(mapped) {
  var cfg = loadFormConfig();
  var flat = Object.assign({}, mapped);
  var answers = mapped.custom_answers || {};
  var fieldLabels = cfg.field_labels || {};

  Object.keys(answers).forEach(function (rawKey) {
    var canonical = resolveCanonicalField(rawKey, cfg);
    if (!canonical) return;
    flat[canonical] = answers[rawKey];
  });

  if (flat.serviceNeed) {
    var fromNeed = mapServiceNeedToVertical(flat.serviceNeed, cfg);
    if (fromNeed) flat.vertical = fromNeed;
  }

  var template = findTemplate(cfg, mapped.form_id, mapped.vertical);
  if (template) {
    flat.meta_form_template = template.name || null;
  }

  var devisPreview = [];
  Object.keys(flat).forEach(function (k) {
    if (fieldLabels[k] && flat[k]) {
      devisPreview.push({ key: k, label: fieldLabels[k], value: String(flat[k]) });
    }
  });
  flat.devis_preview = devisPreview;
  flat.devis_summary = buildSummary(flat, cfg);

  var progress = computeQuestionnaireProgress(flat, template);
  flat.questionnaire_step = progress.step;
  flat.questionnaire_total = progress.total;
  flat.questionnaire_pct = progress.pct;

  return flat;
}

function computeQuestionnaireProgress(flat, template) {
  var total = 10;
  var answered = 0;
  if (template && Array.isArray(template.questions)) {
    total = template.questions.length + 3;
    template.questions.forEach(function (q) {
      if (q.maps_to && flat[q.maps_to]) answered += 1;
    });
  } else if (flat.custom_answers) {
    total = Math.max(5, Object.keys(flat.custom_answers).length + 3);
    answered = Object.keys(flat.custom_answers).filter(function (k) {
      return flat.custom_answers[k];
    }).length;
  }
  if (flat.email) answered += 1;
  if (flat.phone) answered += 1;
  if (flat.firstName || flat.lastName || flat.name) answered += 1;
  var step = Math.min(total, answered);
  var pct = total > 0 ? Math.min(100, Math.round((step / total) * 100)) : 0;
  return { step: step, total: total, pct: pct };
}

function buildSummary(flat, cfg) {
  var parts = [];
  var labels = cfg.field_labels || {};
  ["vtcPlatform", "vtcStatus", "householdType", "healthPriority", "immoProjectStage", "homeStatus", "homeType", "autoFormula", "serviceNeed"].forEach(function (k) {
    if (flat[k]) parts.push((labels[k] || k) + ": " + flat[k]);
  });
  if (flat.postal_code || flat.postalCode) {
    parts.push("CP: " + (flat.postal_code || flat.postalCode));
  }
  if (flat.city) parts.push(flat.city);
  return parts.join(" · ").slice(0, 280);
}

function enrichForLeadScore(flat) {
  var out = Object.assign({}, flat);
  if (flat.devis_summary) out.details = flat.devis_summary;
  if (flat.vtcStatus && /societe|sarl|auto-entrepreneur/i.test(String(flat.vtcStatus))) {
    out.hasCompany = "1";
  }
  out.platform = flat.platform || "facebook";
  out.utm_source = flat.utm_source || "meta";
  out.utm_medium = flat.utm_medium || "paid_social";
  return out;
}

module.exports = {
  flattenMetaLead,
  enrichForLeadScore,
  buildSummary,
  computeQuestionnaireProgress,
};
