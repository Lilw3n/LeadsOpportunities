#!/usr/bin/env node
/**
 * Vérifie le dossier interlocuteur (perso / pro / biens) et le câblage Slack.
 */
var path = require("path");
var fs = require("fs");
var Dossier = require("../js/interlocuteur-dossier-lib");
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

var payload = {
  civility: "Mme",
  firstName: "Marie",
  lastName: "Dupont",
  email: "marie@test.fr",
  phone: "0612345678",
  familyPhone: "0142000000",
  birthDate: "1990-05-12",
  maritalStatus: "marie",
  street: "12 rue Test",
  postalCode: "75000",
  cityFull: "Paris",
  companyName: "Dupont SARL",
  companySiret: "12345678901234",
  csp: "Artisan",
  autoPlate: "AA-123-BB",
  vehicleBrand: "Renault",
  propertyType: "appartement",
  homeSurface: "90",
  projectType: "Achat residence principale",
  need: "credit_immo",
};

var d = Dossier.buildDossier({ vertical: "credit_immo", payload: payload });
assert(d.perso.some(function (r) { return r.key === "email" && r.value.indexOf("marie") >= 0; }), "perso email");
assert(d.perso.some(function (r) { return r.key === "civility"; }), "perso civilité");
assert(d.perso.some(function (r) { return r.key === "age"; }), "âge calculé depuis naissance");
assert(d.pro.some(function (r) { return r.key === "companySiret"; }), "pro SIRET");
assert(d.biens.vehicules.some(function (r) { return r.key === "autoPlate"; }), "bien véhicule plaque");
assert(d.biens.immobilier.some(function (r) { return r.key === "propertyType"; }), "bien immobilier");
assert(d.projet.some(function (r) { return r.key === "need"; }), "projet produit");

var patches = Dossier.patchesFromDossier(d);
assert(patches.vehicle && patches.vehicle.registration === "AA-123-BB", "patch véhicule");
assert(patches.company && patches.company.siret === "12345678901234", "patch entreprise");
assert(patches.family && patches.family.maritalStatus === "marie", "patch famille");
assert(Dossier.countFilled(d) >= 8, "compte champs remplis");
assert(Dossier.renderSections(d).indexOf("Info perso") >= 0, "HTML info perso");
assert(Dossier.labelOf("propertyIds") === "Identifiant(s) du bien", "libellé propertyIds FR");
assert(Dossier.labelOf("confirmByEmail") === "Confirmation par e-mail", "libellé confirmByEmail FR");
var immoD = Dossier.buildDossier({
  payload: {
    role: "vendeur",
    propertyIds: ["prop_test"],
    confirmByEmail: true,
    sellerKind: "particulier",
  },
});
assert(
  immoD.projet.some(function (r) {
    return r.key === "role" && r.label === "Profil" && r.value === "Vendeur";
  }),
  "champs immo classés en projet avec libellés FR"
);
assert(Dossier.slackLines(d, { contactUrl: "https://x/c" }).indexOf("marie@test.fr") >= 0, "Slack email");

var html = read("crm-contact.html");
assert(html.indexOf("dossierMount") >= 0, "fiche : montage dossier");
assert(html.indexOf("interlocuteur-dossier-lib.js") >= 0, "fiche : lib dossier");
assert(html.indexOf("interlocuteur-dossier.css") >= 0, "fiche : styles dossier");
assert(html.indexOf("btnSlackFiche") >= 0, "fiche : bouton Slack");
assert(html.indexOf("contactDriveBar") >= 0, "fiche : barre Drive");
assert(html.indexOf("contactDocumentsPanel") >= 0, "fiche : panneau documents");

