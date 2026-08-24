/** Filtres liste leads — multi-valeurs (cases à cocher) + enrichissement. */

var VALID_STATUS = ["new", "contacted", "qualified", "converted", "lost"];
var VALID_VIEWS = ["new", "unopened", "relevant"];
var VALID_PLATFORMS = [
  "google",
  "facebook",
  "meta",
  "instagram",
  "tiktok",
  "linkedin",
  "withallo",
  "site_web",
  "landing_form",
  "landing_quick",
];

function parseCsvList(raw, allowed) {
  if (raw == null || raw === "") return null;
  var parts = String(raw)
    .split(/[,|;]+/)
    .map(function (s) {
      return s.trim().toLowerCase();
    })
    .filter(Boolean);
  if (!parts.length) return null;
  if (!allowed || !allowed.length) return parts;
  var out = [];
  parts.forEach(function (p) {
    if (allowed.indexOf(p) >= 0 && out.indexOf(p) < 0) out.push(p);
  });
  return out.length ? out : null;
}

function sanitizeVerticalList(raw) {
  if (raw == null || raw === "") return null;
  var parts = String(raw)
    .split(/[,|;]+/)
    .map(function (s) {
      return s
        .trim()
        .toLowerCase()
        .slice(0, 40);
    })
    .filter(function (s) {
      return /^[a-z0-9][a-z0-9_-]*$/.test(s);
    });
  var out = [];
  parts.forEach(function (p) {
    if (out.indexOf(p) < 0) out.push(p);
  });
  return out.length ? out : null;
}

function parseLeadListFilters(url) {
  var statusRaw = url.searchParams.get("status") || url.searchParams.get("statuses") || "";
  var verticalRaw = url.searchParams.get("vertical") || url.searchParams.get("verticals") || "";
  var platformRaw = url.searchParams.get("platform") || url.searchParams.get("platforms") || "";
  var viewRaw = url.searchParams.get("view") || url.searchParams.get("views") || "";

  var statuses = parseCsvList(statusRaw, VALID_STATUS);
  var verticals = sanitizeVerticalList(verticalRaw);
  var platforms = parseCsvList(platformRaw, VALID_PLATFORMS);
  var views = parseCsvList(viewRaw, VALID_VIEWS);

  return {
    view: views && views.length === 1 ? views[0] : viewRaw.indexOf(",") >= 0 ? "" : viewRaw || "",
    views: views,
    platform: platforms && platforms.length === 1 ? platforms[0] : "",
    platforms: platforms,
    statuses: statuses,
    status: statuses && statuses.length === 1 ? statuses[0] : null,
    verticals: verticals,
    vertical: verticals && verticals.length === 1 ? verticals[0] : null,
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

  return row;
}

/** Match réseau côté app (multi-cases). */
function leadMatchesPlatforms(lead, platforms) {
  if (!platforms || !platforms.length) return true;
  var hay = [
    lead.platform,
    lead.source,
    lead.utm_source,
    lead.utm_medium,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  var gclid = lead.gclid || (lead.payload && lead.payload.gclid) || "";
  for (var i = 0; i < platforms.length; i++) {
    var p = platforms[i];
    if (p === "google" && (hay.indexOf("google") >= 0 || gclid)) return true;
    if (
      (p === "facebook" || p === "meta") &&
      (hay.indexOf("facebook") >= 0 || hay.indexOf("meta") >= 0 || hay.indexOf("instagram") >= 0)
    ) {
      return true;
    }
    if (hay.indexOf(p) >= 0) return true;
    if (String(lead.source || "").toLowerCase() === p) return true;
    if (String(lead.platform || "").toLowerCase() === p) return true;
  }
  return false;
}

module.exports = {
  VALID_STATUS,
  VALID_VIEWS,
  VALID_PLATFORMS,
  parseCsvList,
  sanitizeVerticalList,
  parseLeadListFilters,
  enrichLeadRow,
  leadMatchesPlatforms,
};
