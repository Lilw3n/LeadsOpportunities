#!/usr/bin/env node
/**
 * Verifie le silo garanties taxi (page catalogue + alias + hub + landing).
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

assert(exists("assurance-taxi/index.html"), "hub taxi present");
assert(exists("assurance-taxi/garanties/index.html"), "page garanties presente");
assert(exists("assurance-taxi/garanties-obligatoires/index.html"), "page garanties-obligatoires presente");

var g = read("assurance-taxi/garanties/index.html");
[
  "seo-guarantee-grid",
  "seo-guarantee-chip",
  'id="conducteur"',
  'id="rc-auto"',
  'id="tpt"',
  'id="rc-pro"',
  'id="bris-de-glace"',
  'id="vol"',
  'id="incendie"',
  'id="dommages"',
  'id="vehicule-relais"',
  'id="perte-exploitation"',
  "seo-callout",
  "landings/taxi.html",
  "Assurance du conducteur taxi",
  "Transport de personnes a titre onereux",
].forEach(function (needle) {
  assert(g.indexOf(needle) !== -1, "garanties contient: " + needle);
});

var o = read("assurance-taxi/garanties-obligatoires/index.html");
assert(/garanties obligatoires/i.test(o), "alias obligatoire OK");
assert(o.indexOf("/assurance-taxi/garanties/") !== -1, "alias pointe vers catalogue");

var hub = read("assurance-taxi/index.html");
assert(hub.indexOf("/assurance-taxi/garanties/") !== -1, "hub lie vers garanties");
assert(hub.indexOf("seo-guarantee-grid") !== -1 || hub.indexOf("Panorama des garanties") !== -1, "hub panorama garanties");
assert(hub.indexOf("Nos services d assurances pour taxi") !== -1, "hub services taxi");

var landing = read("landings/taxi.html");
assert(landing.indexOf("Garanties taxi a comparer") !== -1, "landing section garanties");
assert(landing.indexOf("../assurance-taxi/garanties/") !== -1, "landing liens catalogue");
assert(landing.indexOf('name="need" value="taxi"') !== -1, "landing need=taxi");

var css = read("seo/seo-pages.css");
assert(css.indexOf(".seo-guarantee-grid") !== -1, "CSS grille garanties");
assert(css.indexOf(".seo-callout") !== -1, "CSS callout");
assert(css.indexOf(".seo-page--taxi") !== -1, "CSS theme taxi");

var sm = "";
["sitemap.xml", "sitemap-main.xml", "seo/generated-sitemap-fragment.xml"].forEach(function (f) {
  if (exists(f)) sm += read(f);
});
assert(sm.indexOf("/assurance-taxi/") !== -1, "sitemap hub taxi");
assert(sm.indexOf("/assurance-taxi/garanties/") !== -1, "sitemap garanties");
assert(sm.indexOf("/assurance-taxi/garanties-obligatoires/") !== -1, "sitemap garanties-obligatoires");

assert(exists("scripts/taxi-garanties-content.cjs"), "source contenu garanties");
assert(exists("scripts/niche-taxi-pages.cjs"), "niche taxi pages");

if (failed) {
  console.log("\n" + failed + " echec(s)");
  process.exit(1);
}
console.log("\nAll taxi garanties checks passed");
