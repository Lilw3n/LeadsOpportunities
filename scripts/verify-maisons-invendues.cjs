#!/usr/bin/env node
/** Vérifie contenu maisons invendues + matching acquéreurs. */
var fs = require("fs");
var path = require("path");
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

var articles = require("./blog-maisons-invendues-articles.cjs");
assert(articles.length >= 5, "5+ articles invendus");

var lib = require("./maisons-invendues-lib.cjs");
assert(lib.UNSOLD_CONTEXTS.length >= 8, "8 contextes invendus");
assert(lib.vendeurUnsoldSections({ name: "Nancy" }).length >= 2, "sections SEO vendeur");

var hub = read("immobilier/maisons-invendues/index.html");
["invendu", "acquéreur", "négociateur", "finançable"].forEach(function (kw) {
  assert(hub.toLowerCase().indexOf(kw.toLowerCase()) >= 0, "hub " + kw);
});

articles.forEach(function (a) {
  assert(fs.existsSync(path.join(root, "blog", a.file)), "blog " + a.file);
});

var landing = read("landings/acheteur-immo.html");
assert(landing.indexOf("bien-invendu") >= 0, "landing section invendu");
assert(landing.indexOf("sellerUnsoldReason") >= 0, "champs vendeur invendu");

var q = read("js/questionnaire-config.js");
assert(q.indexOf("vendeur-immo") >= 0, "questionnaire vendeur-immo");

var map = JSON.parse(read("data/blog-questionnaire-map.json"));
assert(map.articles["maison-ne-se-vend-pas-pourquoi-que-faire-2026.html"], "bridge hub invendu");

var gsc = read("scripts/seo-gsc-priority-urls.cjs");
assert(gsc.indexOf("/immobilier/maisons-invendues/") >= 0, "GSC hub invendus");

process.exit(failed ? 1 : 0);
