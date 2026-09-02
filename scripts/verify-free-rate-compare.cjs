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
assert(hub.indexOf("Comparateur taux libre") !== -1, "titre taux libre");
assert(hub.indexOf("frTable") !== -1, "table frTable");
assert(hub.indexOf("frRateBase") !== -1, "select base taux");
assert(/Comparer les agences \(barèmes CRM\)/.test(hub), "panneau barèmes distinct");

var lib = read("js/crm-agency-fees-lib.js");
assert(lib.indexOf("calculateFreeRate") !== -1, "lib calculateFreeRate");
assert(lib.indexOf("compareFreeRates") !== -1, "lib compareFreeRates");
assert(lib.indexOf("FREE_RATE_KEY") !== -1, "clé localStorage");

var js = read("crm-agency-fees.js");
assert(js.indexOf("renderFreeRates") !== -1, "UI renderFreeRates");
assert(js.indexOf("wireFreeRates") !== -1, "wire FreeRates");

function calc(price, priceMode, rateBase, ratePct) {
  var p = Math.max(0, Number(price) || 0);
  var r = Math.max(0, Math.min(99.9, Number(ratePct) || 0)) / 100;
  var net;
  var fai;
  var fee;
  if (rateBase === "of_net") {
    if (priceMode === "net_vendeur") {
      net = p;
      fee = net * r;
      fai = net + fee;
    } else {
      fai = p;
      net = fai / (1 + r);
      fee = fai - net;
    }
  } else if (priceMode === "fai") {
    fai = p;
    fee = fai * r;
    net = fai - fee;
  } else {
    net = p;
    fai = net / (1 - r);
    fee = fai - net;
  }
  return {
    net: Math.round(net * 100) / 100,
    fai: Math.round(fai * 100) / 100,
    fee: Math.round(fee * 100) / 100,
  };
}

var a = calc(250000, "fai", "of_fai", 5);
assert(a.fee === 12500, "FAI 250k @5% → honoraires 12 500");
assert(a.net === 237500, "FAI 250k @5% → net 237 500");

var b = calc(200000, "net_vendeur", "of_net", 6);
assert(b.fee === 12000, "Net 200k @6% net → honoraires 12 000");
assert(b.fai === 212000, "Net 200k @6% net → FAI 212 000");

var c = calc(250000, "fai", "of_net", 5);
assert(Math.abs(c.net - 238095.24) < 0.02, "FAI 250k @5% du net → net ≈ 238 095");

console.log("\nComparateur taux libre : OK.");
