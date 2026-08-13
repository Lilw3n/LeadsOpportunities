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
const {
  readJson,
  writeJson,
  rankCandidates,
  appendPendingArticle,
  isPlaceholderActuItem,
  isWeakLeadCandidate,
  existingFiles,
} = require("./blog-actu-lib.cjs");
const { isInternationalAudienceTopic, isFranceMarketTopic } = require("./france-audience-lib.cjs");
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

function urlKey(u) {
  var raw = String(u || "")
    .trim()
    .replace(/#.*$/, "")
    .replace(/&amp;/g, "&");
  var bingInner = raw.match(/[?&]url=([^&]+)/);
  if (bingInner && /bing\.com\/news\/apiclick/i.test(raw)) {
    try {
      raw = decodeURIComponent(bingInner[1]);
    } catch (e) {}
  }
  return raw.replace(/[?&](utm_[^=]+|xtor|oc)=[^&]*/g, "").replace(/\?$/, "");
}

function titleKey(t) {
  return normalizeTitle(t)
    .replace(/\s*:.*/, "")
    .replace(/['’"]/g, "")
    .slice(0, 72);
}

function loadPublishedTitleKeys(state) {
  var keys = new Set();
  function add(t) {
    var n = normalizeTitle(t);
    if (n) keys.add(n);
    var k = titleKey(t);
    if (k) keys.add(k);
  }
  var pub = readJson("blog-actu-published.json", { articles: [] });
  (pub.articles || []).forEach(function (a) {
    add(a.title);
  });
  try {
    var manifest = require("./blog-articles-manifest.cjs");
    (manifest.articles || []).forEach(function (a) {
      add(a.title);
    });
  } catch (e) {}
  (state && state.skippedTitles ? state.skippedTitles : []).forEach(add);
  (state && state.autoRuns ? state.autoRuns : []).forEach(function (run) {
    (run.articles || []).forEach(function (a) {
      add(a.title);
    });
  });
  return keys;
}

var PLATFORM_TYPES = ["cafeyn", "edge", "firefox"];

function candidateSourceType(c, feedMap) {
  if (c.sourceType) return c.sourceType;
  var src = String(c.source || "").toLowerCase();
  if (src.indexOf("cafeyn") !== -1) return "cafeyn";
  if (src.indexOf("edge") !== -1 || src.indexOf("msn") !== -1 || src.indexOf("bing") !== -1) return "edge";
  if (src.indexOf("firefox") !== -1 || src.indexOf("pocket") !== -1) return "firefox";
  return feedMap[c.feedId] || "aggregator";
}

function bestFromPlatform(available, platform, feedMap, used) {
  var list = available
    .filter(function (c) {
      var k = c.url || c.title;
      return candidateSourceType(c, feedMap) === platform && !used.has(k);
    })
    .sort(function (a, b) {
      return b.leadScore - a.leadScore;
    });
  return list[0] || null;
}

function pickCandidates(candidates, count, state) {
  var feedMap = loadFeedSourceMap();
  var processed = new Set((state.processedUrls || []).map(urlKey));
  var titleKeys = loadPublishedTitleKeys(state);
  var occupiedFiles = new Set();
  existingFiles().forEach(function (f) {
    occupiedFiles.add(f);
    occupiedFiles.add(String(f).replace(/-\d+(?=\.html$)/, ""));
    occupiedFiles.add(String(f).replace(/\.html$/, "").replace(/-\d+$/, "").slice(0, 40));
  });
  var ranked = rankCandidates(candidates);

  var available = ranked.filter(function (c) {
    if (isPlaceholderActuItem(c)) return false;
    if (isWeakLeadCandidate(c)) return false;
    if (c.url && processed.has(urlKey(c.url))) return false;
    if (titleKeys.has(normalizeTitle(c.title)) || titleKeys.has(titleKey(c.title))) return false;
    var sug = String(c.suggestedFile || "");
    if (sug && !sug.endsWith(".html")) sug += ".html";
    if (sug && (occupiedFiles.has(sug) || occupiedFiles.has(sug.replace(/-\d+(?=\.html$)/, "")))) {
      return false;
    }
    if (sug && occupiedFiles.has(sug.replace(/\.html$/, "").replace(/-\d+$/, "").slice(0, 40))) {
      return false;
    }
    var hay = String(c.title || "") + " " + String(c.summary || "");
    if (isInternationalAudienceTopic(hay) && !isFranceMarketTopic(hay)) return false;
    return true;
  });

  if (!available.length) return [];

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

  if (count >= 3) {
    PLATFORM_TYPES.forEach(function (platform) {
      if (picks.length >= count) return;
      var pick = bestFromPlatform(available, platform, feedMap, used);
      if (pick) {
        picks.push(pick);
        used.add(pick.url || pick.title);
      }
    });
    state._nextPlatformRotation = ((state.platformRotationIndex || 0) + PLATFORM_TYPES.length) % PLATFORM_TYPES.length;
  } else {
    var rot = state.platformRotationIndex || 0;
    for (var i = 0; i < count && picks.length < count; i++) {
      var platform = PLATFORM_TYPES[(rot + i) % PLATFORM_TYPES.length];
      var rotated = bestFromPlatform(available, platform, feedMap, used);
      if (rotated) {
        picks.push(rotated);
        used.add(rotated.url || rotated.title);
      }
    }
    state._nextPlatformRotation = (rot + count) % PLATFORM_TYPES.length;
  }

  available
    .filter(function (c) {
      return PLATFORM_TYPES.indexOf(candidateSourceType(c, feedMap)) !== -1;
    })
    .forEach(function (c) {
      if (picks.length >= count) return;
      var k = c.url || c.title;
      if (used.has(k)) return;
      picks.push(c);
      used.add(k);
    });

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
  var feedMap = loadFeedSourceMap();

  for (var i = 0; i < picks.length; i++) {
    var pick = picks[i];
    var platform = candidateSourceType(pick, feedMap);
    console.log(
      "\n[" +
        (i + 1) +
        "/" +
        picks.length +
        "] [" +
        platform.toUpperCase() +
        "] score=" +
        pick.leadScore +
        " — " +
        pick.title.slice(0, 72)
    );

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
      sourceType: platform,
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
    if (process.env.STRICT_ACTU_QUALITY === "1" || process.argv.indexOf("--strict-quality") !== -1) {
      console.log("\n=== Contrôle qualité ===");
      try {
        execSync("node scripts/verify-actu-quality.cjs --file=data/blog-actu-pending.json", {
          stdio: "inherit",
          cwd: ROOT,
        });
      } catch (e) {
        console.error("Qualité insuffisante — publication annulée. Utilisez Cursor pour enrichir.");
        process.exit(1);
      }
    }
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
  if (state._nextPlatformRotation !== undefined) {
    state.platformRotationIndex = state._nextPlatformRotation;
    delete state._nextPlatformRotation;
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

  try {
    var dbIds = picks.filter(function (p) {
      return p.id && String(p.id).indexOf("ingest-") === 0;
    }).map(function (p) {
      return p.id;
    });
    if (dbIds.length) {
      var dbMod = require("./blog-actu-queue-db.cjs");
      await dbMod.markQueuePublished(dbIds);
      console.log("DB queue: marqué publié —", dbIds.length);
    }
  } catch (e) {
    console.warn("DB queue mark:", e.message);
  }

  console.log("\n✓ Publié:", published.length, "article(s)");
  published.forEach(function (p) {
    console.log("  -", p.file, "[" + (p.sourceType || "?").toUpperCase() + "]", "(" + (p.source || "?") + ")");
  });
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
