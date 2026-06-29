/**
 * Source taxonomy for the blog actu pipeline.
 *
 * The public RSS feeds are grouped by the user-facing surface they represent:
 * Cafeyn equivalents, browser home pages, and news aggregators.
 */

const SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo", "aggregator"];

const PRIORITY_SOURCE_TYPES = ["cafeyn", "edge", "firefox", "google", "bing", "yahoo"];

const DEFAULT_QUOTAS = {
  cafeyn: 20,
  edge: 12,
  firefox: 15,
  google: 25,
  bing: 12,
  yahoo: 12,
  aggregator: 20,
};

function normalizeSourceType(type) {
  var value = String(type || "").toLowerCase().trim();
  if (value === "msn") return "edge";
  if (value === "mozilla" || value === "pocket") return "firefox";
  if (SOURCE_TYPES.indexOf(value) !== -1) return value;
  return "aggregator";
}

function inferSourceTypeFromText(text) {
  var s = String(text || "").toLowerCase();
  if (s.indexOf("cafeyn") !== -1) return "cafeyn";
  if (s.indexOf("firefox") !== -1 || s.indexOf("mozilla") !== -1 || s.indexOf("pocket") !== -1) {
    return "firefox";
  }
  if (s.indexOf("google") !== -1 || s.indexOf("news.google.") !== -1) return "google";
  if (s.indexOf("yahoo") !== -1 || s.indexOf("fr.news.yahoo.") !== -1 || s.indexOf("fr.finance.yahoo.") !== -1) {
    return "yahoo";
  }
  if (s.indexOf("edge") !== -1 || s.indexOf("msn") !== -1) return "edge";
  if (s.indexOf("bing") !== -1 || s.indexOf("bing.com/news") !== -1) return "bing";
  return "aggregator";
}

function feedSourceType(feed) {
  if (!feed) return "aggregator";
  if (feed.sourceType) return normalizeSourceType(feed.sourceType);
  return inferSourceTypeFromText([feed.id, feed.name, feed.url].filter(Boolean).join(" "));
}

function candidateSourceType(candidate, feedMap) {
  var c = candidate || {};
  var explicit = normalizeSourceType(c.sourceType);
  if (explicit !== "aggregator") return explicit;
  if (feedMap && c.feedId && feedMap[c.feedId]) return normalizeSourceType(feedMap[c.feedId]);
  return inferSourceTypeFromText([c.source, c.feedName, c.feedId, c.url].filter(Boolean).join(" "));
}

function makeSourceBuckets() {
  return SOURCE_TYPES.reduce(function (acc, type) {
    acc[type] = [];
    return acc;
  }, {});
}

function sourceCountsFromBuckets(buckets) {
  return SOURCE_TYPES.reduce(function (acc, type) {
    acc[type] = (buckets[type] || []).length;
    return acc;
  }, {});
}

function formatSourceCounts(counts) {
  var src = counts || {};
  return SOURCE_TYPES.map(function (type) {
    return type + ":" + (src[type] || 0);
  }).join(" ");
}

function isQueuePlaceholder(item) {
  var id = String((item && item.id) || "").toLowerCase();
  var title = String((item && item.title) || "").toLowerCase();
  if (id.indexOf("pending-template") !== -1) return true;
  if (!String((item && item.url) || "").trim() && /collez ici|exemple|template/.test(title)) return true;
  return false;
}

module.exports = {
  SOURCE_TYPES: SOURCE_TYPES,
  PRIORITY_SOURCE_TYPES: PRIORITY_SOURCE_TYPES,
  DEFAULT_QUOTAS: DEFAULT_QUOTAS,
  normalizeSourceType: normalizeSourceType,
  inferSourceTypeFromText: inferSourceTypeFromText,
  feedSourceType: feedSourceType,
  candidateSourceType: candidateSourceType,
  makeSourceBuckets: makeSourceBuckets,
  sourceCountsFromBuckets: sourceCountsFromBuckets,
  formatSourceCounts: formatSourceCounts,
  isQueuePlaceholder: isQueuePlaceholder,
};
