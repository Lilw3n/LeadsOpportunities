/**
 * Vérifie les articles niche Wakam ACPR → VTC (chauffeurs + courtiers).
 */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var wakam = require("./blog-articles-wakam-vtc.cjs");
var files = [
  "wakam-acpr-assurance-vtc-bascule-2026.html",
  "wakam-vtc-opportunite-courtiers-portefeuille.html",
];

assert.strictEqual(wakam.articles.length, 2, "2 articles Wakam attendus");
assert.ok(wakam.deep[files[0]], "deep chauffeur");
assert.ok(wakam.deep[files[1]], "deep courtiers");

files.forEach(function (file) {
  var blogPath = path.join(root, "blog", file);
  assert.ok(fs.existsSync(blogPath), "HTML manquant: " + file);
  var html = fs.readFileSync(blogPath, "utf8");
  assert.ok(html.indexOf("Wakam") !== -1, "Wakam manquant dans " + file);
  assert.ok(html.indexOf("ACPR") !== -1, "ACPR manquant dans " + file);
  assert.ok(html.indexOf("25 septembre 2026") !== -1 || html.indexOf("25/09/2026") !== -1, "date ACPR dans " + file);
  assert.ok(html.indexOf("questionnaires") !== -1 || html.indexOf("landings/vtc") !== -1 || html.indexOf("contact@leadsopportunities") !== -1, "CTA LO dans " + file);
});

var chauffeur = fs.readFileSync(path.join(root, "blog", files[0]), "utf8");
assert.ok(chauffeur.indexOf("Yeet") !== -1, "Yeet mentionné");
assert.ok(chauffeur.indexOf("zéro jour") !== -1 || chauffeur.indexOf("zero jour") !== -1 || chauffeur.indexOf("sans trou") !== -1, "règle zéro trou");
assert.ok(chauffeur.indexOf("relevé d") !== -1 || chauffeur.indexOf("relevé d'information") !== -1 || chauffeur.indexOf("RI") !== -1, "RI");

var ads = fs.readFileSync(path.join(root, "ads", "meta-blog-conversions.csv"), "utf8");
assert.ok(ads.indexOf("wakam-acpr-assurance-vtc-bascule-2026") !== -1, "ads Meta chauffeur");
assert.ok(ads.indexOf("wakam-vtc-opportunite-courtiers-portefeuille") !== -1, "ads Meta courtiers");

var sm = fs.readFileSync(path.join(root, "sitemap-main.xml"), "utf8");
files.forEach(function (file) {
  assert.ok(sm.indexOf("/blog/" + file) !== -1, "sitemap-main : " + file);
});

console.log("verify:wakam-vtc OK —", files.join(", "));
