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

var quoteHtml = Print.fromQuote(
  {
    id: "qte_test",
    title: "Devis VTC",
    product_type: "vtc",
    status: "envoye",
    premium_estimate: 1200,
    data: { coverage: "Tous risques", offers: [{ insurer: "FMA", premium: 1180, score: 82 }] },
  },
  { first_name: "Marie", last_name: "Dupont", email: "marie@test.fr" }
);
assert(quoteHtml.indexOf("Devis VTC") >= 0, "devis titre");
assert(quoteHtml.indexOf("FMA") >= 0, "devis offre");
assert(quoteHtml.indexOf("1") >= 0 && quoteHtml.indexOf("200") >= 0, "devis prime");

var contractHtml = Print.fromContract(
  {
    id: "ctr_1",
    policy_number: "POL-88",
    contract_type: "Auto Pro",
    insurer: "FMA",
    status: "Actif",
    premium: 95,
    description: "Avenant véhicule 12/08/2026",
  },
  { first_name: "Jean", last_name: "Martin", email: "jean@test.fr" },
  { vehicles: [{ registration: "AA-123-BB", brand: "Tesla", model: "Y" }] }
);
assert(contractHtml.indexOf("POL-88") >= 0, "contrat police");
assert(contractHtml.indexOf("AA-123-BB") >= 0, "contrat véhicule");
assert(contractHtml.indexOf("Avenant véhicule") >= 0, "contrat description");

var avenantHtml = Print.fromAvenant(
  {
    avenantType: "Changement véhicule",
    premium: 110,
    endDate: "2027-08-01",
    status: "En attente",
    notes: "Remplacement Tesla Y",
  },
  { id: "ctr_1", policy_number: "POL-88", premium: 95, insurer: "FMA" },
  { first_name: "Jean", last_name: "Martin" }
);
assert(avenantHtml.indexOf("Changement véhicule") >= 0, "avenant type");
assert(avenantHtml.indexOf("Remplacement Tesla Y") >= 0, "avenant motif");
assert(avenantHtml.indexOf("Avenant") >= 0, "avenant kind");

var tariffHtml = Print.fromTariffGrid(
  {
    insurer: "fma",
    insurerLabel: "FMA",
    product: "vtc",
    totalAnnual: 1450,
    rows: [{ label: "RC Pro", code: "rc", franchise: 300, annualPremium: 1450, commissionPct: 12 }],
  },
  { leadId: "lead_1" }
);
assert(tariffHtml.indexOf("Bordereau tarifaire") >= 0, "bordereau titre");
assert(tariffHtml.indexOf("RC Pro") >= 0, "bordereau garantie");
assert(tariffHtml.indexOf("1") >= 0 && tariffHtml.indexOf("450") >= 0, "bordereau total");

var claimHtml = Print.fromClaim(
  { claim_type: "Bris de glace", status: "ouvert", amount: 420, description: "Pare-brise CDG" },
  { first_name: "Marie", last_name: "Dupont" }
);
assert(claimHtml.indexOf("Bris de glace") >= 0, "sinistre type");
assert(claimHtml.indexOf("Pare-brise CDG") >= 0, "sinistre description");

assert(read("crm-contract-avenant.html").indexOf("btnPrintAvenant") >= 0, "bouton avenant");
assert(read("crm-contract-avenant.js").indexOf("fromAvenant") >= 0, "avenant → PDF");
assert(read("crm-tariff-grid.html").indexOf("btnPrintTariff") >= 0, "bouton bordereau");
assert(read("crm-tariff-grid.js").indexOf("fromTariffGrid") >= 0, "bordereau → PDF");
assert(read("crm-quote-detail.js").indexOf("fromQuote") >= 0, "devis → PDF");
assert(read("crm-contract-detail.js").indexOf("fromContract") >= 0, "contrat → PDF");
assert(read("crm-claim-detail.js").indexOf("fromClaim") >= 0, "sinistre → PDF");
assert(read("crm-lead-detail.js").indexOf("ldPrintTariff") >= 0, "fiche lead bordereau");

["js/print-document-lib.js"].forEach(function (rel) {
  require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
  assert(true, "syntaxe " + rel);
});

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les contrôles impression PDF sont OK.");
