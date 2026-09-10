#!/usr/bin/env node
/** Vérifie SEO recherche-bien bassin Nancy (54) + capture critères acquéreur. */
var fs = require("fs");
var path = require("path");
var bassin = require("./nancy-bassin-pret-lib.cjs");
var Crit = require("../api/_lib/buyer-criteria-from-lead.js");
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

assert(bassin.COMMUNES.length >= 35, "communes bassin");
assert(typeof bassin.rechercheTitle === "function", "rechercheTitle");
assert(typeof bassin.buildHubPages === "function", "buildHubPages");

assert(exists("recherche-bien/nancy-metropole/index.html"), "hub recherche nancy-metropole");
var hub = read("recherche-bien/nancy-metropole/index.html");
assert(hub.indexOf("Jarville") !== -1, "hub Jarville");
assert(hub.indexOf("Varangéville") !== -1, "hub Varangéville");
assert(hub.indexOf("Varengeville") === -1, "pas de Varengeville");
assert(hub.indexOf("Dombasle") !== -1, "hub Dombasle");
assert(hub.indexOf("Houdemont") !== -1, "hub Houdemont");
assert(hub.indexOf("acheteur-immo.html") !== -1, "hub CTA acheteur");
assert(hub.indexOf("Déposer ma recherche") !== -1 || hub.indexOf("deposer") !== -1 || hub.indexOf("critères") !== -1 || hub.indexOf("criteres") !== -1, "hub message critères");

["jarville-la-malgrange", "varangeville", "dombasle-sur-meurthe", "houdemont", "nancy"].forEach(function (slug) {
  assert(exists("recherche-bien/" + slug + "/index.html"), "page recherche " + slug);
  var html = read("recherche-bien/" + slug + "/index.html");
  assert(html.indexOf("nancy-metropole") !== -1, slug + " lien hub");
  assert(html.indexOf("Varengeville") === -1, slug + " pas typo Varengeville");
  assert(html.indexOf("acheteur-immo.html") !== -1, slug + " CTA acheteur");
});

var acheteur = read("landings/acheteur-immo.html");
assert(acheteur.indexOf("bedroomsMin") !== -1, "form chambres");
assert(acheteur.indexOf("wantGarden") !== -1, "form jardin");
assert(acheteur.indexOf("searchNotes") !== -1, "form notes recherche");
assert(acheteur.indexOf("Nancy, Jarville") !== -1 || acheteur.indexOf("Varangéville") !== -1, "placeholders 54");
assert(acheteur.indexOf("data-immo-ville") !== -1, "prefill ville URL");

var submit = read("api/_lib/routes/public-immo-listing-submit.js");
assert(submit.indexOf('role === "acheteur"') !== -1 && submit.indexOf("buyer-criteria-from-lead") !== -1, "API critères acheteur");

var ingest = read("api/_lib/crm-ingest-from-lead.js");
assert(ingest.indexOf("upsertBuyerCriteriaFromLead") !== -1, "ingest CRM critères");

var item = Crit.buildCriteriaItem(
  {
    vertical: "acheteur_immo",
    firstName: "Alice",
    searchCities: "Nancy, Jarville",
    budgetMax: "250000",
    roomsMin: "3",
    bedroomsMin: "2",
    propertySought: ["maison", "appartement"],
    wantGarden: "1",
    postalProject: "54000",
  },
  "lead_test",
  "ct_test"
);
assert(item && item.cities && item.cities.indexOf("Nancy") !== -1, "criteria cities");
assert(item.budget_max === 250000, "criteria budget");
assert(item.rooms_min === 3, "criteria rooms");
assert(item.bedrooms_min === 2, "criteria bedrooms");
assert(item.want_garden === true, "criteria garden");
assert(item.departments && item.departments.indexOf("54") !== -1, "criteria dept 54");
assert(item.property_types.indexOf("maison") !== -1, "criteria types");

assert(Crit.buildCriteriaItem({ vertical: "animaux", email: "x@y.fr" }, "l", null) === null, "ignore non-acheteur");

assert(exists("blog/acheter-maison-appartement-nancy-metropole-54-2026.html"), "blog achat nancy");
assert(exists("blog/recherche-bien-nancy-54-deposer-criteres-2026.html"), "blog critères");
var blogAchat = read("blog/acheter-maison-appartement-nancy-metropole-54-2026.html");
assert(blogAchat.indexOf("Varangéville") !== -1, "blog Varangéville");
assert(blogAchat.indexOf("acheteur-immo.html") !== -1, "blog CTA");
assert(blogAchat.indexOf("nancy-metropole") !== -1, "blog hub");

var gsc = read("scripts/seo-gsc-priority-urls.cjs");
assert(gsc.indexOf("/recherche-bien/nancy-metropole/") !== -1, "GSC hub recherche");
assert(gsc.indexOf("acheter-maison-appartement-nancy-metropole") !== -1, "GSC blog achat");

assert(read("immobilier/index.html").indexOf("nancy-metropole") !== -1, "pilier immo hub");
assert(read("immobilier/biens.html").indexOf("demande") !== -1, "biens CTA critères");

assert(read("package.json").indexOf("verify:nancy-bassin-acquereur") !== -1, "npm script");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les checks Nancy acquéreur OK");
