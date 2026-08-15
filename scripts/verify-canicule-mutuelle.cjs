#!/usr/bin/env node
/**
 * Vérifie les articles canicule → mutuelle.
 */
var fs = require("fs");
var path = require("path");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

var files = [
  "canicule-enfants-famille-mutuelle.html",
  "canicule-maladies-chroniques-mutuelle.html",
  "canicule-teleconsultation-medecin-mutuelle.html",
  "canicule-travailleurs-exterieur-mutuelle.html",
  "canicule-vigilance-meteo-france-mutuelle.html",
  "canicule-grossesse-mutuelle-maternite.html",
];

var src = require("./blog-canicule-mutuelle-articles.cjs");
assert(src.length === 6, "6 articles dans le module (got " + src.length + ")");

var slugs = src.map(function (a) {
  return a.file;
});
files.forEach(function (f) {
  assert(slugs.indexOf(f) >= 0, "module exporte " + f);
});

src.forEach(function (a) {
  assert(a.section === "sante", a.file + " section sante");
  assert(a.themes && a.themes.indexOf("canicule") >= 0, a.file + " thème canicule");
  assert(a.cta && /sante/.test(a.cta.href), a.file + " CTA mutuelle");
  assert(a.blocks && a.blocks.length >= 8, a.file + " contenu long");
  assert(
    a.blocks.some(function (b) {
      return b.type === "bridge";
    }),
    a.file + " pont questionnaire"
  );
  assert(a.faq && a.faq.length >= 2, a.file + " FAQ");
  var text = JSON.stringify(a.blocks);
  assert(/mutuelle/i.test(text), a.file + " parle de mutuelle");
  assert(/landings\/(devis|questionnaire|sante)/.test(text + JSON.stringify(a.cta)), a.file + " lien landing");
});

var manifest = read("scripts/blog-articles-manifest.cjs");
assert(manifest.indexOf("blog-canicule-mutuelle-articles") >= 0, "manifeste charge le module");

var map = JSON.parse(read("data/blog-questionnaire-map.json"));
files.forEach(function (f) {
  assert(map.articles[f] && map.articles[f].section === "sante", "questionnaire-map : " + f);
});

files.forEach(function (f) {
  var htmlPath = path.join(__dirname, "..", "blog", f);
  assert(fs.existsSync(htmlPath), "HTML généré : " + f);
  if (fs.existsSync(htmlPath)) {
    var html = fs.readFileSync(htmlPath, "utf8");
    assert(html.indexOf("landings/") >= 0, f + " CTA landing dans le HTML");
    assert(html.indexOf("article-faq") >= 0, f + " FAQ HTML");
    assert(/noindex/i.test(html) === false || /index,follow/i.test(html), f + " indexable FR");
  }
});

var index = read("blog/index.html");
files.forEach(function (f) {
  assert(index.indexOf(f) >= 0, "index blog liste " + f);
});

var sm = read("sitemap-main.xml");
files.forEach(function (f) {
  assert(sm.indexOf("/blog/" + f) >= 0, "sitemap-main : " + f);
});

require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "blog-canicule-mutuelle-articles.cjs")]);
assert(true, "syntaxe blog-canicule-mutuelle-articles.cjs");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les contrôles canicule mutuelle sont OK.");
