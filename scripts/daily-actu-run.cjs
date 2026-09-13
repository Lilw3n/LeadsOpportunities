#!/usr/bin/env node
/**
 * Pipeline quotidien : fetch actu → score leads → sélection top N pour rédaction.
 * Usage: npm run blog:actu:daily [-- --count=3]
 */
const { execSync } = require("child_process");
const { readJson, writeJson, rankCandidates, isAutopublishLeadCandidate } = require("./blog-actu-lib.cjs");

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
  var ranked = rankCandidates(candidates);
  var leadRanked = ranked.filter(isAutopublishLeadCandidate);
  var picks = (leadRanked.length ? leadRanked : ranked).slice(0, count);

  writeJson("blog-actu-daily-pick.json", {
    date: new Date().toISOString().slice(0, 10),
    instruction:
      "Rédiger articles COMPLETS (8+ blocs, angle assurance, CTA questionnaire UTM). Ajouter dans data/blog-actu-pending.json puis npm run blog:actu:publish",
    picks: picks,
  });

  console.log("\n--- Top " + count + " pour leads (score) ---");
  picks.forEach(function (p, i) {
    console.log((i + 1) + ". [" + p.leadScore + "/100] [" + (p.need || "?") + "] " + p.title.slice(0, 72));
  });
  console.log("\nDétail: data/blog-actu-daily-pick.json");
  console.log("Étape agent: enrichir pending → npm run blog:actu:publish → PR");
}

main();
