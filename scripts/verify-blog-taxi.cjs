#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL", msg);
    process.exit(1);
  }
  console.log("OK  ", msg);
}

assert(exists("scripts/blog-taxi-articles.cjs"), "module articles taxi");
assert(
  read("scripts/blog-articles-manifest.cjs").indexOf("blog-taxi-articles") !== -1,
  "manifest charge articles taxi"
);
assert(read("scripts/blog-articles-manifest.cjs").indexOf('id: "taxi"') !== -1, "section blog taxi");
assert(read("scripts/blog-themes.cjs").indexOf("taxi:") !== -1, "theme taxi");
assert(read("blog/blog.css").indexOf(".tag-taxi") !== -1, "CSS tag-taxi");

var articles = require("./blog-taxi-articles.cjs");
assert(articles.length >= 6, "au moins 6 articles taxi");

var files = {};
articles.forEach(function (a) {
  assert(a.section === "taxi", "section taxi " + a.file);
  assert(a.file && a.title && a.blocks && a.blocks.length >= 6, "article complet " + a.file);
  assert(!files[a.file], "slug unique " + a.file);
  files[a.file] = true;
  assert(a.cta && /landings\/(taxi|questionnaire|devis-rapide)/.test(a.cta.href), "CTA landing " + a.file);
  assert(/utm_campaign=promo_taxi/.test(JSON.stringify(a)), "UTM promo_taxi " + a.file);
  var hasBridge = (a.blocks || []).some(function (b) {
    return b.type === "bridge";
  });
  assert(hasBridge, "bloc bridge " + a.file);
  assert(exists("blog/" + a.file), "HTML généré " + a.file);
  var html = read("blog/" + a.file);
  assert(html.indexOf("landings/taxi.html") !== -1 || html.indexOf("need=taxi") !== -1, "lien lead " + a.file);
});

assert(files["assurance-taxi-moins-cher-2026.html"], "article tarif");
assert(files["assurance-taxi-garanties-obligatoires-tpt-2026.html"], "article TPT");
assert(files["devis-assurance-taxi-rappel-15-min-courtier-orias.html"], "article devis");

var map = read("data/blog-questionnaire-map.json");
assert(map.indexOf('"taxi"') !== -1, "map questionnaire taxi");
assert(map.indexOf("assurance-taxi-moins-cher-2026.html") !== -1, "override map tarif");

var csv = read("ads/meta-blog-conversions.csv");
assert(csv.indexOf("assurance-taxi-moins-cher-2026") !== -1, "Meta CSV tarif taxi");
assert(csv.indexOf("devis-assurance-taxi-rappel-15-min-courtier-orias") !== -1, "Meta CSV devis taxi");

var gsc = read("scripts/seo-gsc-priority-urls.cjs");
assert(gsc.indexOf("/blog/assurance-taxi-moins-cher-2026.html") !== -1, "GSC tarif taxi");
assert(gsc.indexOf("/landings/taxi.html") !== -1, "GSC landing taxi");

var sm = read("sitemap-main.xml");
assert(sm.indexOf("/blog/assurance-taxi-moins-cher-2026.html") !== -1, "sitemap tarif taxi");
assert(sm.indexOf("/blog/devis-assurance-taxi-rappel-15-min-courtier-orias.html") !== -1, "sitemap devis taxi");

var landing = read("landings/taxi.html");
assert(landing.indexOf('href="./vtc.html"') === -1, "landing taxi ne bascule pas vers VTC");
assert(landing.indexOf("questionnaire.html?need=taxi") !== -1, "landing lien questionnaire taxi");

var catalog = JSON.parse(read("data/crm-catalog-broker.json"));
var taxi = catalog.products.filter(function (p) {
  return p.id === "taxi";
})[0];
assert(taxi && taxi.landingUrl === "/landings/taxi.html", "catalogue CRM landing taxi");
assert(taxi && taxi.need === "taxi", "catalogue CRM need=taxi");

console.log("\nBlog taxi leads : OK —", articles.length, "articles.");
