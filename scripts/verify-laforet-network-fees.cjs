#!/usr/bin/env node
var fs = require("fs");
var path = require("path");

global.window = {};
require(path.join(__dirname, "..", "js", "crm-agency-fees-lib.js"));
var Lib = global.window.CrmAgencyFees;
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

var laforet = Lib.listAgencies().find(function (a) {
  return a.id === "agency_laforet";
});
assert(!!laforet, "agence Laforêt présente");
assert((laforet.postShareCosts || []).length >= 2, "frais post-part Laforêt configurés");

var res = Lib.calculate({
  agency: laforet,
  scheduleId: "sched_laforet_vente",
  price: 200000,
  chargesPct: 22,
  cfePct: 0.5,
  accountingPct: 1,
});
assert(res.agencyFee === 18000, "honoraires 9 % sur 200000");
assert(res.dealSplit.myGrossBeforeNetwork === 7200, "part négociateur brute 40 %");
assert(res.dealSplit.networkCostsTotal === 432, "frais réseau 4 % + 2 % après 40 %");
assert(res.agentGross === 6768, "part après frais réseau");

[
  "js/crm-agency-fees-lib.js",
  "crm-agency-fees.js",
].forEach(function (rel) {
  require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
  assert(true, "syntaxe " + rel);
});

var html = read("crm-agency-fees.html");
assert(html.indexOf("agencyOperatingPct") >= 0, "champ fonctionnement agence");
assert(html.indexOf("agencyFranchisePct") >= 0, "champ franchise/pub");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nContrôles Laforêt OK.");
