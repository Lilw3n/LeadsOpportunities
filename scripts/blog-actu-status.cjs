#!/usr/bin/env node
/**
 * Affiche l'état du pipeline actu blog.
 */
const { readJson, loadPendingArticles, rankCandidates } = require("./blog-actu-lib.cjs");
const { SOURCE_TYPES } = require("./blog-actu-sources.cjs");
const MANIFEST = require("./blog-articles-manifest.cjs");

function isPlaceholderQueueItem(item) {
  var id = String(item.id || "");
  var title = String(item.title || "");
  return (
    id === "cafeyn-pending-template" ||
    title.indexOf("COLLEZ ICI") !== -1 ||
    title.indexOf("titre de la une Cafeyn") !== -1
  );
}

function main() {
  var queue = readJson("blog-actu-queue.json", { items: [] });
  var candidates = readJson("blog-actu-candidates.json", { candidates: [] });
  var pending = loadPendingArticles();
  var state = readJson("blog-actu-state.json", {});

  console.log("=== Pipeline blog actu ===\n");
  console.log("Articles manifeste:", MANIFEST.articles.length);
  console.log("File manuelle (queue):", (queue.items || []).filter(function (i) {
    return i.status !== "published" && !isPlaceholderQueueItem(i);
  }).length);
  console.log("Candidats RSS:", (candidates.candidates || []).length);
  if (candidates.bySource) {
    console.log(
      "Sources:",
      SOURCE_TYPES.map(function (type) {
        return type + ":" + (candidates.bySource[type] || 0);
      }).join(" ")
    );
  }
  console.log("Articles pending (brouillon):", pending.length);
  console.log("Dernier fetch:", state.lastFetch || "jamais");
  console.log("URLs traitées:", (state.processedUrls || []).length);

  if ((candidates.candidates || []).length) {
    console.log("\n--- Top candidats ---");
    rankCandidates(candidates.candidates).slice(0, 5).forEach(function (c, i) {
      console.log(i + 1 + ". [" + c.leadScore + "/100] [" + c.section + "]", c.title.slice(0, 65));
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
