#!/usr/bin/env node
/** Synthèse totale visible et trouvable (Composition + nav + bandeau). */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
var failed = 0;
function ok(c, m) {
  if (!c) {
    failed++;
    console.log("FAIL", m);
  } else console.log("OK  ", m);
}
function read(r) {
  return fs.readFileSync(path.join(root, r), "utf8");
}

var page = read("js/crm-immo-property-page.js");
ok(page.indexOf('id="synthese-totale"') >= 0, "ancre #synthese-totale");
ok(page.indexOf("Synthèse totale") >= 0, "libellé Synthèse totale");
ok(page.indexOf("syntheseTotaleBlockHtml") >= 0, "bloc synthèse");
ok(page.indexOf("btnNavSyntheseTotale") >= 0, "entrée menu latéral");
ok(page.indexOf("goToSyntheseTotale") >= 0, "navigation vers synthèse");
ok(page.indexOf("syntheseStripHost") >= 0 || page.indexOf("btnOpenSyntheseTotale") >= 0, "bandeau / ouvrir");
ok(page.indexOf("btnJumpSchema") >= 0, "saut vers schéma");
ok(page.indexOf("syntheseTotaleBlockHtml(tot") >= 0, "composition utilise le bloc");

var html = read("crm-immo-property.html");
ok(html.indexOf("syntheseStripHost") >= 0, "hôte bandeau dans HTML");
ok(html.indexOf(".synthese-totale") >= 0, "styles synthèse totale");
ok(html.indexOf(".side-synthese") >= 0, "styles entrée menu");

if (failed) {
  console.log(failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK verify-immo-synthese-totale");
