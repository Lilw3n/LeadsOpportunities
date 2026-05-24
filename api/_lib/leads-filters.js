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
  return row;
}

module.exports = {
  parseLeadListFilters,
  enrichLeadRow,
};
