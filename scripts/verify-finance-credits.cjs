#!/usr/bin/env node
/** Hubs + landings + blog crédits hors immo (RAC, conso, relais, pro, rénégociation). */
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

var arts = require("./blog-finance-credits-articles.cjs");
assert(arts.length >= 9, ">= 9 articles finance credits");

var files = arts.map(function (a) {
  return a.file;
});
[
  "regroupement-credits-baisser-mensualites-2026.html",
  "credit-consommation-guide-france-2026.html",
  "pret-relais-vente-achat-guide-2026.html",
  "credit-professionnel-tns-entreprise-2026.html",
].forEach(function (f) {
  assert(files.indexOf(f) >= 0, "article " + f);
});

arts.forEach(function (a) {
  assert(a.keywords && a.keywords.length >= 3, a.file + " keywords");
  assert(
    a.blocks.some(function (b) {
      return b.type === "bridge";
    }),
    a.file + " bridge"
  );
  assert(
    /rachat|conso|pret-relais|credit-pro|renegociation/.test(a.cta.href),
    a.file + " CTA landing finance"
  );
});

assert(read("scripts/blog-articles-manifest.cjs").indexOf("blog-finance-credits-articles") >= 0, "manifest wired");

var landings = ["rachat.html", "conso.html", "pret-relais.html", "credit-pro.html", "renegociation.html"];
landings.forEach(function (f) {
  var p = path.join(root, "landings", f);
  assert(fs.existsSync(p), "landing " + f);
  var html = read("landings/" + f);
  assert(html.indexOf("data-need=") >= 0, f + " data-need");
  assert(html.indexOf("data-quote-wizard") >= 0, f + " wizard");
  assert(html.indexOf("data-callback-strip") >= 0, f + " callback");
});

var hubs = [
  "rachat-credit/index.html",
  "rachat-credit/regroupement/index.html",
  "credit-conso/index.html",
  "credit-conso/travaux/index.html",
  "pret-relais/index.html",
  "credit-pro/index.html",
  "renegociation-pret/index.html",
  "credit-immo/rachat-credit/index.html",
  "credit-immo/taux-pret/index.html",
];
hubs.forEach(function (f) {
  assert(fs.existsSync(path.join(root, f)), "hub " + f);
});

assert(read("js/service-catalog.js").indexOf("landings/rachat.html") >= 0, "catalog rachat landing");
assert(read("js/service-catalog.js").indexOf('need: "relais"') >= 0, "catalog relais");
assert(read("js/questionnaire-config.js").indexOf("relais:") >= 0, "wizard relais");
assert(read("landings/devis-init.js").indexOf("data-need") >= 0, "devis-init skip redirect");

var geo = read("scripts/seo-geo-lib.cjs");
assert(geo.indexOf('dir: "rachat-credit"') >= 0, "GEO rachat-credit");
assert(geo.indexOf('dir: "credit-conso"') >= 0, "GEO credit-conso");
assert(geo.indexOf('dir: "pret-relais"') >= 0, "GEO pret-relais");

assert(read("finance/index.html").indexOf("/rachat-credit/") >= 0, "pilier finance → hub RAC");
assert(read("finance/index.html").indexOf("/pret-relais/") >= 0, "pilier finance → relais");
assert(read("nos-services.html").indexOf("landings/rachat.html") >= 0, "nos-services rachat");
assert(read("index.html").indexOf("./rachat-credit/") >= 0 || read("index.html").indexOf("./credit-conso/") >= 0, "home pills finance");

var gsc = require("./seo-gsc-priority-urls.cjs");
assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/rachat-credit/") >= 0, "GSC rachat hub");
assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/landings/rachat.html") >= 0, "GSC landing rachat");
assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/blog/credit-consommation-guide-france-2026.html") >= 0, "GSC blog conso");

assert(read("scripts/seo-long-term-related.cjs").indexOf("SILOS_FINANCE") >= 0, "LT SILOS_FINANCE");

landings.concat(["rachat-credit/", "credit-conso/", "pret-relais/"]).forEach(function () {});

var sitemap = read("sitemap-main.xml") + read("sitemap-geo.xml");
assert(sitemap.indexOf("/rachat-credit/") >= 0, "sitemap rachat");
assert(sitemap.indexOf("/credit-conso/") >= 0, "sitemap conso");
assert(sitemap.indexOf("/pret-relais/") >= 0, "sitemap relais");
assert(sitemap.indexOf("/finance/") >= 0, "sitemap finance pilier");

arts.forEach(function (a) {
  var htmlPath = path.join(root, "blog", a.file);
  assert(fs.existsSync(htmlPath), "HTML " + a.file);
  var html = read("blog/" + a.file);
  assert(html.indexOf("article-bridge") >= 0 || html.indexOf("data-blog-article") >= 0, a.file + " rendu");
});

assert(read("blog/index.html").indexOf("credit-consommation-guide-france-2026.html") >= 0, "index blog conso");
assert(read("blog/rachat-credit-immobilier-guide-2026.html").indexOf("landings/rachat.html") >= 0, "guide RAC CTA landing rachat");

if (failed) {
  console.log("\n" + failed + " echec(s)");
  process.exit(1);
}
console.log("\nFinance credits (RAC, conso, relais, pro) : OK.");
