#!/usr/bin/env node
/**
 * Pipeline 100 % auto : fetch (RSS Cafeyn/Edge/Firefox + Pocket) → rédaction → publish.
 *
 * Usage:
 *   npm run blog:actu:auto
 *   npm run blog:actu:auto -- --count=2
 *   npm run blog:actu:auto -- --min-lead-score=35
 *   npm run blog:actu:auto -- --dry-run
 *   npm run blog:actu:auto -- --no-ai
 */
const { execSync } = require("child_process");
const path = require("path");
const { readJson, writeJson, rankCandidates, appendPendingArticle } = require("./blog-actu-lib.cjs");
const { enrichFromCandidate } = require("./blog-actu-enrich.cjs");
const { generateActuArticleAi } = require("./generate-actu-article-ai.cjs");

var ROOT = path.join(__dirname, "..");
var DEFAULT_MIN_LEAD_SCORE = 35;

function arg(name, def) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  if (!m) return def;
  return m.split("=").slice(1).join("=");
}

function numericArg(name, envName, def) {
  var raw = arg(name, "");
  if (raw === "" && envName) raw = process.env[envName] || "";
  if (raw === "") return def;
  var value = Number(raw);
  return Number.isFinite(value) ? value : def;
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

function pickCandidates(candidates, count, state, options) {
  var feedMap = loadFeedSourceMap();
  var processed = new Set(state.processedUrls || []);
  var titleKeys = loadPublishedTitleKeys();
  var ranked = rankCandidates(candidates);
  var minLeadScore = Math.max(0, Number(options && options.minLeadScore) || 0);

  var available = ranked.filter(function (c) {
    if (c.url && processed.has(c.url)) return false;
    if (titleKeys.has(normalizeTitle(c.title))) return false;
    return true;
  });

  if (!available.length) return [];
  var beforeLeadGate = available.length;
  available = available.filter(function (c) {
    return c.status === "queued" || Number(c.leadScore || 0) >= minLeadScore;
  });
  state._leadGateStats = {
    minLeadScore: minLeadScore,
    available: beforeLeadGate,
    eligible: available.length,
  };
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
  var minLeadScore = Math.max(0, Math.min(100, numericArg("min-lead-score", "MIN_LEAD_SCORE", DEFAULT_MIN_LEAD_SCORE)));
  var dryRun = process.argv.indexOf("--dry-run") !== -1;
  var skipPublish = process.argv.indexOf("--skip-publish") !== -1;
  var useAi = hasAiKey() && process.argv.indexOf("--no-ai") === -1;

  console.log("=== Auto actu publish ===");
  console.log(
    "count:",
    count,
    "| minLeadScore:",
    minLeadScore,
    "| IA:",
    useAi ? "oui" : "non (enrich)",
    "| dry-run:",
    dryRun
  );
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
  var picks = pickCandidates(candidates, count, state, { minLeadScore: minLeadScore });

  if (!picks.length) {
    if (state._leadGateStats && state._leadGateStats.available) {
      console.log(
        "Aucun candidat au-dessus du seuil lead (" +
          minLeadScore +
          "). Éligibles: " +
          state._leadGateStats.eligible +
          "/" +
          state._leadGateStats.available +
          "."
      );
    } else {
      console.log("Aucun candidat disponible.");
    }
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
      published.push({ file: article.file, title: article.title, leadScore: pick.leadScore });
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
      leadScore: pick.leadScore,
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
        execSync("node scripts/verify-actu-quality.cjs", { stdio: "inherit", cwd: ROOT });
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
    minLeadScore: minLeadScore,
    articles: published,
  });
  if (state.autoRuns.length > 50) {
    state.autoRuns = state.autoRuns.slice(-50);
  }
  if (state._nextPlatformRotation !== undefined) {
    state.platformRotationIndex = state._nextPlatformRotation;
    delete state._nextPlatformRotation;
  }
  delete state._leadGateStats;
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
