#!/usr/bin/env node
/**
 * Firefox Pocket — récupère les derniers articles sauvegardés (API publique).
 * Variables : POCKET_CONSUMER_KEY + POCKET_ACCESS_TOKEN
 * Usage: node scripts/fetch-pocket.cjs
 */
const { readJson, writeJson } = require("./blog-actu-lib.cjs");

async function main() {
  var consumerKey = process.env.POCKET_CONSUMER_KEY || "";
  var accessToken = process.env.POCKET_ACCESS_TOKEN || "";
  if (!consumerKey || !accessToken) {
    console.log("Pocket: POCKET_CONSUMER_KEY / POCKET_ACCESS_TOKEN manquants — skip");
    return;
  }

  var res = await fetch("https://getpocket.com/v3/get", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({
      consumer_key: consumerKey,
      access_token: accessToken,
      detailType: "simple",
      sort: "newest",
      count: 8,
    }),
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) {
    throw new Error("Pocket HTTP " + res.status);
  }

  var data = await res.json();
  var list = data.list || {};
  var queue = readJson("blog-actu-queue.json", { items: [] });
  var state = readJson("blog-actu-state.json", { processedUrls: [] });
  var processed = new Set(state.processedUrls || []);
  var existing = new Set(
    (queue.items || []).map(function (i) {
      return (i.url || i.title || "").toLowerCase();
    })
  );

  var added = 0;
  Object.keys(list).forEach(function (id) {
    var item = list[id];
    if (!item || !item.resolved_title) return;
    var url = item.resolved_url || item.given_url || "";
    var key = (url || item.resolved_title).toLowerCase();
    if (processed.has(url) || existing.has(key)) return;

    queue.items = queue.items || [];
    queue.items.unshift({
      id: "pocket-" + id,
      title: item.resolved_title,
      url: url,
      source: "firefox-pocket",
      note: "Pocket Firefox — actu sauvegardee",
      status: "pending",
      addedAt: new Date(Number(item.time_added || Date.now()) * 1000).toISOString(),
    });
    existing.add(key);
    added++;
  });

  queue.updated = new Date().toISOString();
  writeJson("blog-actu-queue.json", queue);
  console.log("Pocket:", added, "nouvel(le)s item(s) dans blog-actu-queue.json");
}

main().catch(function (e) {
  console.error("Pocket erreur:", e.message);
  process.exit(1);
});
