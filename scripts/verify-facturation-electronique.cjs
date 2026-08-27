#!/usr/bin/env node
/**
 * Vérifie le silo facturation électronique (hub, blog, landing, liens DGFiP).
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

assert(exists("landings/facturation-electronique.html"), "landing");
var landing = read("landings/facturation-electronique.html");
assert(landing.indexOf("impots.gouv.fr/professionnel/je-passe-la-facturation-electronique") >= 0, "landing lien DGFiP");
assert(landing.indexOf("portail.chorus-pro.gouv.fr") >= 0, "landing Chorus Pro");
assert(landing.indexOf("je-consulte-la-liste-des-plateformes-agreees") >= 0, "landing liste plateformes");
assert(landing.indexOf("0806807807") >= 0 || landing.indexOf("0806 807 807") >= 0, "landing téléphone DGFiP");
assert(landing.indexOf("Varangéville") >= 0, "landing Varangéville");
assert(landing.indexOf("Varengeville") < 0, "landing pas Varengeville");

assert(exists("scripts/niche-facturation-electronique-pages.cjs"), "pages SEO");
assert(read("scripts/niche-pages.cjs").indexOf("buildFacturationElectroniquePages") >= 0, "niche-pages charge FE");

var articles = require("./blog-facturation-electronique-articles.cjs");
assert(articles.length >= 4, "4 articles blog");
articles.forEach(function (a) {
  assert(a.keywords && a.keywords.length >= 3, a.file + " mots-clés");
  assert(
    a.blocks.some(function (b) {
      return b.type === "bridge";
    }),
    a.file + " pont"
  );
  var t = JSON.stringify(a);
  assert(t.indexOf("Varengeville") < 0, a.file + " pas Varengeville");
});
assert(read("scripts/blog-articles-manifest.cjs").indexOf("blog-facturation-electronique") >= 0, "manifeste");

var LT = require("./seo-long-term-related.cjs");
assert(LT.FACTURATION_ELECTRONIQUE && LT.FACTURATION_ELECTRONIQUE.length >= 6, "cluster LT");

var gsc = require("./seo-gsc-priority-urls.cjs");
assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/facturation-electronique/") >= 0, "GSC hub");
assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/landings/facturation-electronique.html") >= 0, "GSC landing");

assert(exists("facturation-electronique/index.html"), "hub généré");
var hub = read("facturation-electronique/index.html");
assert(hub.indexOf("impots.gouv.fr/professionnel/je-passe-la-facturation-electronique") >= 0, "hub lien DGFiP");
assert(hub.indexOf("portail.chorus-pro.gouv.fr") >= 0, "hub Chorus Pro");
assert(hub.indexOf("je-consulte-la-liste-des-plateformes-agreees") >= 0, "hub liste plateformes");
assert(exists("facturation-electronique/calendrier-2026/index.html"), "page calendrier");
assert(exists("facturation-electronique/chorus-pro/index.html"), "page Chorus Pro");
assert(exists("facturation-electronique/tpe-auto-entrepreneur/index.html"), "page TPE");
assert(exists("facturation-electronique/plateformes-agreees/index.html"), "page plateformes");
assert(exists("blog/facturation-electronique-obligatoire-2026.html"), "article guide");
assert(read("blog/facturation-electronique-nancy-varangeville-54.html").indexOf("Varangéville") >= 0, "blog 54 Varangéville");
assert(read("blog/facturation-electronique-obligatoire-2026.html").indexOf("impots.gouv.fr") >= 0, "article guide lien DGFiP");
assert(read("package.json").indexOf("verify:facturation-electronique") >= 0, "npm script");
assert(exists("ads/google-facturation-electronique-search.csv"), "CSV Google FE");
assert(read("ads/google-ads-editor-ready-utm.csv").indexOf("FR_Search_Facturation_Electronique") >= 0, "CSV UTM FE");
assert(read("ads/meta-blog-conversions.csv").indexOf("facturation-electronique") >= 0, "Meta blog FE");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK facturation électronique (hub + blog + liens DGFiP)");
