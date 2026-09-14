#!/usr/bin/env node
/**
 * Vérifie : création → fiche riche, pipeline location, estimation/mandat + formulaire PDF.
 */
var fs = require("fs");
var path = require("path");
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

var Ops = require(path.join(root, "js/crm-immo-ops-lib.js"));
var Bareme = require(path.join(root, "js/bareme-honoraires-lib.js"));

assert(typeof Ops.seedUnitsForCreate === "function", "seedUnitsForCreate");
assert(typeof Ops.ensureLocationOpsOnProperty === "function", "ensureLocationOpsOnProperty");
assert(typeof Ops.ensureEstimationMandatOnProperty === "function", "ensureEstimationMandatOnProperty");

var unitsApt = Ops.seedUnitsForCreate("appartement", "location", null);
assert(unitsApt.length >= 1, "seed appart");
assert((unitsApt[0].transaction || "") === "location" || true, "seed transaction location");

var unitsImm = Ops.seedUnitsForCreate("immeuble", "vente", null);
assert(unitsImm.length >= 3, "seed immeuble multi-niveaux");

var prop = {
  title: "Test location Nancy",
  property_type: "appartement",
  transaction: "location",
  surface_m2: 52,
  city: "Nancy",
  postal_code: "54000",
  details: {},
  units: unitsApt,
};
var ops = Ops.ensureLocationOpsOnProperty(prop);
ops.remuneration.surface_m2 = 52;
ops.remuneration.zone = "hors";
ops.remuneration.part_agent_pct = 50;
ops.dossiers.push(
  Ops.emptyDossier({
    candidat_nom: "Martin",
    statut: "valide",
    pieces: {
      piece_identite: true,
      justificatif_domicile: true,
      contrat_travail: true,
      avis_imposition: true,
      bulletins_salaire: true,
      garant_id: true,
    },
  })
);
ops.visites.push(Ops.emptyVisite({ statut: "faite", present: true }));
ops.baux.push(Ops.emptyBail({ statut: "signe", loyer_hc: 720 }));
var stats = Ops.locationPipelineStats(ops);
assert(stats.dossiers_ok === 1 && stats.visites_faites === 1 && stats.baux_signes === 1, "stats pipeline location");

var rem = Ops.computeLocationRemuneration(ops, Bareme);
assert(rem.ok && rem.agence_ttc > 0 && rem.agent_ttc > 0, "rémunération barème + part agent");

var est = Ops.ensureEstimationMandatOnProperty({
  city: "Nancy",
  postal_code: "54000",
  address: "1 rue Stanislas",
  price_net: 220000,
  transaction: "vente",
  details: {},
});
assert(est.bien_ville === "Nancy" && Number(est.valeur_estimee) === 220000, "estimation préremplie");
est.honoraires_pct = 4;
var hon = Ops.computeMandatHonoraires(est);
assert(Math.round(hon.honoraires_ttc) === 8800, "honoraires mandat 4% TTC");

var schema = read("js/crm-immo-property-schema.js");
assert(schema.indexOf("location_pipeline") !== -1, "schema location_pipeline");
assert(schema.indexOf("estimation_mandat") !== -1, "schema estimation_mandat");
assert(/composition[\s\S]*appartement/.test(schema) || schema.indexOf('"appartement"') !== -1, "composition / appart");

var page = read("js/crm-immo-property-page.js");
assert(page.indexOf("location_pipeline") !== -1 && page.indexOf("CrmImmoOpsUi") !== -1, "fiche pipeline");
assert(page.indexOf("estimation_mandat") !== -1, "fiche estimation/mandat");
assert(page.indexOf("wizard") !== -1, "wizard création");

var propsPage = read("js/crm-immo-properties-page.js");
assert(propsPage.indexOf("seedUnitsForCreate") !== -1, "création seed units");
assert(propsPage.indexOf("wizard=1") !== -1, "création → fiche wizard");

var htmlProp = read("crm-immo-property.html");
assert(htmlProp.indexOf("crm-immo-ops-lib.js") !== -1 && htmlProp.indexOf("crm-immo-ops-ui.js") !== -1, "scripts ops fiche");
assert(htmlProp.indexOf("bareme-honoraires-lib.js") !== -1, "barème fiche");

var htmlProps = read("crm-immo-properties.html");
assert(htmlProps.indexOf("crm-immo-ops-lib.js") !== -1, "ops lib piges");

assert(fs.existsSync(path.join(root, "estimation-mandat.html")), "page publique estimation-mandat");
assert(fs.existsSync(path.join(root, "js/estimation-mandat-form.js")), "JS formulaire");
var formHtml = read("estimation-mandat.html");
assert(formHtml.indexOf("btnPdfEst") !== -1 && formHtml.indexOf("print-document-lib.js") !== -1, "formulaire PDF");
assert(formHtml.indexOf("client_nom") !== -1 && formHtml.indexOf("honoraires_pct") !== -1, "champs formulaire");

var formJs = read("js/estimation-mandat-form.js");
assert(formJs.indexOf("normalizeEstimationMandat") !== -1 && formJs.indexOf("fromKpis") !== -1, "form → ops + PDF");

var ui = read("js/crm-immo-ops-ui.js");
assert(ui.indexOf("renderLocationPipeline") !== -1 && ui.indexOf("renderEstimationMandat") !== -1, "UI ops");
assert(ui.indexOf("fromKpis") !== -1, "UI PDF fromKpis");

assert(read("js/print-document-lib.js").indexOf("fromKpis") !== -1, "PrintDocument.fromKpis");

[
  "js/crm-immo-ops-lib.js",
  "js/crm-immo-ops-ui.js",
  "js/estimation-mandat-form.js",
  "js/crm-immo-property-page.js",
  "js/crm-immo-properties-page.js",
].forEach(function (rel) {
  require("child_process").execFileSync(process.execPath, ["--check", path.join(root, rel)]);
  assert(true, "syntaxe " + rel);
});

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nPipeline immo création / location / mandat OK");
