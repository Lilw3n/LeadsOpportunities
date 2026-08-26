#!/usr/bin/env node
/** Vérifie le tableau pièces modulable (dépôt de bien). */
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

var js = read("js/acheteur-immo-rooms.js");
assert(js.indexOf("data-room-handle") >= 0, "poignée de déplacement");
assert(js.indexOf("data-room-up") >= 0 && js.indexOf("data-room-down") >= 0, "flèches haut / bas");
assert(js.indexOf("bindPointerSort") >= 0 && js.indexOf("placeAfter") >= 0, "glisser-déposer au pointeur");
assert(js.indexOf("roomComments[]") >= 0, "champ commentaires");
assert(js.indexOf('selectHtml("roomName[]"') >= 0, "liste Nom");
assert(js.indexOf('selectHtml("roomExposure[]"') >= 0, "liste Exposition");
assert(js.indexOf('selectHtml("roomFlooring[]"') >= 0, "liste Sol");
assert(js.indexOf("moveRow: moveRow") >= 0, "API moveRow exposée");
assert(js.indexOf("collect: collect") >= 0, "API collect exposée");

var catalog = read("js/immo-room-catalog.js");
assert(catalog.indexOf("Abri de jardin") >= 0, "catalogue : Abri de jardin");
assert(catalog.indexOf("Séjour cathédrale") >= 0, "catalogue : Séjour cathédrale");
assert(catalog.indexOf("Parking en sous-sol") >= 0, "catalogue : Parking en sous-sol");
assert(catalog.indexOf("Chambre Salle de Bains") >= 0, "catalogue : Chambre Salle de Bains");
assert((catalog.match(/"Chambre 4"/g) || []).length === 1, "pas de doublon Chambre 4");
assert((catalog.match(/"Autre"/g) || []).length === 1, "pas de doublon Autre");
assert(catalog.indexOf("numeric: true") >= 0, "tri naturel Chambre 2 avant 10");

var html = read("landings/acheteur-immo.html");
assert(html.indexOf("immo-rooms-hint") >= 0, "consigne réordonnancement");
assert(html.indexOf(">Niveau</th>") >= 0 && html.indexOf(">Nom</th>") >= 0, "colonnes Niveau / Nom");
assert(html.indexOf(">Sol</th>") >= 0 && html.indexOf(">Commentaires</th>") >= 0, "colonnes Sol / Commentaires");
assert(html.indexOf("immo-room-catalog.js?v=20260826rooms5") >= 0, "catalogue pièces chargé");
assert(html.indexOf("acheteur-immo-rooms.js?v=20260826rooms5") >= 0, "cache-bust JS pièces");
assert(html.indexOf("immo-parcours.css?v=20260826rooms8") >= 0, "cache-bust CSS");

var css = read("landings/css/immo-parcours.css");
assert(css.indexOf(".immo-room-handle") >= 0, "style poignée");
assert(css.indexOf("body.immo-rooms-dragging") >= 0, "style glisser en cours");
assert(css.indexOf(".immo-room-move") >= 0, "style flèches");

var qi = read("js/quote-intelligence.js");
assert(qi.indexOf("roomComments[]") >= 0, "autosave roomComments[]");

var print = read("js/acheteur-immo-print.js");
assert(print.indexOf("Commentaires") >= 0, "impression commentaires");
assert(print.indexOf("ROOM_PRINT_FIELDS") >= 0, "impression par champ nommé");

var guide = read("js/acheteur-immo-deposit-guide.js");
assert(guide.indexOf("draft.rooms") >= 0, "brouillon conserve l'ordre des pièces");
assert(guide.indexOf("AcheteurImmoRooms.render") >= 0, "restauration des pièces");

var vente = read("js/acheteur-immo-deposit-vente.js");
assert(vente.indexOf("propertyRooms") >= 0, "sellDossier.propertyRooms");

require("../js/immo-room-catalog.js");
var names = global.ImmoRoomCatalog.names;
assert(names.length >= 220, "catalogue ≥ 220 noms uniques (" + names.length + ")");
assert(names.indexOf("Chambre 2") < names.indexOf("Chambre 10"), "Chambre 2 avant Chambre 10");
assert(names.indexOf("Cuisine") >= 0 && names.indexOf("W.C.") >= 0, "Cuisine et W.C. présents");
var expo = global.ImmoRoomCatalog.exposures;
assert(expo && expo.join(",") === "E,EO,N,NE,NO,NS,O,S,SE,SO", "exposition codes agence E…SO");

