#!/usr/bin/env node
/** Vérifie la mise en avant publique des apporteurs (sans promesse chiffrée). */
var fs = require("fs");
var path = require("path");
var Rel = require("../js/crm-people-relations-lib.js");
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

assert(Rel.NO_PROMISE.indexOf("rémunération") !== -1, "NO_PROMISE mentionne rémunération");
assert(/promis/i.test(Rel.NO_PROMISE), "NO_PROMISE dit qu'il n'y a pas de promesse");
assert(Rel.NO_PROMISE.indexOf("conclusion") !== -1, "NO_PROMISE : dossier finalisé");
assert(Rel.APPORTEUR_COMPLETION.indexOf("aboutit") !== -1, "APPORTEUR_COMPLETION");

var landing = read("landings/apporteur-affaires.html");
assert(landing.indexOf("data-callback-need=\"apporteur-affaires\"") !== -1, "formulaire apporteur");
assert(read("index.html").indexOf("apporteur-affaires.html") !== -1, "bannière accueil");
assert(read("js/service-catalog.js").indexOf("apporteur-affaires") !== -1, "catalogue service");

process.exit(failed ? 1 : 0);
