#!/usr/bin/env node
/**
 * Vérifie demande de mandat (pièces + clauses) + liens perso questionnaire.
 */
var fs = require("fs");
var path = require("path");
var ok = true;
function fail(m) {
  console.error("[FAIL]", m);
  ok = false;
}
function pass(m) {
  console.log("[OK]", m);
}
function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

var html = read("landings/acheteur-immo.html");
if (html.indexOf("sellMandateRetractForm") === -1 || html.indexOf("sellMandatePrecontract") === -1 || html.indexOf("sellMandateStartNow") === -1) {
  fail("clauses mandat (rétractation / précontractuel / début prestations) manquantes");
} else pass("clauses mandat Code de la consommation");
if (html.indexOf("data-mandate-scroll-docs") === -1 || html.indexOf("Ajouter un(e) pièce jointe") === -1) {
  fail("bouton pièces jointes mandat manquant");
} else pass("pièces jointes sur la demande de mandat");
if (html.indexOf("Je demande un mandat de vente") === -1) {
  fail("libellé demande de mandat manquant");
} else pass("opt-in = demande de mandat");
if (html.indexOf("quest-resume-client.js?v=20260826qr1") === -1) {
  fail("script reprise lien perso manquant sur acheteur-immo");
} else pass("acheteur-immo charge quest-resume-client");

var submit = read("api/_lib/routes/public-immo-listing-submit.js");
if (submit.indexOf("sendMandateRequestNotice") === -1) {
  fail("e-mail vendeur (demande de mandat) manquant");
} else pass("submit listing informe le vendeur");

var ext = read("api/external/[action].js");
if (ext.indexOf("quest-resume") === -1) fail("route externe quest-resume manquante");
else pass("GET/POST /api/external/quest-resume");

var crm = read("api/crm/[action].js");
if (crm.indexOf("quest-resume-link") === -1) fail("route CRM quest-resume-link manquante");
else pass("POST /api/crm/quest-resume-link");

var lib = read("api/_lib/quest-resume.js");
if (lib.indexOf("identityMatches") === -1 || lib.indexOf("quest_resume") === -1) {
  fail("jeton / vérif identité manquants");
} else pass("JWT reprise + match e-mail/téléphone");

var tools = read("js/crm-questionnaire-tools.js");
if (tools.indexOf("Copier le lien client") === -1 || tools.indexOf("Envoyer le lien au client") === -1) {
  fail("boutons fiche interlocuteur manquants");
} else pass("fiche interlocuteur : copier / envoyer lien");

var client = read("js/quest-resume-client.js");
if (client.indexOf("/api/external/quest-resume") === -1) fail("client reprise sans API");
else pass("overlay confirmation e-mail ou téléphone");

var qi = read("js/quote-intelligence.js");
if (qi.indexOf("applyPartialToForm") === -1) fail("applyPartialToForm manquant");
else pass("préremplissage questionnaire générique");

["vtc.html", "questionnaire.html", "sante.html"].forEach(function (page) {
  var p = read("landings/" + page);
  if (p.indexOf("quest-resume-client.js?v=20260826qr1") === -1) fail(page + " sans quest-resume-client");
  else pass(page + " reprend les liens perso");
});

require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "../api/_lib/quest-resume.js")]);
require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "../api/_lib/routes/crm-quest-resume-link.js")]);
require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "../api/_lib/routes/external-quest-resume.js")]);
require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "../js/quest-resume-client.js")]);
require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "../js/acheteur-immo-mandate-client.js")]);
pass("syntaxe JS/API");

process.exit(ok ? 0 : 1);
