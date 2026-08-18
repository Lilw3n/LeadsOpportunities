#!/usr/bin/env node
/** Vérifie le bloc vente 3D et situations complexes. */
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
assert(/viager|SCI|bénéficiaires|beneficiaires/i.test(Msg.LEAD), "LEAD situations complexes");
assert(Msg.ITEMS.length === 3, "3 situations 3D");
assert(Msg.COMPLEX_CASES && Msg.COMPLEX_CASES.length >= 5, "cas complexes");
assert(
  Msg.COMPLEX_CASES.some(function (c) {
    return /viager/i.test(c.label);
  }),
  "cas viager"
);
assert(
  Msg.COMPLEX_CASES.some(function (c) {
    return /SCI/i.test(c.label);
  }),
  "cas SCI"
);
assert(
  Msg.COMPLEX_CASES.some(function (c) {
    return /pro|professionnel/i.test(c.label);
  }),
  "cas locaux pro"
);
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
assert(/viager|SCI|héritiers|heritiers/i.test(read("index.html")), "accueil : FAQ élargie");
assert(/viager|SCI|héritiers|heritiers/i.test(read("landings/acheteur-immo.html")), "acquéreur : FAQ élargie");
assert(/viager|SCI familiale/i.test(read("scripts/blog-articles-manifest.cjs")), "blog : sections complexes");

process.exit(failed ? 1 : 0);
