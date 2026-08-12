/**
 * Source catalog for the blog actuality pipeline.
 *
 * Keep source types centralized so fetch, scoring, status and auto-publish
 * apply the same quotas and labels.
 */

var SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];
var ROTATION_SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo"];

var DEFAULT_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 18,
  bing: 18,
  yahoo: 12,
  aggregator: 20,
};

var SOURCE_LABELS = {
  cafeyn: "Cafeyn (RSS publics de journaux lus sur Cafeyn)",
  edge: "Microsoft Edge / MSN accueil",
  firefox: "Mozilla Firefox / Pocket",
  google: "Google News",
  bing: "Bing News",
  yahoo: "Yahoo Actualites",
  aggregator: "Agregateurs et RSS publics",
};

var SOURCE_SCORE_BOOSTS = {
  cafeyn: 12,
  edge: 12,
  firefox: 12,
  google: 9,
  bing: 9,
  yahoo: 8,
  aggregator: 3,
};

function normalizeSourceType(value, fallback) {
  var raw = String(value || "").toLowerCase();
  if (raw.indexOf("cafeyn") !== -1) return "cafeyn";
  if (raw.indexOf("firefox") !== -1 || raw.indexOf("pocket") !== -1 || raw.indexOf("mozilla") !== -1) {
    return "firefox";
  }
  if (raw.indexOf("google") !== -1) return "google";
  if (raw.indexOf("yahoo") !== -1) return "yahoo";
  if (raw.indexOf("edge") !== -1 || raw.indexOf("msn") !== -1) return "edge";
  if (raw.indexOf("bing") !== -1) return "bing";
  if (SOURCE_TYPES.indexOf(raw) !== -1) return raw;
  return fallback || "aggregator";
}

function sourceLabel(type) {
  return SOURCE_LABELS[normalizeSourceType(type)] || SOURCE_LABELS.aggregator;
}

function sourceScoreBoost(type) {
  var normalized = normalizeSourceType(type);
  return SOURCE_SCORE_BOOSTS[normalized] || 0;
}

function emptyBuckets() {
  return SOURCE_TYPES.reduce(function (acc, type) {
    acc[type] = [];
    return acc;
  }, {});
}

function sourceCounts(buckets) {
  return SOURCE_TYPES.reduce(function (acc, type) {
    acc[type] = (buckets[type] || []).length;
    return acc;
  }, {});
}

module.exports = {
  SOURCE_TYPES: SOURCE_TYPES,
  ROTATION_SOURCE_TYPES: ROTATION_SOURCE_TYPES,
  DEFAULT_QUOTAS: DEFAULT_QUOTAS,
  SOURCE_LABELS: SOURCE_LABELS,
  normalizeSourceType: normalizeSourceType,
  sourceLabel: sourceLabel,
  sourceScoreBoost: sourceScoreBoost,
  emptyBuckets: emptyBuckets,
  sourceCounts: sourceCounts,
};
