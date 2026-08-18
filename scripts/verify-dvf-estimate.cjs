/**
 * Vérifie données DVF + estimation Varangeville.
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { estimateProperty } = require("./dvf-estimate-lib.cjs");

const ROOT = path.join(__dirname, "..");

function read(p) {
  return fs.readFileSync(path.join(ROOT, p), "utf8");
}

assert(fs.existsSync(path.join(ROOT, "data/dvf-france-communes.json")), "dvf-france-communes.json manquant — npm run dvf:build");
assert(fs.existsSync(path.join(ROOT, "data/dvf-54-sales.json")), "dvf-54-sales.json manquant — npm run dvf:build");

var fr = JSON.parse(read("data/dvf-france-communes.json"));
assert(fr.communes["54549"], "Varangeville (54549) absente");
assert(fr.communes["54549"].maison && fr.communes["54549"].maison.medianM2 > 500, "médiane maison Varangeville");

assert(read("api/[action].js").indexOf("property-estimate") >= 0, "route API property-estimate");
assert(read("landings/estimation-vente.html").indexOf("data-property-estimate") >= 0, "landing estimation");

(async function () {
  var r = await estimateProperty({
    address: "29 rue Jean Jaures",
    postalCode: "54110",
    city: "Varangeville",
    propertyType: "maison",
    surface: 100,
  });
  assert(r.ok, "estimation Varangeville échouée: " + JSON.stringify(r));
  assert(r.estimate.estimatedPrice > 50000, "prix estimé trop bas");
  console.log("OK DVF — Varangeville ~", r.estimate.estimatedPrice, "€", "(" + r.method + ", confiance " + r.confidence + ")");
})().catch(function (e) {
  console.error(e);
  process.exit(1);
});