var tax = read("js/immo-listing-taxonomy.js");
assert(tax.indexOf("COPRO_PROCEDURES") >= 0, "taxonomie procédures copro");
assert(tax.indexOf("Absence de syndic") >= 0, "procédure Absence de syndic");
assert(tax.indexOf("mandataire ad hoc") >= 0, "procédure mandataire ad hoc");
assert(html.indexOf('name="sellCoproProcedureKind[]"') >= 0, "chips procédures copro");
assert(html.indexOf("Dont lots d'habitation") >= 0, "lots d'habitation");
assert(qi.indexOf("sellCoproProcedureKind[]") >= 0, "autosave procédures copro");
assert(tax.indexOf("Tuiles Mécaniques") >= 0 && tax.indexOf("Zinc") >= 0, "couverture Tuiles Mécaniques / Zinc");
assert(html.indexOf('id="sellRoofing"') >= 0, "champ Couverture");
assert(html.indexOf("sellRoofingNote") >= 0, "commentaire couverture si Autre / doute");
assert(html.indexOf("Extérieur du bâtiment") >= 0, "bloc extérieur distinct (pas terrain)");
assert(html.indexOf("Terrain / parcelle") >= 0, "terrain séparé de l'enveloppe");
assert(html.indexOf("immo-field-note") >= 0, "commentaire sous chaque liste");
assert(tax.indexOf("Grand standing") >= 0, "standing Grand standing");
assert(tax.indexOf("Somptueux") >= 0, "état extérieur Somptueux");
assert(tax.indexOf("Haussmannien") >= 0, "style Haussmannien");
assert((tax.match(/"Ossature bois"/g) || []).length === 1, "construction sans doublon Ossature bois");
assert(html.indexOf('id="sellWindows"') >= 0 && html.indexOf("<select id=\"sellWindows\"") >= 0, "fenêtres = liste agence");
assert(tax.indexOf("Triple Vitrage") >= 0, "fenêtres Triple Vitrage");
assert(tax.indexOf("Roulants électriques") >= 0, "volets Roulants électriques");
assert(tax.indexOf("Laine de verre") >= 0, "isolation Laine de verre");
assert(tax.indexOf("Tout à l'égout") >= 0, "assainissement tout-à-l'égout");
assert(html.indexOf("sellWindowsNote") >= 0, "commentaire fenêtres");
assert(tax.indexOf("Mixte Bois Béton") >= 0, "dalle Mixte Bois Béton");
assert(tax.indexOf("Collectif avec comptage individuel") >= 0, "type chauffage collectif comptage");
assert(tax.indexOf("Pompe à chaleur air/eau") >= 0, "méca PAC air/eau");
assert(tax.indexOf("Gaz + Pompe à chaleur") >= 0, "méca Gaz + PAC");
assert(tax.indexOf("Poêle hybride bois et granulés") >= 0, "méca poêle hybride");
assert(tax.indexOf("Radiants") >= 0, "mode chauffage Radiants");
assert(tax.indexOf("Thermodynamique") >= 0, "eau chaude Thermodynamique");
assert(html.indexOf('id="sellFloorSlab"') >= 0, "champ Dalle");
assert(html.indexOf('id="sellHeatingMode"') >= 0, "champ Mode chauffage");
assert(html.indexOf("sellHeatingEnergyNote") >= 0, "commentaire méca chauffage");
assert(html.indexOf('id="sellFireplace"') >= 0, "champ Cheminée");
assert(html.indexOf("immo-listing-taxonomy.js?v=20260826rooms11") >= 0, "cache-bust taxonomie intérieur");
assert(html.indexOf('id="sellGarden"') >= 0 && html.indexOf("<select id=\"sellGarden\"") >= 0, "jardin = Oui/Non comme l'agence");
assert(tax.indexOf("Travertin") >= 0, "construction jusqu’à Travertin");
assert(tax.indexOf("XVIII") >= 0, "style jusqu’à XVIII");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK pièces modulables");
