#!/usr/bin/env node
/**
 * Garde CI pour la cadence des articles actu orientes leads.
 *
 * Usage:
 *   npm run blog:actu:guard
 *   npm run blog:actu:guard -- --max-age-hours=30 --min-runs-24h=1
 */
const { readJson } = require("./blog-actu-lib.cjs");

function argNumber(name, fallback) {
  var prefix = "--" + name + "=";
  var match = process.argv.find(function (a) {
    return a.indexOf(prefix) === 0;
  });
  if (!match) return fallback;
  var n = Number(match.slice(prefix.length));
  return Number.isFinite(n) ? n : fallback;
}

function hoursSince(iso, now) {
  if (!iso) return Infinity;
  var time = new Date(iso).getTime();
  if (!Number.isFinite(time)) return Infinity;
  return (now - time) / 3600000;
}

function formatAge(hours) {
  if (!Number.isFinite(hours)) return "jamais";
  if (hours < 1) return Math.round(hours * 60) + " min";
  return hours.toFixed(1) + " h";
}

function main() {
  var maxAgeHours = argNumber("max-age-hours", 36);
  var windowHours = argNumber("window-hours", 24);
  var minRuns = argNumber("min-runs-24h", 1);
  var now = Date.now();

  var state = readJson("blog-actu-state.json", {
    lastFetch: "",
    lastAutoRun: "",
    autoRuns: [],
  });
  var candidates = readJson("blog-actu-candidates.json", { candidates: [] });
  var since = now - windowHours * 3600000;
  var runs = (state.autoRuns || []).filter(function (run) {
    var at = new Date(run.at).getTime();
    return Number.isFinite(at) && at >= since;
  });
  var articles = runs.reduce(function (sum, run) {
    return sum + (Number(run.count) || 0);
  }, 0);
  var lastRunAge = hoursSince(state.lastAutoRun, now);
  var lastFetchAge = hoursSince(state.lastFetch, now);
  var errors = [];

  console.log("=== Garde cadence blog actu leads ===");
  console.log("Dernier auto-run:", state.lastAutoRun || "jamais", "(" + formatAge(lastRunAge) + ")");
  console.log("Dernier fetch:", state.lastFetch || "jamais", "(" + formatAge(lastFetchAge) + ")");
  console.log("Runs sur", windowHours + "h:", runs.length, "| articles:", articles);
  console.log("Candidats en cache:", (candidates.candidates || []).length);

  if (!state.lastAutoRun || lastRunAge > maxAgeHours) {
    errors.push("aucune publication recente (max " + maxAgeHours + "h)");
  }
  if (runs.length < minRuns) {
    errors.push("cadence insuffisante: " + runs.length + " run(s) sur " + windowHours + "h, attendu >= " + minRuns);
  }
  if (runs.length && articles < minRuns) {
    errors.push("runs recents sans article publie");
  }

  if (errors.length) {
    console.error("\n[FAIL]", errors.join("; "));
    console.error("Action: verifier les flux RSS, la cle IA et la qualite des articles avant le prochain cron.");
    process.exit(1);
  }

  console.log("\n[OK] Cadence de publication active.");
}

main();
