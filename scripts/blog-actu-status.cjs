#!/usr/bin/env node
/**
 * Affiche l'état du pipeline actu blog.
 */
const { readJson, loadPendingArticles } = require("./blog-actu-lib.cjs");
const MANIFEST = require("./blog-articles-manifest.cjs");

function isActiveQueueItem(item) {
  return item.status !== "published" && item.status !== "rejected" && item.status !== "template";
}

function main() {
  var queue = readJson("blog-actu-queue.json", { items: [] });
  var candidates = readJson("blog-actu-candidates.json", { candidates: [] });
  var pending = loadPendingArticles();
  var state = readJson("blog-actu-state.json", {});
  var leadTopics = readJson("blog-lead-topics.json", { topics: [] });
  var usedLeadTopics = new Set((state.leadTopicHistory || []).map(function (entry) {
    return entry.id;
  }));
  var availableLeadTopics = (leadTopics.topics || []).filter(function (topic) {
    return topic.enabled !== false && topic.id && !usedLeadTopics.has(topic.id);
  }).length;

  console.log("=== Pipeline blog actu ===\n");
  console.log("Articles manifeste:", MANIFEST.articles.length);
  console.log("File manuelle (queue):", (queue.items || []).filter(function (i) {
    return isActiveQueueItem(i);
  }).length);
  console.log("Candidats RSS:", (candidates.candidates || []).length);
  console.log("Articles pending (brouillon):", pending.length);
  console.log("Dernier fetch:", state.lastFetch || "jamais");
  console.log("URLs traitées:", (state.processedUrls || []).length);
  console.log("Sujets leads evergreen disponibles:", availableLeadTopics + "/" + (leadTopics.topics || []).length);

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
