#!/usr/bin/env node
/**
 * Vérifie le silo VSP (SEO, landing, Google Ads, Meta discrète, questionnaire).
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

assert(exists("landings/vsp.html"), "landing vsp.html");
assert(read("landings/vsp.html").indexOf("need=vsp") >= 0, "landing → questionnaire need=vsp");
assert(read("landings/vsp.html").indexOf("assurance-voiture-sans-permis") >= 0, "landing lien silo SEO");

assert(exists("scripts/niche-vsp-pages.cjs"), "niche-vsp-pages.cjs");
assert(read("scripts/niche-pages.cjs").indexOf("buildVspPages") >= 0, "niche-pages charge VSP");

var geo = read("scripts/seo-geo-lib.cjs");
assert(geo.indexOf('key: "vsp"') >= 0, "GEO_PRODUCTS vsp");
assert(geo.indexOf("assurance-voiture-sans-permis") >= 0, "geo dir VSP");
assert(read("scripts/seo-content-lib.cjs").indexOf("vspCitySections") >= 0, "sections ville VSP");

var niches = JSON.parse(read("seo/niches.json"));
var vspNiche = niches.niches.filter(function (n) {
  return n.id === "vsp";
})[0];
assert(vspNiche && vspNiche.status === "live", "seo/niches.json vsp live");
assert(niches.hub.stats.liveNiches >= 4, "liveNiches >= 4");

var markets = JSON.parse(read("data/seo-niche-markets.json"));
var m = markets.markets.filter(function (x) {
  return x.id === "vsp";
})[0];
assert(m && m.status === "live", "seo-niche-markets vsp live");
assert(markets.indexationWeek1.indexOf("/assurance-voiture-sans-permis/") >= 0, "GSC week1 pilier VSP");

assert(read("js/service-catalog.js").indexOf("need: \"vsp\"") >= 0, "service-catalog vsp");
var qc = read("js/questionnaire-config.js");
assert(qc.indexOf("NEED_OVERLAYS") >= 0 && qc.indexOf("vsp: function") >= 0, "overlay questionnaire vsp");
assert(qc.indexOf("vspBsrAm") >= 0, "champ BSR / permis AM");

assert(exists("ads/google-vsp-search.csv"), "CSV Google VSP");
assert(read("ads/google-vsp-search.csv").indexOf("FR_Search_VSP_HotIntent") >= 0, "campagne Search VSP");
assert(read("ads/google-vsp-search.csv").indexOf('"devis vsp"') >= 0, "mot-clé devis vsp");
assert(read("ads/google-ads-editor-ready-utm.csv").indexOf("FR_Search_VSP_HotIntent") >= 0, "CSV UTM contient VSP");
assert(read("js/devis-express-config.js").indexOf("vsp: function") >= 0, "express BY_NEED vsp");
assert(read("js/devis-express-config.js").indexOf('"vsp"') >= 0, "express MOBILITY vsp");
assert(exists("docs/GOOGLE-VSP-PUB.md"), "doc Google VSP");
assert(read("docs/META-VSP-PUB-DISCRETE.md").indexOf("GOOGLE-VSP-PUB") >= 0, "Meta doc pointe Google explicite");

var hub = JSON.parse(read("config/ad-platform-hub.json"));
assert(
  hub.preset_campaigns.some(function (c) {
    return c.id === "google_vsp_search";
  }),
  "hub pubs : campagne Google VSP"
);
assert(read("config/ad-platform-hub.json").indexOf("landings/vsp.html") >= 0, "hub : landing test VSP");

var LT = require("./seo-long-term-related.cjs");
assert(LT.NICHES_VSP && LT.NICHES_VSP.length >= 3, "cluster NICHES_VSP");

var articles = require("./blog-vsp-articles.cjs");
assert(articles.length >= 10, "10 articles blog VSP");
articles.forEach(function (a) {
  assert(a.keywords && a.keywords.length >= 3, a.file + " mots-clés");
  assert(
    a.blocks.some(function (b) {
      return b.type === "bridge";
    }),
    a.file + " pont"
  );
});
assert(read("scripts/blog-articles-manifest.cjs").indexOf("blog-vsp-articles") >= 0, "manifeste charge VSP");
assert(read("scripts/blog-articles-manifest.cjs").indexOf('id: "vsp"') >= 0, "section blog vsp");

assert(read("ads/sea-structure.md").indexOf("FR_Search_VSP_HotIntent") >= 0, "sea-structure VSP");
assert(read("package.json").indexOf("verify:vsp") >= 0, "npm run verify:vsp");

assert(exists("assurance-voiture-sans-permis/index.html"), "pilier SEO généré");
assert(
  read("assurance-voiture-sans-permis/index.html").indexOf("assurance-voiture-sans-permis-guide") >= 0,
  "pilier VSP → blog"
);
assert(exists("assurance-voiture-sans-permis/paris/index.html"), "page ville Paris VSP");
assert(exists("blog/assurance-voiture-sans-permis-guide-2026.html"), "article blog VSP");
assert(exists("blog/permis-am-bsr-assr-voiture-sans-permis-2026.html"), "article blog permis AM");
assert(exists("blog/tarif-assurance-voiture-sans-permis-2026.html"), "article tarifs VSP");
assert(exists("blog/assurance-voiturette-quadricycle-leger-2026.html"), "article voiturette");
assert(exists("blog/assurance-aixam-ligier-microcar-voiture-sans-permis.html"), "article Aixam Ligier");
assert(exists("blog/citroen-ami-assurance-sans-permis.html"), "article Citroën Ami");
assert(exists("blog/jeune-conducteur-16-ans-assurance-voiture-sans-permis.html"), "article 16 ans");
assert(exists("blog/assurance-vsp-vol-bris-tous-risques.html"), "article vol/bris");
assert(exists("blog/resilier-changer-assurance-voiture-sans-permis.html"), "article résiliation");
assert(exists("blog/assurance-vsp-nancy-varangeville-meurthe-et-moselle.html"), "article Nancy Varangéville");
assert(
  read("blog/assurance-vsp-nancy-varangeville-meurthe-et-moselle.html").indexOf("Varangéville") >= 0,
  "orthographe Varangéville"
);
assert(read("blog/assurance-vsp-nancy-varangeville-meurthe-et-moselle.html").indexOf("Varengeville") < 0, "pas Varengeville");
assert(read("assurances-niches.html").indexOf("assurance-voiture-sans-permis") >= 0, "hub niches VSP");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK silo VSP (SEO + Google Ads + Meta discrète)");
