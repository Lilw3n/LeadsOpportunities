#!/usr/bin/env node
/** Vérifie le coffre Obsidian SEO et le maillage partenariat / VTC. */
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

var markets = require("../data/seo-niche-markets.json").markets;
var LT = require("./seo-long-term-related.cjs");

assert(fs.existsSync(path.join(root, "vault/Accueil.md")), "coffre : Accueil");
assert(fs.existsSync(path.join(root, "vault/.obsidian/app.json")), "coffre : config Obsidian");
assert(read("vault/Accueil.md").indexOf("[[SEO/MOC SEO") >= 0, "Accueil lie le MOC SEO");
assert(read("vault/Netlinking/MOC Netlinking.md").indexOf("[[Netlinking/Liens entrants]]") >= 0, "MOC netlinking");
assert(read("vault/Journal/Notes manuelles.md").indexOf("généré") >= 0 || read("vault/Journal/Notes manuelles.md").indexOf("pas régénéré") >= 0, "journal manuel conservé");

markets.forEach(function (m) {
  assert(fs.existsSync(path.join(root, "vault/Silos/" + m.id + ".md")), "silo " + m.id);
});

assert(fs.existsSync(path.join(root, "vault/Maillage/partenariat-ramonage.md")), "maillage ramonage");
assert(fs.existsSync(path.join(root, "vault/Netlinking/Cibles/federations-chasse.md")), "cible chasse");
assert(LT.PARTENARIAT && LT.PARTENARIAT.ramonage.length >= 3, "cluster partenariat ramonage");
assert(
  LT.VTC_IDF.some(function (l) {
    return l.href.indexOf("assurancevtcfrance.com") >= 0;
  }),
  "cluster VTC lie AVF"
);

var articles = require("./blog-partenariat-niches-articles.cjs");
var ramon = articles.filter(function (a) {
  return a.file.indexOf("ramoneur") >= 0;
})[0];
assert(
  ramon.related.some(function (r) {
    return r.href.indexOf("decennale") >= 0;
  }),
  "article ramoneur lie la décennale"
);

assert(read("landings/ramonage.html").indexOf("decennale.html") >= 0, "landing ramonage → décennale");
assert(read("landings/padel.html").indexOf("salles-loisirs.html") >= 0, "landing padel → loisirs");
assert(read("landings/convoyage-vehicules.html").indexOf("assurance-vtc/") >= 0, "landing convoyage → VTC");
assert(read("blog/assurance-ramoneur-rc-pro-multirisque-2026.html").indexOf("decennale") >= 0, "HTML blog ramoneur");
assert(read("assurance-vtc/index.html").indexOf("assurancevtcfrance.com") >= 0, "hub VTC → AVF");
assert(read("assurance-vtc-france/index.html").indexOf("/assurance-vtc/") >= 0, "AVF → hub VTC");

var accueil = read("vault/Accueil.md");
var unresolved = [];
accueil.replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g, function (_, target) {
  var rel = "vault/" + target.trim() + ".md";
  if (!fs.existsSync(path.join(root, rel))) unresolved.push(target);
});
assert(unresolved.length === 0, "wikilinks Accueil résolus" + (unresolved.length ? " : " + unresolved.join(", ") : ""));

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nCoffre SEO et maillage OK.");
