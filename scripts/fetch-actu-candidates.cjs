#!/usr/bin/env node
/**
 * Récupère l'actu (RSS publics) + file d'attente manuelle
 * (Cafeyn, Edge, Firefox, Google, Bing, Yahoo, etc.)
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
const { DEFAULT_QUOTAS, isPlaceholderQueueItem, resolveSourceType, sourceTypes } = require("./blog-actu-sources.cjs");

const MAX_PER_FEED = 8;

function resolveQueueSourceType(source) {
  return resolveSourceType(source);
}

function mergeWithQuotas(buckets, quotas) {
  var queued = [];
  var rest = [];
  sourceTypes().forEach(function (type) {
    (buckets[type] || []).forEach(function (c) {
      if (c && c.status === "queued") queued.push(c);
      else rest.push(c);
    });
  });
  rest.sort(function (a, b) {
    return b.leadScore - a.leadScore;
  });
  /* File manuelle / thèmes : toujours en tête, hors plafond RSS */
  var merged = queued.slice();
  var seen = new Set(
    queued.map(function (c) {
      return (c.url || c.title || "").toLowerCase();
    })
  );
  sourceTypes().forEach(function (type) {
    var cap = quotas[type] || 0;
    var list = rest
      .filter(function (c) {
        return c.sourceType === type;
      })
      .slice(0, cap);
    list.forEach(function (c) {
      var k = (c.url || c.title || "").toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      merged.push(c);
    });
  });
  return merged;
}

function ingestQueueItem(item, buckets, processed) {
  if (isPlaceholderQueueItem(item)) return;
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
    section: item.section || scaffold.section,
    need: item.need || scaffold.need || "habitation",
    tag: item.tag || scaffold.tag,
    tagClass: item.tagClass || scaffold.tagClass,
    leadScore: 100,
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
  var sourceType = resolveSourceType([feed.id, feed.name, feed.sourceType].join(" "), feed.sourceType || "aggregator");
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
  var buckets = {};
  sourceTypes().forEach(function (type) {
    buckets[type] = [];
  });

  /* File manuelle / thèmes AVANT les RSS — sinon la dédup URL garde le candidat RSS */
  (queue.items || []).forEach(function (item) {
    ingestQueueItem(item, buckets, processed);
  });
  dbQueue.forEach(function (item) {
    ingestQueueItem(item, buckets, processed);
  });
  sourceTypes().forEach(function (type) {
    (buckets[type] || []).forEach(function (c) {
      var k = c.url || c.title;
      if (k) processed.add(k);
    });
  });

  await fetchFeedsParallel(feedsCfg.feeds || [], buckets, processed, maxPerFeed);

  var files = existingFiles();
  sourceTypes().forEach(function (type) {
    buckets[type] = (buckets[type] || []).filter(function (c) {
      var f = c.suggestedFile || "";
      if (!f.endsWith(".html")) f += ".html";
      return !files.has(f);
    });
  });

  sourceTypes().forEach(function (type) {
    var seen = new Set();
    buckets[type] = (buckets[type] || []).filter(function (c) {
      var k = (c.url || c.title).toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    buckets[type].forEach(function (c) {
      c.leadScore = scoreLeadPotential(c);
      if (c.status === "queued") c.leadScore = Math.max(c.leadScore, 100);
    });
  });

  var deduped = mergeWithQuotas(buckets, quotas);
  var bySource = {};
  sourceTypes().forEach(function (type) {
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
    sourceTypes()
      .map(function (type) {
        return type + ":" + ((buckets[type] || []).length);
      })
      .join(" ")
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
