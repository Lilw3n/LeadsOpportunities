#!/usr/bin/env node
/** Vérifie le bloc information risques crédit / endettement. */
var fs = require("fs");
var path = require("path");
var Msg = require("../js/pret-risks-messaging-lib.js");
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

assert(/endett/i.test(Msg.RISK_HEADLINE), "titre endettement");
assert(/divorce|séparation|separation/i.test(Msg.RISK_LEAD), "divorce / séparation");
assert(/danger|serein|durée|durer/i.test(Msg.REASSURANCE_BODY), "réassurance");
assert(Msg.RISK_POINTS.length >= 3, "3 points risque");

["landings/credit-immo.html", "landings/projection-achat.html", "landings/acheteur-immo.html"].forEach(
  function (page) {
    var html = read(page);
    assert(html.indexOf("data-pret-risks-block") !== -1, page + " : bloc risques");
    assert(html.indexOf("pret-risks-messaging-lib.js") !== -1, page + " : lib");
  }
);

assert(/divorce|séparation|separation/i.test(read("index.html")), "FAQ risques accueil");

process.exit(failed ? 1 : 0);
