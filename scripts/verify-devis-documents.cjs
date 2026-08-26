#!/usr/bin/env node
/**
 * Vérifie les configs documents P1 (auto, VTC, santé, entreprise).
 */
var cfg = require("../js/devis-document-config.js");
// browser IIFE — load via vm
var fs = require("fs");
var path = require("path");
var code = fs.readFileSync(path.join(__dirname, "../js/devis-document-config.js"), "utf8");
var sandbox = { window: {}, global: {} };
sandbox.global = sandbox;
require("vm").runInNewContext(code + "; this.DEVIS_DOCUMENT_CONFIG = window.DEVIS_DOCUMENT_CONFIG || global.DEVIS_DOCUMENT_CONFIG;", sandbox);
var DC = sandbox.window.DEVIS_DOCUMENT_CONFIG || sandbox.DEVIS_DOCUMENT_CONFIG;
if (!DC) {
  console.error("FAIL: DEVIS_DOCUMENT_CONFIG non chargé");
  process.exit(1);
}

function hasType(need, type) {
  return DC.getConfig(need).items.some(function (i) {
    return i.type === type;
  });
}

var checks = [
  ["auto", "permis"],
  ["auto", "carte_grise"],
  ["auto", "releve_info"],
  ["vtc", "carte_vtc"],
  ["vtc", "kbis"],
  ["vtc", "avis_insee"],
  ["vtc", "permis"],
  ["sante", "carte_vitale"],
  ["collective", "kbis"],
  ["collective", "avis_insee"],
  ["rc-pro", "kbis"],
  ["credit-immo", "piece_identite"],
];

var ok = true;
checks.forEach(function (c) {
  if (hasType(c[0], c[1])) console.log("[OK]", c[0], "→", c[1]);
  else {
    console.error("[FAIL]", c[0], "manque", c[1]);
    ok = false;
  }
});

var sante = DC.getConfig("sante");
if (sante.extraFields && sante.extraFields.some(function (f) { return f.name === "numero_secu"; })) {
  console.log("[OK] sante extraFields numero_secu");
} else {
  console.error("[FAIL] sante numero_secu");
  ok = false;
}

process.exit(ok ? 0 : 1);
