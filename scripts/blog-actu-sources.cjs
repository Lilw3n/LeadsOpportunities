/**
 * Taxonomie partagee des sources d'actualite pour le pipeline blog.
 *
 * Les familles "cafeyn" sont des equivalents RSS publics des titres lus dans
 * Cafeyn : aucun identifiant Cafeyn n'est requis ni stocke par ces scripts.
 */
const SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];

const PRIORITY_SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo"];

const DEFAULT_SOURCE_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 18,
  bing: 12,
  yahoo: 10,
  aggregator: 20,
};

function resolveSourceType(value, fallback) {
  var s = String(value || "").toLowerCase();
  if (s.indexOf("cafeyn") !== -1) return "cafeyn";
  if (s.indexOf("firefox") !== -1 || s.indexOf("pocket") !== -1 || s.indexOf("mozilla") !== -1) {
    return "firefox";
  }
  if (s.indexOf("google") !== -1) return "google";
  if (s.indexOf("yahoo") !== -1) return "yahoo";
  if (s.indexOf("edge") !== -1 || s.indexOf("msn") !== -1) return "edge";
  if (s.indexOf("bing") !== -1) return "bing";
  if (SOURCE_TYPES.indexOf(s) !== -1) return s;
  return fallback || "aggregator";
}

function resolveFeedSourceType(feed) {
  if (feed && feed.sourceType && feed.sourceType !== "aggregator") {
    return resolveSourceType(feed.sourceType);
  }
  return resolveSourceType((feed && (feed.id || feed.name || feed.url)) || "aggregator");
}

function emptySourceBuckets() {
  return SOURCE_TYPES.reduce(function (acc, type) {
    acc[type] = [];
    return acc;
  }, {});
}

function sourceLabel(type) {
  var normalized = resolveSourceType(type);
  return {
    cafeyn: "Cafeyn (presse partenaire)",
    edge: "Microsoft Edge / MSN actu",
    firefox: "Mozilla Firefox / Pocket",
    google: "Google News",
    bing: "Bing Actualites",
    yahoo: "Yahoo Actualites",
    aggregator: "l'actualite du jour",
  }[normalized];
}

module.exports = {
  SOURCE_TYPES: SOURCE_TYPES,
  PRIORITY_SOURCE_TYPES: PRIORITY_SOURCE_TYPES,
  DEFAULT_SOURCE_QUOTAS: DEFAULT_SOURCE_QUOTAS,
  resolveSourceType: resolveSourceType,
  resolveFeedSourceType: resolveFeedSourceType,
  emptySourceBuckets: emptySourceBuckets,
  sourceLabel: sourceLabel,
};
