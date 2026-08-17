#!/usr/bin/env node
/** Offre inversée : capture acquéreurs (alerte) avant dépôt vendeur. */
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

var landing = read("landings/acheteur-immo.html");
assert(landing.indexOf('id="alerte"') >= 0, "landing #alerte");
assert(landing.indexOf('href="#alerte"') >= 0, "CTA vers #alerte");
assert(landing.indexOf("Créer une alerte") >= 0, "copy alerte hero");
assert(landing.indexOf('href="#deposer-bien"') >= 0, "dépôt vendeur secondaire");
var heroPrimary = landing.slice(landing.indexOf('class="actions"'), landing.indexOf("data-immo-parcours"));
assert(heroPrimary.indexOf('href="#alerte"') >= 0, "CTA primaire alerte dans hero");
assert(heroPrimary.indexOf("Déposer / coller un bien") < 0, "plus de dépôt en CTA primaire hero");
assert(landing.indexOf("data-callback-source=\"buyer_alert_express\"") >= 0, "form alerte express");
assert(landing.indexOf("Aucun mandat public ici") >= 0, "empty state acquéreur");

var search = read("js/acheteur-immo-search.js");
assert(search.indexOf('params.get("ville")') >= 0, "prefill ?ville=");
assert(search.indexOf("fillBuyerCityFields") >= 0, "prefill ville alerte + wizard");
assert(search.indexOf("Créez une alerte") >= 0 || search.indexOf("Créer une alerte") >= 0 || search.indexOf("alerte") >= 0, "empty hint alerte");

var hat = read("js/acheteur-immo-listing-url.js");
assert(hat.indexOf("Alerte sur cette URL") >= 0, "hat acheteur = alerte URL");
assert(hat.indexOf("pas besoin du téléphone du vendeur") >= 0, "pas de tél vendeur côté acheteur");

var parcours = read("js/immo-parcours-strip.js");
assert(parcours.indexOf("Chercher / alerte") >= 0, "parcours hint alerte");

var api = read("api/_lib/routes/public-immo-listing-submit.js");
assert(api.indexOf('role === "les_deux" || role === "acheteur"') >= 0, "criteria aussi pour acheteur");
assert(api.indexOf("public_buyer_hat") >= 0, "metadata buyer hat");

var cb = read("js/callback-form.js");
assert(cb.indexOf("cityField") >= 0, "callback champ ville");
assert(cb.indexOf("buyer_alert_express") >= 0, "copy source alerte");
assert(cb.indexOf("data-callback-submit") >= 0, "submit label attr");

var dest = read("scripts/seo-immo-destinations.cjs");
assert(dest.indexOf('SEARCH_LANDING + "#alerte"') >= 0, "hub CTA #alerte");
assert(dest.indexOf("Creer mon alerte") >= 0 || dest.indexOf("Créer mon alerte") >= 0, "label alerte hub");

var geo = read("scripts/seo-geo-lib.cjs");
assert(geo.indexOf("#alerte") >= 0, "landing ville → #alerte");
assert(geo.indexOf("Creer une alerte a") >= 0, "ctaLabel alerte ville");

var gsc = require("./seo-gsc-priority-urls.cjs").GSC_INDEX_NOW_PRIORITY;
[
  "/recherche-bien/marseille/",
  "/recherche-bien/toulouse/",
  "/recherche-bien/nice/",
  "/recherche-bien/bordeaux/",
  "/recherche-bien/nantes/",
  "/recherche-bien/strasbourg/",
  "/recherche-bien/villes/",
  "/landings/acheteur-immo.html#alerte",
  "/blog/alerte-immobilier-acquereur-avant-les-autres.html",
].forEach(function (u) {
  assert(gsc.indexOf(u) >= 0, "GSC " + u);
});

var home = read("index.html");
assert(home.indexOf("acheteur-immo.html#alerte") >= 0, "home → alerte");
assert(home.indexOf("./recherche-bien/villes/") >= 0, "home raccourci villes recherche-bien");

var hub = read("immobilier/index.html");
assert(hub.indexOf("acheteur-immo.html#alerte") >= 0, "hub immo → alerte");
assert(hub.indexOf("Alerte acquéreur") >= 0, "hub immo copy alerte");

var arts = require("./blog-acquereur-articles.cjs");
assert(arts.length >= 4, "4 articles acquéreur");
arts.forEach(function (a) {
  assert(String(a.cta && a.cta.href).indexOf("acheteur-immo.html") >= 0, a.file + " CTA landing");
});
assert(read("scripts/blog-articles-manifest.cjs").indexOf("blog-acquereur-articles") >= 0, "manifest wired");

var clusters = require("../data/seo-keyword-clusters.json").clusters;
var acq = clusters.find(function (c) {
  return c.id === "acquereur-immo";
});
assert(acq && acq.blog.length >= 4, "cluster acquereur-immo");
assert(acq.moneyPages.indexOf("/recherche-bien/") >= 0, "cluster money recherche-bien");

var LT = require("./seo-long-term-related.cjs");
assert(LT.ACQUEREUR_IMMO && LT.ACQUEREUR_IMMO.length >= 4, "LT.ACQUEREUR_IMMO");

assert(read("blog/alerte-immobilier-acquereur-avant-les-autres.html").indexOf("acheteur-immo.html") >= 0, "article alerte généré");
assert(read("recherche-bien/index.html").indexOf("alerte") >= 0, "hub recherche-bien alerte");
assert(read("recherche-bien/lyon/index.html").indexOf("#alerte") >= 0, "page Lyon → #alerte");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOffre inversée / capture acquéreurs : OK.");
