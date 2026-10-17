#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var catalog = require("./metiers-suite-catalog.cjs");
var articles = require("./blog-metiers-suite-articles.cjs");
var root = path.join(__dirname, "..");
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
  return fs.readFileSync(path.join(root, rel), "utf8");
}

assert(catalog.length >= 17, "catalogue métiers");
assert(articles.length === catalog.length + 1, "articles + pilier");

catalog.forEach(function (item) {
  var landing = read("landings/" + item.file);
  var blog = read("blog/" + item.blog);
  assert(landing.indexOf("need=" + item.need) >= 0, item.id + " questionnaire");
  assert(landing.indexOf("data-market-intent=\"FR\"") >= 0, item.id + " France");
  assert(landing.indexOf("15005935") >= 0, item.id + " ORIAS");
  assert(blog.indexOf("article-hero") < 0, item.id + " sans image stock");
  assert(blog.indexOf("need=" + item.need) >= 0, item.id + " blog CTA");
  assert(read("sitemap-main.xml").indexOf("/landings/" + item.file) >= 0, item.id + " sitemap");
});

var pillar = read("blog/assurance-metiers-quel-contrat-choisir-2026.html");
assert(pillar.indexOf("assurances-niches.html") >= 0, "pilier vers le hub");
assert(pillar.indexOf("article-hero") < 0, "pilier sans image");

var markets = JSON.parse(read("data/seo-niche-markets.json"));
["instrument", "bateau", "caravane", "scolaire", "flotte", "tns", "piscine"].forEach(function (id) {
  var m = markets.markets.find(function (x) {
    return x.id === id;
  });
  assert(m && m.status === "live", "silo " + id);
});

var niches = JSON.parse(read("seo/niches.json"));
var plannedLeft = niches.niches.filter(function (n) {
  return n.status === "planned" && catalog.some(function (c) {
    return c.id === n.id;
  });
});
assert(plannedLeft.length === 0, "plus de planned sur le catalogue");

var map = JSON.parse(read("data/blog-questionnaire-map.json"));
assert(map.articles["assurance-flotte-vehicules-professionnels-2026.html"].section === "flotte", "CTA flotte explicite");
assert(map.sections.caravane.need === "caravane", "section caravane");

var hub = JSON.parse(read("data/assurances-hub-meta.json"));
["mrp", "decennale", "flotte", "dirigeant", "bateau", "instrument", "garage", "transport-logistique", "transport-voyageurs", "metiers-batiment"].forEach(function (id) {
  var row = hub.services[id] || {};
  var blogs = row.blogUrls || (row.blogUrl ? [row.blogUrl] : []);
  assert(blogs.length > 0, "catalogue article " + id);
});
var shelf = read("blog/index.html");
assert(shelf.indexOf('id="articles-metiers"') >= 0, "rayon métiers sur le blog");
assert((shelf.match(/class="metier-blog-card"/g) || []).length >= 24, "au moins 24 cartes métiers");
assert(shelf.indexOf('id="blog-sections"') >= 0, "mosaïque des sections");
["pro", "collective", "partenariat", "vtc", "sante", "finance"].forEach(function (id) {
  assert(shelf.indexOf('id="blog-section-' + id + '"') >= 0, "section blog " + id);
});
var hubPage = read("assurances/index.html");
assert(hubPage.indexOf('<section class="metier-blog-shelf" id="articles-metiers">') >= 0, "rayon métiers sur le catalogue");
assert(hubPage.indexOf("METIERS-BLOG-<section") < 0, "rayon catalogue hors commentaire");
assert(hubPage.indexOf("\n    SHELF\n") < 0, "placeholder SHELF retiré");

if (failed) {
  console.log(failed, "échecs");
  process.exit(1);
}
console.log("verify metiers suite ok");
