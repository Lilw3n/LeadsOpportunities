/**
 * Typologie des sources du pipeline actu.
 *
 * Les sources Cafeyn restent des RSS publics de titres equivalents ou la file
 * manuelle securisee: aucun identifiant Cafeyn n'est lu ni stocke ici.
 */
var SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];

var DEFAULT_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 25,
  bing: 10,
  yahoo: 10,
  aggregator: 10,
};

var PLATFORM_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo"];
var PRIORITY_PLATFORM_TYPES = ["cafeyn", "edge", "firefox"];

function normalizeSourceType(type) {
  var t = String(type || "").toLowerCase().trim();
  return SOURCE_TYPES.indexOf(t) !== -1 ? t : "aggregator";
}

function sourceTypeFromText(source) {
  var s = String(source || "").toLowerCase();
  if (s.indexOf("cafeyn") !== -1) return "cafeyn";
  if (s.indexOf("firefox") !== -1 || s.indexOf("pocket") !== -1 || s.indexOf("mozilla") !== -1) {
    return "firefox";
  }
  if (s.indexOf("google") !== -1) return "google";
  if (s.indexOf("yahoo") !== -1) return "yahoo";
  if (s.indexOf("edge") !== -1 || s.indexOf("msn") !== -1 || s.indexOf("microsoft") !== -1) {
    return "edge";
  }
  if (s.indexOf("bing") !== -1) return "bing";
  return "aggregator";
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

function sourceTypeLabel(type) {
  var t = normalizeSourceType(type);
  var labels = {
    cafeyn: "Cafeyn (RSS presse partenaire)",
    edge: "Microsoft Edge / MSN",
    firefox: "Mozilla Firefox / Pocket",
    google: "Google News",
    bing: "Bing News",
    yahoo: "Yahoo Actualites",
    aggregator: "agregateurs publics",
  };
  return labels[t] || labels.aggregator;
}

module.exports = {
  SOURCE_TYPES: SOURCE_TYPES,
  DEFAULT_QUOTAS: DEFAULT_QUOTAS,
  PLATFORM_TYPES: PLATFORM_TYPES,
  PRIORITY_PLATFORM_TYPES: PRIORITY_PLATFORM_TYPES,
  normalizeSourceType: normalizeSourceType,
  sourceTypeFromText: sourceTypeFromText,
  mergeWithQuotas: mergeWithQuotas,
  sourceTypeLabel: sourceTypeLabel,
};
