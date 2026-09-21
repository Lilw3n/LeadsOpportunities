/**
 * Typologie commune des sources du pipeline actu.
 *
 * Les sources Cafeyn sont volontairement des flux RSS publics de journaux
 * equivalents : aucun identifiant Cafeyn ne doit etre stocke ni transmis.
 */
const SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];

const DEFAULT_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 25,
  bing: 20,
  yahoo: 15,
  aggregator: 10,
};

const SOURCE_LABELS = {
  cafeyn: "Cafeyn / presse RSS publique",
  edge: "Microsoft Edge / MSN",
  firefox: "Mozilla Firefox / Pocket",
  google: "Google News",
  bing: "Bing News",
  yahoo: "Yahoo Actualites",
  aggregator: "Agregateurs publics",
};

function normalizeSourceType(value) {
  var t = String(value || "").toLowerCase();
  if (SOURCE_TYPES.indexOf(t) !== -1) return t;
  if (t.indexOf("cafeyn") !== -1) return "cafeyn";
  if (t.indexOf("edge") !== -1 || t.indexOf("msn") !== -1) return "edge";
  if (t.indexOf("firefox") !== -1 || t.indexOf("pocket") !== -1) return "firefox";
  if (t.indexOf("google") !== -1) return "google";
  if (t.indexOf("bing") !== -1) return "bing";
  if (t.indexOf("yahoo") !== -1) return "yahoo";
  return "aggregator";
}

function resolveCandidateSourceType(candidate, feedMap) {
  if (candidate && candidate.sourceType) return normalizeSourceType(candidate.sourceType);
  var src = String((candidate && candidate.source) || "").toLowerCase();
  var fromText = normalizeSourceType(src);
  if (fromText !== "aggregator") return fromText;
  return normalizeSourceType(feedMap && candidate ? feedMap[candidate.feedId] : "");
}

function activeSourceTypes(quotas) {
  var q = quotas || DEFAULT_QUOTAS;
  return SOURCE_TYPES.filter(function (type) {
    return Number(q[type] || 0) > 0;
  });
}

function emptyBuckets() {
  return SOURCE_TYPES.reduce(function (acc, type) {
    acc[type] = [];
    return acc;
  }, {});
}

module.exports = {
  SOURCE_TYPES: SOURCE_TYPES,
  DEFAULT_QUOTAS: DEFAULT_QUOTAS,
  SOURCE_LABELS: SOURCE_LABELS,
  normalizeSourceType: normalizeSourceType,
  resolveCandidateSourceType: resolveCandidateSourceType,
  activeSourceTypes: activeSourceTypes,
  emptyBuckets: emptyBuckets,
};
