#!/usr/bin/env node
/**
 * Vérifie l'installation Microsoft Clarity (snippet inline + collect).
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

console.log("=== Microsoft Clarity — vérification complète ===\n");

var index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
if (index.indexOf("clarity.ms/tag/") === -1 && index.indexOf("x7yqp46fj9") === -1) {
  fail("index.html sans snippet inline clarity.ms/tag/x7yqp46fj9");
} else {
  pass("Snippet inline clarity.ms/tag visible dans index.html (view-source)");
}

if (index.indexOf("consentv2") === -1) fail("index.html sans consentv2");
else pass("Consent V2 dans le snippet inline");

var seoGen = fs.readFileSync(path.join(ROOT, "scripts", "generate-seo-pages.cjs"), "utf8");
if (seoGen.indexOf("clarity-inline-html") === -1) fail("generate-seo-pages sans module inline");
else pass("Générateur SEO avec snippet inline");

var sampleSeo = path.join(ROOT, "france", "index.html");
if (fs.existsSync(sampleSeo)) {
  var seoHtml = fs.readFileSync(sampleSeo, "utf8");
  if (seoHtml.indexOf("clarity.ms/tag/") === -1) {
    fail("france/index.html sans clarity.ms/tag — lancez: npm run seo:build");
  } else {
    pass("Page SEO échantillon avec snippet inline");
  }
}

var src = fs.readFileSync(path.join(ROOT, "js", "clarity-source.mjs"), "utf8");
if (src.indexOf("bindClickDiagnostics") === -1) fail("clarity-source sans diagnostics clics");
else pass("Diagnostics clics (zones, rage, dead) actifs");

console.log(ok ? "\nClarity prêt pour la production." : "\nCorrigez les points ci-dessus.");
process.exit(ok ? 0 : 1);
