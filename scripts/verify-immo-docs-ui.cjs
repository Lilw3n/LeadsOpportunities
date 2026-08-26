#!/usr/bin/env node
/** Vérifie le UI pièces : lignes Déposer (photo préférée), pas de pastilles vides. */
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

var checklist = read("js/immo-sell-docs-checklist.js");
assert(checklist.indexOf('details class="immo-doc-cat"') >= 0, "checklist = details immo-doc-cat");
assert(checklist.indexOf("fieldset") === -1, "checklist sans fieldset");
assert(checklist.indexOf("immo-doc-line-label") >= 0, "ligne = libellé + Déposer");
assert(checklist.indexOf("immo-doc-drive-hint") >= 0, "hint Drive par groupe");
assert(checklist.indexOf("field-check immo-doc-line-check") === -1, "pas de checkbox visible");

var cfg = read("js/immo-documents-config.js");
assert(cfg.indexOf('legend: "Identité & domicile vendeur(s)"') >= 0, "groupe Identité");
assert(cfg.indexOf('driveFolder: "04_documents_confidentiels"') >= 0, "Drive 04_documents_confidentiels");

var css = read("css/immo-documents.css");
assert(css.indexOf(".immo-doc-status-badge[hidden]") >= 0, "pastilles statut [hidden] masquées");
assert(css.indexOf("display: none !important") >= 0, "hidden override display:inline-flex");
assert(css.indexOf(".immo-doc-line-check-sr") >= 0, "checkbox hors écran");

var parcours = read("landings/css/immo-parcours.css");
assert(parcours.indexOf("flex-direction: column") >= 0, "checklist en colonne (pas grille 260px)");
assert(parcours.indexOf("minmax(260px, 1fr)") === -1, "plus de grille compacte checklist");

var html = read("landings/acheteur-immo.html");
assert(html.indexOf("Déposez les pièces déjà disponibles") >= 0, "copy dépôt (plus « Cochez »)");
assert(html.indexOf("immo-documents.css?v=20260826docsui") >= 0, "cache-bust CSS");
assert(html.indexOf("immo-sell-docs-checklist.js?v=20260826docsui") >= 0, "cache-bust checklist");

var dash = read("dashboard.html");
assert(dash.indexOf("immo-documents.css?v=20260826docsui") >= 0, "CRM dashboard cache-bust CSS");

var driveFolders = read("api/_lib/drive-folders.js");
assert(driveFolders.indexOf("Id contact :") >= 0, "sous-dossier Drive = Id contact : ct_…");
assert(driveFolders.indexOf("function rawContactId") >= 0, "rawContactId (ct_ = contact CRM)");

process.exit(failed ? 1 : 0);
