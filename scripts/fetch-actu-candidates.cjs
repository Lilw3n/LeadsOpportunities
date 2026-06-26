#!/usr/bin/env node
/**
 * Récupère l'actu (RSS publics) + file d'attente manuelle (Cafeyn, Edge, etc.)
 * → data/blog-actu-candidates.json
 *
 * Usage: npm run blog:actu:fetch
 */
const {
  readJson,
  writeJson,
  scaffoldArticle,
  parseRssItems,
  existingFiles,
  scoreLeadPotential,
} = require("./blog-actu-lib.cjs");

const MAX_PER_FEED = 8;
const DEFAULT_QUOTAS = { cafeyn: 20, edge: 12, firefox: 15, google: 25, yahoo: 12, aggregator: 10 };
const DEFAULT_SOURCE_ORDER = Object.keys(DEFAULT_QUOTAS);

function resolveQueueSourceType(source) {
  var s = String(source || "").toLowerCase();
  if (s.indexOf("cafeyn") !== -1) return "cafeyn";
  if (s.indexOf("edge") !== -1 || s.indexOf("msn") !== -1 || s.indexOf("bing") !== -1) return "edge";
  if (s.indexOf("firefox") !== -1 || s.indexOf("pocket") !== -1) return "firefox";
  if (s.indexOf("google") !== -1) return "google";
  if (s.indexOf("yahoo") !== -1) return "yahoo";
  return "aggregator";
}

