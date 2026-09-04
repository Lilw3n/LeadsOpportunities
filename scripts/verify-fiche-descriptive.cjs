#!/usr/bin/env node
/** Vérifie fiche descriptive du bien (éditeur + PDF + branchements). */
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

[
  "js/fiche-descriptive-bien-lib.js",
  "js/fiche-descriptive-bien-page.js",
  "js/acheteur-immo-fiche-descriptive.js",
  "landings/fiche-descriptive-bien.html",
  "landings/css/fiche-descriptive-bien.css",
].forEach(function (f) {
  assert(fs.existsSync(path.join(root, f)), f + " existe");
});

var lib = read("js/fiche-descriptive-bien-lib.js");
assert(lib.indexOf("fromSellForm") >= 0, "fromSellForm");
assert(lib.indexOf("fromCrmProperty") >= 0, "fromCrmProperty");
assert(lib.indexOf("FicheDescriptiveBien") >= 0, "export global");
assert(lib.indexOf("saveDraft") >= 0, "brouillons locaux");
assert(lib.indexOf("bodyHtml") >= 0, "corps PDF");

var Fiche = require("../js/fiche-descriptive-bien-lib.js");
var empty = Fiche.emptyFiche();
assert(empty && empty.city === "", "emptyFiche");
var sample = Fiche.merge(empty, {
  title: "Test Nancy T3",
  city: "Nancy",
  postalCode: "54000",
  propertyType: "appartement",
  surfaceHab: "85",
  dpe: "D",
  description: "Bel appartement",
});
assert(sample.city === "Nancy", "merge city");
assert(typeof Fiche.bodyHtml === "function", "bodyHtml fn");

// PrintDocument stub for Node bodyHtml
global.PrintDocument = require("../js/print-document-lib.js");
var html = Fiche.bodyHtml(sample);
assert(html.indexOf("Identification") >= 0 || html.indexOf("Surfaces") >= 0, "bodyHtml sections");
assert(html.indexOf("Nancy") >= 0 || html.indexOf("Test Nancy") >= 0, "bodyHtml contenu");

var landing = read("landings/fiche-descriptive-bien.html");
assert(landing.indexOf("data-fiche-form") >= 0, "form éditeur");
assert(landing.indexOf("data-fiche-print") >= 0, "bouton PDF");
assert(landing.indexOf("fiche-descriptive-bien-lib.js") >= 0, "script lib");

var immo = read("landings/acheteur-immo.html");
assert(immo.indexOf("data-fiche-descriptive-print") >= 0, "bouton PDF questionnaire");
assert(immo.indexOf("data-fiche-descriptive-edit") >= 0, "lien éditer");
assert(immo.indexOf("acheteur-immo-fiche-descriptive.js") >= 0, "script bridge");

var crm = read("crm-immo-property.html");
assert(crm.indexOf("btnEditFichePdf") >= 0, "CRM éditer fiche PDF");
assert(crm.indexOf("fiche-descriptive-bien-lib.js") >= 0, "CRM charge lib");

var printLib = read("js/print-document-lib.js");
assert(printLib.indexOf("FicheDescriptiveBien") >= 0, "fromProperty délègue fiche");

var pkg = JSON.parse(read("package.json"));
assert(pkg.scripts["verify:fiche-descriptive"], "npm script verify:fiche-descriptive");

process.exit(failed ? 1 : 0);
