#!/usr/bin/env node
/** Vérifie le boost SEO long terme (maillage hubs ↔ blogs ↔ GSC). */
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

var LT = require("./seo-long-term-related.cjs");
assert(LT.CANICULE_MUTUELLE.length >= 5, "cluster canicule");
assert(LT.PRET_REFUSE.length >= 5, "cluster prêt refusé");
assert(LT.NICHES_CHASSE.length >= 3, "cluster chasse");
assert(LT.VTC_IDF.length >= 5, "cluster VTC IDF");
assert(LT.NICHES_VSP && LT.NICHES_VSP.length >= 3, "cluster VSP");

var clusters = require("../data/seo-keyword-clusters.json").clusters;
var chasse = clusters.find(function (c) {
  return c.id === "chasse";
});
var equi = clusters.find(function (c) {
  return c.id === "equitation";
});
var credit = clusters.find(function (c) {
  return c.id === "credit-immo";
});
assert(chasse && chasse.blog.length >= 2, "clusters chasse blog");
assert(equi && equi.blog.length >= 2, "clusters equitation blog");
assert(credit && credit.moneyPages.indexOf("/pret-immobilier/") >= 0, "clusters pret moneyPages");
assert(credit.blog.some(function (b) {
  return b.indexOf("pret-immobilier-refuse") >= 0;
}), "clusters prêt refuse blog");

var gsc = require("./seo-gsc-priority-urls.cjs").GSC_INDEX_NOW_PRIORITY;
assert(gsc.indexOf("/assurance-chasse/chien-chasse/") >= 0, "GSC chien chasse");
assert(gsc.indexOf("/assurance-voiture-sans-permis/") >= 0, "GSC VSP pilier");
assert(gsc.indexOf("/blog/assurance-voiture-sans-permis-guide-2026.html") >= 0, "GSC blog VSP");
assert(gsc.indexOf("/assurance-vtc/pas-cher/") >= 0, "GSC VTC pas cher");
assert(gsc.indexOf("/blog/insolation-canicule-que-faire-mutuelle-devis.html") >= 0, "GSC insolation");
assert(gsc.indexOf("/blog/pret-refuse-primo-accedant-ptz-solutions.html") >= 0, "GSC primo PTZ");

var meta = require("../data/seo-page-meta.json").pages;
assert(
  meta.some(function (p) {
    return p.path === "/pret-immobilier";
  }),
  "meta pret-immobilier"
);
assert(
  meta.some(function (p) {
    return p.path === "/recherche-bien";
  }),
  "meta recherche-bien"
);

assert(read("assurances-niches.html").indexOf("blogActuNiches") < 0, "hub niches HTML (pas raw key)");
assert(read("assurances-niches.html").indexOf("assurance-chasse-rc-chasseur-guide-2026") >= 0, "hub niches liens blog");
assert(read("assurances-niches.html").indexOf("Guides par niche live") >= 0, "hub niches guides live");

assert(read("assurance-sante/index.html").indexOf("canicule-mutuelle-coup-chaleur") >= 0, "hub sante → canicule");
assert(read("credit-immo/index.html").indexOf("pret-immobilier-refuse-que-faire") >= 0, "hub credit → prêt refusé");
assert(read("assurance-vtc/index.html").indexOf("ile-de-france") >= 0, "hub VTC → IDF");
assert(read("assurance-chasse/index.html").indexOf("assurance-chasse-rc-chasseur-guide") >= 0, "hub chasse → blog");
assert(read("assurance-equitation/index.html").indexOf("assurance-equitation-rc-equestre-guide") >= 0, "hub equi → blog");
assert(
  read("assurance-voiture-sans-permis/index.html").indexOf("assurance-voiture-sans-permis-guide") >= 0,
  "hub VSP → blog"
);
assert(read("assurances-niches.html").indexOf("voiture sans permis") >= 0, "hub niches mentionne VSP");
assert(read("pret-immobilier/index.html").indexOf("pret-refuse") >= 0, "hub pret → refuse");

assert(read("scripts/generate-seo-pages.cjs").indexOf("seo-long-term-related") >= 0, "generate-seo wired");
assert(read("scripts/niche-chasse-equitation-pages.cjs").indexOf("seo-long-term-related") >= 0, "niches wired");
assert(read("scripts/seo-geo-lib.cjs").indexOf("canicule-mutuelle-coup-chaleur") >= 0, "geo sante related");
assert(read("scripts/seo-geo-lib.cjs").indexOf("pret-immobilier-refuse-que-faire") >= 0, "geo credit related");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nSEO long terme : OK.");
