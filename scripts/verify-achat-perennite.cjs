#!/usr/bin/env node
/** Vérifie le bloc conseil achat durable / pérennité. */
var fs = require("fs");
var path = require("path");
var Msg = require("../js/achat-perennite-messaging-lib.js");
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

assert(/bonne décision|bonne decision/i.test(Msg.HEADLINE), "titre bonne décision");
assert(/autre bien|convien/i.test(Msg.LEAD), "proposer un autre bien");
assert(/pérennité|perennite|travaux/i.test(Msg.LEAD + Msg.REASSURANCE_BODY), "pérennité / travaux");
assert(Msg.PILLARS.length >= 4, "4 piliers");

["landings/acheteur-immo.html", "landings/projection-achat.html", "landings/chasseur-bien.html"].forEach(
  function (page) {
    var html = read(page);
    assert(html.indexOf("data-achat-perennite-block") !== -1, page + " : bloc pérennité");
    assert(html.indexOf("achat-perennite-messaging-lib.js") !== -1, page + " : lib");
  }
);

assert(/pérennité|perennite|bonne décision/i.test(read("index.html")), "accueil : pérennité");

process.exit(failed ? 1 : 0);
