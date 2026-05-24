/** Filtres liste leads — compatible Neon sans colonnes optionnelles. */

function parseLeadListFilters(url) {
  return {
    view: url.searchParams.get("view") || "",
    platform: url.searchParams.get("platform") || "",
  };
}

/** Filtres via payload JSON (toujours disponible). */
function applyViewFilterPayload(sql, view) {
  if (!view) return sql``;
  if (view === "relevant") {
    return sql`AND COALESCE(payload->>'relevance', '') = 'high'`;
  }
  if (view === "unopened") {
    return sql`AND COALESCE(payload->>'openedAt', '') = ''`;
  }
  if (view === "new") {
    return sql`AND COALESCE(status, 'new') = 'new' AND COALESCE(payload->>'openedAt', '') = ''`;
  }
  return sql``;
}

/** Filtre plateforme (alias Google / Meta). */
function applyPlatformFilter(sql, platform) {
  if (!platform) return sql``;
  if (platform === "google") {
    return sql`AND (
      COALESCE(platform, '') IN ('google', 'google_ads')
      OR LOWER(COALESCE(utm_source, '')) LIKE '%google%'
      OR COALESCE(gclid, '') <> ''
    )`;
  }
  if (platform === "facebook" || platform === "meta") {
    return sql`AND (
      COALESCE(platform, '') IN ('facebook', 'meta', 'instagram')
      OR LOWER(COALESCE(utm_source, '')) LIKE '%facebook%'
      OR LOWER(COALESCE(utm_source, '')) LIKE '%meta%'
      OR LOWER(COALESCE(utm_source, '')) LIKE '%instagram%'
    )`;
  }
  return sql`AND (
    COALESCE(platform, source, '') = ${platform}
    OR LOWER(COALESCE(utm_source, '')) = LOWER(${platform})
  )`;
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
  return row;
}

module.exports = {
  parseLeadListFilters,
  applyViewFilterPayload,
  applyPlatformFilter,
  enrichLeadRow,
};