function sourceTypesFromConfig(feedsCfg, quotas) {
  var seen = {};
  DEFAULT_SOURCE_ORDER.concat(Object.keys(quotas || {})).forEach(function (type) {
    seen[type] = true;
  });
  (feedsCfg.feeds || []).forEach(function (feed) {
    seen[feed.sourceType || "aggregator"] = true;
  });
  return Object.keys(seen).sort(function (a, b) {
    var ia = DEFAULT_SOURCE_ORDER.indexOf(a);
    var ib = DEFAULT_SOURCE_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function emptyBuckets(sourceTypes) {
  var buckets = {};
  sourceTypes.forEach(function (type) {
    buckets[type] = [];
  });
  return buckets;
}

function mergeWithQuotas(buckets, quotas, sourceTypes) {
  var merged = [];
  sourceTypes.forEach(function (type) {
    var cap = quotas[type] || 0;
    var list = (buckets[type] || []).slice();
    list.sort(function (a, b) {
      return b.leadScore - a.leadScore;
    });
    merged = merged.concat(list.slice(0, cap));
  });
  return merged;
}

function ingestQueueItem(item, buckets, processed) {
  if (item.status === "published" || item.status === "rejected") return;
  var key = item.url || item.title;
  if (key && processed.has(key)) return;
  var queueType = resolveQueueSourceType(item.source);
  var scaffold = scaffoldArticle({
    title: item.title,
    summary: item.note || "",
    url: item.url || "",
    source: item.source || queueType,
    note: item.note || "",
  });
  if (!scaffold) return;
  if (!buckets[queueType]) buckets[queueType] = [];
  buckets[queueType].push({
    id: item.id || "manual-" + scaffold.file.replace(".html", ""),
    title: item.title,
    url: item.url || "",
    summary: item.note || "",
    source: item.source || "manual",
    sourceType: queueType,
    suggestedFile: scaffold.file,
    section: scaffold.section,
    status: "queued",
    fromDatabase: !!item.fromDatabase,
  });
}

async function fetchText(url) {
  var res = await fetch(url, {
    headers: {
      "User-Agent": "LeadsOpportunities-BlogBot/1.0 (+https://www.leadsopportunities.fr)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.text();
}

async function processFeed(feed, buckets, processed, maxPerFeed) {
  var sourceType = feed.sourceType || "aggregator";
  if (!buckets[sourceType]) buckets[sourceType] = [];
  try {
    var xml = await fetchText(feed.url);
    var items = parseRssItems(xml).slice(0, maxPerFeed);
    var added = 0;
    items.forEach(function (item) {
      if (item.url && processed.has(item.url)) return;
      var scaffold = scaffoldArticle({
        title: item.title,
        summary: item.summary,
        url: item.url,
        source: sourceType,
        feedName: feed.name,
      });
      if (!scaffold) return;
      buckets[sourceType].push({
        id: "rss-" + scaffold.file.replace(".html", ""),
        title: item.title,
        url: item.url,
        summary: item.summary,
        pubDate: item.pubDate,
        feedId: feed.id,
        feedName: feed.name,
        sourceType: sourceType,
        suggestedFile: scaffold.file,
        section: scaffold.section,
        need: scaffold.cta.href.match(/need=([^&]+)/)
          ? scaffold.cta.href.match(/need=([^&]+)/)[1]
          : "habitation",
        leadScore: 0,
        status: "candidate",
      });
      added++;
    });
    console.log("OK feed:", feed.id, "(" + sourceType + ") —", added, "items");
  } catch (e) {
    console.warn("SKIP feed:", feed.id, "—", e.message);
  }
}

async function fetchFeedsParallel(feeds, buckets, processed, maxPerFeed) {
  var CONCURRENCY = 8;
  var enabled = feeds.filter(function (f) {
    return f.enabled;
  });
  for (var i = 0; i < enabled.length; i += CONCURRENCY) {
    var batch = enabled.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(function (feed) {
        return processFeed(feed, buckets, processed, maxPerFeed);
      })
    );
  }
}

async function main() {
  var feedsCfg = readJson("blog-actu-feeds.json", { feeds: [], quotas: DEFAULT_QUOTAS });
  var quotas = Object.assign({}, DEFAULT_QUOTAS, feedsCfg.quotas || {});
  var sourceTypes = sourceTypesFromConfig(feedsCfg, quotas);
  var maxPerFeed = feedsCfg.maxPerFeed || MAX_PER_FEED;
  var state = readJson("blog-actu-state.json", { processedUrls: [], publishedFiles: [] });
  var queue = readJson("blog-actu-queue.json", { items: [] });
  var dbQueue = [];
  try {
    var dbMod = require("./blog-actu-queue-db.cjs");
    dbQueue = await dbMod.loadQueueFromDatabase();
    if (dbQueue.length) console.log("DB queue:", dbQueue.length, "item(s) Cafeyn/inbox");
  } catch (e) {
    console.warn("DB queue:", e.message);
  }
  var processed = new Set(state.processedUrls || []);
  var buckets = emptyBuckets(sourceTypes);

  await fetchFeedsParallel(feedsCfg.feeds || [], buckets, processed, maxPerFeed);

  (queue.items || []).forEach(function (item) {
    ingestQueueItem(item, buckets, processed);
  });
  dbQueue.forEach(function (item) {
    ingestQueueItem(item, buckets, processed);
  });

  var files = existingFiles();
  sourceTypes.forEach(function (type) {
    buckets[type] = (buckets[type] || []).filter(function (c) {
      var f = c.suggestedFile || "";
      if (!f.endsWith(".html")) f += ".html";
      return !files.has(f);
    });
  });

  sourceTypes.forEach(function (type) {
    var seen = new Set();
    buckets[type] = (buckets[type] || []).filter(function (c) {
      var k = (c.url || c.title).toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    buckets[type].forEach(function (c) {
      c.leadScore = scoreLeadPotential(c);
    });
  });

  var deduped = mergeWithQuotas(buckets, quotas, sourceTypes);
  var bySource = {};
  sourceTypes.forEach(function (type) {
    bySource[type] = (buckets[type] || []).length;
  });

  writeJson("blog-actu-candidates.json", {
    updated: new Date().toISOString(),
    quotas: quotas,
    bySource: bySource,
    candidates: deduped,
  });

  state.lastFetch = new Date().toISOString();
  writeJson("blog-actu-state.json", state);

  console.log(
    "Candidates:",
    deduped.length,
    "—",
    sourceTypes.join("/"),
    ":",
    sourceTypes.map(function (type) {
      return (buckets[type] || []).length;
    }).join("/")
  );
  if (deduped.length) {
    console.log("Top 3:");
    deduped.slice(0, 3).forEach(function (c, i) {
      console.log(" ", i + 1 + ".", c.title.slice(0, 70));
    });
  }
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
