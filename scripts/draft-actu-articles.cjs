#!/usr/bin/env node
/**
 * Passe des candidats / file manuelle → articles pending (ébauche) pour enrichissement agent.
 *
 * Usage:
 *   npm run blog:actu:draft -- --top=3
 *   npm run blog:actu:draft -- --id=rss-mon-article
 */
const {
  readJson,
  writeJson,
  scaffoldArticle,
  appendPendingArticle,
  isWeakLeadActuTitle,
} = require("./blog-actu-lib.cjs");

function arg(name, def) {
  var m = process.argv.find(function (a) {
    return a.indexOf("--" + name + "=") === 0;
  });
  if (!m) return def;
  return m.split("=")[1];
}

function main() {
  var top = Number(arg("top", 2)) || 2;
  var id = arg("id", "");
  var candidates = readJson("blog-actu-candidates.json", { candidates: [] }).candidates || [];
  var queue = readJson("blog-actu-queue.json", { items: [] });
  var state = readJson("blog-actu-state.json", { processedUrls: [], publishedFiles: [] });

  var picked = [];
  if (id) {
    picked = candidates.filter(function (c) {
      return c.id === id;
    });
  } else {
    picked = candidates.slice(0, top);
  }

  if (!picked.length) {
    console.log("Aucun candidat. Lancez: npm run blog:actu:fetch");
    process.exit(0);
  }

  picked.forEach(function (c) {
    if (isWeakLeadActuTitle(c.title)) {
      console.warn("Ignoré (faible potentiel lead):", c.title);
      return;
    }
    var article = scaffoldArticle({
      title: c.title,
      summary: c.summary || "",
      url: c.url || "",
      source: c.source || c.feedName || "rss",
      note: c.summary || "",
    });
    if (!article) return;
    appendPendingArticle(article);
    if (c.url) state.processedUrls.push(c.url);
    state.publishedFiles.push(article.file);
    console.log("Pending:", article.file, "—", article.title.slice(0, 60));

    (queue.items || []).forEach(function (item) {
      if (item.title === c.title || item.url === c.url) item.status = "draft";
    });
  });

  state.lastDraft = new Date().toISOString();
  writeJson("blog-actu-state.json", state);
  queue.updated = new Date().toISOString();
  writeJson("blog-actu-queue.json", queue);

  console.log("\nProchaine étape: enrichir data/blog-actu-pending.json (agent Cursor), puis npm run blog:actu:publish");
}

main();
