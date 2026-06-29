/**
 * Taxonomie commune des canaux de veille actu.
 *
 * Les sources protegees par login (ex. Cafeyn) sont representees par des
 * flux publics equivalents ou par la file manuelle securisee.
 */
const SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];
const PLATFORM_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo"];

const DEFAULT_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 30,
  bing: 12,
  yahoo: 12,
  aggregator: 20,
};

const SOURCE_LABELS = {
  cafeyn: "Cafeyn (RSS presse equivalente)",
  edge: "Microsoft Edge / MSN",
  firefox: "Mozilla Firefox / Pocket",
  google: "Google News",
  bing: "Bing News",
  yahoo: "Yahoo Actualites",
  aggregator: "Autres agregateurs",
};

function resolveSourceType(value, fallback) {
  var s = String(value || "").toLowerCase();
  if (s.indexOf("cafeyn") !== -1) return "cafeyn";
  if (s.indexOf("firefox") !== -1 || s.indexOf("pocket") !== -1) return "firefox";
  if (s.indexOf("google") !== -1) return "google";
  if (s.indexOf("yahoo") !== -1) return "yahoo";
  if (s.indexOf("edge") !== -1 || s.indexOf("msn") !== -1) return "edge";
  if (s.indexOf("bing") !== -1) return "bing";
  return fallback || "aggregator";
}

function sourceLabel(sourceType) {
  var type = resolveSourceType(sourceType);
  return SOURCE_LABELS[type] || SOURCE_LABELS.aggregator;
}

function resolveFeedSourceType(feed) {
  var explicit = feed && feed.sourceType;
  if (explicit && explicit !== "aggregator") return resolveSourceType(explicit);
  return resolveSourceType(
    [feed && feed.id, feed && feed.name, feed && feed.url].filter(Boolean).join(" "),
    "aggregator"
  );
}

function isPlaceholderQueueItem(item) {
  var id = String((item && item.id) || "").toLowerCase();
  var title = String((item && item.title) || "").toLowerCase();
  return id === "cafeyn-pending-template" || title.indexOf("collez ici") !== -1;
}

function emptyBuckets() {
  return SOURCE_TYPES.reduce(function (acc, type) {
    acc[type] = [];
    return acc;
  }, {});
}

module.exports = {
  SOURCE_TYPES: SOURCE_TYPES,
  PLATFORM_TYPES: PLATFORM_TYPES,
  DEFAULT_QUOTAS: DEFAULT_QUOTAS,
  SOURCE_LABELS: SOURCE_LABELS,
  resolveSourceType: resolveSourceType,
  resolveFeedSourceType: resolveFeedSourceType,
  isPlaceholderQueueItem: isPlaceholderQueueItem,
  sourceLabel: sourceLabel,
  emptyBuckets: emptyBuckets,
};
