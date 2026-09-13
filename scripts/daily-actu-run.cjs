#!/usr/bin/env node
/**
 * Pipeline quotidien : fetch actu → score leads → sélection top N pour rédaction.
 * Usage: npm run blog:actu:daily [-- --count=3]
 */
const { execSync } = require("child_process");
const { readJson, writeJson, rankCandidates } = require("./blog-actu-lib.cjs");
const { PRIMARY_SOURCE_TYPES, resolveSourceType } = require("./blog-actu-sources.cjs");
const { isInternationalAudienceTopic, isFranceMarketTopic } = require("./france-audience-lib.cjs");

function arg(name, def) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  if (!m) return def;
  return m.split("=")[1];
}

function loadFeedSourceMap() {
  var feedsCfg = readJson("blog-actu-feeds.json", { feeds: [] });
  var map = {};
  (feedsCfg.feeds || []).forEach(function (f) {
    map[f.id] = resolveSourceType([f.id, f.name, f.sourceType].join(" "), f.sourceType || "aggregator");
  });
  return map;
}

function candidateSourceType(candidate, feedMap) {
  if (candidate.sourceType) return resolveSourceType(candidate.sourceType, candidate.sourceType);
  if (candidate.source) {
    var fromSource = resolveSourceType(candidate.source, "");
    if (fromSource) return fromSource;
  }
  return feedMap[candidate.feedId] || "aggregator";
}

function pickBalanced(ranked, count) {
  var feedMap = loadFeedSourceMap();
  var available = ranked.filter(function (candidate) {
    var hay = String(candidate.title || "") + " " + String(candidate.summary || "");
    return !(isInternationalAudienceTopic(hay) && !isFranceMarketTopic(hay));
  });
  var picks = [];
  var used = new Set();

  PRIMARY_SOURCE_TYPES.forEach(function (type) {
    if (picks.length >= count) return;
    var pick = available.find(function (candidate) {
      var key = candidate.url || candidate.title;
      return candidateSourceType(candidate, feedMap) === type && !used.has(key);
    });
    if (pick) {
      picks.push(pick);
      used.add(pick.url || pick.title);
    }
  });

  available.forEach(function (candidate) {
    if (picks.length >= count) return;
    var key = candidate.url || candidate.title;
    if (used.has(key)) return;
    picks.push(candidate);
    used.add(key);
  });

  return picks;
}

function main() {
  var count = Number(arg("count", 3)) || 3;

  console.log("=== Actu quotidien — sélection leads ===\n");
  try {
    execSync("node scripts/fetch-actu-candidates.cjs", { stdio: "inherit", cwd: require("path").join(__dirname, "..") });
  } catch (e) {
    console.warn("Fetch partiel ou erreur réseau — on continue avec la file existante.");
  }

  var candidates = readJson("blog-actu-candidates.json", { candidates: [] }).candidates || [];
  var ranked = rankCandidates(candidates);
  var picks = pickBalanced(ranked, count);

  writeJson("blog-actu-daily-pick.json", {
    date: new Date().toISOString().slice(0, 10),
    instruction:
      "Rédiger articles COMPLETS (8+ blocs, angle assurance, CTA questionnaire UTM). Ajouter dans data/blog-actu-pending.json puis npm run blog:actu:publish",
    picks: picks,
  });

  console.log("\n--- Top " + count + " pour leads (score) ---");
  picks.forEach(function (p, i) {
    console.log(
      (i + 1) +
        ". [" +
        p.leadScore +
        "/100] [" +
        (p.sourceType || "?") +
        "] [" +
        (p.need || "?") +
        "] " +
        p.title.slice(0, 72)
    );
  });
  console.log("\nDétail: data/blog-actu-daily-pick.json");
  console.log("Étape agent: enrichir pending → npm run blog:actu:publish → PR");
}

main();
