#!/usr/bin/env node
/**
 * Pipeline 100 % auto : fetch (RSS Cafeyn/Edge/Firefox + Pocket) → rédaction → publish.
 *
 * Usage:
 *   npm run blog:actu:auto
 *   npm run blog:actu:auto -- --count=2
 *   npm run blog:actu:auto -- --dry-run
 *   npm run blog:actu:auto -- --no-ai
 */
const { execSync } = require("child_process");
const path = require("path");
const { readJson, writeJson, rankCandidates, appendPendingArticle } = require("./blog-actu-lib.cjs");
const { enrichFromCandidate } = require("./blog-actu-enrich.cjs");
const { generateActuArticleAi } = require("./generate-actu-article-ai.cjs");

var ROOT = path.join(__dirname, "..");

function arg(name, def) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  if (!m) return def;
  return m.split("=").slice(1).join("=");
}

function hasAiKey() {
  return !!(
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.OPENAI_API_KEY
  );
}

function loadFeedSourceMap() {
  var feedsCfg = readJson("blog-actu-feeds.json", { feeds: [] });
  var map = {};
  (feedsCfg.feeds || []).forEach(function (f) {
    map[f.id] = f.sourceType || "aggregator";
  });
  return map;
}

function normalizeTitle(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function loadPublishedTitleKeys() {
  var keys = new Set();
  var pub = readJson("blog-actu-published.json", { articles: [] });
  (pub.articles || []).forEach(function (a) {
    keys.add(normalizeTitle(a.title));
  });
  try {
    var manifest = require("./blog-articles-manifest.cjs");
    (manifest.articles || []).forEach(function (a) {
      keys.add(normalizeTitle(a.title));
    });
  } catch (e) {}
  return keys;
}

function pickCandidates(candidates, count, state) {
  var feedMap = loadFeedSourceMap();
  var processed = new Set(state.processedUrls || []);
  var titleKeys = loadPublishedTitleKeys();
  var ranked = rankCandidates(candidates);

  var available = ranked.filter(function (c) {
    if (c.url && processed.has(c.url)) return false;
    if (titleKeys.has(normalizeTitle(c.title))) return false;
    return true;
  });

  if (!available.length) return [];

  var rotation = ["cafeyn", "edge", "firefox", "aggregator"];
  var slot = Math.floor(Date.now() / 3600000) % rotation.length;
  var preferred = rotation[slot];

  var picks = [];
  var used = new Set();

  available
    .filter(function (c) {
      return c.status === "queued";
    })
    .slice(0, count)
    .forEach(function (c) {
      if (picks.length >= count) return;
      picks.push(c);
      used.add(c.url || c.title);
    });

  if (picks.length < count) {
    var prefPick = available.find(function (c) {
      var st = feedMap[c.feedId] || c.source || "aggregator";
      var k = c.url || c.title;
      return st === preferred && !used.has(k);
    });
    if (prefPick) {
      picks.push(prefPick);
      used.add(prefPick.url || prefPick.title);
    }
  }

  available.forEach(function (c) {
    if (picks.length >= count) return;
    var k = c.url || c.title;
    if (used.has(k)) return;
    picks.push(c);
    used.add(k);
  });

  return picks;
}

function runNode(script) {
  execSync("node " + script, { stdio: "inherit", cwd: ROOT });
}

async function main() {
  var count = Math.min(5, Math.max(1, Number(arg("count", 1)) || 1));
  var dryRun = process.argv.indexOf("--dry-run") !== -1;
  var skipPublish = process.argv.indexOf("--skip-publish") !== -1;
  var useAi = hasAiKey() && process.argv.indexOf("--no-ai") === -1;

  console.log("=== Auto actu publish ===");
  console.log("count:", count, "| IA:", useAi ? "oui" : "non (enrich)", "| dry-run:", dryRun);
  console.log("");

  var feedsCfg = readJson("blog-actu-feeds.json", { pocket: {} });
  if (feedsCfg.pocket && feedsCfg.pocket.enabled !== false) {
    try {
      runNode("scripts/fetch-pocket.cjs");
    } catch (e) {
      console.warn("Pocket skip:", e.message || e);
    }
  }

  try {
    runNode("scripts/fetch-actu-candidates.cjs");
  } catch (e) {
    console.warn("Fetch RSS partiel — on continue.");
  }

  var candidates = readJson("blog-actu-candidates.json", { candidates: [] }).candidates || [];
  var state = readJson("blog-actu-state.json", {
    processedUrls: [],
    publishedFiles: [],
    autoRuns: [],
  });
  var picks = pickCandidates(candidates, count, state);

  if (!picks.length) {
    console.log("Aucun candidat disponible.");
    process.exit(0);
  }

  console.log("Sélection:", picks.length, "candidat(s)");
  var published = [];

  for (var i = 0; i < picks.length; i++) {
    var pick = picks[i];
    console.log("\n[" + (i + 1) + "/" + picks.length + "] score=" + pick.leadScore + " — " + pick.title.slice(0, 72));

    var article = null;
    if (useAi) {
      var aiRes = await generateActuArticleAi(pick);
      if (aiRes.ok) {
        article = aiRes.article;
        console.log("  Rédaction IA:", aiRes.provider);
      } else {
        console.warn("  IA:", aiRes.error, "→ enrichissement local");
        article = enrichFromCandidate(pick);
      }
    } else {
      article = enrichFromCandidate(pick);
    }

    if (!article || !article.blocks || !article.blocks.length) {
      console.warn("  Article invalide — ignoré");
      continue;
    }

    if (dryRun) {
      console.log("  [dry-run]", article.file);
      published.push({ file: article.file, title: article.title });
      continue;
    }

    appendPendingArticle(article);
    if (pick.url) {
      state.processedUrls = state.processedUrls || [];
      if (state.processedUrls.indexOf(pick.url) === -1) {
        state.processedUrls.push(pick.url);
      }
    }
    published.push({
      file: article.file,
      title: article.title,
      source: pick.feedName || pick.source || pick.feedId,
    });
  }

  if (!published.length) {
    console.log("Rien généré.");
    process.exit(0);
  }

  if (dryRun) {
    console.log("\nDry-run terminé —", published.length, "article(s) simulé(s).");
    process.exit(0);
  }

  if (!skipPublish) {
    console.log("\n=== Génération HTML + SEO ===");
    execSync("npm run blog:actu:publish", { stdio: "inherit", cwd: ROOT });
    runNode("scripts/archive-actu-pending.cjs");
  }

  state.lastAutoRun = new Date().toISOString();
  state.autoRuns = state.autoRuns || [];
  state.autoRuns.push({
    at: state.lastAutoRun,
    count: published.length,
    usedAi: useAi,
    articles: published,
  });
  if (state.autoRuns.length > 50) {
    state.autoRuns = state.autoRuns.slice(-50);
  }
  writeJson("blog-actu-state.json", state);

  var queue = readJson("blog-actu-queue.json", { items: [] });
  picks.forEach(function (p) {
    (queue.items || []).forEach(function (item) {
      if (item.title === p.title || (p.url && item.url === p.url)) {
        item.status = "published";
      }
    });
  });
  queue.updated = new Date().toISOString();
  writeJson("blog-actu-queue.json", queue);

  console.log("\n✓ Publié:", published.length, "article(s)");
  published.forEach(function (p) {
    console.log("  -", p.file, "(" + (p.source || "?") + ")");
  });
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
