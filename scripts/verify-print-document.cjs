#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var Print = require("../js/print-document-lib.js");
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
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

var html = Print.renderHtml({
  kind: "questionnaire",
  title: "Marie Dupont",
  subtitle: "Test",
  meta: ["vtc"],
  bodyHtml: Print.section("Info perso", Print.rowsHtml([{ label: "E-mail", value: "marie@test.fr" }])),
});
assert(html.indexOf("Leads Opportunities") >= 0, "en-tête marque");
assert(html.indexOf("ORIAS 15005935") >= 0, "ORIAS");
assert(html.indexOf("Marie Dupont") >= 0, "titre document");
assert(html.indexOf("marie@test.fr") >= 0, "ligne e-mail");
assert(html.indexOf("Enregistrer au format PDF") >= 0, "consigne PDF");
assert(html.indexOf("@media print") >= 0, "CSS print");
assert(html.indexOf("<script>") >= 0, "auto-print");

var dossierHtml = Print.dossierBody({
  perso: [{ label: "Nom", value: "Dupont" }],
  pro: [],
  biens: { vehicules: [], immobilier: [] },
  projet: [{ label: "Produit", value: "VTC" }],
});
assert(dossierHtml.indexOf("Info perso") >= 0, "section perso");
assert(dossierHtml.indexOf("VTC") >= 0, "section projet");

assert(read("crm-contact.html").indexOf("print-document-lib.js") >= 0, "fiche interlocuteur charge la lib");
assert(read("crm-contact.js").indexOf("fromDossier") >= 0, "fiche interlocuteur imprime le dossier");
assert(read("crm-immo-documents.html").indexOf("btnPrintDoc") >= 0, "bouton mandat");
assert(read("js/crm-immo-documents-page.js").indexOf("fromImmoDoc") >= 0, "mandat → PDF");
assert(read("js/dashboard-mailbox.js").indexOf("mbxBtnPrintPdf") >= 0, "messagerie questionnaire");
assert(read("crm-lead-detail.js").indexOf("ldPrintPdf") >= 0, "fiche lead");
assert(read("landings/projection-achat.html").indexOf("btnPrintProjection") >= 0, "projection");
assert(read("js/achat-projection-page.js").indexOf("printProjection") >= 0, "projection handler");
assert(read("crm-agency-fees.html").indexOf("btnPrintFees") >= 0, "honoraires");
assert(read("js/crm-immo-property-page.js").indexOf("fromProperty") >= 0, "fiche bien");
assert(read("js/crm-immo-properties-page.js").indexOf('kind: "listing"') >= 0, "listing piges");
assert(read("dashboard.html").indexOf("modalPrintPdf") >= 0, "modal lead");

["js/print-document-lib.js"].forEach(function (rel) {
  require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
  assert(true, "syntaxe " + rel);
});

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les contrôles impression PDF sont OK.");
