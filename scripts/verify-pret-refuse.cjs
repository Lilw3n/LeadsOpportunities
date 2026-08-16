#!/usr/bin/env node
/** Prêt immobilier refusé → solutions. */
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

var arts = require("./blog-pret-refuse-articles.cjs");
assert(arts.length >= 10, ">= 10 articles prêt refusé");
assert(
  arts.some(function (a) {
    return a.file === "pret-immobilier-refuse-que-faire-2026.html";
  }),
  "article pilier présent"
);

arts.forEach(function (a) {
  assert(a.keywords && a.keywords.length >= 3, a.file + " keywords");
  assert(
    a.blocks.some(function (b) {
      return b.type === "bridge";
    }),
    a.file + " bridge"
  );
  assert(/credit-immo|projection-achat|emprunteur/.test(a.cta.href), a.file + " CTA finance");
});

assert(read("scripts/blog-articles-manifest.cjs").indexOf("blog-pret-refuse-articles") >= 0, "manifest wired");

var map = JSON.parse(read("data/blog-questionnaire-map.json"));
assert(map.articles["pret-immobilier-refuse-que-faire-2026.html"], "map pilier");

var landing = read("landings/credit-immo.html");
assert(landing.indexOf("id=\"pret-refuse\"") >= 0, "landing section prêt refusé");
assert(landing.indexOf("loanRefusedBefore") >= 0, "champ formulaire refus");
assert(landing.indexOf("Dossier deja refuse") >= 0, "option projet 2e chance");
assert(landing.indexOf("On m'a deja refuse un pret") >= 0, "FAQ refus");

var gsc = require("./seo-gsc-priority-urls.cjs");
assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/blog/pret-immobilier-refuse-que-faire-2026.html") >= 0, "GSC pilier");

["pret-immobilier-refuse-que-faire-2026.html", "pret-refuse-endettement-35-hcsf-solutions.html", "pret-refuse-courtier-multibanque-deuxieme-chance.html"].forEach(function (f) {
  assert(fs.existsSync(path.join(root, "blog", f)), "HTML " + f);
  var html = read("blog/" + f);
  assert(html.indexOf("article-bridge") >= 0, f + " bridge html");
  assert(html.indexOf("credit-immo") >= 0, f + " lien crédit");
});

assert(read("blog/index.html").indexOf("pret-immobilier-refuse-que-faire-2026.html") >= 0, "index blog");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nPrêt refusé → solutions : OK.");
