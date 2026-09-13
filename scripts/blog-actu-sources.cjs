/**
 * Typologie des sources publiques pour le pipeline blog actu.
 *
 * Cafeyn reste volontairement represente par des RSS publics de journaux
 * equivalents : aucun identifiant ni contenu paywall n'est collecte ici.
 */
const SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];
const PLATFORM_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo"];

const DEFAULT_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 25,
  bing: 10,
  yahoo: 10,
  aggregator: 15,
};

function textOf(value) {
  return String(value || "").toLowerCase();
}

function sourceTypeFromText(value) {
  var hay = textOf(value);
  if (!hay) return "";
  if (hay.indexOf("cafeyn") !== -1) return "cafeyn";
  if (hay.indexOf("firefox") !== -1 || hay.indexOf("pocket") !== -1 || hay.indexOf("mozilla") !== -1) return "firefox";
  if (hay.indexOf("yahoo") !== -1) return "yahoo";
  if (hay.indexOf("google") !== -1 || hay.indexOf("news.google.com") !== -1) return "google";
  if (hay.indexOf("edge") !== -1 || hay.indexOf("msn") !== -1 || hay.indexOf("microsoft start") !== -1) return "edge";
  if (hay.indexOf("bing") !== -1) return "bing";
  return "";
}

function resolveSourceType(source) {
  var explicit = textOf(source);
  if (SOURCE_TYPES.indexOf(explicit) !== -1 && explicit !== "aggregator") return explicit;
  return sourceTypeFromText(source) || "aggregator";
}

function resolveFeedSourceType(feed) {
  var explicit = textOf(feed && feed.sourceType);
  var descriptor = [feed && feed.id, feed && feed.name, feed && feed.url].filter(Boolean).join(" ");
  var detected = sourceTypeFromText(descriptor);

  if (SOURCE_TYPES.indexOf(explicit) !== -1 && explicit !== "aggregator") return explicit;
  if (detected) return detected;
  return "aggregator";
}

function createSourceBuckets() {
  return SOURCE_TYPES.reduce(function (acc, type) {
    acc[type] = [];
    return acc;
  }, {});
}

function bySourceCounts(buckets) {
  return SOURCE_TYPES.reduce(function (acc, type) {
    acc[type] = (buckets[type] || []).length;
    return acc;
  }, {});
}

function isPlatformSourceType(type) {
  return PLATFORM_TYPES.indexOf(resolveSourceType(type)) !== -1;
}

function sourceLabel(typeOrSource) {
  var type = resolveSourceType(typeOrSource);
  if (type === "cafeyn") return "Cafeyn (presse partenaire)";
  if (type === "edge") return "Microsoft Edge / MSN actu";
  if (type === "firefox") return "Mozilla Firefox / Pocket";
  if (type === "google") return "Google News";
  if (type === "bing") return "Bing News";
  if (type === "yahoo") return "Yahoo Actualites";
  return "l'actualite du jour";
}

function isPlaceholderQueueItem(item) {
  var id = textOf(item && item.id);
  var title = textOf(item && item.title);
  return id === "cafeyn-pending-template" || title.indexOf("collez ici") !== -1;
}

module.exports = {
  SOURCE_TYPES: SOURCE_TYPES,
  PLATFORM_TYPES: PLATFORM_TYPES,
  DEFAULT_QUOTAS: DEFAULT_QUOTAS,
  resolveSourceType: resolveSourceType,
  resolveFeedSourceType: resolveFeedSourceType,
  createSourceBuckets: createSourceBuckets,
  bySourceCounts: bySourceCounts,
  isPlatformSourceType: isPlatformSourceType,
  sourceLabel: sourceLabel,
  isPlaceholderQueueItem: isPlaceholderQueueItem,
};
