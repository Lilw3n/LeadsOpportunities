/** Filtres liste leads (vue, plateforme) pour requetes SQL. */
function parseLeadListFilters(url) {
  var view = url.searchParams.get("view") || "";
  var platform = url.searchParams.get("platform") || "";
  return { view: view, platform: platform };
}

function applyViewFilter(sql, view) {
  if (view === "unopened") {
    return sql`AND opened_at IS NULL`;
  }
  if (view === "new") {
    return sql`AND COALESCE(status, 'new') = 'new' AND opened_at IS NULL`;
  }
  if (view === "relevant") {
    return sql`AND relevance = 'high'`;
  }
  return sql``;
}

function applyPlatformFilter(sql, platform) {
  if (!platform) return sql``;
  return sql`AND COALESCE(platform, source, '') = ${platform}`;
}

module.exports = { parseLeadListFilters, applyViewFilter, applyPlatformFilter };
