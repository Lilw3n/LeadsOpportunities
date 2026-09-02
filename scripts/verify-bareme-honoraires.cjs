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
assert(html.indexOf('id="estimation"') >= 0, "section estimation");
assert(html.indexOf("Matterport") >= 0, "mention Matterport");
assert(html.indexOf("deposer-bien") >= 0, "lien dépôt de bien");
assert(/pas de projet de vente/i.test(html), "texte sans projet de vente");
assert(/appareil photo/i.test(html), "mention appareil photo");
assert(html.indexOf("data-estim-price") >= 0, "champ prix estimation");
assert(html.indexOf("estimation-request.js") >= 0, "script estimation prix");
assert(html.indexOf("../assurances/") >= 0 && html.indexOf("../finance/") >= 0, "menu complet page bareme");

var immo = read("immobilier/index.html");
assert(immo.indexOf("data-estim-price") >= 0, "champ prix estimation hub immo");
assert(immo.indexOf("estimation-request.js") >= 0, "script estimation hub immo");
assert(immo.indexOf("../assurances/") >= 0 && immo.indexOf("bareme-honoraires") >= 0, "menu hub immo + barème");
assert(fs.existsSync(path.join(root, "js/estimation-request.js")), "estimation-request.js");

var js = read("js/bareme-honoraires-public.js");
assert(js.indexOf("bareme-honoraires-public.json") >= 0, "charge JSON publié");

assert(read("immobilier/index.html").indexOf("bareme-honoraires") >= 0, "lien hub immo");
assert(read("immobilier/index.html").indexOf('id="bareme"') >= 0, "section bareme hub immo");
assert(read("immobilier/index.html").indexOf('id="estimation"') >= 0, "section estimation hub immo");
assert(read("immobilier/index.html").indexOf("immobilier-bareme-embed.js") >= 0, "embed JS hub immo");
assert(fs.existsSync(path.join(root, "js/immobilier-bareme-embed.js")), "embed JS fichier");
assert(read("crm-agency-fees.html").indexOf("bareme-honoraires") >= 0, "lien CRM");
assert(read("index.html").indexOf("bareme-honoraires") >= 0, "lien footer accueil");
assert(read("vercel.json").indexOf("/bareme-honoraires") >= 0, "rewrite Vercel");

var lib = read("js/crm-agency-fees-lib.js");
assert(lib.indexOf("publicOnSite: true") >= 0, "flag publicOnSite Portes Clés");

process.exit(failed ? 1 : 0);
