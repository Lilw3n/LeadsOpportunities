/**
 * Vérifie le pack pub Wakam ACPR (articles + ads, sans calque concurrent).
 */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var wakam = require("./blog-articles-wakam-vtc.cjs");
var files = [
  "wakam-acpr-assurance-vtc-bascule-2026.html",
  "yeet-vtc-wakam-bascule-attestation-2026.html",
  "solly-zephir-wakam-marque-blanche-vtc-2026.html",
  "wakam-vtc-opportunite-courtiers-portefeuille.html",
];

assert.strictEqual(wakam.articles.length, 4, "4 articles Wakam pack pub");
files.forEach(function (file) {
  assert.ok(wakam.deep[file], "deep manquant: " + file);
  var blogPath = path.join(root, "blog", file);
  assert.ok(fs.existsSync(blogPath), "HTML manquant: " + file);
  var html = fs.readFileSync(blogPath, "utf8");
  assert.ok(html.indexOf("Wakam") !== -1, "Wakam dans " + file);
  assert.ok(html.indexOf("landings/vtc") !== -1 || html.indexOf("contact@leadsopportunities") !== -1, "CTA LO " + file);
  // Pas de phrases signature VTC Protect
  assert.ok(html.indexOf("Comparez 7 assureurs") === -1, "pas de calque « 7 assureurs »");
  assert.ok(html.indexOf("15 à 20 %") === -1 && html.indexOf("15 a 20 %") === -1, "pas de stat concurrente");
  assert.ok(html.indexOf("vtcprotect") === -1, "pas de lien concurrent");
});

var chauffeur = fs.readFileSync(path.join(root, "blog", files[0]), "utf8");
assert.ok(chauffeur.indexOf("courses") !== -1 || chauffeur.indexOf("course") !== -1, "hook courses");
assert.ok(chauffeur.indexOf("Yeet") !== -1, "Yeet");

var ads = fs.readFileSync(path.join(root, "ads", "meta-blog-conversions.csv"), "utf8");
assert.ok(ads.indexOf("vtc_wakam_convert") !== -1, "campagne Meta wakam");
assert.ok(ads.indexOf("yeet-vtc-wakam-bascule") !== -1, "ads Yeet");
assert.ok(ads.indexOf("solly-zephir-wakam") !== -1, "ads Solly/Zéphir");

var prio = fs.readFileSync(path.join(root, "ads", "meta-priorite-vtc-pret-sante.csv"), "utf8");
assert.ok(prio.indexOf("vtc_wakam_courses") !== -1, "priorité Meta wakam");
assert.ok(prio.indexOf("vtc_wakam_yeet") !== -1, "priorité Meta yeet");

var sm = fs.readFileSync(path.join(root, "sitemap-main.xml"), "utf8");
files.forEach(function (file) {
  assert.ok(sm.indexOf("/blog/" + file) !== -1, "sitemap: " + file);
});

var gsc = fs.readFileSync(path.join(root, "scripts", "seo-gsc-priority-urls.cjs"), "utf8");
assert.ok(gsc.indexOf("wakam-acpr-assurance-vtc-bascule-2026") !== -1, "GSC wakam");
assert.ok(gsc.indexOf("yeet-vtc-wakam-bascule") !== -1, "GSC yeet");

console.log("verify:wakam-vtc OK —", files.join(", "));
