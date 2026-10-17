#!/usr/bin/env node
/**
 * Article actu 17 octobre 2026 : casse, activité difficile, régime émeutes non applicable.
 */
var fs = require("fs");
var path = require("path");
var failed = 0;
var root = path.join(__dirname, "..");

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

var file = "blog/manifestation-17-octobre-2026-casse-assurance-commerce.html";
var html = read(file);
var manifest = require("./blog-articles-manifest.cjs");
var hit = manifest.articles.filter(function (a) {
  return a.file === "manifestation-17-octobre-2026-casse-assurance-commerce.html";
});

assert(hit.length === 1, "manifeste : un article");
assert(hit[0] && hit[0].leadSeo === true, "leadSeo");
assert(hit[0] && hit[0].audience === "france", "audience france");
assert(html.indexOf("L. 121-8") >= 0, "article L. 121-8");
assert(html.indexOf("L. 12-11-1") >= 0, "régime L. 12-11-1");
assert(html.indexOf("2026-103") >= 0, "loi 2026-103");
assert(html.indexOf("ce décret n'est pas publié") >= 0 || html.indexOf("Ce décret n'est pas publié") >= 0, "décret non publié");
assert(html.indexOf("cinq jours") >= 0, "délai cinq jours");
assert(html.indexOf("deux jours") >= 0, "délai vol deux jours");
assert(html.indexOf("perte d") >= 0, "perte d'exploitation");
assert(html.indexOf("need=mrp") >= 0, "questionnaire MRP");
assert(html.indexOf("Varangéville") >= 0, "Varangéville");
assert(html.indexOf("Varengeville") < 0, "pas Varengeville");
assert(html.indexOf("15005935") >= 0, "ORIAS");
assert(!/\d[\d\s]*\s*€|1,5\s*%|1\.5\s*%/.test(html), "pas de prix");
assert(read("blog/index.html").indexOf("manifestation-17-octobre-2026-casse-assurance-commerce.html") >= 0, "index blog");
assert(read("sitemap-main.xml").indexOf("/blog/manifestation-17-octobre-2026-casse-assurance-commerce.html") >= 0, "sitemap");
assert(read("blog/feed.xml").indexOf("manifestation-17-octobre-2026-casse-assurance-commerce.html") >= 0, "flux");
assert(read("vault/Accueil.md").indexOf("Journal/Actu 17 octobre 2026") >= 0, "accueil coffre");
assert(read("scripts/build-obsidian-vault.cjs").indexOf("Journal/Actu 17 octobre 2026") >= 0, "générateur coffre");
assert(read("vault/Journal/Actu 17 octobre 2026.md").indexOf("generated: false") >= 0, "journal manuel");
assert(read("data/blog-questionnaire-map.json").indexOf("manifestation-17-octobre-2026-casse-assurance-commerce.html") >= 0, "pont questionnaire");

if (failed) {
  console.log(failed + " échec(s)");
  process.exit(1);
}
console.log("verify:actu-17-octobre OK");
