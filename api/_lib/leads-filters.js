/** Filtres liste leads — enrichissement côté application. */

var LeadOrigin = require("../../js/lead-origin-lib.js");

function parseLeadListFilters(url) {
  return {
    view: url.searchParams.get("view") || "",
    platform: url.searchParams.get("platform") || "",
    email: url.searchParams.get("email") || "",
    phone: url.searchParams.get("phone") || "",
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
  if (!row.utm_campaign && p && p.utm_campaign) row.utm_campaign = p.utm_campaign;
  if (!row.utm_medium && p && p.utm_medium) row.utm_medium = p.utm_medium;
  if (!row.utm_source && p && p.utm_source) row.utm_source = p.utm_source;

  if (p) {
    if (!row.page_url && (p.page_url || p.pageUrl)) row.page_url = p.page_url || p.pageUrl;
    if (!row.page_hash && (p.page_hash || p.pageHash)) row.page_hash = p.page_hash || p.pageHash;
    if (!row.site_domain && (p.site_domain || p.siteDomain)) {
      row.site_domain = p.site_domain || p.siteDomain;
    }
    if (!row.referrer && (p.referrer || p.referrer_first)) {
      row.referrer = p.referrer || p.referrer_first;
    }
  }

  var origin = LeadOrigin.build(Object.assign({}, row, { payload: p || row.payload }));
  if (origin && origin.url) {
    row.origin_url = origin.url;
    row.origin_host = origin.host;
    row.origin_short = origin.short;
    if (origin.referrer && !row.referrer) row.referrer = origin.referrer;
  }

  return row;
}

module.exports = {
  parseLeadListFilters,
  enrichLeadRow,
};
