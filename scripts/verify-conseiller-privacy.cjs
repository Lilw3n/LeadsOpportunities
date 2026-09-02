#!/usr/bin/env node
/**
 * Mode conseiller : pas de préremplissage d’un dossier client
 * sans reprise explicite (lien perso, CRM, leadId+identité).
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

var ident = require("../api/_lib/resume-identity");
if (ident.identityMatchesLead({ email: "marie.hafner@test.fr", phone: "0612345678" }, {}, "", "")) {
  fail("leadId / fiche sans e-mail ni tél. ne doit pas matcher");
} else pass("sans identité → pas de match");
if (!ident.identityMatchesLead({ email: "marie.hafner@test.fr" }, {}, "marie.hafner@test.fr", "")) {
  fail("e-mail identique doit matcher");
} else pass("e-mail correspondant");
if (ident.identityMatchesLead({ email: "marie.hafner@test.fr" }, {}, "autre@test.fr", "")) {
  fail("e-mail différent ne doit pas matcher");
} else pass("e-mail différent refusé");
if (!ident.identityMatchesLead({ phone: "06 12 34 56 78" }, {}, "", "0612345678")) {
  fail("téléphone normalisé doit matcher");
} else pass("téléphone correspondant");

var api = read("api/_lib/routes/external-resume-deposit.js");
if (api.indexOf("identityMatchesLead") === -1) {
  fail("resume-deposit n’exige pas l’identité pour un leadId");
} else pass("GET resume-deposit : identité obligatoire avec leadId");
if (api.indexOf("found: false") === -1 && api.indexOf("found:false") === -1) {
  fail("resume-deposit doit renvoyer found:false si identité absente");
} else pass("leadId seul → found:false");

var fill = read("js/acheteur-immo-fill-mode.js");
["isBlankDepositStart", "hasExplicitResumeIntent", "isConseillerContext"].forEach(function (fn) {
  if (fill.indexOf(fn) === -1) fail("fill-mode manque " + fn);
  else pass("fill-mode " + fn);
});

var guide = read("js/acheteur-immo-deposit-guide.js");
["beginBlankDeposit", "detachLeadIdentity", "isBlankDepositStart", "lo_immo_session_intent"].forEach(function (s) {
  if (guide.indexOf(s) === -1) fail("deposit-guide manque " + s);
  else pass("deposit-guide " + s);
});
if (guide.indexOf("creds.leadId && (creds.email || creds.phone)") === -1) {
  fail("fetchServerDraft peut encore appeler l’API avec un leadId seul");
} else pass("API reprise : leadId seulement avec e-mail ou tél");

var qi = read("js/quote-intelligence.js");
if (qi.indexOf("shouldSkipLocalDraftRestore") === -1) {
  fail("quote-intelligence restaure encore le brouillon en mode conseiller");
} else pass("quote-intelligence ignore le brouillon en dépôt conseiller vierge");

var acc = read("js/acheteur-immo-account.js");
if (acc.indexOf("skipClientSessionPrefill") === -1) {
  fail("account préremplit encore la session client en mode conseiller");
} else pass("account ne préremplit pas la session en dépôt conseiller vierge");

var html = read("landings/acheteur-immo.html");
if (html.indexOf("acheteur-immo-deposit-guide.js?v=20260826priv1") === -1) {
  fail("cache-bust deposit-guide manquant");
} else pass("cache-bust dépôt conseiller");

require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "../api/_lib/resume-identity.js")]);
require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "../js/acheteur-immo-deposit-guide.js")]);
require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "../js/acheteur-immo-fill-mode.js")]);
require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "../js/quote-intelligence.js")]);
require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "../js/acheteur-immo-account.js")]);
pass("syntaxe JS");

process.exit(ok ? 0 : 1);
