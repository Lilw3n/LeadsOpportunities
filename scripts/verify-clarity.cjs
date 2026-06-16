#!/usr/bin/env node
/**
 * Vérifie l'intégration @microsoft/clarity (npm officiel).
 * Usage: npm run verify:clarity
 */
const fs = require("fs");
const path = require("path");

var ROOT = path.join(__dirname, "..");
var ok = true;

function pass(msg) {
  console.log("[OK] " + msg);
}

function fail(msg) {
  console.log("[FAIL] " + msg);
  ok = false;
}

console.log("=== Vérification Microsoft Clarity (@microsoft/clarity) ===\n");

var pkgPath = path.join(ROOT, "node_modules", "@microsoft", "clarity", "package.json");
if (!fs.existsSync(pkgPath)) {
  fail("Package absent — lancez: npm install @microsoft/clarity");
} else {
  var pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pass("npm installé: @microsoft/clarity@" + (pkg.version || "?"));
}

var sourcePath = path.join(ROOT, "js", "clarity-source.mjs");
if (!fs.existsSync(sourcePath)) {
  fail("js/clarity-source.mjs manquant");
} else {
  var src = fs.readFileSync(sourcePath, "utf8");
  if (src.indexOf('@microsoft/clarity') === -1) {
    fail("clarity-source.mjs n'importe pas @microsoft/clarity");
  } else if (src.indexOf("Clarity.init") === -1) {
    fail("clarity-source.mjs n'appelle pas Clarity.init()");
  } else {
    pass("Source: import npm + Clarity.init()");
  }
}

var bundlePath = path.join(ROOT, "js", "clarity-init.js");
if (!fs.existsSync(bundlePath)) {
  fail("js/clarity-init.js manquant — lancez: npm run build:clarity");
} else {
  var bundle = fs.readFileSync(bundlePath, "utf8");
  if (bundle.indexOf("ref=npm") === -1) {
    fail("Bundle sans ?ref=npm (pas le script officiel npm)");
  } else {
    pass("Bundle: script clarity.ms avec ref=npm");
  }
  if (bundle.indexOf("consentv2") === -1 && bundle.indexOf("consentV2") === -1) {
    fail("Bundle sans API consentV2");
  } else {
    pass("Bundle: API consentV2 présente");
  }
}

var googleCfg = fs.readFileSync(path.join(ROOT, "google-config.js"), "utf8");
if (googleCfg.indexOf("clarity-init.js") === -1) {
  fail("google-config.js ne charge pas /js/clarity-init.js");
} else {
  pass("google-config.js charge clarity-init.js");
}

if (googleCfg.indexOf("x7yqp46fj9") === -1 && googleCfg.indexOf("clarityProjectId") === -1) {
  fail("ID projet Clarity non configuré dans google-config.js");
} else {
  pass("ID projet Clarity configuré (x7yqp46fj9 ou env)");
}

console.log(ok ? "\nClarity est correctement installé via npm." : "\nCorrigez les points ci-dessus.");
process.exit(ok ? 0 : 1);
