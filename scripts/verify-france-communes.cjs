#!/usr/bin/env node
/** Annuaire des communes : recensement complet, pas de page produit par hameau. */
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

var census = JSON.parse(fs.readFileSync(path.join(root, "seo/france-communes.json"), "utf8"));
assert(census.count >= 34000, "au moins 34 000 communes (got " + census.count + ")");
var varange = census.communes.filter(function (c) {
  return c[1] === "Varangéville";
});
assert(varange.length === 1 && varange[0][0] === "54549" && varange[0][2] === "54", "Varangéville INSEE 54549");
assert(
  !census.communes.some(function (c) {
    return String(c[1]).toLowerCase() === "varengeville" && c[2] === "54";
  }),
  "pas de Varengeville en Meurthe-et-Moselle"
);

var index = fs.readFileSync(path.join(root, "france/communes/index.html"), "utf8");
assert(index.indexOf(String(census.count)) !== -1 || index.indexOf("34") !== -1, "hub national");
assert(index.indexOf("/pret-immobilier/nancy-metropole/") !== -1, "hub Nancy sur l’annuaire national");
assert(index.indexOf("ORIAS") !== -1, "ORIAS sur l’annuaire");

var mm = fs.readFileSync(path.join(root, "france/communes/meurthe-et-moselle/index.html"), "utf8");
assert(mm.indexOf("Varangéville") !== -1, "Varangéville listée");
assert(mm.indexOf("INSEE 54549") !== -1, "code INSEE Varangéville");
assert(mm.indexOf("/pret-immobilier/nancy/") !== -1, "Nancy a une page prêt");
assert(mm.indexOf("/pret-immobilier/nancy-metropole/") !== -1, "renvoi bassin Nancy");
assert(mm.indexOf('id="communeFilter"') !== -1, "recherche de commune");
assert(!fs.existsSync(path.join(root, "france/communes/meurthe-et-moselle/varangeville/index.html")), "pas de page hameau");

var ain = fs.readFileSync(path.join(root, "france/communes/ain/index.html"), "utf8");
assert(ain.indexOf("Communes — Ain") !== -1, "Ain recensé même sans page ville");

var sm = fs.readFileSync(path.join(root, "sitemap-communes.xml"), "utf8");
assert(sm.indexOf("/france/communes/meurthe-et-moselle/") !== -1, "sitemap communes");
assert(fs.readFileSync(path.join(root, "sitemap.xml"), "utf8").indexOf("sitemap-communes.xml") !== -1, "index sitemap");

var dept = fs.readFileSync(path.join(root, "france/departement/meurthe-et-moselle/index.html"), "utf8");
assert(dept.indexOf("/france/communes/meurthe-et-moselle/") !== -1, "lien depuis la page département");

var journal = fs.readFileSync(path.join(root, "vault/Journal/Communes de France.md"), "utf8");
assert(journal.indexOf("generated: false") !== -1, "journal non régénéré par vault:seo");
assert(journal.indexOf("Varangéville") !== -1, "journal Varangéville");
assert(fs.readFileSync(path.join(root, "vault/Accueil.md"), "utf8").indexOf("Journal/Communes de France") !== -1, "lien Accueil");

process.exit(failed ? 1 : 0);
