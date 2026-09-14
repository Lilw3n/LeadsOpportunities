#!/usr/bin/env node
/** Liens cliquables IDs contact / lead / bien dans le CRM immo. */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
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
  return fs.readFileSync(path.join(root, rel), "utf8");
}

var html = read("crm-immo-properties.html");
assert(html.indexOf("pOwnerOpen") >= 0, "lien Ouvrir contact vendeur");
assert(html.indexOf("pBuyerOpen") >= 0, "lien Ouvrir contact acquéreur");
assert(html.indexOf("pLeadOpen") >= 0, "lien Ouvrir lead");
assert(html.indexOf("pPropOpen") >= 0, "lien Ouvrir fiche bien");
assert(html.indexOf("immo-id-row") >= 0, "CSS immo-id-row");

var js = read("js/crm-immo-properties-page.js");
assert(js.indexOf("syncFormIdLinks") >= 0, "syncFormIdLinks");
assert(js.indexOf("crm-contact.html?id=") >= 0, "href contact");
assert(js.indexOf("crm-lead-detail.html?id=") >= 0, "href lead");
assert(js.indexOf("crm-immo-property.html?id=") >= 0, "href fiche bien");
assert(js.indexOf("prospectBlockHtml") >= 0, "bloc prospect sur liste");
assert(js.indexOf("hydrateContactLabels") >= 0, "hydratation noms contacts");
assert(js.indexOf("immo-prospect") >= 0, "classe CSS prospect");
assert(js.indexOf("/api/crm/contact?id=") >= 0, "fetch contact par id");
assert(html.indexOf(".immo-prospect") >= 0, "styles prospect dans page");

var matchHtml = read("crm-immo-matching.html");
assert(matchHtml.indexOf("cContactOpen") >= 0 && matchHtml.indexOf("cLeadOpen") >= 0, "matching : liens ID");

var matchJs = read("js/crm-immo-matching-page.js");
assert(matchJs.indexOf("syncCritIdLinks") >= 0, "matching : sync liens");
assert(matchJs.indexOf("crm-contact.html?id=") >= 0, "matching → contact");

var contactJs = read("crm-contact.js");
assert(contactJs.indexOf("crm-immo-property.html?id=") >= 0, "contact → fiche bien CRM");
assert(contactJs.indexOf("Fiche CRM") >= 0, "libellé Fiche CRM sur contact");

var pkg = JSON.parse(read("package.json"));
assert(pkg.scripts["verify:immo-id-links"], "npm script verify:immo-id-links");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nLiens ID CRM immo OK");
