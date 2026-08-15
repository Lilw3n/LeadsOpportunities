#!/usr/bin/env node
/**
 * Vérifie le silo SEO VTC Île-de-France (pages + images).
 */
var fs = require("fs");
var path = require("path");
var Img = require("../scripts/seo-images-lib.cjs");
var Idf = require("../scripts/seo-vtc-idf-pages.cjs");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function exists(rel) {
  return fs.existsSync(path.join(__dirname, "..", rel));
}

function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

assert(Idf.ARRONDISSEMENTS.length === 20, "20 arrondissements");
assert(Idf.getVtcIdfSitemapEntries("https://x").length >= 27, "sitemap IDF >= 27 URLs");

Object.keys(Img.UNSPLASH).forEach(function (rel) {
  var p = "images/seo/" + rel;
  assert(exists(p) && fs.statSync(path.join(__dirname, "..", p)).size > 8000, "photo " + rel);
});

assert(exists("assurance-vtc/ile-de-france/index.html"), "hub IDF généré");
assert(exists("assurance-vtc/aeroport-cdg/index.html"), "page CDG");
assert(exists("assurance-vtc/aeroport-orly/index.html"), "page Orly");
assert(exists("assurance-vtc/la-defense/index.html"), "page La Défense");
assert(exists("assurance-vtc/paris-15e/index.html"), "Paris 15e");
assert(exists("assurance-vtc/puteaux/index.html"), "ville Puteaux");
assert(exists("assurance-vtc/saint-ouen-sur-seine/index.html"), "Saint-Ouen");

var hub = read("assurance-vtc/ile-de-france/index.html");
assert(hub.indexOf("images/seo/vtc/paris-eiffel.jpg") >= 0, "hub : photo Paris");
assert(hub.indexOf("og:image") >= 0 && hub.indexOf("og-vtc.jpg") >= 0, "hub : OG jpg");
assert(hub.indexOf("ImageObject") >= 0, "hub : schema ImageObject");
assert(hub.indexOf("seo-gallery") >= 0, "hub : galerie");

var paris = read("assurance-vtc/paris/index.html");
assert(paris.indexOf("images/seo/vtc/") >= 0, "Paris : image hero");
assert(paris.indexOf("ile-de-france") >= 0, "Paris : lien hub IDF");

var gen = read("scripts/generate-seo-pages.cjs");
assert(gen.indexOf("buildVtcIdfPages") >= 0, "générateur branche IDF");

var sm = read("sitemap-main.xml");
assert(sm.indexOf("/assurance-vtc/ile-de-france/") >= 0, "sitemap hub IDF");
assert(sm.indexOf("/assurance-vtc/paris-15e/") >= 0, "sitemap Paris 15e");

["scripts/seo-images-lib.cjs", "scripts/seo-vtc-idf-pages.cjs", "scripts/generate-seo-pages.cjs", "scripts/seo-geo-lib.cjs"].forEach(
  function (rel) {
    require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
    assert(true, "syntaxe " + rel);
  }
);

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nSEO VTC Île-de-France OK.");
