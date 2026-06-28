/**
 * Construit le payload Meta Graph API pour créer un formulaire Lead Ads.
 * Doc : POST /{page_id}/leadgen_forms
 */
const DEFAULT_PRIVACY_URL = "https://www.leadsopportunities.fr/politique-confidentialite.html";
const SITE_ORIGIN = "https://www.leadsopportunities.fr";

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}

function optionKey(label, index) {
  return normalizeKey(label) || "opt_" + index;
}

function buildCustomQuestion(q) {
  var key = normalizeKey(q.maps_to || q.label);
  if (q.type === "SHORT_ANSWER") {
    return {
      type: "CUSTOM",
      key: key,
      label: String(q.label || "").slice(0, 200),
    };
  }
  var options = (q.options || []).map(function (opt, i) {
    return { key: optionKey(opt, i), value: String(opt).slice(0, 120) };
  });
  return {
    type: "CUSTOM",
    key: key,
    label: String(q.label || "").slice(0, 200),
    options: options,
  };
}

function buildContactQuestions(prefilled) {
  var fields = prefilled || ["full_name", "email", "phone_number", "city", "post_code"];
  var map = {
    full_name: { type: "FULL_NAME" },
    first_name: { type: "FIRST_NAME" },
    last_name: { type: "LAST_NAME" },
    email: { type: "EMAIL" },
    phone_number: { type: "PHONE" },
    phone: { type: "PHONE" },
    city: { type: "CITY" },
    post_code: { type: "POST_CODE" },
    postal_code: { type: "POST_CODE" },
  };
  var out = [];
  var seen = {};
  fields.forEach(function (f) {
    var m = map[f];
    if (!m || seen[m.type]) return;
    seen[m.type] = true;
    out.push({ type: m.type });
  });
  if (!seen.EMAIL) out.push({ type: "EMAIL" });
  if (!seen.PHONE) out.push({ type: "PHONE" });
  return out;
}

function resolveFollowUpUrl(template, cfg) {
  var path = template.landing || cfg.default_landing || "/landings/rappel.html";
  if (path.indexOf("http") === 0) return path;
  return SITE_ORIGIN + (path.charAt(0) === "/" ? path : "/" + path);
}

function buildLeadFormPayload(template, cfg, opts) {
  opts = opts || {};
  var questions = [];
  (template.questions || []).forEach(function (q) {
    questions.push(buildCustomQuestion(q));
  });
  buildContactQuestions(cfg.prefilled_fields).forEach(function (q) {
    questions.push(q);
  });

  var payload = {
    name: String(template.name || template.vertical || "Lead form").slice(0, 120),
    locale: "fr_FR",
    follow_up_action_url: resolveFollowUpUrl(template, cfg),
    privacy_policy: {
      url: opts.privacyUrl || DEFAULT_PRIVACY_URL,
    },
    questions: questions,
  };

  if (template.intro) {
    payload.context_card = {
      title: String(template.name || "Devis express").slice(0, 60),
      content: [String(template.intro).slice(0, 500)],
      style: "PARAGRAPH_STYLE",
      button_text: "Continuer",
    };
  }

  return payload;
}

function buildFormRegistryEntry(templateKey, template, formId, blogRanking) {
  var topBlog = null;
  if (blogRanking && Array.isArray(blogRanking.byTemplate)) {
    var block = blogRanking.byTemplate.find(function (b) {
      return b.templateKey === templateKey;
    });
    if (block && block.articles && block.articles[0]) {
      topBlog = block.articles[0];
    }
  }
  return {
    template: templateKey,
    name: template.name,
    vertical: template.vertical,
    campaign: template.campaign,
    landing: template.landing,
    form_id: formId,
    top_blog_slug: topBlog ? topBlog.slug : (template.blog_slugs && template.blog_slugs[0]) || null,
    top_blog_score: topBlog ? topBlog.score : null,
  };
}

module.exports = {
  buildLeadFormPayload,
  buildFormRegistryEntry,
  normalizeKey,
  DEFAULT_PRIVACY_URL,
  SITE_ORIGIN,
};
