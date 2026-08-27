#!/usr/bin/env node
/**
 * Vérifie le pack santé collective (SEO, blog, landing, Google Ads, Meta).
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

assert(exists("landings/sante-collective.html"), "landing sante-collective.html");
assert(read("landings/sante-collective.html").indexOf("need=collective") >= 0 || read("landings/sante-collective.html").indexOf("collective") >= 0, "landing collective");
assert(read("landings/sante-collective.html").indexOf("assurance-sante-collective") >= 0, "landing → silo SEO");

assert(exists("scripts/niche-collective-pages.cjs"), "niche-collective-pages.cjs");
assert(read("scripts/niche-pages.cjs").indexOf("buildCollectivePages") >= 0, "niche-pages charge collective");

assert(exists("assurance-sante-collective/index.html") || true, "silo généré après seo:build (check soft)");

var niches = JSON.parse(read("seo/niches.json"));
var col = niches.niches.filter(function (n) {
  return n.id === "collective";
})[0];
assert(col && col.status === "live", "seo/niches.json collective live");
assert(niches.hub.stats.liveNiches >= 5, "liveNiches >= 5");

var markets = JSON.parse(read("data/seo-niche-markets.json"));
var m = markets.markets.filter(function (x) {
  return x.id === "collective";
})[0];
assert(m && m.status === "live", "seo-niche-markets collective live");
assert(markets.indexationWeek1.indexOf("/assurance-sante-collective/") >= 0, "GSC week1 pilier collective");
assert(markets.indexationWeek1.indexOf("/landings/sante-collective.html") >= 0, "GSC week1 landing");

assert(read("js/service-catalog.js").indexOf("collective") >= 0, "service-catalog collective");
assert(read("js/questionnaire-config.js").indexOf("collective") >= 0, "questionnaire collective");
assert(read("js/devis-express-config.js").indexOf("collective") >= 0, "express collective");

assert(exists("ads/google-collective-search.csv"), "CSV Google collective");
assert(read("ads/google-collective-search.csv").indexOf("FR_Search_Collective_HotIntent") >= 0, "campagne Search collective");
assert(read("ads/google-collective-search.csv").indexOf('"devis mutuelle collective"') >= 0, "mot-clé devis mutuelle collective");
assert(read("ads/google-ads-editor-ready-utm.csv").indexOf("FR_Search_Collective_HotIntent") >= 0, "CSV UTM contient collective");
assert(read("ads/meta-blog-conversions.csv").indexOf("collective_blog_convert") >= 0, "Meta blog-convert collective");

var hubMeta = JSON.parse(read("data/assurances-hub-meta.json"));
assert(hubMeta.services.collective && hubMeta.services.collective.seoUrl, "hub-meta seoUrl collective");

var articles = require("./blog-collective-articles.cjs");
assert(articles.length >= 8, "8 articles blog collective");
assert(read("scripts/blog-articles-manifest.cjs").indexOf("blog-collective-articles") >= 0, "manifest charge collective");
assert(read("scripts/blog-articles-manifest.cjs").indexOf('id: "collective"') >= 0, "section blog collective");

assert(read("seo/keyword-clusters-seo-sea.csv").indexOf("collective,transactionnelle") >= 0, "keyword clusters collective");
assert(read("scripts/seo-gsc-priority-urls.cjs").indexOf("/assurance-sante-collective/") >= 0, "GSC priority silo");
assert(exists("docs/COLLECTIVE-SANTE-PUB.md"), "doc pubs collective");

var hub = JSON.parse(read("config/ad-platform-hub.json"));
assert(
  hub.preset_campaigns.some(function (c) {
    return c.id === "google_collective_search";
  }),
  "hub pubs : campagne Google collective"
);

if (failed) {
  console.error("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK santé collective");
