#!/usr/bin/env node
/**
 * Affiche l'état du pipeline actu blog.
 */
const { readJson, loadPendingArticles } = require("./blog-actu-lib.cjs");
const MANIFEST = require("./blog-articles-manifest.cjs");
const { SOURCE_TYPES, formatSourceCounts, candidateSourceType } = require("./blog-actu-sources.cjs");

function candidateCounts(candidates) {
  var existing = candidates.bySource || {};
  var list = candidates.candidates || [];
  return SOURCE_TYPES.reduce(function (acc, type) {
    acc[type] =
      existing[type] ||
      list.filter(function (candidate) {
        return candidateSourceType(candidate, null) === type;
      }).length;
    return acc;
  }, {});
}

function main() {
  var queue = readJson("blog-actu-queue.json", { items: [] });
  var candidates = readJson("blog-actu-candidates.json", { candidates: [] });
  var pending = loadPendingArticles();
  var state = readJson("blog-actu-state.json", {});

  console.log("=== Pipeline blog actu ===\n");
  console.log("Articles manifeste:", MANIFEST.articles.length);
  console.log("File manuelle (queue):", (queue.items || []).filter(function (i) {
    return i.status !== "published";
  }).length);
  console.log("Candidats RSS:", (candidates.candidates || []).length);
  console.log("Sources:", formatSourceCounts(candidateCounts(candidates)));
  console.log("Articles pending (brouillon):", pending.length);
  console.log("Dernier fetch:", state.lastFetch || "jamais");
  console.log("URLs traitées:", (state.processedUrls || []).length);

  if ((candidates.candidates || []).length) {
    console.log("\n--- Top candidats ---");
    candidates.candidates.slice(0, 5).forEach(function (c, i) {
      console.log(i + 1 + ". [" + (c.sourceType || "?") + "/" + c.section + "]", c.title.slice(0, 65));
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
  console.log("  npm run blog:actu:publish # générer HTML + sitemap");
}

main();
