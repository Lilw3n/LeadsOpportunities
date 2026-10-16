#!/usr/bin/env node
/** Cluster garage, MRP, RC Pro, métiers du bâtiment, transport. */
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

var articles = require("./blog-pro-metiers-articles.cjs");
var files = [
  "assurance-garage-negociant-auto-rc-mrp-2026.html",
  "assurance-multirisque-professionnelle-locaux-2026.html",
  "assurance-rc-pro-entreprise-guide-2026.html",
  "assurance-metiers-batiment-decennale-rc-2026.html",
  "assurance-transport-logistique-marchandises-2026.html",
  "assurance-transport-voyageurs-commun-2026.html",
];
assert(articles.length === files.length, "6 articles pro/transport");
files.forEach(function (f) {
  assert(
    articles.some(function (a) {
      return a.file === f;
    }),
    "module " + f
  );
  assert(fs.existsSync(path.join(root, "blog", f)), "HTML " + f);
});

var landings = [
  "landings/garage-negociant-auto.html",
  "landings/multirisque-professionnelle.html",
  "landings/rc-pro.html",
  "landings/metiers-batiment.html",
  "landings/transport-logistique.html",
  "landings/transport-voyageurs.html",
];
landings.forEach(function (rel) {
  var html = read(rel);
  assert(html.indexOf("leadsopportunities.fr") >= 0, rel + " canonique");
  assert(html.indexOf("questionnaire.html") >= 0, rel + " questionnaire");
  assert(html.indexOf("data-market-intent=\"FR\"") >= 0, rel + " France");
});

assert(read("landings/transport-voyageurs.html").indexOf("/assurance-vtc/") >= 0, "voyageurs → VTC");
assert(read("landings/metiers-batiment.html").indexOf("decennale.html") >= 0, "bâtiment → décennale");
assert(read("landings/metiers-batiment.html").indexOf("sante-collective.html") >= 0, "bâtiment → collective");
assert(read("landings/garage-negociant-auto.html").indexOf("multirisque-professionnelle.html") >= 0, "garage → MRP");
assert(read("blog/assurance-garage-negociant-auto-rc-mrp-2026.html").indexOf("need=rc-pro") >= 0, "garage blog → RC Pro");
assert(read("blog/assurance-garage-negociant-auto-rc-mrp-2026.html").indexOf("need=auto") < 0, "garage blog pas le questionnaire auto");
assert(read("blog/assurance-garage-negociant-auto-rc-mrp-2026.html").indexOf("article-hero") < 0, "pas d’image code pour le garage");
assert(
  read("blog/assurance-transport-voyageurs-commun-2026.html").indexOf("questionnaire VTC") >= 0 ||
    read("scripts/blog-pro-metiers-articles.cjs").indexOf("questionnaire VTC") >= 0,
  "autocar hors questionnaire VTC"
);

var LT = require("./seo-long-term-related.cjs");
["garage", "mrp", "rc-pro", "metiers-batiment", "transport-logistique", "transport-voyageurs"].forEach(function (id) {
  assert(LT.PARTENARIAT[id] && LT.PARTENARIAT[id].length >= 3, "maillage " + id);
});

var markets = JSON.parse(read("data/seo-niche-markets.json"));
["garage", "mrp", "rc-pro", "metiers-batiment", "transport-logistique", "transport-voyageurs", "decennale", "collective"].forEach(
  function (id) {
    var m = markets.markets.find(function (x) {
      return x.id === id;
    });
    assert(m && m.status === "live", "silo " + id);
  }
);

var niches = JSON.parse(read("seo/niches.json"));
assert(
  niches.niches.some(function (n) {
    return n.id === "transport-voyageurs" && n.status === "live";
  }),
  "hub niches voyageurs"
);

assert(read("vault/Silos/garage.md").indexOf("garage") >= 0, "coffre silo garage");
assert(read("vault/Journal/Cluster pro et transport.md").indexOf("Astra") >= 0, "journal cluster");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nverify:pro-metiers OK");
