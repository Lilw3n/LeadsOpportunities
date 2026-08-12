/**
 * Typologie des sources pour la collecte actu.
 * Les identifiants Cafeyn ne sont jamais utilises ici : Cafeyn = RSS publics
 * de titres disponibles dans le kiosque + file manuelle securisee.
 */

var SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];

var PREFERRED_SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo"];

var DEFAULT_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 18,
  bing: 12,
  yahoo: 10,
  aggregator: 8,
};

var SOURCE_LABELS = {
  cafeyn: "Cafeyn / presse quotidienne",
  edge: "Microsoft Edge / MSN",
  firefox: "Mozilla Firefox / Pocket",
  google: "Google News",
  bing: "Bing News",
  yahoo: "Yahoo Actualites",
  aggregator: "Agregateurs RSS",
};

function sourceTypes() {
  return SOURCE_TYPES.slice();
}

function preferredSourceTypes() {
  return PREFERRED_SOURCE_TYPES.slice();
}

function sourceLabel(type) {
  return SOURCE_LABELS[type] || SOURCE_LABELS.aggregator;
}

function emptyBuckets() {
  return SOURCE_TYPES.reduce(function (acc, type) {
    acc[type] = [];
    return acc;
  }, {});
}

function ensureBucket(buckets, type) {
  var resolved = SOURCE_TYPES.indexOf(type) === -1 ? "aggregator" : type;
  if (!buckets[resolved]) buckets[resolved] = [];
  return resolved;
}

function resolveSourceType(source, feedId) {
  var s = String(source || "").toLowerCase();
  var f = String(feedId || "").toLowerCase();
  var hay = s + " " + f;
  if (hay.indexOf("cafeyn") !== -1) return "cafeyn";
  if (hay.indexOf("firefox") !== -1 || hay.indexOf("pocket") !== -1) return "firefox";
  if (hay.indexOf("google") !== -1) return "google";
  if (hay.indexOf("yahoo") !== -1) return "yahoo";
  if (hay.indexOf("edge") !== -1 || hay.indexOf("msn") !== -1) return "edge";
  if (hay.indexOf("bing") !== -1) return "bing";
  return "aggregator";
}

function mergeWithQuotas(buckets, quotas) {
  var merged = [];
  SOURCE_TYPES.forEach(function (type) {
    var cap = quotas[type] || 0;
    var list = (buckets[type] || []).slice();
    list.sort(function (a, b) {
      return (b.leadScore || 0) - (a.leadScore || 0);
    });
    merged = merged.concat(list.slice(0, cap));
  });
  return merged;
}

function countsBySource(buckets) {
  return SOURCE_TYPES.reduce(function (acc, type) {
    acc[type] = (buckets[type] || []).length;
    return acc;
  }, {});
}

module.exports = {
  DEFAULT_QUOTAS: DEFAULT_QUOTAS,
  SOURCE_LABELS: SOURCE_LABELS,
  sourceTypes: sourceTypes,
  preferredSourceTypes: preferredSourceTypes,
  sourceLabel: sourceLabel,
  emptyBuckets: emptyBuckets,
  ensureBucket: ensureBucket,
  resolveSourceType: resolveSourceType,
  mergeWithQuotas: mergeWithQuotas,
  countsBySource: countsBySource,
};
