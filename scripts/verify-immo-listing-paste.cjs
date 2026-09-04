#!/usr/bin/env node
/**
 * Vérifie la reprise d'infos depuis un lien / texte Leboncoin (sans scraping).
 */
var Paste = require("../js/immo-listing-paste-lib.js");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

assert(Paste.parseListingPaste, "parseListingPaste exposé");

var sample =
  "https://www.leboncoin.fr/ad/ventes_immobilieres/2781234567\n\n" +
  "Appartement T3 lumineux Varangéville\n" +
  "147 000 €\n" +
  "65 m²\n" +
  "3 pièces\n" +
  "2 chambres\n" +
  "Étage : 1\n" +
  "54110 Varangéville\n" +
  "Classe énergie D\n" +
  "GES : C\n" +
  "Chauffage : Gaz individuel\n" +
  "Ascenseur\n" +
  "Cave\n" +
  "Bel appartement proche écoles, avec balcon.";

var p = Paste.parseListingPaste(sample);
assert(p.ok, "parse ok");
assert(p.listing_url.indexOf("leboncoin.fr") !== -1, "URL LBC");
assert(p.portal === "leboncoin", "portal leboncoin");
assert(Number(p.price_fai) === 147000, "prix 147000");
assert(Number(p.surface_m2) === 65, "surface 65");
assert(Number(p.rooms) === 3, "3 pièces");
assert(Number(p.bedrooms) === 2, "2 chambres");
assert(p.floor === "1", "étage 1");
assert(p.postal_code === "54110", "CP");
assert(/varang/i.test(p.city), "ville");
assert(p.dpe === "D" && p.ges === "C", "DPE/GES");
assert(/gaz/i.test(p.heating), "chauffage");
assert(p.has_elevator === true && p.has_cave === true, "équipements");
assert(p.has_balcony === true, "balcon");
assert(p.property_type === "appartement", "type appartement");

var urlOnly = Paste.parseListingPaste("https://www.leboncoin.fr/ad/ventes_immobilieres/9998887777");
assert(urlOnly.listing_url.indexOf("9998887777") !== -1, "URL seule reconnue");
assert(urlOnly.hint && /bloque|collez/i.test(urlOnly.hint), "hint coller le texte si URL seule");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les checks reprise Leboncoin OK");
