#!/usr/bin/env node
/**
 * Vérifie l'installation @microsoft/clarity (npm officiel).
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

console.log("=== Microsoft Clarity — installation NPM ===\n");

var pkgPath = path.join(ROOT, "node_modules", "@microsoft", "clarity", "package.json");
if (!fs.existsSync(pkgPath)) {
  fail("Package absent — lancez: npm install @microsoft/clarity");
} else {
  pass("@microsoft/clarity@" + JSON.parse(fs.readFileSync(pkgPath, "utf8")).version);
}

var src = fs.readFileSync(path.join(ROOT, "js", "clarity-source.mjs"), "utf8");
if (src.indexOf("@microsoft/clarity") === -1 || src.indexOf("Clarity.init") === -1) {
  fail("js/clarity-source.mjs invalide");
} else {
  pass("import npm + Clarity.init(projectId)");
}

if (src.indexOf("if (!analyticsAllowed()) return") !== -1) {
  fail("Clarity bloque encore init avant consentement");
} else {
  pass("Init Clarity sans blocage consentement");
}

var bundle = fs.readFileSync(path.join(ROOT, "js", "clarity-init.js"), "utf8");
if (bundle.indexOf("ref=npm") === -1) fail("Bundle sans ref=npm");
else pass("Bundle clarity.ms?ref=npm");
if (bundle.indexOf("x7yqp46fj9") === -1 && bundle.indexOf("clarityProjectId") === -1) {
  fail("ID projet x7yqp46fj9 absent");
} else pass("Projet Clarity x7yqp46fj9");

var index = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
if (index.indexOf("/js/clarity-init.js") === -1) fail("index.html sans clarity-init.js");
else pass("Script NPM dans index.html");

var blogGen = fs.readFileSync(path.join(ROOT, "scripts", "generate-blog-articles.cjs"), "utf8");
if (blogGen.indexOf("/js/clarity-init.js") === -1) fail("generate-blog-articles sans clarity-init");
else pass("Générateur blog articles avec clarity-init");

console.log(ok ? "\nInstallation NPM conforme." : "\nCorrigez les points ci-dessus.");
process.exit(ok ? 0 : 1);
