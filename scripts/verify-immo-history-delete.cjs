#!/usr/bin/env node
/** Historique fiche : suppression unitaire + tout supprimer. */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
var failed = 0;
function ok(c, m) {
  if (!c) {
    failed++;
    console.log("FAIL", m);
  } else console.log("OK  ", m);
}
function read(r) {
  return fs.readFileSync(path.join(root, r), "utf8");
}

var page = read("js/crm-immo-property-page.js");
ok(page.indexOf("immo-hist-del") >= 0, "bouton Supprimer par ligne");
ok(page.indexOf("btnHistClearAll") >= 0, "bouton Tout supprimer");
ok(page.indexOf("Supprimer cet enregistrement") >= 0, "confirm suppression unitaire");
ok(/hist\.splice\(idx,\s*1\)/.test(page), "splice entrée historique");
ok(page.indexOf("persistHistoryAndRerender") >= 0, "persist après suppression");
ok(page.indexOf("Store.upsertProperty(prop)") >= 0, "upsert store");

var html = read("crm-immo-property.html");
ok(html.indexOf("immo-history-actions") >= 0, "styles actions historique");
ok(html.indexOf("immo-hist-del") >= 0, "style bouton supprimer");

if (failed) {
  console.log(failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK verify-immo-history-delete");
