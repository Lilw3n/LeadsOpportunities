#!/usr/bin/env node
/** Vérifie le bloc valeur client / honoraires sur les pages clés. */
var fs = require("fs");
var path = require("path");
var Msg = require("../js/client-value-messaging-lib.js");
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

assert(/centralisé|centralise/i.test(Msg.VALUE_HEADLINE), "VALUE_HEADLINE : travail centralisé");
assert(/prix/i.test(Msg.VALUE_LEAD), "VALUE_LEAD : prix");
assert(/honoraires|commission/i.test(Msg.HONORAIRES_BODY), "HONORAIRES_BODY");
assert(Msg.VALUE_PILLARS.length >= 3, "3 piliers valeur");

["index.html", "landings/acheteur-immo.html", "landings/chasseur-bien.html", "landings/credit-immo.html"].forEach(
  function (page) {
    var html = read(page);
    assert(html.indexOf("data-client-value-block") !== -1, page + " : bloc valeur");
    assert(html.indexOf("client-value-messaging-lib.js") !== -1, page + " : lib messaging");
  }
);

var index = read("index.html");
assert(/honoraires|commission/i.test(index), "FAQ honoraires accueil");

process.exit(failed ? 1 : 0);
