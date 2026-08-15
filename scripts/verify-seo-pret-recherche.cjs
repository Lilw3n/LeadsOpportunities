#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var Immo = require("./seo-immo-content-lib.cjs");
var Dest = require("./seo-immo-destinations.cjs");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function exists(rel) {
  return fs.existsSync(path.join(__dirname, "..", rel));
}

function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

var cities = JSON.parse(read("seo/france-cities.json"));
var regions = JSON.parse(read("seo/france-regions.json"));
assert(cities.length >= 270, ">= 270 villes (" + cities.length + ")");
assert(
  regions.some(function (r) {
    return r.slug === "polynesie-francaise";
  }),
  "region Polynesie"
);
assert(
  cities.some(function (c) {
    return c.slug === "papeete";
  }),
  "Papeete"
);
assert(
  cities.some(function (c) {
    return c.slug === "noumea";
  }),
  "Noumea"
);
assert(
  cities.some(function (c) {
    return c.slug === "saint-tropez";
  }),
  "Saint-Tropez"
);
assert(
  cities.some(function (c) {
    return c.slug === "gustavia";
  }),
  "Gustavia"
);

var islandCities = cities.filter(function (c) {
  return Immo.isIsland(c);
});
assert(islandCities.length >= 30, "villes iles/outre-mer (" + islandCities.length + ")");

var pretParis = read("pret-immobilier/paris/index.html");
assert(pretParis.indexOf("Pret immobilier") >= 0, "Paris pret H1/title");
assert(pretParis.indexOf("landings/credit-immo.html") >= 0, "CTA simulation");

var pretFdf = read("pret-immobilier/fort-de-france/index.html");
assert(pretFdf.indexOf("Martinique") >= 0, "Fort-de-France Martinique");
assert(pretFdf.indexOf("iles") >= 0 || pretFdf.indexOf("outre-mer") >= 0, "angle outre-mer FDF");

var pretPap = read("pret-immobilier/papeete/index.html");
assert(pretPap.indexOf("Papeete") >= 0, "Papeete pret");
assert(pretPap.indexOf("CFP") >= 0 || pretPap.indexOf("Pacifique") >= 0, "angle Pacifique");

var recSt = read("recherche-bien/saint-tropez/index.html");
assert(recSt.indexOf("Saint-Tropez") >= 0, "recherche Saint-Tropez");
assert(recSt.indexOf("acheteur-immo.html") >= 0, "CTA recherche");

assert(exists("pret-immobilier/iles-francaises/index.html"), "hub iles pret");
assert(exists("pret-immobilier/dom-tom/index.html"), "hub DOM-TOM pret");
assert(exists("pret-immobilier/destinations/index.html"), "hub destinations pret");
assert(exists("recherche-bien/iles-francaises/index.html"), "hub iles recherche");
assert(exists("recherche-bien/villes/index.html"), "annuaire villes recherche");
assert(exists("pret-immobilier/villes/index.html"), "annuaire villes pret");

var sm = read("sitemap-geo.xml");
assert(sm.indexOf("/pret-immobilier/ajaccio/") >= 0, "sitemap pret Ajaccio");
assert(sm.indexOf("/recherche-bien/noumea/") >= 0, "sitemap recherche Noumea");
assert(sm.indexOf("/pret-immobilier/saint-martin-de-re/") >= 0, "sitemap Ile de Re");

var smMain = read("sitemap-main.xml");
assert(smMain.indexOf("/pret-immobilier/iles-francaises/") >= 0, "sitemap hub iles");
assert(smMain.indexOf("/landings/acheteur-immo.html") >= 0, "sitemap landing recherche");

assert(Dest.getImmoDestinationSitemapEntries("https://x").length >= 8, "sitemap dest entries");

var sections = Immo.pretCitySections({
  slug: "ajaccio",
  name: "Ajaccio",
  region: "Corse",
  regionSlug: "corse",
  dept: "corse-du-sud",
});
assert(sections.length >= 3, "sections pret Corse enrichies");

if (failed) {
  console.log("\n" + failed + " echec(s)");
  process.exit(1);
}
console.log("\nSEO pret + recherche de bien : OK (" + cities.length + " villes).");