var creditPayload = {
  email: "a@972.fr",
  phone: "0612345678",
  propertyType: "Appartement neuf / VEFA",
  homeSurface: "65",
  projectType: "Achat residence principale",
  postalProject: "75000",
  propertyFound: "Oui, offre acceptee",
  loanRefusedBefore: "Oui — je cherche une 2e chance",
  horizon: "Sous 30 jours (urgent)",
  propertyPrice: "0",
  worksAmount: "0",
  downPayment: "10000",
  downPaymentSource: "Epargne personnelle",
  page: "/landings/credit-immo.html",
  variant: "speed",
  journey: "quick",
  parcours_id: "meta_lead_rapide",
  parcours_type: "source",
  parcours_workflow: ["new", "questionnaire"],
  landing_path: "/",
  seo_product: "credit_immo",
  landing_at: "2026-05-27T18:04:56.978Z",
  referrer_first: "https://www.leadsopportunities.fr/credit-immo/",
  source: "landing_form",
  vertical: "credit_immo",
};
var creditD = Dossier.buildDossier({ vertical: "credit_immo", payload: creditPayload });
assert(
  creditD.projet.some(function (r) {
    return r.key === "loanRefusedBefore" && r.label.indexOf("refusé") >= 0;
  }),
  "crédit : prêt refusé classé en projet (FR)"
);
assert(
  creditD.projet.some(function (r) {
    return r.key === "downPayment" && String(r.value).indexOf("€") >= 0;
  }),
  "crédit : apport formaté en euros"
);
assert(
  creditD.biens.immobilier.some(function (r) {
    return r.key === "propertyPrice" && String(r.value).indexOf("€") >= 0;
  }),
  "crédit : prix du bien en immobilier"
);
assert(
  !(creditD.biens.autres || []).some(function (r) {
    return r.key === "parcours_id" || r.key === "page" || r.key === "seo_product";
  }),
  "crédit : pas de champs techniques en Autres"
);
var creditHtml = Dossier.renderSections(creditD);
assert(creditHtml.indexOf("Info pro") < 0, "HTML : masque Info pro vide");
assert(creditHtml.indexOf("Véhicule") < 0, "HTML : masque sous-section véhicule vide");
assert(creditHtml.indexOf("int-card") >= 0, "HTML : cartes dossier");
assert(creditHtml.indexOf("Loan Refused") < 0, "HTML : pas de label anglais brut");
assert(creditHtml.indexOf("parcours_id") < 0, "HTML : pas de parcours_id brut");

var dash = read("dashboard.html");
assert(dash.indexOf("btnCreateInterlocuteur") >= 0, "dashboard : créer fiche");
assert(dash.indexOf("interlocuteur-dossier-lib.js") >= 0, "dashboard : lib dossier");
assert(dash.indexOf("onContactCreated") >= 0, "dashboard : refresh CTA après promote Drive");

var qTools = read("js/crm-questionnaire-tools.js");
assert(qTools.indexOf("data-crm-q-open-drive") >= 0, "toolbar : bouton Ouvrir Drive");
assert(qTools.indexOf("openContactDrive") >= 0, "toolbar : openContactDrive");
assert(qTools.indexOf("/api/crm/drive-folder") >= 0, "toolbar : API drive-folder");
assert(qTools.indexOf("ensureContactId") >= 0, "upload : assure fiche avant dépôt");
assert(qTools.indexOf("Enregistrer les pièces") >= 0, "upload : bouton enregistrer");
assert(html.indexOf("btnOpenContactDrive") >= 0, "fiche : bouton Drive contact");

var uploadApi = read("api/_lib/routes/external-upload.js");
assert(uploadApi.indexOf("contact_missing") >= 0, "API upload : code contact_missing");
assert(uploadApi.indexOf("site_leads") >= 0, "API upload : résout contact via leadId");

var life = read("api/_lib/routes/crm-lead-lifecycle.js");
assert(life.indexOf("hydrateInterlocuteurFromLead") >= 0, "promote hydrate la fiche");

var router = read("api/crm/[action].js");
assert(router.indexOf("notify-slack") >= 0, "route notify-slack");

var em = read("crm-event-manager.html");
assert(em.indexOf("emSlackBar") >= 0, "événements : barre Slack");

["js/interlocuteur-dossier-lib.js", "api/_lib/hydrate-interlocuteur.js", "api/_lib/routes/crm-notify-slack.js"].forEach(function (rel) {
  require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
  assert(true, "syntaxe " + rel);
});

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les contrôles fiche interlocuteur sont OK.");
