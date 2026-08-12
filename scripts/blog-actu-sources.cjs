/**
 * Source taxonomy for the blog actu pipeline.
 */

const SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];
const PLATFORM_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo"];

const DEFAULT_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 30,
  bing: 20,
  yahoo: 12,
  aggregator: 8,
};

function normalizeSourceType(input, fallback) {
  var s = String(input || "").toLowerCase();
  if (SOURCE_TYPES.indexOf(s) !== -1) return s;
  if (s.indexOf("cafeyn") !== -1) return "cafeyn";
  if (s.indexOf("edge") !== -1 || s.indexOf("msn") !== -1) return "edge";
  if (s.indexOf("firefox") !== -1 || s.indexOf("pocket") !== -1 || s.indexOf("mozilla") !== -1) return "firefox";
  if (s.indexOf("google") !== -1) return "google";
  if (s.indexOf("bing") !== -1) return "bing";
  if (s.indexOf("yahoo") !== -1) return "yahoo";
  return fallback || "aggregator";
}

function emptyBuckets() {
  var buckets = {};
  SOURCE_TYPES.forEach(function (type) {
    buckets[type] = [];
  });
  return buckets;
}

function mergeWithQuotas(buckets, quotas) {
  var merged = [];
  SOURCE_TYPES.forEach(function (type) {
    var cap = quotas[type] || 0;
    var list = (buckets[type] || []).slice();
    list.sort(function (a, b) {
      return b.leadScore - a.leadScore;
    });
    merged = merged.concat(list.slice(0, cap));
  });
  return merged;
}

function bySourceCounts(buckets) {
  var counts = {};
  SOURCE_TYPES.forEach(function (type) {
    counts[type] = (buckets[type] || []).length;
  });
  return counts;
}

function formatSourceCounts(buckets) {
  return SOURCE_TYPES.map(function (type) {
    return type + ":" + ((buckets[type] || []).length);
  }).join(" ");
}

module.exports = {
  SOURCE_TYPES: SOURCE_TYPES,
  PLATFORM_TYPES: PLATFORM_TYPES,
  DEFAULT_QUOTAS: DEFAULT_QUOTAS,
  normalizeSourceType: normalizeSourceType,
  emptyBuckets: emptyBuckets,
  mergeWithQuotas: mergeWithQuotas,
  bySourceCounts: bySourceCounts,
  formatSourceCounts: formatSourceCounts,
};
