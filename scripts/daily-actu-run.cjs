#!/usr/bin/env node
/**
 * Pipeline quotidien : fetch actu → score leads → sélection top N pour rédaction.
 * Usage: npm run blog:actu:daily [-- --count=3]
 */
const { execSync } = require("child_process");
const { readJson, writeJson, rankCandidates } = require("./blog-actu-lib.cjs");
const { PRIMARY_SOURCE_TYPES, normalizeSourceType, resolveSourceTypeFromText } = require("./blog-actu-sources.cjs");

function arg(name, def) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  if (!m) return def;
  return m.split("=")[1];
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
  var sourceCounts = readJson("blog-actu-candidates.json", { bySource: {} }).bySource || {};
  var ranked = rankCandidates(candidates);
  var picks = ranked.slice(0, count);
  var topBySource = bestBySource(candidates);

  writeJson("blog-actu-daily-pick.json", {
    date: new Date().toISOString().slice(0, 10),
    instruction:
      "Rédiger articles COMPLETS (8+ blocs, angle assurance, CTA questionnaire UTM). Ajouter dans data/blog-actu-pending.json puis npm run blog:actu:publish",
    sourceCounts: sourceCounts,
    topBySource: topBySource,
    picks: picks,
  });

  console.log("\n--- Top " + count + " pour leads (score) ---");
  picks.forEach(function (p, i) {
    console.log((i + 1) + ". [" + p.leadScore + "/100] [" + (p.need || "?") + "] " + p.title.slice(0, 72));
  });
  console.log("\nDétail: data/blog-actu-daily-pick.json");
  console.log("Étape agent: enrichir pending → npm run blog:actu:publish → PR");
}

function bestBySource(candidates) {
  var ranked = rankCandidates(candidates);
  return PRIMARY_SOURCE_TYPES.reduce(function (acc, type) {
    var best = ranked.find(function (c) {
      return candidateSourceType(c) === type;
    });
    if (best) acc[type] = best;
    return acc;
  }, {});
}

function candidateSourceType(candidate) {
  if (candidate.sourceType) return normalizeSourceType(candidate.sourceType);
  return resolveSourceTypeFromText(candidate.source || candidate.feedName || candidate.feedId);
}

main();
