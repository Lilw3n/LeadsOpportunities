/** Filtres liste leads — enrichissement côté application. */



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

  try {
    const { applyToLead } = require("../../js/form-lead-category");
    applyToLead(row);
  } catch (e) {}

  return row;

}



module.exports = {

  parseLeadListFilters,

  enrichLeadRow,

};


