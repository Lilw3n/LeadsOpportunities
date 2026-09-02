#!/usr/bin/env node
/** Vérifie que le détail pièces / balcons est sauvegardé et restauré (brouillon + envoi). */
var fs = require("fs");
var path = require("path");
var vm = require("vm");
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

function loadIife(rel) {
  var src = read(rel);
  var sandbox = {
    window: {},
    document: {
      readyState: "complete",
      querySelectorAll: function () {
        return [];
      },
      addEventListener: function () {},
    },
  };
  vm.runInNewContext(src, sandbox);
  return sandbox.window;
}

var roomsApi = loadIife("js/acheteur-immo-rooms.js").AcheteurImmoRooms;
assert(roomsApi && typeof roomsApi.collect === "function", "AcheteurImmoRooms.collect exporté");
assert(typeof roomsApi.collectFilled === "function", "AcheteurImmoRooms.collectFilled exporté");
assert(typeof roomsApi.fromFieldArrays === "function", "AcheteurImmoRooms.fromFieldArrays exporté");
assert(typeof roomsApi.render === "function", "AcheteurImmoRooms.render exporté");

var rebuilt = roomsApi.fromFieldArrays({
  "roomLevel[]": ["RDC", "1"],
  "roomName[]": ["Séjour", "Ch1"],
  "roomSurface[]": ["30", "12"],
  "roomDimensions[]": ["6x5", "4x3"],
  "roomFlooring[]": ["Parquet", "Carrelage"],
  "roomExposure[]": ["S", "E"],
});
assert(rebuilt.length === 2, "fromFieldArrays : 2 pièces");
assert(rebuilt[0].name === "Séjour" && rebuilt[0].surface === "30", "fromFieldArrays : séjour 30 m²");
assert(rebuilt[1].name === "Ch1" && rebuilt[1].level === "1", "fromFieldArrays : chambre étage 1");

var compacted = roomsApi.fromFieldArrays({
  "roomName[]": ["", "Cuisine"],
  "roomSurface[]": ["", "8"],
});
assert(compacted.length === 1 && compacted[0].name === "Cuisine", "fromFieldArrays ignore les lignes vides");

var coproApi = loadIife("js/acheteur-immo-copro-works.js").AcheteurImmoCoproWorks;
assert(coproApi && typeof coproApi.fromFieldArrays === "function", "AcheteurImmoCoproWorks.fromFieldArrays");
var copro = coproApi.fromFieldArrays({
  "coproWorkNature[]": ["Ravalement", ""],
  "coproWorkStatus[]": ["vote", ""],
  "coproWorkAmount[]": ["12000", ""],
});
assert(copro.length === 1 && copro[0].nature === "Ravalement", "fromFieldArrays copro compacte");

var guide = read("js/acheteur-immo-deposit-guide.js");
assert(guide.indexOf("rooms: rooms") >= 0, "collectDraft enregistre rooms");
assert(guide.indexOf("coproWorks: coproWorks") >= 0, "collectDraft enregistre coproWorks");
assert(guide.indexOf("AcheteurImmoRooms.render") >= 0, "applyDraftToForm restaure les pièces");
assert(guide.indexOf("REPEAT_TABLE_NAMES") >= 0, "serializeScope n’écrase plus roomName[] (last-wins)");
assert(guide.indexOf("rowsHaveContent(draft.rooms") >= 0, "hasDraftContent compte les pièces");
assert(guide.indexOf("sd.roomDetails") >= 0, "payloadToDraft reprend roomDetails");
assert(guide.indexOf("resetDynamicRows") >= 0, "resetDynamicRows après nouvelle demande / envoi");

var vente = read("js/acheteur-immo-deposit-vente.js");
assert(vente.indexOf("o.roomDetails") >= 0, "collectSellDossier envoie roomDetails");
assert(vente.indexOf("REPEAT_SKIP") >= 0, "collectSellDossier ignore les champs room*[] last-wins");

var listing = read("js/acheteur-immo-listing-url.js");
assert(listing.indexOf("resetDynamicRows") >= 0, "après envoi : table pièces réinitialisée (pas 7 lignes vides)");

var qi = read("js/quote-intelligence.js");
assert(qi.indexOf("restoreRepeatingTables") >= 0, "QI restaure les lignes dynamiques");
assert(qi.indexOf("fromFieldArrays") >= 0, "QI utilise fromFieldArrays");

var html = read("landings/acheteur-immo.html");
assert(html.indexOf("acheteur-immo-rooms.js?v=20260826rooms1") >= 0, "cache-bust rooms.js");
assert(html.indexOf("acheteur-immo-deposit-guide.js?v=20260826rooms1") >= 0, "cache-bust deposit-guide.js");
assert(html.indexOf("acheteur-immo-deposit-vente.js?v=20260826rooms1") >= 0, "cache-bust deposit-vente.js");
assert(html.indexOf("data-rooms-mount") >= 0, "table pièces dans le HTML");
assert(html.indexOf("+ Ajouter une pièce") >= 0, "bouton ajouter une pièce");

var dossier = read("js/interlocuteur-dossier-lib.js");
assert(dossier.indexOf('roomDetails: "Pièces / balcons (détail)"') >= 0, "label CRM roomDetails");
assert(dossier.indexOf('"roomDetails"') >= 0, "roomDetails dans IMMO_KEYS");
assert(dossier.indexOf("p.sellDossier.roomDetails") >= 0, "CRM lit roomDetails depuis sellDossier");

var dossierLib = require("../js/interlocuteur-dossier-lib");
var built = dossierLib.buildDossier(null, {
  firstName: "Léa",
  sellCity: "Nancy",
  sellDossier: {
    roomDetails: [{ level: "RDC", name: "Séjour", surface: "28", flooring: "Parquet", exposure: "S" }],
  },
});
var roomRow = ((built.biens && built.biens.immobilier) || []).filter(function (r) {
  return r.key === "roomDetails";
})[0];
assert(roomRow && /Séjour/.test(roomRow.value), "CRM dossier affiche le détail pièces");

process.exit(failed ? 1 : 0);
