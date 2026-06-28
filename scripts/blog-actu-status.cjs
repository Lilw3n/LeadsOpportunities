#!/usr/bin/env node
/**
 * Affiche l'état du pipeline actu blog.
 */
const { readJson, loadPendingArticles } = require("./blog-actu-lib.cjs");
const MANIFEST = require("./blog-articles-manifest.cjs");

function isPlaceholderQueueItem(item) {
  var title = String((item && item.title) || "").toLowerCase();
  var note = String((item && item.note) || "").toLowerCase();
  var hasUrl = !!(item && item.url);
  return (
    (!hasUrl && title.indexOf("collez ici") !== -1) ||
    (!hasUrl && title.indexOf("template") !== -1) ||
    (!hasUrl && note.indexOf("a preciser") !== -1)
  );
}

function main() {
  var queue = readJson("blog-actu-queue.json", { items: [] });
  var candidates = readJson("blog-actu-candidates.json", { candidates: [] });
  var pending = loadPendingArticles();
  var state = readJson("blog-actu-state.json", {});
  var leadTopics = readJson("blog-lead-topics.json", { topics: [] });
  var monthKey = new Date().toISOString().slice(0, 7);
  var usedLeadTopics = new Set(
    (state.processedUrls || []).filter(function (key) {
      return String(key).indexOf("lead-topic:" + monthKey + ":") === 0;
    })
  );
  var activeQueueItems = (queue.items || []).filter(function (item) {
    return item.status !== "published" && item.status !== "rejected" && !isPlaceholderQueueItem(item);
  });
  var placeholderQueueItems = (queue.items || []).filter(isPlaceholderQueueItem);

  console.log("=== Pipeline blog actu ===\n");
  console.log("Articles manifeste:", MANIFEST.articles.length);
  console.log("File manuelle (queue publiable):", activeQueueItems.length);
  if (placeholderQueueItems.length) {
    console.log("Modeles queue ignores:", placeholderQueueItems.length);
  }
  console.log("Candidats RSS:", (candidates.candidates || []).length);
  console.log("Articles pending (brouillon):", pending.length);
  console.log(
    "Sujets leads fallback restants ce mois:",
    Math.max(0, (leadTopics.topics || []).length - usedLeadTopics.size)
  );
  console.log("Dernier fetch:", state.lastFetch || "jamais");
  console.log("URLs traitées:", (state.processedUrls || []).length);

  if ((candidates.candidates || []).length) {
    console.log("\n--- Top candidats ---");
    candidates.candidates.slice(0, 5).forEach(function (c, i) {
      console.log(i + 1 + ". [" + c.section + "]", c.title.slice(0, 65));
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
