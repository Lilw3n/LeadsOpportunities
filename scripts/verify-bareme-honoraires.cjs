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
  "js/bareme-honoraires-lib.js",
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
var locHab = (data.schedules || []).find(function (s) {
  return s.kind === "location_habitation";
});
assert(locHab && locHab.perSqm && locHab.perSqm.negotiationTtcPerM2 === 10, "location négo 10 €/m²");
assert(locHab.perSqm.etatDesLieuxTtcPerM2 === 3.03, "EDL 3,03 €/m²");
assert(locHab.perSqm.dossierTtcPerM2["tres-tendue"] === 12.1, "dossier très tendue 12,10");
assert(locHab.perSqm.dossierTtcPerM2.tendue === 10.09, "dossier tendue 10,09");
assert(locHab.perSqm.dossierTtcPerM2.hors === 8.07, "dossier hors zone 8,07");

var bail = (data.schedules || []).find(function (s) {
  return s.kind === "bail_commercial";
});
assert(bail && bail.percentValue === 30 && bail.minimumHt === 7000, "bail com 30 % HT mini 7000");

var locPro = (data.schedules || []).find(function (s) {
  return s.kind === "location_pro";
});
assert(locPro && locPro.percentValue === 18, "location pro 18 % TTC");

var ventePro = (data.schedules || []).find(function (s) {
  return s.kind === "vente_pro";
});
assert(ventePro && ventePro.brackets && ventePro.brackets[0].value === 10, "vente pro 10 %");

var Lib = require(path.join(root, "js/bareme-honoraires-lib.js"));
var loc50 = Lib.computeLocationHabitation(50, "tendue");
assert(loc50.ok && loc50.bailleurTtc === 1156 && loc50.locataireTtc === 656, "50 m² zone tendue 1156 / 656");
assert(loc50.totalAgenceTtc === 1812, "total agence 50 m² tendue = 1812");
var locHors = Lib.computeLocationHabitation(50, "hors_zone");
assert(locHors.ok && locHors.zone.id === "hors" && locHors.bailleurTtc === 1055, "alias hors_zone + 50 m² hors = 1055");
var bailMin = Lib.computeBailCommercial(20000);
assert(bailMin.ok && bailMin.appliedMinimum && bailMin.honorairesHt === 7000 && bailMin.honorairesTtc === 8400, "bail com mini 7000 HT / 8400 TTC");
var bailOk = Lib.computeBailCommercial(30000);
assert(bailOk.ok && !bailOk.appliedMinimum && bailOk.honorairesHt === 9000, "bail com 30 % de 30k = 9000 HT");
var pro = Lib.computeLocationPro(12000);
assert(pro.ok && pro.honorairesTtc === 2160, "location pro 18 % de 12000 = 2160");
var autres = Lib.computeVenteAutres(200000);
assert(autres.ok && autres.honorairesTtc === 20000 && autres.fai === 220000, "vente pro 10 %");
var avis = Lib.computeAvisValeur("appartement", 42);
assert(avis.ok && avis.eligibleForfait && avis.honorairesTtc === 360, "avis appart < 50 m² = 360");
var avisDevis = Lib.computeAvisValeur("maison", 120);
assert(avisDevis.ok && !avisDevis.eligibleForfait, "avis maison ≥ 100 m² = devis");

var html = read("bareme-honoraires/index.html");
assert(html.indexOf("bhPrice") >= 0, "estimateur vente");
assert(html.indexOf('id="location"') >= 0 && html.indexOf("bhLocSurface") >= 0, "simulateur location habitation");
assert(html.indexOf('id="location-pro"') >= 0 && html.indexOf("bhLocProRent") >= 0, "simulateur location pro");
assert(html.indexOf('id="bail-commercial"') >= 0 && html.indexOf("bhBailRent") >= 0, "simulateur bail commercial");
assert(html.indexOf('id="vente-autres"') >= 0 && html.indexOf("bhProPrice") >= 0, "simulateur vente autres");
assert(html.indexOf('id="avis-valeur"') >= 0 && html.indexOf("bhAvisSurface") >= 0, "simulateur avis de valeur");
assert(html.indexOf("bareme-honoraires-lib.js") >= 0, "lib barème");
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
assert(js.indexOf("computeLocationHabitation") >= 0, "JS public appelle lib location");
assert(js.indexOf("computeBailCommercial") >= 0, "JS public appelle lib bail com");

assert(read("immobilier/index.html").indexOf("bareme-honoraires") >= 0, "lien hub immo");
assert(read("immobilier/index.html").indexOf('id="bareme"') >= 0, "section bareme hub immo");
assert(read("immobilier/index.html").indexOf('id="estimation"') >= 0, "section estimation hub immo");
assert(read("immobilier/index.html").indexOf("immobilier-bareme-embed.js") >= 0, "embed JS hub immo");
assert(read("immobilier/index.html").indexOf("bareme-honoraires-lib.js") >= 0, "lib sur hub immo");
assert(read("immobilier/index.html").indexOf("immoLocProRent") >= 0, "simulateur loc pro hub immo");
assert(read("immobilier/index.html").indexOf("immoBailRent") >= 0, "simulateur bail com hub immo");
assert(read("immobilier/location/index.html").indexOf("immoLocSurface") >= 0, "simulateur location sous-hub");
assert(fs.existsSync(path.join(root, "js/immobilier-bareme-embed.js")), "embed JS fichier");
assert(read("crm-agency-fees.html").indexOf("bareme-honoraires") >= 0, "lien CRM");
assert(read("index.html").indexOf("bareme-honoraires") >= 0, "lien footer accueil");
assert(read("vercel.json").indexOf("/bareme-honoraires") >= 0, "rewrite Vercel");

var lib = read("js/crm-agency-fees-lib.js");
assert(lib.indexOf("publicOnSite: true") >= 0, "flag publicOnSite Portes Clés");
assert(lib.indexOf("negotiation: 10") >= 0, "CRM négo location 10 €/m²");
assert(lib.indexOf("minFeeHt: 7000") >= 0, "CRM bail com mini 7000 HT");

process.exit(failed ? 1 : 0);
