#!/usr/bin/env node
/**
 * Pipeline quotidien : fetch actu → score leads → sélection top N pour rédaction.
 * Usage: npm run blog:actu:daily [-- --count=3]
 */
const { execSync } = require("child_process");
const { readJson, writeJson, rankCandidates } = require("./blog-actu-lib.cjs");

var SOURCE_ORDER = ["cafeyn", "edge", "firefox", "google", "yahoo"];

function arg(name, def) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  if (!m) return def;
  return m.split("=")[1];
}

function candidateSourceType(c) {
  if (c.sourceType) return c.sourceType;
  var hay = (String(c.source || "") + " " + String(c.feedId || "") + " " + String(c.feedName || "")).toLowerCase();
  if (hay.indexOf("cafeyn") !== -1) return "cafeyn";
  if (hay.indexOf("edge") !== -1 || hay.indexOf("bing") !== -1 || hay.indexOf("msn") !== -1) return "edge";
  if (hay.indexOf("firefox") !== -1 || hay.indexOf("pocket") !== -1) return "firefox";
  if (hay.indexOf("google") !== -1) return "google";
  if (hay.indexOf("yahoo") !== -1) return "yahoo";
  return "aggregator";
}

function balancedPicks(ranked, count) {
  if (count < 3) return ranked.slice(0, count);
  var picks = [];
  var used = new Set();

  SOURCE_ORDER.forEach(function (sourceType) {
    if (picks.length >= count) return;
    var pick = ranked.find(function (c) {
      var key = c.url || c.title;
      return candidateSourceType(c) === sourceType && !used.has(key);
    });
    if (pick) {
      picks.push(pick);
      used.add(pick.url || pick.title);
    }
  });

  ranked.forEach(function (candidate) {
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
  var picks = balancedPicks(ranked, count);

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
        candidateSourceType(p).toUpperCase() +
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
