/**
 * Taxonomie partagee des sources d'actualite pour le pipeline blog.
 *
 * Cafeyn reste represente par des RSS publics equivalents + l'inbox securisee :
 * aucun identifiant Cafeyn ne doit etre stocke ni transmis aux scripts.
 */
const SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];

const DEFAULT_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 25,
  bing: 15,
  yahoo: 12,
  aggregator: 8,
};

const PREFERRED_PLATFORM_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo"];

function normalizeSourceType(type, fallback) {
  var value = String(type || "").toLowerCase().trim();
  if (SOURCE_TYPES.indexOf(value) !== -1) return value;
  return fallback || "aggregator";
}

function resolveSourceType(input, fallback) {
  var s = String(input || "").toLowerCase();
  if (s.indexOf("cafeyn") !== -1) return "cafeyn";
  if (s.indexOf("firefox") !== -1 || s.indexOf("mozilla") !== -1 || s.indexOf("pocket") !== -1) return "firefox";
  if (s.indexOf("google") !== -1) return "google";
  if (s.indexOf("yahoo") !== -1) return "yahoo";
  if (s.indexOf("edge") !== -1 || s.indexOf("msn") !== -1 || s.indexOf("microsoft") !== -1) return "edge";
  if (s.indexOf("bing") !== -1) return "bing";
  return fallback || "aggregator";
}

function emptySourceBuckets() {
  return SOURCE_TYPES.reduce(function (acc, type) {
    acc[type] = [];
    return acc;
  }, {});
}

function sourceLabel(type) {
  return {
    cafeyn: "Cafeyn",
    edge: "Edge/MSN",
    firefox: "Firefox/Pocket",
    google: "Google News",
    bing: "Bing News",
    yahoo: "Yahoo",
    aggregator: "Autres agregateurs",
  }[normalizeSourceType(type)] || "Autres agregateurs";
}

function isEditorialSourceType(type) {
  return PREFERRED_PLATFORM_TYPES.indexOf(normalizeSourceType(type)) !== -1;
}

module.exports = {
  SOURCE_TYPES: SOURCE_TYPES,
  DEFAULT_QUOTAS: DEFAULT_QUOTAS,
  PREFERRED_PLATFORM_TYPES: PREFERRED_PLATFORM_TYPES,
  normalizeSourceType: normalizeSourceType,
  resolveSourceType: resolveSourceType,
  emptySourceBuckets: emptySourceBuckets,
  sourceLabel: sourceLabel,
  isEditorialSourceType: isEditorialSourceType,
};
