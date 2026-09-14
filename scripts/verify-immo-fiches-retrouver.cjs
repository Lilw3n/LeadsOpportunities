#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
var failed = 0;
function assert(c, m) {
  if (!c) {
    failed++;
    console.log("FAIL", m);
  } else console.log("OK  ", m);
}
function read(r) {
  return fs.readFileSync(path.join(root, r), "utf8");
}
var store = read("js/crm-immo-store.js");
var page = read("js/crm-immo-properties-page.js");
var html = read("crm-immo-properties.html");
assert(store.indexOf("mergeEntityLists") >= 0, "merge sync local+serveur");
assert(store.indexOf('pushEntity(pushKind, local)') >= 0, "re-push fiches locales manquantes");
assert(store.indexOf("saveLocal(merged)") >= 0, "saveLocal(merged) pas écrasement aveugle");
assert(store.indexOf("saveLocal(data.db)") < 0, "plus de saveLocal(data.db) direct");
assert(page.indexOf("formatWhen") >= 0, "format date modif");
assert(page.indexOf("exportInventory") >= 0, "export inventaire");
assert(page.indexOf("Modifié le") >= 0, "libellé Modifié le sur cartes");
assert(page.indexOf('act === "inventory"') >= 0, "action inventory");
assert(html.indexOf('data-act="inventory"') >= 0, "bouton Inventaire fiches");
assert(html.indexOf("piges-hint") >= 0, "bandeau aide");
assert(html.indexOf(".immo-when") >= 0, "CSS date");
var pkg = JSON.parse(read("package.json"));
assert(pkg.scripts["verify:immo-fiches-retrouver"], "npm script");
if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK verify-immo-fiches-retrouver");
