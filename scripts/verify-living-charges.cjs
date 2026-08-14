#!/usr/bin/env node
/**
 * Charges nommables + taux d'endettement / d'effort.
 */
var LC = require("../js/living-charges-lib.js");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

assert(LC.defaultList().length === 4, "4 charges par défaut (gaz, élec, internet, abo)");
assert(
  LC.defaultList()
    .map(function (x) {
      return x.id;
    })
    .join(",") === "gaz,electricite,internet,abonnements",
  "ids presets de départ"
);

var renamed = LC.normalizeItem({ id: "gaz", label: "Gaz de ville (Engie)", amount: 85 });
assert(renamed.label === "Gaz de ville (Engie)" && renamed.amount === 85, "libellé personnalisable");
assert(renamed.inDti === false, "gaz hors endettement banque par défaut");

var custom = LC.normalizeItem({ label: "Salle de sport", amount: 39.9 });
assert(custom.label === "Salle de sport" && custom.id.indexOf("chg_") === 0, "charge nom libre");

var list = LC.normalizeList([
  { id: "gaz", label: "Gaz", amount: 70 },
  { id: "electricite", label: "Électricité", amount: 90 },
  { id: "internet", label: "Fibre", amount: 40 },
  { id: "abonnements", label: "Netflix + Spotify", amount: 25 },
  { id: "pension", label: "Pension", amount: 200, inDti: true },
]);
assert(LC.sumAll(list) === 425, "somme charges de vie");
assert(LC.sumInDti(list) === 200, "seule la ligne cochée entre dans le DTI");

var bud = LC.computeBudget({
  revenus: 4000,
  credits: 150,
  pension: 0,
  loyer: 0,
  newLoan: 1100,
  livingCharges: list,
  dtiMax: 35,
});
assert(bud.dtiApres === 36.25, "DTI banque = (150+200+1100)/4000 = 36,25 % (got " + bud.dtiApres + ")");
assert(bud.livingAll === 425, "charges de vie totales");
assert(bud.effortApres === 150 + 1100 + 425, "effort = crédits + prêt + toutes charges vie");
assert(bud.rav === 4000 - bud.effortApres, "RAV = revenus − effort");
assert(bud.okHcsf === false && bud.tone === "no", "au-dessus du plafond HCSF");

var ok = LC.computeBudget({
  revenus: 5000,
  credits: 0,
  newLoan: 1400,
  livingCharges: [
    { id: "gaz", amount: 60 },
    { id: "electricite", amount: 80 },
    { id: "internet", amount: 30 },
  ],
});
assert(ok.dtiApres === 28, "DTI 1400/5000 = 28 % sans charges vie (got " + ok.dtiApres + ")");
assert(ok.okHcsf === true, "passe HCSF");
assert(ok.effortPct === 31.4, "effort 1570/5000 = 31,4 % (got " + ok.effortPct + ")");

var html = LC.listHtml(LC.defaultList(), { showDti: true });
assert(html.indexOf("Gaz") !== -1 && html.indexOf("Électricité") !== -1, "HTML contient gaz + élec");
assert(html.indexOf("Internet") !== -1 && html.indexOf("Abonnements") !== -1, "HTML internet + abo");
assert(html.indexOf("lc-label") !== -1 && html.indexOf("Ajouter une charge") !== -1, "libellé éditable + ajout");
assert(html.indexOf("Endettement") !== -1, "case endettement banque");

var fs = require("fs");
var path = require("path");
function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

assert(read("crm-pret-immo-sim.html").indexOf("living-charges") !== -1, "simulateur prêt : widget");
assert(read("crm-agency-fees.html").indexOf("bfLivingCharges") !== -1, "barèmes : charges foyer");
assert(read("landings/projection-achat.html").indexOf("projLivingCharges") !== -1, "projection : charges nommables");
assert(read("landings/credit-immo.html").indexOf("livingChargesMount") !== -1, "landing crédit : charges");
assert(read("js/crm-pret-immo-lib.js").indexOf("charges_libres") !== -1, "dossier prêt persiste charges_libres");
assert(read("js/crm-buyer-finance-lib.js").indexOf("livingCharges") !== -1, "finance acheteur : livingCharges");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nCharges nommables / endettement : OK");
