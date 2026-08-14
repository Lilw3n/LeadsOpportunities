#!/usr/bin/env node
/**
 * Vérifie le dossier interlocuteur (perso / pro / biens) et le câblage
 * « créer une fiche partout ».
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
  huntLicense: "oui",
  huntCover: "rc",
  huntWeapon: "carabine",
};

var d = Dossier.buildDossier({ vertical: "credit_immo", payload: payload });
assert(d.perso.some(function (r) { return r.key === "email" && r.value.indexOf("marie") >= 0; }), "perso email");
assert(d.perso.some(function (r) { return r.key === "civility"; }), "perso civilité");
assert(d.perso.some(function (r) { return r.key === "age"; }), "âge calculé depuis naissance");
assert(d.pro.some(function (r) { return r.key === "companySiret"; }), "pro SIRET");
assert(d.biens.vehicules.some(function (r) { return r.key === "autoPlate"; }), "bien véhicule plaque");
assert(d.biens.immobilier.some(function (r) { return r.key === "propertyType"; }), "bien immobilier");
assert(d.projet.some(function (r) { return r.key === "need"; }), "projet produit");

var chasse = Dossier.buildDossier({
  vertical: "chasse",
  payload: { firstName: "Lucas", huntLicense: "oui", huntCover: "rc", huntWeapon: "carabine", need: "chasse" },
});
assert(chasse.projet.some(function (r) { return r.key === "huntLicense"; }), "projet chasse permis");
assert(chasse.projet.some(function (r) { return r.key === "huntWeapon"; }), "projet chasse arme");

var patches = Dossier.patchesFromDossier(d);
assert(patches.vehicle && patches.vehicle.registration === "AA-123-BB", "patch véhicule");
assert(patches.company && patches.company.siret === "12345678901234", "patch entreprise");
assert(patches.family && patches.family.maritalStatus === "marie", "patch famille");
assert(Dossier.countFilled(d) >= 8, "compte champs remplis");
assert(Dossier.renderSections(d).indexOf("Info perso") >= 0, "HTML info perso");
assert(Dossier.slackLines(d, { contactUrl: "https://x/c" }).indexOf("marie@test.fr") >= 0, "Slack email");

var html = read("crm-contact.html");
assert(html.indexOf("dossierMount") >= 0, "fiche : montage dossier");
assert(html.indexOf("interlocuteur-dossier-lib.js") >= 0, "fiche : lib dossier");
assert(html.indexOf("btnSlackFiche") >= 0, "fiche : bouton Slack");

var dash = read("dashboard.html");
assert(dash.indexOf("crm-create-interlocuteur.js") >= 0, "dashboard : helper création");
assert(dash.indexOf("btn-int-create") >= 0, "dashboard : bouton fiche visible");
assert(dash.indexOf("interlocuteur-dossier-lib.js") >= 0, "dashboard : lib dossier");
assert(dash.indexOf('value="chasse"') >= 0, "dashboard : filtre chasse");

var helper = read("js/crm-create-interlocuteur.js");
assert(helper.indexOf('action: "promote"') >= 0, "helper : promote lead-lifecycle");
assert(helper.indexOf("data-create-interlocuteur") >= 0, "helper : délégation clic");

var payloadView = read("js/crm-lead-payload-view.js");
assert(payloadView.indexOf("CrmCreateInterlocuteur") >= 0, "questionnaire : CTA fiche");
assert(payloadView.indexOf("huntLicense") >= 0, "questionnaire : labels chasse");

var mailbox = read("js/dashboard-mailbox.js");
assert(mailbox.indexOf("CrmCreateInterlocuteur") >= 0, "messagerie : bouton fiche");

var acq = read("crm-acquisition.js");
assert(acq.indexOf("CrmCreateInterlocuteur") >= 0, "pipeline : bouton fiche");
assert(read("crm-acquisition.html").indexOf("crm-create-interlocuteur.js") >= 0, "pipeline : script helper");

var meta = read("crm-meta-inbox.js");
assert(meta.indexOf("CrmCreateInterlocuteur") >= 0, "inbox Meta : bouton fiche");
assert(read("crm-meta-inbox.html").indexOf("crm-create-interlocuteur.js") >= 0, "inbox Meta : script helper");

var crm = read("crm.js");
assert(crm.indexOf("CrmCreateInterlocuteur") >= 0, "CRM overview : bouton fiche");
assert(read("crm.html").indexOf("crm-create-interlocuteur.js") >= 0, "CRM : script helper");

assert(read("crm-leads.html").indexOf("crm-create-interlocuteur.js") >= 0, "leads hub : script helper");
assert(read("crm-lead-detail.html").indexOf("crm-create-interlocuteur.js") >= 0, "fiche lead : script helper");

var life = read("api/_lib/routes/crm-lead-lifecycle.js");
assert(life.indexOf("hydrateInterlocuteurFromLead") >= 0, "promote hydrate la fiche");

var convert = read("api/_lib/routes/crm-convert-lead.js");
assert(convert.indexOf("hydrateInterlocuteurFromLead") >= 0, "convert-lead hydrate la fiche");
assert(convert.indexOf("alreadyLinked") >= 0 && convert.indexOf("dossierFilled") >= 0, "convert-lead hydrate aussi si déjà lié");

var leadsApi = read("api/_lib/routes/leads.js");
assert(leadsApi.indexOf("contact_id") >= 0, "liste leads : contact_id exposé");

var router = read("api/crm/[action].js");
assert(router.indexOf("notify-slack") >= 0, "route notify-slack");

var em = read("crm-event-manager.html");
assert(em.indexOf("emSlackBar") >= 0, "événements : barre Slack");

[
  "js/interlocuteur-dossier-lib.js",
  "js/crm-create-interlocuteur.js",
  "js/crm-lead-payload-view.js",
  "api/_lib/hydrate-interlocuteur.js",
  "api/_lib/routes/crm-notify-slack.js",
  "api/_lib/routes/crm-convert-lead.js",
].forEach(function (rel) {
  require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
  assert(true, "syntaxe " + rel);
});

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les contrôles fiche interlocuteur sont OK.");
