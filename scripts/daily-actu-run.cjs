#!/usr/bin/env node
/**
 * Pipeline quotidien : fetch actu → score leads → sélection top N pour rédaction.
 * Usage: npm run blog:actu:daily [-- --count=3]
 */
const { execSync } = require("child_process");
const { readJson, writeJson, rankCandidates } = require("./blog-actu-lib.cjs");
const { PRIMARY_SOURCE_TYPES, resolveSourceType, sourceLabel, sourceTypes } = require("./blog-actu-sources.cjs");

function arg(name, def) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  if (!m) return def;
  return m.split("=")[1];
}

function candidateSourceType(candidate) {
  if (candidate.sourceType) return resolveSourceType(candidate.sourceType, candidate.sourceType);
  return resolveSourceType([candidate.feedId, candidate.feedName, candidate.source].join(" "), "aggregator");
}

function candidateKey(candidate) {
  return String(candidate.url || candidate.title || "").toLowerCase();
}

function decoratePick(candidate) {
  var type = candidateSourceType(candidate);
  return Object.assign({}, candidate, {
    sourceType: type,
    editorialSource: sourceLabel(type),
  });
}

function pickBalanced(ranked, count) {
  var picks = [];
  var used = new Set();

  ranked
    .filter(function (candidate) {
      return candidate.status === "queued";
    })
    .forEach(function (candidate) {
      var key = candidateKey(candidate);
      if (picks.length >= count || used.has(key)) return;
      picks.push(candidate);
      used.add(key);
    });

  PRIMARY_SOURCE_TYPES.forEach(function (type) {
    if (picks.length >= count) return;
    var candidate = ranked.find(function (item) {
      var key = candidateKey(item);
      return candidateSourceType(item) === type && !used.has(key);
    });
    if (!candidate) return;
    picks.push(candidate);
    used.add(candidateKey(candidate));
  });

  ranked.forEach(function (candidate) {
    var key = candidateKey(candidate);
    if (picks.length >= count || used.has(key)) return;
    picks.push(candidate);
    used.add(key);
  });

  return picks.slice(0, count).map(decoratePick);
}

function sourceCoverage(candidates) {
  var coverage = {};
  sourceTypes().forEach(function (type) {
    coverage[type] = 0;
  });
  candidates.forEach(function (candidate) {
    var type = candidateSourceType(candidate);
    coverage[type] = (coverage[type] || 0) + 1;
  });
  return coverage;
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
      "Rédiger articles COMPLETS (8+ blocs, angle assurance, CTA questionnaire UTM). Couvrir plusieurs sources si possible. Ajouter dans data/blog-actu-pending.json puis npm run blog:actu:publish",
    sourceCoverage: sourceCoverage(ranked),
    picks: picks,
  });

  console.log("\n--- Top " + count + " multi-sources pour leads (score) ---");
  picks.forEach(function (p, i) {
    console.log(
      (i + 1) +
        ". [" +
        p.leadScore +
        "/100] [" +
        (p.need || "?") +
        "] [" +
        sourceLabel(p.sourceType) +
        "] " +
        p.title.slice(0, 72)
    );
  });
  console.log("\nDétail: data/blog-actu-daily-pick.json");
  console.log("Étape agent: enrichir pending → npm run blog:actu:publish → PR");
}

main();
