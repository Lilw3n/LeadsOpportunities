#!/usr/bin/env node
/** Hub immobilier multi-audiences + espace investisseurs (SEO / pub). */
var fs = require("fs");
var path = require("path");
var failed = 0;
var root = path.join(__dirname, "..");

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

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

[
  "immobilier/index.html",
  "immobilier/investissement.html",
  "css/immo-hub-audiences.css",
  "js/immo-investisseur-yield.js",
  "ads/meta-immo-audiences.csv",
].forEach(function (f) {
  assert(exists(f), f + " existe");
});

var hub = read("immobilier/index.html");
assert(/investisseur/i.test(hub), "hub mentionne investisseurs");
assert(hub.indexOf("investissement.html") >= 0, "lien hub → investissement");
assert(hub.indexOf('id="audiences"') >= 0, "section audiences");
assert(hub.indexOf("data-immo-yield") >= 0, "simulateur rendement sur hub");
assert(hub.indexOf("immo-hub-audiences.css") >= 0, "CSS audiences chargé");
assert(hub.indexOf("immo-investisseur-yield.js") >= 0, "JS yield chargé");
assert(hub.indexOf("FAQPage") >= 0, "JSON-LD FAQPage");
assert(hub.indexOf('id="faq"') >= 0, "FAQ visible");
assert(
  hub.indexOf("Achat, location") >= 0 || hub.indexOf("location &amp; syndic") >= 0,
  "hero conserve ancrage achat/location/syndic"
);
assert(hub.indexOf("./location/") >= 0 && hub.indexOf("./syndic/") >= 0, "liens location + syndic");
assert(hub.indexOf('id="location-bareme"') >= 0, "estimateur location conservé");
assert(hub.indexOf('id="bareme"') >= 0 && hub.indexOf('id="estimation"') >= 0, "barème + estimation");

assert(/Acquéreurs|acquereur/i.test(hub), "audience acquéreurs");
assert(/Vendeurs|vendeur/i.test(hub), "audience vendeurs");
assert(/Locataires|locataire/i.test(hub), "audience locataires");

var inv = read("immobilier/investissement.html");
assert(inv.indexOf("data-immo-yield") >= 0, "simulateur sur page investissement");
assert(inv.indexOf("rendement") >= 0 && /cash-?flow/i.test(inv), "métriques rendement + cash-flow");
assert(inv.indexOf("./marche.html") >= 0, "lien marché");
assert(inv.indexOf("credit-immo.html") >= 0, "lien financement");
assert(inv.indexOf("canonical") >= 0 && inv.indexOf("investissement.html") >= 0, "canonical investissement");
assert(inv.indexOf("application/ld+json") >= 0, "JSON-LD page investissement");

var css = read("css/immo-hub-audiences.css");
assert(css.indexOf(".immo-aud-grid") >= 0 && css.indexOf(".immo-yield") >= 0, "styles audiences + yield");

var js = read("js/immo-investisseur-yield.js");
assert(js.indexOf("data-yield-price") >= 0 && js.indexOf("ImmoInvestisseurYield") >= 0, "API yield JS");
assert(js.indexOf("rendementBrut") >= 0 && js.indexOf("cashflowMensuel") >= 0, "calculs brut + cash-flow");

var ads = read("ads/meta-immo-audiences.csv");
["investisseur", "acquereur", "vendeur", "locataire", "bailleur", "meta_immo_hub_reference"].forEach(function (k) {
  assert(ads.indexOf(k) >= 0, "ads Meta contient " + k);
});
assert(ads.indexOf("/immobilier/investissement.html") >= 0, "ads → page investissement");
assert(ads.indexOf("/immobilier/?") >= 0 || ads.indexOf("/immobilier/") >= 0, "ads → hub immobilier");

var marche = read("immobilier/marche.html");
assert(marche.indexOf("investissement.html") >= 0, "marché lie l’espace investisseurs");

var pkg = JSON.parse(read("package.json"));
assert(pkg.scripts["verify:immo-hub-audiences"], "npm script verify:immo-hub-audiences");

var gsc = read("scripts/seo-gsc-priority-urls.cjs");
assert(gsc.indexOf("/immobilier/investissement.html") >= 0, "GSC priorité investissement");

var geo = read("scripts/seo-geo-lib.cjs");
assert(geo.indexOf("/immobilier/investissement.html") >= 0, "sitemap geo lib investissement");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les checks hub immo audiences OK");
