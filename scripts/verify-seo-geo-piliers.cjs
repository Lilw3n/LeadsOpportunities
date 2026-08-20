#!/usr/bin/env node
/**
 * Vérifie le maillage geo pour tous les piliers (prêt, recherche, finance, banque…).
 */
var fs = require("fs");
var path = require("path");
var geo = require("./seo-geo-lib.cjs");
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

var keys = geo.GEO_PRODUCTS.map(function (p) {
  return p.key;
});
assert(keys.indexOf("pret") !== -1, "produit pret");
assert(keys.indexOf("recherche") !== -1, "produit recherche");
assert(keys.indexOf("finance") !== -1, "produit finance");
assert(keys.indexOf("banque") !== -1, "produit banque");
assert(geo.GEO_PRODUCTS.length >= 16, ">= 16 produits geo (" + geo.GEO_PRODUCTS.length + ")");

assert(exists("finance/index.html"), "hub finance custom");
var financeHub = read("finance/index.html");
assert(financeHub.indexOf("Rachat, conso") >= 0, "hub finance non ecrase");
assert(financeHub.indexOf('href="departements/"') >= 0, "hub finance lien departements");
assert(financeHub.indexOf('href="regions/"') >= 0, "hub finance lien regions");

assert(exists("banque/index.html"), "hub banque custom");
var banqueHub = read("banque/index.html");
assert(banqueHub.indexOf("Offres bancaires") >= 0, "hub banque non ecrase");
assert(banqueHub.indexOf('href="departements/"') >= 0, "hub banque lien departements");

assert(exists("finance/departement/gironde/index.html"), "finance Gironde");
assert(exists("banque/departement/gironde/index.html"), "banque Gironde");
assert(exists("pret-immobilier/departement/gironde/index.html"), "pret Gironde");
assert(exists("recherche-bien/departement/gironde/index.html"), "recherche Gironde");

assert(exists("finance/region/nouvelle-aquitaine/index.html"), "finance Nouvelle-Aquitaine");
assert(exists("banque/region/nouvelle-aquitaine/index.html"), "banque Nouvelle-Aquitaine");
assert(exists("pret-immobilier/region/nouvelle-aquitaine/index.html"), "pret Nouvelle-Aquitaine");
assert(exists("assurance-sante/region/nouvelle-aquitaine/index.html"), "sante Nouvelle-Aquitaine");

assert(exists("finance/bordeaux/index.html"), "finance Bordeaux");
assert(exists("banque/bordeaux/index.html"), "banque Bordeaux");
assert(exists("finance/villes/index.html"), "annuaire villes finance");
assert(exists("finance/departements/index.html"), "annuaire depts finance");
assert(exists("finance/regions/index.html"), "annuaire regions finance");
assert(exists("banque/villes/index.html"), "annuaire villes banque");

var girondeFr = read("france/departement/gironde/index.html");
assert(girondeFr.indexOf("/finance/departement/gironde/") >= 0, "tuile Finance sur hub Gironde");
assert(girondeFr.indexOf("/banque/departement/gironde/") >= 0, "tuile Banque sur hub Gironde");
assert(girondeFr.indexOf("/pret-immobilier/departement/gironde/") >= 0, "tuile Pret sur hub Gironde");
assert(girondeFr.indexOf("/recherche-bien/departement/gironde/") >= 0, "tuile Recherche sur hub Gironde");

var financeGironde = read("finance/departement/gironde/index.html");
assert(financeGironde.indexOf("questionnaire.html?need=rachat") >= 0, "CTA rachat Gironde finance");
assert(financeGironde.indexOf("Finance dans le Gironde") >= 0 || financeGironde.indexOf("Finance") >= 0, "H1 finance Gironde");

var banqueGironde = read("banque/departement/gironde/index.html");
assert(banqueGironde.indexOf("rappel.html?need=banque") >= 0, "CTA rappel Gironde banque");

var financeBx = read("finance/bordeaux/index.html");
assert(financeBx.indexOf("Bordeaux") >= 0, "ville Bordeaux finance");
assert(financeBx.indexOf("rachat") >= 0, "contenu rachat Bordeaux");

var regionNa = read("france/region/nouvelle-aquitaine/index.html");
assert(regionNa.indexOf("/finance/region/nouvelle-aquitaine/") >= 0, "lien finance region NA");
assert(regionNa.indexOf("/banque/region/nouvelle-aquitaine/") >= 0, "lien banque region NA");

var sm = read("sitemap-geo.xml");
assert(sm.indexOf("/finance/departement/gironde/") >= 0, "sitemap finance Gironde");
assert(sm.indexOf("/banque/departement/gironde/") >= 0, "sitemap banque Gironde");
assert(sm.indexOf("/finance/bordeaux/") >= 0, "sitemap finance Bordeaux");
assert(sm.indexOf("/finance/region/nouvelle-aquitaine/") >= 0, "sitemap finance region NA");
assert(sm.indexOf("/pret-immobilier/region/nouvelle-aquitaine/") >= 0, "sitemap pret region NA");

if (failed) {
  console.log("\n" + failed + " echec(s)");
  process.exit(1);
}
console.log("\nSEO geo piliers (finance, banque, pret, recherche, regions) : OK.");
