#!/usr/bin/env node
/** Vérifie le bloc vente 3D (divorce, décès, déménagement). */
var fs = require("fs");
var path = require("path");
var Msg = require("../js/vente-3d-messaging-lib.js");
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

assert(/divorce/i.test(Msg.LEAD), "LEAD divorce");
assert(/décès|deces/i.test(Msg.LEAD), "LEAD décès");
assert(/déménagement|demenagement/i.test(Msg.LEAD), "LEAD déménagement");
assert(Msg.ITEMS.length === 3, "3 situations 3D");
assert(fs.existsSync(path.join(root, "blog", Msg.BLOG_SLUG)), "article blog 3D");

[
  "index.html",
  "landings/acheteur-immo.html",
  "landings/chasseur-bien.html",
  "landings/credit-immo.html",
  "landings/projection-achat.html",
].forEach(function (page) {
  var html = read(page);
  assert(html.indexOf("data-vente-3d-block") !== -1, page + " : bloc 3D");
  assert(html.indexOf("vente-3d-messaging-lib.js") !== -1, page + " : lib");
});

assert(
  read("scripts/seo-gsc-priority-urls.cjs").indexOf("vente-immobiliere-3d-divorce-deces-demenagement") !== -1,
  "URL GSC prioritaire"
);
assert(/divorce|décès|déménagement|3D/i.test(read("index.html")), "accueil : FAQ 3D");

process.exit(failed ? 1 : 0);
