#!/usr/bin/env node
/**
 * Vérifie le cluster blog auto + MRH (grossiste, SEO ville, pubs).
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

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

var articles = require("./blog-auto-mrh-articles.cjs");
assert(articles.length >= 16, ">= 16 articles auto/MRH (got " + articles.length + ")");

var files = {};
articles.forEach(function (a) {
  assert(a.file && !files[a.file], "fichier unique " + (a.file || "?"));
  files[a.file] = true;
  assert(a.keywords && a.keywords.length >= 3, a.file + " mots-clés");
  assert(
    a.blocks &&
      a.blocks.some(function (b) {
        return b.type === "bridge";
      }),
    a.file + " pont"
  );
  var text = JSON.stringify(a);
assert(text.indexOf("Varengeville") < 0, a.file + " pas Varengeville");
  assert(text.indexOf("need=auto") >= 0 || text.indexOf("need=habitation") >= 0, a.file + " CTA need=");
  assert(text.indexOf("utm_source=blog") >= 0, a.file + " UTM blog");
});

function sourceWords(a) {
  var t = "";
  (a.blocks || []).forEach(function (b) {
    t += " " + (b.text || "");
    if (b.items) t += " " + b.items.join(" ");
  });
  (a.faq || []).forEach(function (f) {
    t += " " + (f.q || "") + " " + (f.a || "");
  });
  return t.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
}

var PILLARS = [
  "tarif-assurance-auto-2026.html",
  "resilier-assurance-auto-loi-hamon-2026.html",
  "assurance-auto-courtier-grossiste-comparatif-2026.html",
  "assurance-auto-paris-ile-de-france-2026.html",
  "assurance-auto-nancy-varangeville-54.html",
  "changer-assurance-habitation-loi-hamon.html",
  "assurance-habitation-courtier-grossiste-mrh-2026.html",
  "assurance-habitation-nancy-varangeville-54.html",
];
PILLARS.forEach(function (file) {
  var art = articles.filter(function (a) {
    return a.file === file;
  })[0];
  assert(art, "pilier " + file);
  if (!art) return;
  assert(art.skipEnrich, file + " skipEnrich (pas de pad générique)");
  assert(sourceWords(art) >= 280, file + " longueur utile (got " + sourceWords(art) + ")");
  assert(JSON.stringify(art).indexOf("Lyon hors sujet") < 0, file + " pas de note interne");
});

var auto = articles.filter(function (a) {
  return a.section === "auto";
});
var habitat = articles.filter(function (a) {
  return a.section === "habitat";
});
assert(auto.length >= 8, ">= 8 articles auto");
assert(habitat.length >= 8, ">= 8 articles MRH");
assert(files["assurance-auto-courtier-grossiste-comparatif-2026.html"], "article auto grossiste");
assert(files["assurance-habitation-courtier-grossiste-mrh-2026.html"], "article MRH grossiste");
assert(files["assurance-auto-nancy-varangeville-54.html"], "auto 54");
assert(files["assurance-habitation-nancy-varangeville-54.html"], "MRH 54");
assert(read("scripts/blog-auto-mrh-articles.cjs").indexOf("Varangéville") >= 0, "orthographe Varangéville");
assert(read("scripts/blog-articles-manifest.cjs").indexOf("blog-auto-mrh-articles") >= 0, "manifeste");

assert(exists("ads/google-auto-search.csv"), "CSV Google auto");
assert(read("ads/google-auto-search.csv").indexOf("FR_Search_Auto_HotIntent") >= 0, "campagne auto");
assert(exists("ads/google-habitation-search.csv"), "CSV Google habitation");
assert(read("ads/google-habitation-search.csv").indexOf("FR_Search_Habitation_HotIntent") >= 0, "campagne MRH");
assert(read("ads/google-ads-editor-ready-utm.csv").indexOf("FR_Search_Auto_HotIntent") >= 0, "CSV UTM auto");
assert(read("ads/google-ads-editor-ready-utm.csv").indexOf("FR_Search_Habitation_HotIntent") >= 0, "CSV UTM MRH");
assert(read("ads/meta-blog-conversions.csv").indexOf("courtier-grossiste") >= 0, "Meta blog grossiste");

var LT = require("./seo-long-term-related.cjs");
assert(LT.AUTO_MRH && LT.AUTO_MRH.length >= 6, "cluster LT AUTO_MRH");

var gsc = require("./seo-gsc-priority-urls.cjs");
assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/assurance-auto/") >= 0, "GSC auto");
assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/blog/assurance-auto-courtier-grossiste-comparatif-2026.html") >= 0, "GSC blog auto");

var geo = read("scripts/seo-geo-lib.cjs");
assert(geo.indexOf("autoCitySections") >= 0, "sections ville auto");
assert(geo.indexOf("habitationCitySections") >= 0, "sections ville MRH");
assert(read("scripts/seo-content-lib.cjs").indexOf("localKeywordSections") >= 0, "sections ville tous produits");
assert(read("scripts/seo-content-lib.cjs").indexOf("santeCitySections") >= 0, "sections ville mutuelle");
assert(read("scripts/seo-content-lib.cjs").indexOf("emprunteurCitySections") >= 0, "sections ville emprunteur");
assert(read("scripts/seo-content-lib.cjs").indexOf("prevoyanceCitySections") >= 0, "sections ville prévoyance");
assert(read("scripts/seo-content-lib.cjs").indexOf("localIntentFaq") >= 0, "FAQ locale mots-clés");
assert(read("scripts/seo-content-lib.cjs").indexOf("localDeptSection") >= 0, "SEO département");
assert(read("scripts/seo-geo-lib.cjs").indexOf("localKeywordSections") >= 0, "geo concat keyword sections");

assert(exists("blog/assurance-auto-courtier-grossiste-comparatif-2026.html"), "HTML auto grossiste");
assert(exists("blog/assurance-habitation-courtier-grossiste-mrh-2026.html"), "HTML MRH grossiste");
assert(read("blog/assurance-auto-nancy-varangeville-54.html").indexOf("Varangéville") >= 0, "blog auto 54");
assert(read("assurance-auto/nancy/index.html").indexOf("Nancy") >= 0, "page ville auto Nancy");
assert(read("assurance-habitation/varangeville/index.html").indexOf("Varangéville") >= 0, "page ville MRH Varangéville");
(function () {
  var title = (read("assurance-auto/nancy/index.html").match(/<title>([^<]+)/) || [])[1] || "";
  assert(title.indexOf("meurthe-et-moselle") < 0, "titre auto Nancy sans slug département (" + title + ")");
})();
assert(read("assurance-auto/marseille/index.html").indexOf("assurance-auto-nancy-varangeville-54") < 0, "Marseille sans lien Nancy");
assert(read("assurance-auto/marseille/index.html").indexOf("assurance-auto-paris-ile-de-france") < 0, "Marseille sans lien Paris IDF");
assert(read("banque/nancy/index.html").indexOf("Changer d'assurance à Nancy") < 0, "banque Nancy : pas Hamon");
assert(read("banque/nancy/index.html").indexOf("Mots-clés") < 0, "banque Nancy : pas dump Mots-clés");
assert(read("blog/assurance-auto-paris-ile-de-france-2026.html").indexOf("Lyon hors sujet") < 0, "HTML Paris sans note interne");
assert(read("ads/google-auto-search.csv").indexOf("landings/devis.html?need=auto") >= 0, "KW chauds → devis auto");
assert(read("ads/google-auto-search.csv").indexOf("rsa_paris") >= 0 && read("ads/google-auto-search.csv").indexOf("rsa_nancy") >= 0, "RSA auto Paris / Nancy séparés");
assert(read("package.json").indexOf("verify:auto-mrh") >= 0, "npm script");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK auto + MRH (blog, villes, pubs, grossiste)");
