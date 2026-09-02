#!/usr/bin/env node
/** Vérifie la page publique barème des honoraires. */
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

[
  "bareme-honoraires/index.html",
  "js/bareme-honoraires-public.js",
  "css/bareme-honoraires.css",
  "data/bareme-honoraires-public.json",
].forEach(function (f) {
  assert(fs.existsSync(path.join(root, f)), f + " existe");
});

var data = JSON.parse(read("data/bareme-honoraires-public.json"));
assert(data.agencyId === "agency_portes_cles", "agence publique Portes Clés");
var hab = (data.schedules || []).find(function (s) {
  return s.kind === "vente_habitation";
});
assert(hab && Array.isArray(hab.brackets) && hab.brackets.length >= 23, "23 paliers habitation");
assert(hab.brackets[5].value === 10000 && hab.brackets[5].min === 150001, "palier 150k–200k = 10k");

var html = read("bareme-honoraires/index.html");
assert(html.indexOf("bhPrice") >= 0, "estimateur");
assert(html.indexOf("bareme-honoraires-public.js") >= 0, "script public");
assert(html.indexOf("canonical") >= 0, "canonical");

var js = read("js/bareme-honoraires-public.js");
assert(js.indexOf("bareme-honoraires-public.json") >= 0, "charge JSON publié");

assert(read("immobilier/index.html").indexOf("bareme-honoraires") >= 0, "lien hub immo");
assert(read("crm-agency-fees.html").indexOf("bareme-honoraires") >= 0, "lien CRM");
assert(read("index.html").indexOf("bareme-honoraires") >= 0, "lien footer accueil");
assert(read("vercel.json").indexOf("/bareme-honoraires") >= 0, "rewrite Vercel");

var lib = read("js/crm-agency-fees-lib.js");
assert(lib.indexOf("publicOnSite: true") >= 0, "flag publicOnSite Portes Clés");

process.exit(failed ? 1 : 0);
