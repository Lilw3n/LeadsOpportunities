/**
 * Typologie partagée des sources actu blog (RSS publics).
 * Cafeyn = journaux équivalents sans login ; Edge/MSN via Bing ;
 * Firefox via France Info / France 24 / etc. ; Google / Bing / Yahoo séparés.
 */
var SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];

var DEFAULT_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 25,
  bing: 12,
  yahoo: 10,
  aggregator: 8,
};

var PLATFORM_PRIMARY = ["cafeyn", "edge", "firefox"];

function isPlaceholderQueueItem(item) {
  if (!item) return true;
  var id = String(item.id || "").toLowerCase();
  var title = String(item.title || "");
  if (id === "cafeyn-pending-template") return true;
  if (/^collez ici/i.test(title.trim())) return true;
  if (/COLLEZ ICI/i.test(title)) return true;
  return false;
}

function resolveSourceType(source, feedType) {
  if (feedType && SOURCE_TYPES.indexOf(feedType) !== -1) return feedType;
  var s = String(source || "").toLowerCase();
  if (s.indexOf("cafeyn") !== -1) return "cafeyn";
  if (s.indexOf("yahoo") !== -1) return "yahoo";
  if (s.indexOf("google") !== -1) return "google";
  if (s.indexOf("bing") !== -1 && s.indexOf("edge") === -1) return "bing";
  if (s.indexOf("edge") !== -1 || s.indexOf("msn") !== -1) return "edge";
  if (s.indexOf("firefox") !== -1 || s.indexOf("pocket") !== -1) return "firefox";
  return "aggregator";
}

function emptyBuckets() {
  var b = {};
  SOURCE_TYPES.forEach(function (t) {
    b[t] = [];
  });
  return b;
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

function bySourceCounts(buckets) {
  var out = {};
  SOURCE_TYPES.forEach(function (t) {
    out[t] = (buckets[t] || []).length;
  });
  return out;
}

function editorialLabel(sourceType) {
  switch (sourceType) {
    case "cafeyn":
      return "Cafeyn (RSS journaux)";
    case "edge":
      return "Microsoft Edge / MSN (Bing News)";
    case "firefox":
      return "Mozilla Firefox / France Info";
    case "google":
      return "Google News";
    case "bing":
      return "Bing News";
    case "yahoo":
      return "Yahoo Actualités";
    default:
      return "Agrégateur";
  }
}

module.exports = {
  SOURCE_TYPES: SOURCE_TYPES,
  DEFAULT_QUOTAS: DEFAULT_QUOTAS,
  PLATFORM_PRIMARY: PLATFORM_PRIMARY,
  isPlaceholderQueueItem: isPlaceholderQueueItem,
  resolveSourceType: resolveSourceType,
  emptyBuckets: emptyBuckets,
  mergeWithQuotas: mergeWithQuotas,
  bySourceCounts: bySourceCounts,
  editorialLabel: editorialLabel,
};
