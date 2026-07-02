#!/usr/bin/env node
/** Affiche la checklist URLs pour Search Console. */
const { absoluteUrls } = require("./seo-gsc-priority-urls.cjs");
console.log("# URLs prioritaires — Google Search Console\n");
console.log("Search Console → Inspection de l'URL → Tester → Demander l'indexation\n");
absoluteUrls().forEach(function (u, i) {
  console.log((i + 1) + ". " + u);
});
console.log("\n" + absoluteUrls().length + " URLs — max ~10–15 par jour recommandé.");
