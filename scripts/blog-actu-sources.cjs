/**
 * Source taxonomy shared by the blog actu pipeline.
 *
 * Keep source types explicit so quotas, rotation, status and prompts stay in sync
 * when a new acquisition channel is added.
 */
const SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];

const ROTATION_SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo"];

const DEFAULT_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 30,
  bing: 20,
  yahoo: 12,
  aggregator: 10,
};

function normalizeSourceType(value) {
  var s = String(value || "").toLowerCase();
  if (s.indexOf("cafeyn") !== -1) return "cafeyn";
  if (s.indexOf("firefox") !== -1 || s.indexOf("pocket") !== -1 || s.indexOf("mozilla") !== -1) return "firefox";
  if (s.indexOf("yahoo") !== -1) return "yahoo";
  if (s.indexOf("google") !== -1) return "google";
  if (s.indexOf("bing") !== -1) return "bing";
  if (s.indexOf("edge") !== -1 || s.indexOf("msn") !== -1) return "edge";
  if (SOURCE_TYPES.indexOf(s) !== -1) return s;
  return "aggregator";
}

function sourceTypeKeys(extraQuotas) {
  var keys = SOURCE_TYPES.slice();
  Object.keys(extraQuotas || {}).forEach(function (key) {
    var type = normalizeSourceType(key);
    if (keys.indexOf(type) === -1) keys.push(type);
  });
  return keys;
}

function createBuckets(extraQuotas) {
  var buckets = {};
  sourceTypeKeys(extraQuotas).forEach(function (type) {
    buckets[type] = [];
  });
  return buckets;
}

function isPrioritySourceType(value) {
  return ROTATION_SOURCE_TYPES.indexOf(normalizeSourceType(value)) !== -1;
}

function sourceTypeLabel(value) {
  var type = normalizeSourceType(value);
  var labels = {
    cafeyn: "Cafeyn / presse newsstand",
    edge: "Microsoft Edge / MSN",
    firefox: "Mozilla Firefox / Pocket",
    google: "Google News",
    bing: "Bing Actualites",
    yahoo: "Yahoo Actualites",
    aggregator: "agregateur actu",
  };
  return labels[type] || labels.aggregator;
}

module.exports = {
  SOURCE_TYPES: SOURCE_TYPES,
  ROTATION_SOURCE_TYPES: ROTATION_SOURCE_TYPES,
  DEFAULT_QUOTAS: DEFAULT_QUOTAS,
  normalizeSourceType: normalizeSourceType,
  sourceTypeKeys: sourceTypeKeys,
  createBuckets: createBuckets,
  isPrioritySourceType: isPrioritySourceType,
  sourceTypeLabel: sourceTypeLabel,
};
