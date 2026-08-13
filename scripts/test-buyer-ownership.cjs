/**
 * Smoke test — projection budget propriétaire (Node, sans DOM).
 * Usage: node scripts/test-buyer-ownership.cjs
 */
"use strict";

var fs = require("fs");
var path = require("path");
var vm = require("vm");

var win = { console: console };
function load(rel) {
  var code = fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
  vm.runInNewContext(code, { window: win, console: console });
}

load("js/crm-buyer-finance-lib.js");
load("js/crm-buyer-ownership-lib.js");

var Fin = win.CrmBuyerFinance;
var Own = win.CrmBuyerOwnership;

var bundle = Own.projectWithFinance(
  {
    netVendeur: 265000,
    agencyFee: 15000,
    downPayment: 40000,
    monthlyIncome: 3200,
    coBorrowerIncome: 1800,
    years: 25,
    notaryPreset: "ancien",
    financeNotary: true,
    insurancePctYear: 0.34,
    travaux: 15000,
    financeTravaux: false,
  },
  {
    priceFai: 280000,
    surfaceM2: 75,
    dpeLetter: "D",
    propertyType: "appartement",
    householdSize: 2,
    currentRent: 950,
    epargneLiquid: 60000,
    patrimoineAutre: 10000,
    reserveCibleMois: 6,
    chargesCoproMensuelles: 120,
    travauxTotal: 15000,
    travauxInLoan: false,
    monthlyIncome: 3200,
    coBorrowerIncome: 1800,
    downPayment: 40000,
  }
);

var o = bundle.ownership;
var f = bundle.finance;
var ok = true;
function assert(cond, msg) {
  if (!cond) {
    ok = false;
    console.error("FAIL:", msg);
  } else {
    console.log("OK:", msg);
  }
}

assert(!!Fin && !!Own, "libs chargées");
assert(f && f.loanAmount > 0, "emprunt > 0 (" + (f && f.loanAmount) + ")");
assert(o.totalCostOfOwnership > o.creditHousing, "TCO > crédit seul");
assert(o.taxeFonciere.monthly > 0, "TF mensuelle > 0");
assert(o.energy.totalMonthly > 0, "énergie > 0");
assert(o.breakdown.length >= 5, "breakdown détaillé");
assert(o.stress.combo.totalMonthly > o.totalCostOfOwnership, "stress combo > base");
assert(typeof o.effortRate === "number", "effortRate numérique");
assert(o.vsRent && o.vsRent.delta !== undefined, "comparaison loyer");

var fromProp = Own.fromProperty({
  property_type: "maison",
  price_fai: 320000,
  fields: {
    surface_habitable: 110,
    taxe_fonciere: 1800,
    conso_energie_primaire: "E",
    charges_copro: 0,
  },
});
assert(fromProp.dpeLetter === "E", "fromProperty DPE");
assert(fromProp.taxeFonciereAnnuelle == 1800, "fromProperty TF");

console.log(
  "\nSynthèse: TCO",
  Own.formatEuro(o.totalCostOfOwnership),
  "/mois · effort",
  Own.formatPct(o.effortRate),
  "· DTI",
  Own.formatPct(o.bankDti),
  "· statut",
  o.status
);

process.exit(ok ? 0 : 1);
