#!/usr/bin/env node
/** Fiche Google / SEO local Varangéville. */
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

var org = require("./seo-org-schema.cjs");
assert(org.ORG.telephone === "+33695820866", "NAP téléphone E.164");
assert(org.ORG.address.streetAddress.indexOf("15 rue Pierre Curie") === 0, "NAP rue = fiche Google");
assert(typeof org.localBusinessJsonLd === "function", "localBusinessJsonLd");
var ld = org.localBusinessJsonLd();
assert(ld["@type"].indexOf("LocalBusiness") >= 0, "schema LocalBusiness");
assert(ld.hasOfferCatalog && ld.hasOfferCatalog.itemListElement.length >= 8, "catalogue services");
assert(JSON.stringify(ld).indexOf("Rachat") >= 0, "schema rachat");

assert(fs.existsSync(path.join(root, "agence-varangeville/index.html")), "page cabinet");
var agence = read("agence-varangeville/index.html");
assert(agence.indexOf("06 95 82 08 66") >= 0, "tél visible");
assert(agence.indexOf("15 rue Pierre Curie") >= 0, "adresse visible");
assert(agence.indexOf("/landings/rachat.html") >= 0, "CTA rachat");
assert(agence.indexOf("/landings/conso.html") >= 0, "CTA conso");
assert(agence.indexOf("/landings/pret-relais.html") >= 0, "CTA relais");
assert(agence.indexOf("LocalBusiness") >= 0, "JSON-LD page");
assert(agence.indexOf("Leads Opportunities - Wendy Buchet") >= 0, "nom fiche à coller");
assert(agence.indexOf("/agence-varangeville/") >= 0, "URL bouton Site web");

assert(read("index.html").indexOf("+33695820866") >= 0, "home téléphone schema");
assert(read("index.html").indexOf("./agence-varangeville/") >= 0, "home lien cabinet");
assert(read("mentions-legales.html").indexOf("06 95 82 08 66") >= 0, "mentions tél");

assert(read("scripts/build-france-cities-json.cjs").indexOf("varangeville") >= 0, "ville Varangéville");
assert(read("scripts/blog-articles-manifest.cjs").indexOf("blog-local-54-articles") >= 0, "manifest local");
assert(fs.existsSync(path.join(root, "blog/courtier-varangeville-nancy-assurance-credit-2026.html")), "article cabinet");
assert(fs.existsSync(path.join(root, "blog/rachat-credits-nancy-meurthe-et-moselle-2026.html")), "article RAC 54");

var gsc = require("./seo-gsc-priority-urls.cjs");
assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/agence-varangeville/") >= 0, "GSC cabinet");

var sm = read("sitemap-main.xml") + read("sitemap-geo.xml");
assert(sm.indexOf("/agence-varangeville/") >= 0, "sitemap cabinet");

if (failed) {
  console.log("\n" + failed + " echec(s)");
  process.exit(1);
}
console.log("\nGBP / SEO local Varangéville : OK.");
