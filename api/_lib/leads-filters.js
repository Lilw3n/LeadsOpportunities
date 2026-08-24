/** Filtres liste leads — enrichissement côté application. */
const { detectNetwork, networkLabel, normalizeNetworkFilter } = require("./lead-network");

function parseLeadListFilters(url) {
  var platform = normalizeNetworkFilter(url.searchParams.get("platform"));
  return {
    view: url.searchParams.get("view") || "",
    platform: platform,
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

  row.form_source = row.source || (p && p.source) || "";
  row.network = detectNetwork(row);
  row.network_label = networkLabel(row.network);
  if (!row.platform || row.platform === "landing_form" || row.platform === "landing_quick") {
    row.platform = row.network;
  }

  return row;
}

module.exports = {
  parseLeadListFilters,
  enrichLeadRow,
};
