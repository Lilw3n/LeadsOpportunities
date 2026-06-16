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
const MAX_CANDIDATES = 30;

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

async function main() {
  var feedsCfg = readJson("blog-actu-feeds.json", { feeds: [] });
  var state = readJson("blog-actu-state.json", { processedUrls: [], publishedFiles: [] });
  var queue = readJson("blog-actu-queue.json", { items: [] });
  var processed = new Set(state.processedUrls || []);
  var candidates = [];

  for (var feed of feedsCfg.feeds || []) {
    if (!feed.enabled) continue;
    try {
      var xml = await fetchText(feed.url);
      var items = parseRssItems(xml).slice(0, MAX_PER_FEED);
      items.forEach(function (item) {
        if (item.url && processed.has(item.url)) return;
        var scaffold = scaffoldArticle({
          title: item.title,
          summary: item.summary,
          url: item.url,
          source: "rss",
          feedName: feed.name,
        });
        if (!scaffold) return;
        candidates.push({
          id: "rss-" + scaffold.file.replace(".html", ""),
          title: item.title,
          url: item.url,
          summary: item.summary,
          pubDate: item.pubDate,
          feedId: feed.id,
          feedName: feed.name,
          suggestedFile: scaffold.file,
          section: scaffold.section,
          need: scaffold.cta.href.match(/need=([^&]+)/)
            ? scaffold.cta.href.match(/need=([^&]+)/)[1]
            : "habitation",
          leadScore: 0,
          status: "candidate",
        });
      });
      console.log("OK feed:", feed.id, "—", items.length, "items");
    } catch (e) {
      console.warn("SKIP feed:", feed.id, "—", e.message);
    }
  }

  (queue.items || []).forEach(function (item) {
    if (item.status === "published" || item.status === "rejected") return;
    var key = item.url || item.title;
    if (key && processed.has(key)) return;
    var scaffold = scaffoldArticle({
      title: item.title,
      summary: item.note || "",
      url: item.url || "",
      source: item.source || "manual",
      note: item.note || "",
    });
    if (!scaffold) return;
    candidates.push({
      id: item.id || "manual-" + scaffold.file.replace(".html", ""),
      title: item.title,
      url: item.url || "",
      summary: item.note || "",
      source: item.source || "manual",
      suggestedFile: scaffold.file,
      section: scaffold.section,
      status: "queued",
    });
  });

  var files = existingFiles();
  candidates = candidates.filter(function (c) {
    var f = c.suggestedFile || "";
    if (!f.endsWith(".html")) f += ".html";
    return !files.has(f);
  });

  var deduped = [];
  var seen = new Set();
  candidates.forEach(function (c) {
    var k = (c.url || c.title).toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    deduped.push(c);
  });

  deduped = deduped.slice(0, MAX_CANDIDATES);
  deduped.forEach(function (c) {
    c.leadScore = scoreLeadPotential(c);
  });
  deduped.sort(function (a, b) {
    return b.leadScore - a.leadScore;
  });

  writeJson("blog-actu-candidates.json", {
    updated: new Date().toISOString(),
    candidates: deduped,
  });

  state.lastFetch = new Date().toISOString();
  writeJson("blog-actu-state.json", state);

  console.log("Candidates:", deduped.length, "— voir data/blog-actu-candidates.json");
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
