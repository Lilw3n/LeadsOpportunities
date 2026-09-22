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

function insuranceTitleWeight(c) {
  var title = String(c.title || "").toLowerCase();
  var n = 0;
  ["mutuelle", "assurance", "sinistre", "emprunteur", "habitation", "prévoyance", "prevoyance"].forEach(function (kw) {
    if (title.indexOf(kw) !== -1) n += 1;
  });
  return n;
}

function compareLeadRank(a, b) {
  var score = b.leadScore - a.leadScore;
  if (score) return score;
  var db = Date.parse(b.pubDate || "") || 0;
  var da = Date.parse(a.pubDate || "") || 0;
  if (db !== da) return db - da;
  return insuranceTitleWeight(b) - insuranceTitleWeight(a);
}

function isUnsuitableActu(c) {
  var hay = (String(c.title || "") + " " + String(c.summary || "")).toLowerCase();
  if (hay.indexOf("collez ici") !== -1) return true;
  if (/sans (leur|son) consentement|violence sexuelle|agression sexuelle|\bviol\b/.test(hay)) return true;
  if (/\bivg\b|avortement/.test(hay)) return true;
  return false;
}

function isDirectProductLead(c) {
  var hay = (String(c.title || "") + " " + String(c.summary || "")).toLowerCase();
  return /mutuelle|assurance|sinistre|emprunteur|carburant|automobil|arr[eê]ts? maladie|dentaire|rembours|pr[eê]t immobilier|inondation|incendie/.test(
    hay
  );
}

function storyTokens(title) {
  var stop = {
    le: 1, la: 1, les: 1, de: 1, des: 1, du: 1, un: 1, une: 1, et: 1, en: 1, au: 1, aux: 1,
    pour: 1, par: 1, sur: 1, dans: 1, que: 1, qui: 1, est: 1, avec: 1, plus: 1, pas: 1, cette: 1,
  };
  return String(title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(function (w) {
      return w.length > 3 && !stop[w];
    });
}

function storyBigrams(title) {
  var tokens = storyTokens(title);
  var grams = [];
  for (var i = 0; i < tokens.length - 1; i++) grams.push(tokens[i] + " " + tokens[i + 1]);
  return grams;
}

function isSameStory(a, b) {
  var ba = storyBigrams(a && a.title);
  var bb = {};
  storyBigrams(b && b.title).forEach(function (g) {
    bb[g] = 1;
  });
  var specific = ba.filter(function (g) {
    if (!bb[g]) return false;
    var parts = g.split(" ");
    return parts[0].length > 4 && parts[1].length > 4;
  });
  if (specific.length) return true;
  var ta = storyTokens(a && a.title);
  var tb = storyTokens(b && b.title);
  if (ta.length < 3 || tb.length < 3) return false;
  var setB = {};
  tb.forEach(function (t) {
    setB[t] = 1;
  });
  var inter = 0;
  ta.forEach(function (t) {
    if (setB[t]) inter += 1;
  });
  var union = {};
  ta.concat(tb).forEach(function (t) {
    union[t] = 1;
  });
  var unionSize = Object.keys(union).length;
  return unionSize > 0 && inter / unionSize >= 0.45;
}

function bestFromPlatform(available, platform, feedMap, used, picks) {
  var list = available
    .filter(function (c) {
      var k = c.url || c.title;
      if (candidateSourceType(c, feedMap) !== platform || used.has(k)) return false;
      return !(picks || []).some(function (p) {
        return isSameStory(p, c);
      });
    })
    .sort(compareLeadRank);
  var direct = list.filter(function (c) {
    return isDirectProductLead(c) && c.leadScore >= 55;
  });
  return direct[0] || null;
}

function pickCandidates(candidates, count, state) {
  var feedMap = loadFeedSourceMap();
  var processed = new Set(state.processedUrls || []);
  var titleKeys = loadPublishedTitleKeys();
  var ranked = rankCandidates(candidates);

  var available = ranked.filter(function (c) {
    if (c.url && processed.has(c.url)) return false;
    if (titleKeys.has(normalizeTitle(c.title))) return false;
    var hay = String(c.title || "") + " " + String(c.summary || "");
    if (isInternationalAudienceTopic(hay) && !isFranceMarketTopic(hay)) return false;
    if (isUnsuitableActu(c)) return false;
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
      var pick = bestFromPlatform(available, platform, feedMap, used, picks);
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
      var rotated = bestFromPlatform(available, platform, feedMap, used, picks);
      if (rotated) {
        picks.push(rotated);
        used.add(rotated.url || rotated.title);
      }
    }
    state._nextPlatformRotation = (rot + count) % PLATFORM_TYPES.length;
  }

  available
    .filter(function (c) {
      return isDirectProductLead(c) && c.leadScore >= 55;
    })
    .forEach(function (c) {
      if (picks.length >= count) return;
      var k = c.url || c.title;
      if (used.has(k)) return;
      if (
        picks.some(function (p) {
          return isSameStory(p, c);
        })
      )
        return;
      picks.push(c);
      used.add(k);
    });

  if (picks.length) return picks;

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
