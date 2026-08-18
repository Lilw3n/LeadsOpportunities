#!/usr/bin/env node
/** Vérifie le contenu local bassin nancéien — acquéreurs autour de Saint-Nicolas-de-Port. */
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

var lib = require("./bassin-nance-local-lib.cjs");
assert(lib.isBassinCity({ slug: "varangeville", dept: "meurthe-et-moselle" }), "Varangeville = bassin");
assert(lib.isAcquereurRayonSaintNicolas({ slug: "art-sur-meurthe" }), "Art-sur-Meurthe = rayon acquéreur");
assert(lib.isAcquereurRayonSaintNicolas({ slug: "haroue" }), "Haroué = rayon acquéreur");
assert(lib.seoSections({ slug: "saint-nicolas-de-port", dept: "meurthe-et-moselle" }).length >= 2, "sections SEO");

var hub = read("immobilier/nancy-metropole/index.html");
["mine de sel", "Solvay", "basilique", "Saint-Nicolas", "Art-sur-Meurthe", "Haroué"].forEach(function (kw) {
  assert(hub.toLowerCase().indexOf(kw.toLowerCase()) >= 0, "hub contient " + kw);
});
assert(hub.indexOf("data-nancy-bassin-communes") >= 0, "hub puces communes acquéreur");

["landings/credit-immo.html", "landings/acheteur-immo.html", "landings/projection-achat.html"].forEach(function (p) {
  var html = read(p);
  assert(html.indexOf("nancy-bassin-local") >= 0, p + " bannière locale");
});

var bannerJs = read("js/nancy-bassin-local.js");
assert(bannerJs.indexOf("Art-sur-Meurthe") >= 0, "bannière JS Art-sur-Meurthe");
assert(bannerJs.indexOf("Haroué") >= 0, "bannière JS Haroué");

var cities = JSON.parse(read("seo/france-cities.json"));
[
  "varangeville",
  "dombasle-sur-meurthe",
  "saint-nicolas-de-port",
  "art-sur-meurthe",
  "haroue",
  "laneuveville-devant-nancy",
  "tomblaine",
].forEach(function (slug) {
  assert(
    cities.some(function (c) {
      return c.slug === slug;
    }),
    "ville SEO " + slug
  );
});

var gsc = read("scripts/seo-gsc-priority-urls.cjs");
assert(gsc.indexOf("/immobilier/nancy-metropole/") >= 0, "GSC hub nancy");
assert(gsc.indexOf("/recherche-bien/art-sur-meurthe/") >= 0, "GSC Art-sur-Meurthe");
assert(gsc.indexOf("/recherche-bien/haroue/") >= 0, "GSC Haroué");

process.exit(failed ? 1 : 0);
