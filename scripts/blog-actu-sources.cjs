/**
 * Types de sources pour le pipeline blog actu.
 *
 * Les pages d'accueil et services sans RSS officiel stable sont representes
 * par des flux publics equivalents, sans login ni scraping de session.
 */
const SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];
const PRIMARY_SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing"];

const DEFAULT_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 30,
  bing: 20,
  yahoo: 14,
  aggregator: 8,
};

const SOURCE_LABELS = {
  cafeyn: "Cafeyn / presse",
  edge: "Microsoft Edge / MSN",
  firefox: "Mozilla Firefox / Pocket",
  google: "Google News",
  bing: "Bing News",
  yahoo: "Yahoo Actualites",
  aggregator: "Agregateur actu",
};

function resolveSourceType(value, fallback) {
  var s = String(value || "").toLowerCase();
  if (s.indexOf("cafeyn") !== -1) return "cafeyn";
  if (s.indexOf("google") !== -1 || s.indexOf("gnews") !== -1) return "google";
  if (s.indexOf("yahoo") !== -1) return "yahoo";
  if (s.indexOf("edge") !== -1 || s.indexOf("msn") !== -1) return "edge";
  if (s.indexOf("bing") !== -1) return "bing";
  if (s.indexOf("firefox") !== -1 || s.indexOf("mozilla") !== -1 || s.indexOf("pocket") !== -1) {
    return "firefox";
  }
  return fallback === undefined ? "aggregator" : fallback;
}

function sourceLabel(type) {
  return SOURCE_LABELS[resolveSourceType(type)] || SOURCE_LABELS.aggregator;
}

function sourceTypes() {
  return SOURCE_TYPES.slice();
}

function isPlaceholderQueueItem(item) {
  var id = String((item && item.id) || "").toLowerCase();
  var title = String((item && item.title) || "").toLowerCase();
  return (
    id.indexOf("pending-template") !== -1 ||
    id.indexOf("placeholder") !== -1 ||
    title.indexOf("collez ici") !== -1
  );
}

module.exports = {
  SOURCE_TYPES: SOURCE_TYPES,
  PRIMARY_SOURCE_TYPES: PRIMARY_SOURCE_TYPES,
  DEFAULT_QUOTAS: DEFAULT_QUOTAS,
  SOURCE_LABELS: SOURCE_LABELS,
  resolveSourceType: resolveSourceType,
  sourceLabel: sourceLabel,
  sourceTypes: sourceTypes,
  isPlaceholderQueueItem: isPlaceholderQueueItem,
};
