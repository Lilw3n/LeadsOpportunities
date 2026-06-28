const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const DEFAULT_FORM_CONFIG = {
  page_id: "1183829618147455",
  ad_account_id: "997768686183548",
  default_vertical: "devis",
  default_landing: "/landings/rappel.html",
  forms: {},
  field_aliases: {
    email: ["email", "e-mail", "adresse_e-mail", "adresse_email", "mail"],
    phone: ["phone_number", "phone", "telephone", "numero_de_telephone", "mobile"],
    first_name: ["first_name", "prenom", "prénom"],
    last_name: ["last_name", "nom", "nom_de_famille"],
    full_name: ["full_name", "nom_complet", "name"],
    city: ["city", "ville"],
    postal_code: ["post_code", "postal_code", "code_postal"],
  },
  vertical_keywords: {
    vtc: ["vtc", "taxi", "chauffeur", "uber"],
    sante: ["mutuelle", "sante", "santé", "complementaire"],
    credit_immo: ["credit", "crédit", "immo", "immobilier", "pret"],
    auto: ["auto", "voiture", "automobile"],
    habitation: ["habitation", "logement", "maison", "appartement"],
    prevoyance: ["prevoyance", "prévoyance", "deces", "décès"],
    animaux: ["animaux", "chien", "chat", "assurance animaux"],
  },
};

function loadFormConfig() {
  try {
    var cfgPath = path.join(process.cwd(), "config", "meta-lead-forms.json");
    if (!fs.existsSync(cfgPath)) return DEFAULT_FORM_CONFIG;
    var raw = fs.readFileSync(cfgPath, "utf8");
    var parsed = JSON.parse(raw);
    return Object.assign({}, DEFAULT_FORM_CONFIG, parsed, {
      field_aliases: Object.assign({}, DEFAULT_FORM_CONFIG.field_aliases, parsed.field_aliases || {}),
      vertical_keywords: Object.assign({}, DEFAULT_FORM_CONFIG.vertical_keywords, parsed.vertical_keywords || {}),
      forms: Object.assign({}, DEFAULT_FORM_CONFIG.forms, parsed.forms || {}),
      form_templates: Object.assign({}, parsed.form_templates || {}),
      field_map: Object.assign({}, parsed.field_map || {}),
      field_labels: Object.assign({}, parsed.field_labels || {}),
      service_need_map: Object.assign({}, parsed.service_need_map || {}),
    });
  } catch (e) {
    console.warn("[meta-lead] config load", e.message);
    return DEFAULT_FORM_CONFIG;
  }
}

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function verifyWebhookSignature(appSecret, rawBody, signatureHeader) {
  if (!appSecret) return { ok: false, reason: "missing_app_secret" };
  if (!signatureHeader || String(signatureHeader).indexOf("sha256=") !== 0) {
    return { ok: false, reason: "missing_signature" };
  }
  var expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  var provided = String(signatureHeader).replace(/^sha256=/, "");
  if (expected.length !== provided.length) {
    return { ok: false, reason: "invalid_signature" };
  }
  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided))) {
    return { ok: false, reason: "invalid_signature" };
  }
  return { ok: true };
}

function getMetaAccessToken() {
  return (
    process.env.META_PAGE_ACCESS_TOKEN ||
    process.env.META_SYSTEM_USER_TOKEN ||
    process.env.META_CAPI_TOKEN ||
    ""
  ).trim();
}

async function fetchLeadFromGraph(leadgenId, accessToken) {
  var token = accessToken || getMetaAccessToken();
  if (!token) throw new Error("META_PAGE_ACCESS_TOKEN manquant");

  var version = process.env.META_CAPI_VERSION || "v20.0";
  var fields = [
    "created_time",
    "id",
    "field_data",
    "ad_id",
    "form_id",
    "campaign_id",
    "adset_id",
    "platform",
  ].join(",");
  var url =
    "https://graph.facebook.com/" +
    version +
    "/" +
    encodeURIComponent(String(leadgenId)) +
    "?fields=" +
    encodeURIComponent(fields) +
    "&access_token=" +
    encodeURIComponent(token);

  var r = await fetch(url);
  var text = await r.text();
  if (!r.ok) {
    throw new Error("Graph API " + r.status + ": " + text.slice(0, 400));
  }
  return JSON.parse(text);
}

function pickFieldValue(fieldData, aliases) {
  if (!Array.isArray(fieldData)) return "";
  var aliasSet = (aliases || []).map(normalizeKey);
  for (var i = 0; i < fieldData.length; i++) {
    var item = fieldData[i] || {};
    var key = normalizeKey(item.name);
    if (aliasSet.indexOf(key) === -1) continue;
    var values = item.values || [];
    if (values.length && values[0]) return String(values[0]).trim();
  }
  return "";
}

