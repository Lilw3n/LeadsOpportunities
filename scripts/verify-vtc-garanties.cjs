#!/usr/bin/env node
/**
 * Verifie le silo garanties VTC (page catalogue + alias + hub + landing).
 */
var fs = require("fs");
var path = require("path");
var ROOT = path.join(__dirname, "..");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

assert(exists("assurance-vtc/garanties/index.html"), "page garanties presente");
assert(exists("assurance-vtc/garanties-obligatoires/index.html"), "page garanties-obligatoires presente");

var g = read("assurance-vtc/garanties/index.html");
[
  "seo-guarantee-grid",
  "seo-guarantee-chip",
  'id="conducteur"',
  'id="rc-auto"',
  'id="recours"',
  'id="bris-de-glace"',
  'id="vol"',
  'id="incendie"',
  'id="dommages"',
  'id="panne"',
  'id="immobilisation"',
  'id="rc-pro"',
  "seo-callout",
  "landings/vtc.html",
  "Assurance du conducteur VTC",
  "Responsabilite civile professionnelle VTC",
].forEach(function (needle) {
  assert(g.indexOf(needle) !== -1, "garanties contient: " + needle);
});

var o = read("assurance-vtc/garanties-obligatoires/index.html");
assert(/garanties obligatoires/i.test(o), "alias obligatoire OK");
assert(o.indexOf("/assurance-vtc/garanties/") !== -1, "alias pointe vers catalogue");

var hub = read("assurance-vtc/index.html");
assert(hub.indexOf("/assurance-vtc/garanties/") !== -1, "hub lie vers garanties");
assert(hub.indexOf("seo-guarantee-grid") !== -1 || hub.indexOf("Panorama des garanties") !== -1, "hub panorama garanties");

var landing = read("landings/vtc.html");
assert(landing.indexOf("Garanties VTC a comparer") !== -1, "landing section garanties");
assert(landing.indexOf("../assurance-vtc/garanties/") !== -1, "landing liens catalogue");

var css = read("seo/seo-pages.css");
assert(css.indexOf(".seo-guarantee-grid") !== -1, "CSS grille garanties");
assert(css.indexOf(".seo-callout") !== -1, "CSS callout");

var sm = "";
["sitemap.xml", "sitemap-main.xml", "seo/generated-sitemap-fragment.xml"].forEach(function (f) {
  if (exists(f)) sm += read(f);
});
assert(sm.indexOf("/assurance-vtc/garanties/") !== -1, "sitemap garanties");
assert(sm.indexOf("/assurance-vtc/garanties-obligatoires/") !== -1, "sitemap garanties-obligatoires");

assert(exists("scripts/vtc-garanties-content.cjs"), "source contenu garanties");
assert(exists("scripts/niche-vtc-pages.cjs"), "niche VTC pages");

if (failed) {
  console.log("\n" + failed + " echec(s)");
  process.exit(1);
}
console.log("\nAll VTC garanties checks passed");
