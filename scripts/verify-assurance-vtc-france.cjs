/**
 * Vérifie le pack domaine assurancevtcfrance.com (pub / SEO / leads).
 */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

assert.ok(fs.existsSync(path.join(root, "assurance-vtc-france/index.html")), "index");
assert.ok(fs.existsSync(path.join(root, "assurance-vtc-france/devis.html")), "devis");
assert.ok(fs.existsSync(path.join(root, "assurance-vtc-france/styles.css")), "styles");
assert.ok(fs.existsSync(path.join(root, "docs/ASSURANCE-VTC-FRANCE-DNS.md")), "doc DNS");

var index = read("assurance-vtc-france/index.html");
assert.ok(index.indexOf("Assurance VTC France") !== -1, "marque home");
assert.ok(index.indexOf("canonical") !== -1 && index.indexOf("assurancevtcfrance.com") !== -1, "canonical");
assert.ok(index.indexOf("devis.html") !== -1, "CTA devis");
assert.ok(index.indexOf("Wakam") !== -1, "angle Wakam");

var devis = read("assurance-vtc-france/devis.html");
assert.ok(devis.indexOf('name="need" value="vtc"') !== -1, "need=vtc");
assert.ok(devis.indexOf("assurancevtcfrance.com") !== -1, "site_domain");
assert.ok(devis.indexOf("data-quick-devis") !== -1, "form express");
assert.ok(devis.indexOf("/landings/tracking.js") !== -1 || devis.indexOf("landings/tracking.js") !== -1, "tracking");

var brand = read("js/site-host-brand.js");
assert.ok(brand.indexOf("isAssuranceVtcFrance") !== -1, "brand host");
assert.ok(brand.indexOf("assurancevtcfrance.com") !== -1, "origin AVF");

var vercel = read("vercel.json");
assert.ok(vercel.indexOf("assurancevtcfrance.com") !== -1, "vercel apex redirect");
assert.ok(vercel.indexOf("www.assurancevtcfrance.com") !== -1, "vercel www");
assert.ok(vercel.indexOf("/assurance-vtc-france/index.html") !== -1, "rewrite home");
assert.ok(vercel.indexOf("/assurance-vtc-france/devis.html") !== -1, "rewrite devis");

assert.ok(fs.existsSync(path.join(root, "ads/meta-assurancevtcfrance.csv")), "meta ads");
assert.ok(fs.existsSync(path.join(root, "ads/google-assurancevtcfrance.csv")), "google ads");
var meta = read("ads/meta-assurancevtcfrance.csv");
assert.ok(meta.indexOf("https://www.assurancevtcfrance.com/devis") !== -1, "meta landing devis");

var partners = read("data/partner-sites.json");
assert.ok(partners.indexOf("assurancevtcfrance.com") !== -1, "partner-sites entry");

var pkg = read("package.json");
assert.ok(pkg.indexOf("verify:assurance-vtc-france") !== -1, "npm script");

console.log("verify:assurance-vtc-france OK");