function collectCustomAnswers(fieldData, knownKeys) {
  var out = {};
  if (!Array.isArray(fieldData)) return out;
  var known = {};
  (knownKeys || []).forEach(function (k) {
    known[normalizeKey(k)] = true;
  });
  fieldData.forEach(function (item) {
    var key = normalizeKey(item && item.name);
    if (!key || known[key]) return;
    var values = (item && item.values) || [];
    if (values.length && values[0]) out[key] = String(values[0]).trim();
  });
  return out;
}

function splitFullName(fullName) {
  var parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function inferVertical(formId, formMeta, campaignName) {
  var cfg = loadFormConfig();
  if (formId && cfg.forms[String(formId)]) {
    return cfg.forms[String(formId)].vertical || cfg.default_vertical;
  }
  var haystack = [
    formMeta && formMeta.name,
    formMeta && formMeta.label,
    campaignName,
    formId,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  var keys = Object.keys(cfg.vertical_keywords || {});
  for (var i = 0; i < keys.length; i++) {
    var vertical = keys[i];
    var words = cfg.vertical_keywords[vertical] || [];
    for (var j = 0; j < words.length; j++) {
      if (haystack.indexOf(String(words[j]).toLowerCase()) >= 0) return vertical;
    }
  }
  return cfg.default_vertical;
}

function mapLeadFields(graphLead, webhookValue) {
  var cfg = loadFormConfig();
  var fieldData = graphLead.field_data || [];
  var aliases = cfg.field_aliases || {};

  var email = pickFieldValue(fieldData, aliases.email);
  var phone = pickFieldValue(fieldData, aliases.phone);
  var firstName = pickFieldValue(fieldData, aliases.first_name);
  var lastName = pickFieldValue(fieldData, aliases.last_name);
  var fullName = pickFieldValue(fieldData, aliases.full_name);
  if (!firstName && fullName) {
    var split = splitFullName(fullName);
    firstName = split.firstName;
    lastName = split.lastName;
  }

  var formId = String(graphLead.form_id || webhookValue.form_id || "");
  var formMeta = cfg.forms[formId] || null;
  var vertical = inferVertical(formId, formMeta, webhookValue.campaign_name || "");
  var customAnswers = collectCustomAnswers(fieldData, [].concat.apply([], Object.values(aliases)));

  return {
    email: email,
    phone: phone,
    firstName: firstName,
    lastName: lastName,
    name: [firstName, lastName].filter(Boolean).join(" ").trim() || fullName,
    city: pickFieldValue(fieldData, aliases.city),
    postal_code: pickFieldValue(fieldData, aliases.postal_code),
    vertical: vertical,
    source: "meta_lead_ads",
    platform: /instagram/i.test(String(graphLead.platform || "")) ? "instagram" : "facebook",
    utm_source: "meta",
    utm_medium: "paid_social",
    utm_campaign: webhookValue.campaign_name || (formMeta && formMeta.campaign) || "meta_lead_ads",
    utm_content: webhookValue.ad_id || graphLead.ad_id || "",
    form_id: formId,
    meta_leadgen_id: String(graphLead.id || webhookValue.leadgen_id || ""),
    meta_ad_id: String(graphLead.ad_id || webhookValue.ad_id || ""),
    meta_adset_id: String(graphLead.adset_id || webhookValue.adgroup_id || ""),
    meta_campaign_id: String(graphLead.campaign_id || webhookValue.campaign_id || ""),
    meta_page_id: String(webhookValue.page_id || cfg.page_id || ""),
    meta_form_name: formMeta && formMeta.name ? formMeta.name : null,
    landing_path: (formMeta && formMeta.landing) || cfg.default_landing,
    journey: "meta_lead_ads",
    custom_answers: customAnswers,
    meta_field_data: fieldData,
  };
}

function extractLeadgenEvents(body) {
  var events = [];
  if (!body || body.object !== "page" || !Array.isArray(body.entry)) return events;
  body.entry.forEach(function (entry) {
    (entry.changes || []).forEach(function (change) {
      if (!change || change.field !== "leadgen") return;
      var value = change.value || {};
      if (!value.leadgen_id) return;
      events.push(value);
    });
  });
  return events;
}

module.exports = {
  loadFormConfig,
  verifyWebhookSignature,
  fetchLeadFromGraph,
  mapLeadFields,
  extractLeadgenEvents,
  getMetaAccessToken,
};
