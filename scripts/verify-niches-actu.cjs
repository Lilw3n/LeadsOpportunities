#!/usr/bin/env node
/**
 * Niches + actu (incendies, eau, présidentielle, chasse, équitation).
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

var articles = require("./blog-niches-actu-articles.cjs");
assert(articles.length >= 12, "au moins 12 articles niches actu (got " + articles.length + ")");

var must = [
  "incendies-gironde-feux-foret-assurance-habitation-2026.html",
  "restriction-eau-secheresse-gironde-assurance-habitation.html",
  "presidentielle-2027-checklist-assurances-foyer.html",
  "assurance-chasse-rc-chasseur-guide-2026.html",
  "assurance-equitation-rc-equestre-guide-2026.html",
  "feux-foret-animaux-chien-chat-assurance.html",
];
var files = articles.map(function (a) {
  return a.file;
});
must.forEach(function (f) {
  assert(files.indexOf(f) >= 0, "module contient " + f);
});

articles.forEach(function (a) {
  assert(a.keywords && a.keywords.length >= 3, a.file + " mots-clés");
  assert(a.blocks && a.blocks.length >= 4, a.file + " contenu");
  assert(
    a.blocks.some(function (b) {
      return b.type === "bridge";
    }),
    a.file + " pont conversion"
  );
  assert(a.cta && a.cta.href, a.file + " CTA");
});

assert(read("scripts/blog-articles-manifest.cjs").indexOf("blog-niches-actu-articles") >= 0, "manifeste charge le module");
assert(read("scripts/blog-articles-manifest.cjs").indexOf('id: "chasse"') >= 0, "section chasse");
assert(read("scripts/blog-articles-manifest.cjs").indexOf('id: "equitation"') >= 0, "section equitation");

var map = JSON.parse(read("data/blog-questionnaire-map.json"));
assert(map.sections.chasse, "map section chasse");
assert(map.sections.equitation, "map section equitation");
must.forEach(function (f) {
  assert(map.articles[f], "map article " + f);
});

must.forEach(function (f) {
  var htmlPath = path.join(root, "blog", f);
  assert(fs.existsSync(htmlPath), "HTML " + f);
  if (fs.existsSync(htmlPath)) {
    var html = read("blog/" + f);
    assert(html.indexOf("landings/") >= 0, f + " lien landing");
    assert(html.indexOf("article-bridge") >= 0, f + " bridge HTML");
  }
});

var gsc = require("./seo-gsc-priority-urls.cjs");
assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/blog/incendies-gironde-feux-foret-assurance-habitation-2026.html") >= 0, "GSC incendies");
assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/blog/assurance-chasse-rc-chasseur-guide-2026.html") >= 0, "GSC chasse");

var niches = JSON.parse(read("data/seo-niche-markets.json"));
assert(niches.blogActuNiches && niches.blogActuNiches.length >= 4, "seo-niche-markets blogActuNiches");

var index = read("blog/index.html");
must.slice(0, 4).forEach(function (f) {
  assert(index.indexOf(f) >= 0, "index blog " + f);
});

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nNiches actu + mots-clés : OK.");
