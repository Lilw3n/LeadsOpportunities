/** Filtres liste leads — enrichissement côté application. */
const Cat = require("../../js/lead-visitor-category-lib");
const Channel = require("../../js/lead-channel-lib");

function isManualLead(row, payload) {
  var source = String((row && row.source) || (payload && payload.source) || "").toLowerCase();
  return source === "crm" || source.indexOf("crm_") === 0 || source.indexOf("crm-") === 0;
}

function classifyLeadOrigin(row, payload) {
  payload = payload || {};
  if (isManualLead(row, payload)) {
    return { id: "manual", label: "Saisie CRM" };
  }
  var ip = (row && row.client_ip) || payload.clientIp || payload.client_ip || "";
  var cat = Cat.categorize({
    client_ip: ip,
    email: row && row.email,
    phone: row && row.phone,
    lead_score: row && row.lead_score,
    source: row && row.source,
    platform: row && row.platform,
    utm_source: row && row.utm_source,
    payload: payload,
  });
  if (cat.id === "bot_meta") {
    return { id: "meta_preview", label: "Test Meta (pas un prospect)" };
  }
  var source = String((row && row.source) || payload.source || "").toLowerCase();
  var platform = String((row && row.platform) || payload.platform || "").toLowerCase();
  if (source === "meta_lead_ads" || (row && row.fbclid) || payload.fbclid) {
    return { id: "meta_ads", label: "Pub Meta" };
  }
  if ((row && (row.gclid || row.msclkid)) || payload.gclid || payload.msclkid) {
    return { id: "google_ads", label: "Pub Google" };
  }
  if ((row && row.ttclid) || payload.ttclid) {
    return { id: "tiktok_ads", label: "Pub TikTok" };
  }
  if (platform === "assurancevtcfrance" || source.indexOf("assurancevtcfrance") >= 0) {
    return { id: "avf", label: "Assurance VTC France" };
  }
  if (platform === "withallo" || source.indexOf("withallo") >= 0) {
    return { id: "withallo", label: "Withallo" };
  }
  return { id: "site", label: "Formulaire du site" };
}



function parseLeadListFilters(url) {

  return {

    view: url.searchParams.get("view") || "",

    platform: url.searchParams.get("platform") || "",

  };

}



function enrichLeadRow(row) {

  if (!row) return row;

  var p = row.payload;

  if (typeof p === "string") {

    try {

      p = JSON.parse(p);

    } catch (e) {

      p = {};

    }

  }

  if (!row.relevance && p && p.relevance) row.relevance = p.relevance;

  if (!row.opened_at && p && p.openedAt) row.opened_at = p.openedAt;

  if (row.competitor_monthly == null && p && p.competitorMonthly != null) {

    row.competitor_monthly = p.competitorMonthly;

  }

  if (row.our_offer_monthly == null && p && p.ourOfferMonthly != null) {

    row.our_offer_monthly = p.ourOfferMonthly;

  }

  if (!row.platform && p && p.platform) row.platform = p.platform;
  if (!row.seo_city && p && (p.seo_city || p.seoCity)) row.seo_city = p.seo_city || p.seoCity;
  if (!row.landing_slug && p && (p.landing_slug || p.landing_path)) {
    row.landing_slug = p.landing_slug || p.landing_path;
  }
  if (row.is_duplicate == null && (row.parent_lead_id || (p && p.parent_lead_id))) {
    row.is_duplicate = true;
  }
  if (!row.client_ip && p) {
    row.client_ip = p.clientIp || p.client_ip || p.ip || null;
  }

  var origin = classifyLeadOrigin(row, p || {});
  row.origin_id = origin.id;
  row.origin_label = origin.label;
  row.is_manual = origin.id === "manual";

  return row;

}



/**
 * Onglet du lead :
 * - prospects : contact réel (ou saisie CRM), à travailler
 * - abandons  : a laissé un contact puis quitté le parcours, à relancer
 * - bruit     : tests (Meta, emails fictifs), bots, plage Meta, sans contact, doublons
 */
function leadBucket(row) {
  var p = row && row.payload;
  if (typeof p === "string") {
    try {
      p = JSON.parse(p);
    } catch (e) {
      p = {};
    }
  }
  p = p || {};
  if (row && row.is_duplicate) return { bucket: "bruit", reason: "Doublon" };
  var cat = Cat.categorize({
    client_ip: (row && row.client_ip) || p.clientIp || p.client_ip || "",
    email: row && row.email,
    phone: row && row.phone,
    lead_score: row && row.lead_score,
    source: row && row.source,
    platform: row && row.platform,
    utm_source: row && row.utm_source,
    pipeline_stage: row && row.pipeline_stage,
    status: row && row.status,
    payload: p,
  });
  if (isManualLead(row, p) && cat.id !== "test") return { bucket: "prospects", reason: "Saisie CRM" };
  if (cat.id === "prospect" || cat.id === "named") return { bucket: "prospects", reason: cat.label };
  if (cat.id === "abandon") {
    // Score bas mais parcours pas quitté (ex. rappel express « Me rappeler ») : c'est un prospect
    var f = p.funnel || {};
    var quit = !!(f.abandonedAt || (row && (row.pipeline_stage === "abandoned" || row.status === "abandoned")));
    if (!quit || p.callbackRequested || p.journey === "callback") {
      return { bucket: "prospects", reason: "Contact laissé" };
    }
    return { bucket: "abandons", reason: cat.label };
  }
  return { bucket: "bruit", reason: cat.label };
}

/** Canal précis (pub / SEO / réseaux / lien / direct) — après decorateLeadArticle */
function decorateLeadChannel(row) {
  if (!row) return row;
  var c = Channel.classify(row);
  row.channel = c.channel;
  row.channel_label = c.label;
  row.channel_network = c.network;
  row.channel_detail = c.detail;
  row.channel_campaign = c.campaign;
  row.channel_ad = c.ad;
  row.channel_page = c.page;
  row.channel_referrer = c.referrer;
  var b = leadBucket(row);
  row.bucket = b.bucket;
  row.bucket_reason = b.reason;
  return row;
}

module.exports = {
  leadBucket,
  decorateLeadChannel,

  parseLeadListFilters,

  enrichLeadRow,
  classifyLeadOrigin,

};


