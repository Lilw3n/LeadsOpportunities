/**
 * Typologie partagee des sources du pipeline blog actu.
 *
 * Les sources Cafeyn restent des equivalents publics (RSS des journaux) :
 * aucun identifiant ni scraping de session n'est utilise.
 */
const SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];

const PRIMARY_SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo"];

const DEFAULT_SOURCE_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 20,
  bing: 12,
  yahoo: 10,
  aggregator: 8,
};

const SOURCE_LABELS = {
  cafeyn: "Cafeyn (presse partenaire via RSS publics)",
  edge: "Microsoft Edge / MSN (via Bing News)",
  firefox: "Mozilla Firefox / Pocket",
  google: "Google News",
  bing: "Bing News",
  yahoo: "Yahoo Actualites / Finance",
  aggregator: "Agregateurs publics",
};

function normalizeSourceType(type) {
  var t = String(type || "").toLowerCase().trim();
  if (SOURCE_TYPES.indexOf(t) !== -1) return t;
  return resolveSourceTypeFromText(t);
}

function resolveSourceTypeFromText(source) {
  var s = String(source || "").toLowerCase();
  if (s.indexOf("cafeyn") !== -1) return "cafeyn";
  if (s.indexOf("edge") !== -1 || s.indexOf("msn") !== -1) return "edge";
  if (s.indexOf("firefox") !== -1 || s.indexOf("pocket") !== -1 || s.indexOf("mozilla") !== -1) {
    return "firefox";
  }
  if (s.indexOf("google") !== -1) return "google";
  if (s.indexOf("bing") !== -1) return "bing";
  if (s.indexOf("yahoo") !== -1) return "yahoo";
  return "aggregator";
}

function sourceTypesForBuckets(quotas) {
  var seen = {};
  var types = [];
  SOURCE_TYPES.forEach(function (type) {
    if ((quotas || {})[type] !== undefined || type !== "aggregator") {
      seen[type] = true;
      types.push(type);
    }
  });
  Object.keys(quotas || {}).forEach(function (type) {
    var normalized = normalizeSourceType(type);
    if (!seen[normalized]) {
      seen[normalized] = true;
      types.push(normalized);
    }
  });
  return types;
}

function createBuckets(quotas) {
  return sourceTypesForBuckets(quotas || DEFAULT_SOURCE_QUOTAS).reduce(function (acc, type) {
    acc[type] = [];
    return acc;
  }, {});
}

function sourceLabel(type) {
  return SOURCE_LABELS[normalizeSourceType(type)] || SOURCE_LABELS.aggregator;
}

module.exports = {
  SOURCE_TYPES: SOURCE_TYPES,
  PRIMARY_SOURCE_TYPES: PRIMARY_SOURCE_TYPES,
  DEFAULT_SOURCE_QUOTAS: DEFAULT_SOURCE_QUOTAS,
  SOURCE_LABELS: SOURCE_LABELS,
  normalizeSourceType: normalizeSourceType,
  resolveSourceTypeFromText: resolveSourceTypeFromText,
  sourceTypesForBuckets: sourceTypesForBuckets,
  createBuckets: createBuckets,
  sourceLabel: sourceLabel,
};
