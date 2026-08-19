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
assert(html.indexOf("btnSlackFiche") >= 0, "fiche : bouton Slack");

var dash = read("dashboard.html");
assert(dash.indexOf("btnCreateInterlocuteur") >= 0, "dashboard : créer fiche");
assert(dash.indexOf("interlocuteur-dossier-lib.js") >= 0, "dashboard : lib dossier");

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
