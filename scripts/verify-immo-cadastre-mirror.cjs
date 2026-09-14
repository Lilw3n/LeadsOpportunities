#!/usr/bin/env node
/** Cadastre visible en Localisation + Composition (lots), sans écrasement. */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
var failed = 0;
function ok(c, m) {
  if (!c) {
    failed++;
    console.log("FAIL", m);
  } else console.log("OK  ", m);
}
function read(r) {
  return fs.readFileSync(path.join(root, r), "utf8");
}

var schema = read("js/crm-immo-property-schema.js");
ok(schema.indexOf('id: "localisation"') >= 0, "section localisation");
ok(schema.indexOf("section_cadastrale") >= 0, "cadastre en localisation");
ok(schema.indexOf("numero_cadastre") >= 0, "n° cadastre localisation");
ok(schema.indexOf("cadastre_section") >= 0, "cadastre en identité lot");
ok(schema.indexOf("cadastre_lieu_dit") >= 0, "lieu-dit lot");
ok(schema.indexOf("Digicode (accès lot)") >= 0 || schema.indexOf("digicode") >= 0, "digicode lot");

var dossier = read("js/crm-immo-dossier-lib.js");
ok(dossier.indexOf("seedUnitCadastreFromProperty") >= 0, "seedUnitCadastreFromProperty");
ok(dossier.indexOf("cadastre_lieu_dit") >= 0, "normalize lieu-dit");

var page = read("js/crm-immo-property-page.js");
ok(page.indexOf("seedUnitCadastreFromProperty") >= 0, "page appelle seed");
ok(page.indexOf("unitCadastreLabel") >= 0, "libellé cadastre sur nœuds composition");
ok(page.indexOf("comp-immeuble-cadastre") >= 0, "bandeau cadastre immeuble en composition");
ok(page.indexOf("Cadastre ") >= 0 && page.indexOf("cadastreLbl") >= 0, "meta cadastre dans arbre");

var docs = read("docs/CRM-IMMO-COMPOSITION-SCHEMA.md");
ok(docs.indexOf("Cadastre multi-endroits") >= 0, "doc multi-endroits");

// Runtime seed
var code = read("js/crm-immo-dossier-lib.js");
var g = { window: {}, module: { exports: {} }, exports: {} };
var D = new Function(
  "window",
  "module",
  "exports",
  code + "\nreturn window.CrmImmoDossier || module.exports;"
)(g.window, g.module, g.exports);
var u = D.normalizeUnit({ type: "appartement", cadastre_section: "AM" });
D.seedUnitCadastreFromProperty(u, {
  details: { localisation: { section_cadastrale: "ZZ", numero_cadastre: "99", digicode: "9999" } },
});
ok(u.cadastre_section === "AM", "n’écrase pas section existante");
ok(u.cadastre_numero === "99", "préremplit n° si vide");
ok(u.digicode === "9999", "préremplit digicode si vide");

if (failed) {
  console.log(failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK verify-immo-cadastre-mirror");
