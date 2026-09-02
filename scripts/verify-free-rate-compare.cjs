#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL", msg);
    process.exit(1);
  }
  console.log("OK  ", msg);
}

var hub = read("crm-agency-fees.html");
assert(hub.indexOf("freeRatePanel") !== -1, "panneau freeRatePanel");
assert(hub.indexOf("montant fixe") !== -1, "mention montant fixe UI");
assert(hub.indexOf("frAddFixedRow") !== -1, "bouton ligne forfait");
assert(hub.indexOf('data-fixed="12000"') !== -1, "preset forfait 12k");
assert(hub.indexOf("frRateBase") !== -1, "select base taux");

var lib = read("js/crm-agency-fees-lib.js");
assert(lib.indexOf("calculateFreeRate") !== -1, "lib calculateFreeRate");
assert(lib.indexOf('feeMode === "fixed"') !== -1, "lib mode fixed");
assert(lib.indexOf("fixedAmount") !== -1, "lib fixedAmount");

var js = read("crm-agency-fees.js");
assert(js.indexOf("renderFreeRates") !== -1, "UI renderFreeRates");
assert(js.indexOf("frAddFixedRow") !== -1, "wire ligne forfait");
assert(js.indexOf('feeMode: "fixed"') !== -1, "push ligne fixed");

var window = {};
eval(lib);
var L = window.CrmAgencyFees;

var a = L.calculateFreeRate(250000, "fai", "of_fai", 5);
assert(a.fee === 12500, "FAI 250k @5% → honoraires 12 500");
assert(a.net === 237500, "FAI 250k @5% → net 237 500");

var b = L.calculateFreeRate(200000, "net_vendeur", "of_net", 6);
assert(b.fee === 12000, "Net 200k @6% net → honoraires 12 000");
assert(b.fai === 212000, "Net 200k @6% net → FAI 212 000");

var f = L.calculateFreeRate(250000, "fai", "of_fai", {
  feeMode: "fixed",
  fixedAmount: 12000,
});
assert(f.fee === 12000, "FAI 250k forfait 12k → fee 12 000");
assert(f.net === 238000, "FAI 250k forfait 12k → net 238 000");
assert(f.feeMode === "fixed", "feeMode fixed");

var g = L.calculateFreeRate(200000, "net_vendeur", "of_fai", {
  feeMode: "fixed",
  fixedAmount: 10000,
});
assert(g.fee === 10000, "Net 200k forfait 10k → fee 10 000");
assert(g.fai === 210000, "Net 200k forfait 10k → FAI 210 000");

var c = L.compareFreeRates({
  price: 250000,
  priceMode: "fai",
  rateBase: "of_fai",
  rows: [
    { name: "A", feeMode: "percent", ratePct: 5 },
    { name: "B", feeMode: "fixed", fixedAmount: 8000 },
  ],
});
assert(c[0].row.name === "B", "forfait 8k bat 5% sur net vendeur");
assert(c[0].result.net === 242000, "meilleur net = 242 000");

console.log("\nComparateur % / montant fixe : OK.");
