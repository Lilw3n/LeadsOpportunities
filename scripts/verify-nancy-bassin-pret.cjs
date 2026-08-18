#!/usr/bin/env node
/** Vérifie le SEO prêt bassin Nancy (54) — priorité locale impérative. */
var fs = require("fs");
var path = require("path");
var bassin = require("./nancy-bassin-pret-lib.cjs");
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

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

assert(bassin.COMMUNES.length >= 20, "communes bassin");
assert(bassin.isBassinCity({ slug: "varangeville" }), "Varangéville");
assert(bassin.isBassinCity({ slug: "jarville-la-malgrange" }), "Jarville");

["jarville-la-malgrange", "varangeville", "maxeville", "saint-nicolas-de-port"].forEach(function (slug) {
  assert(exists("pret-immobilier/" + slug + "/index.html"), "page pret " + slug);
  var html = read("pret-immobilier/" + slug + "/index.html");
  assert(html.indexOf("Nancy") !== -1 || html.indexOf("bassin") !== -1 || html.indexOf("54") !== -1, slug + " contenu local");
  assert(html.indexOf("Varangéville") !== -1 || slug !== "varangeville", "Varangéville mention");
});

assert(exists("pret-immobilier/nancy-metropole/index.html"), "hub pret nancy-metropole");
assert(exists("credit-immo/nancy-metropole/index.html"), "hub credit nancy-metropole");
assert(read("pret-immobilier/nancy-metropole/index.html").indexOf("Jarville") !== -1, "hub Jarville");
assert(read("pret-immobilier/nancy-metropole/index.html").indexOf("Varengeville") !== -1, "hub typo Varengeville");

assert(read("scripts/seo-gsc-priority-urls.cjs").indexOf("nancy-metropole") !== -1, "GSC priorité");
assert(read("js/nancy-bassin-local.js").indexOf("varengeville") !== -1, "bannière JS");
assert(read("landings/credit-immo.html").indexOf("nancy-bassin-local.js") !== -1, "landing credit script");

var cities = JSON.parse(read("seo/france-cities.json"));
bassin.allSlugs().forEach(function (slug) {
  if (slug === "nancy") return;
  assert(
    cities.some(function (c) {
      return c.slug === slug;
    }),
    "ville JSON " + slug
  );
});

process.exit(failed ? 1 : 0);
