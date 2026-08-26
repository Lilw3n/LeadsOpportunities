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
assert(js.indexOf("dragstart") >= 0 && js.indexOf("insertBefore") >= 0, "glisser-déposer DOM");
assert(js.indexOf("roomComments[]") >= 0, "champ commentaires");
assert(js.indexOf('selectHtml("roomName[]"') >= 0, "liste Nom");
assert(js.indexOf('selectHtml("roomExposure[]"') >= 0, "liste Exposition");
assert(js.indexOf('selectHtml("roomFlooring[]"') >= 0, "liste Sol");
assert(js.indexOf("moveRow: moveRow") >= 0, "API moveRow exposée");
assert(js.indexOf("collect: collect") >= 0, "API collect exposée");

var html = read("landings/acheteur-immo.html");
assert(html.indexOf("immo-rooms-hint") >= 0, "consigne réordonnancement");
assert(html.indexOf(">Niveau</th>") >= 0 && html.indexOf(">Nom</th>") >= 0, "colonnes Niveau / Nom");
assert(html.indexOf(">Sol</th>") >= 0 && html.indexOf(">Commentaires</th>") >= 0, "colonnes Sol / Commentaires");
assert(html.indexOf("acheteur-immo-rooms.js?v=20260826rooms") >= 0, "cache-bust JS pièces");
assert(html.indexOf("immo-parcours.css?v=20260826rooms") >= 0, "cache-bust CSS");

var css = read("landings/css/immo-parcours.css");
assert(css.indexOf(".immo-room-handle") >= 0, "style poignée");
assert(css.indexOf(".immo-room-row.is-dragging") >= 0, "style ligne en cours de glisser");
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

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK pièces modulables");
