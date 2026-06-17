#!/usr/bin/env node
/**
 * Vérifie l'installation Microsoft Clarity (snippet + package NPM).
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

var pkgPath = path.join(ROOT, "node_modules", "@microsoft", "clarity", "package.json");
if (!fs.existsSync(pkgPath)) {
  fail("Package absent — lancez: npm install");
} else {
  pass("@microsoft/clarity@" + JSON.parse(fs.readFileSync(pkgPath, "utf8")).version);
}

var snippet = fs.readFileSync(path.join(ROOT, "js", "clarity-snippet.js"), "utf8");
if (snippet.indexOf("clarity.ms/tag/") === -1 || snippet.indexOf("x7yqp46fj9") === -1) {
  fail("js/clarity-snippet.js invalide");
} else {
  pass("Snippet Microsoft clarity.ms/tag/x7yqp46fj9");
}

var src = fs.readFileSync(path.join(ROOT, "js", "clarity-source.mjs"), "utf8");
if (src.indexOf("Clarity.init") === -1) fail("clarity-source sans Clarity.init");
else pass("Clarity.init() toujours appelé");

if (src.indexOf("if (!analyticsAllowed()) return") !== -1) {
  fail("Init encore bloquée par consentement");
} else {
  pass("Pas de blocage init avant consentement");
}

var index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
if (index.indexOf("clarity-snippet.js") === -1) fail("index.html sans clarity-snippet.js");
else pass("Snippet dans index.html");

var seoGen = fs.readFileSync(path.join(ROOT, "scripts", "generate-seo-pages.cjs"), "utf8");
if (seoGen.indexOf("clarity-snippet.js") === -1) fail("generate-seo-pages sans Clarity");
else pass("Générateur SEO pages avec Clarity");

var sampleSeo = path.join(ROOT, "france", "index.html");
if (fs.existsSync(sampleSeo)) {
  var seoHtml = fs.readFileSync(sampleSeo, "utf8");
  if (seoHtml.indexOf("clarity-snippet.js") === -1) {
    fail("france/index.html sans Clarity — lancez: npm run seo:build");
  } else {
    pass("Page SEO échantillon avec Clarity");
  }
} else {
  fail("france/index.html absent");
}

console.log(ok ? "\nClarity prêt pour la production." : "\nCorrigez les points ci-dessus.");
process.exit(ok ? 0 : 1);
