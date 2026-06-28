#!/usr/bin/env node
/**
 * Affiche l'état du pipeline actu blog.
 */
const { readJson, loadPendingArticles } = require("./blog-actu-lib.cjs");
const MANIFEST = require("./blog-articles-manifest.cjs");
const {
  loadLeadPlan,
  describeLeadPlan,
  minLeadScore,
  staleAfterHours,
  targetArticlesPerDay,
} = require("./blog-leads-plan.cjs");

function hoursSince(iso) {
  if (!iso) return null;
  var t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return (Date.now() - t) / 3600000;
}

function formatHours(hours) {
  if (hours === null) return "jamais";
  if (hours < 1) return Math.round(hours * 60) + " min";
  return hours.toFixed(1) + " h";
}

function recentSourceMix(runs) {
  var mix = {};
  (runs || []).slice(-10).forEach(function (run) {
    (run.articles || []).forEach(function (a) {
      var key = a.sourceType || "unknown";
      mix[key] = (mix[key] || 0) + 1;
    });
  });
  return Object.keys(mix)
    .sort()
    .map(function (key) {
      return key + ":" + mix[key];
    })
    .join(" ");
}

function main() {
  var plan = loadLeadPlan();
  var minimumLeadScore = minLeadScore(plan);
  var staleHours = staleAfterHours(plan);
  var queue = readJson("blog-actu-queue.json", { items: [] });
  var candidates = readJson("blog-actu-candidates.json", { candidates: [] });
  var pending = loadPendingArticles();
  var state = readJson("blog-actu-state.json", {});
  var runs = state.autoRuns || [];
  var lastRunAge = hoursSince(state.lastAutoRun);
  var fresh = lastRunAge !== null && lastRunAge <= staleHours;
  var leadReady = (candidates.candidates || []).filter(function (c) {
    return c.status === "queued" || Number(c.leadScore || 0) >= minimumLeadScore;
  });

  console.log("=== Pipeline blog actu ===\n");
  console.log("--- Plan articles leads ---");
  describeLeadPlan(plan).forEach(function (line) {
    console.log(line);
  });
  console.log("Statut cadence:", fresh ? "OK" : "A VERIFIER", "(dernier run:", formatHours(lastRunAge) + ")");
  console.log("Cible quotidienne:", targetArticlesPerDay(plan), "article(s) orientes leads");
  console.log("");

  console.log("Articles manifeste:", MANIFEST.articles.length);
  console.log("File manuelle (queue):", (queue.items || []).filter(function (i) {
    return i.status !== "published";
  }).length);
  console.log("Candidats RSS:", (candidates.candidates || []).length);
  console.log("Candidats publiables leadScore >= " + minimumLeadScore + ":", leadReady.length);
  console.log("Articles pending (brouillon):", pending.length);
  console.log("Dernier fetch:", state.lastFetch || "jamais");
  console.log("Dernier auto-run:", state.lastAutoRun || "jamais");
  console.log("URLs traitées:", (state.processedUrls || []).length);
  console.log("Runs autos suivis:", runs.length);
  if (runs.length) {
    var total = runs.reduce(function (sum, r) {
      return sum + (r.count || 0);
    }, 0);
    console.log("Articles autos suivis:", total);
    console.log("Mix sources recent:", recentSourceMix(runs) || "n/a");
  }

  if ((candidates.candidates || []).length) {
    console.log("\n--- Top candidats ---");
    candidates.candidates.slice(0, 5).forEach(function (c, i) {
      console.log(i + 1 + ". [" + c.section + "] score=" + (c.leadScore || 0), c.title.slice(0, 65));
    });
  }

  if (runs.length) {
    console.log("\n--- Derniers articles publies automatiquement ---");
    runs
      .slice(-3)
      .reverse()
      .forEach(function (run) {
        (run.articles || []).forEach(function (a) {
          console.log("-", run.at, "[" + (a.sourceType || "?") + "]", a.file);
        });
      });
  }

  if (pending.length) {
    console.log("\n--- Pending (à enrichir / publier) ---");
    pending.forEach(function (a) {
      console.log("-", a.file);
    });
  }

  console.log("\nCommandes:");
  console.log("  npm run blog:actu:fetch   # récupérer actu RSS + queue");
  console.log("  npm run blog:actu:draft   # créer ébauches (--top=3)");
  console.log("  npm run blog:actu:plan    # afficher cadence + seuils leads");
  console.log("  npm run blog:actu:publish # générer HTML + sitemap");
}

main();
