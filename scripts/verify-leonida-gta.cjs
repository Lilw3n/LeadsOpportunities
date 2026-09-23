#!/usr/bin/env node
/**
 * Vérifie que les articles GTA envoient vers leonida-vice.com.
 */
var fs = require("fs");
var path = require("path");
var {
  GTA_ARTICLE_FILES,
  isGtaArticleFile,
  leonidaCta,
  LEONIDA_ORIGIN,
  applyLeonidaToArticle,
} = require("./leonida-vice-lib.cjs");
var { resolveBridge } = require("./blog-questionnaire-bridge.cjs");
var manifest = require("./blog-articles-manifest.cjs");

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

assert(GTA_ARTICLE_FILES.length >= 8, "au moins 8 articles GTA listés");
assert(/leonida-vice\.com/.test(LEONIDA_ORIGIN), "origine Leonida");

var gtaFromManifest = manifest.articles.filter(function (a) {
  return isGtaArticleFile(a.file);
});
assert(gtaFromManifest.length >= GTA_ARTICLE_FILES.length, "manifest : tous les GTA présents");

gtaFromManifest.forEach(function (a) {
  var cta = leonidaCta(a.file);
  assert(a.cta && /leonida-vice\.com/.test(a.cta.href), a.file + " : CTA Leonida");
  assert(a.cta.href.indexOf("utm_campaign=gta6") !== -1, a.file + " : utm_campaign=gta6");
  assert(a.cta.href.indexOf("utm_content=") !== -1, a.file + " : utm_content");

  var bridge = resolveBridge(a);
  assert(bridge.partner === "leonida-vice", a.file + " : bridge partner");
  assert(/leonida-vice\.com/.test(bridge.questionnaire), a.file + " : bridge primary → Leonida");
  assert(/leonida-vice\.com/.test(bridge.landing), a.file + " : bridge landing → Leonida");
  assert(!bridge.express, a.file + " : pas de devis express LO");

  var htmlPath = path.join(root, "blog", a.file);
  assert(fs.existsSync(htmlPath), a.file + " : HTML généré");
  if (fs.existsSync(htmlPath)) {
    var html = fs.readFileSync(htmlPath, "utf8");
    assert(/leonida-vice\.com/.test(html), a.file + " : HTML contient leonida-vice.com");
    assert(/data-partner="leonida-vice"/.test(html), a.file + " : data-partner bridge");
    assert(!/article-bridge[\s\S]{0,400}landings\/(questionnaire|devis|credit-immo)/.test(html), a.file + " : bridge sans landing LO");
  }

  var relatedOk = (a.related || []).some(function (r) {
    return /leonida-vice\.com/.test(String(r.href || ""));
  });
  assert(relatedOk, a.file + " : related Leonida");
});

var sample = applyLeonidaToArticle({
  file: "gta-6-sortie-assurance-gaming-materiel.html",
  cta: { href: "../landings/devis.html", label: "x" },
  related: [{ href: "../landings/credit-immo.html", label: "LO" }],
});
assert(/leonida-vice\.com/.test(sample.cta.href), "applyLeonida remplace CTA");
assert(!(sample.related || []).some(function (r) {
  return /landings\//.test(r.href);
}), "applyLeonida retire landings LO des related");

var pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
assert(!!(pkg.scripts && pkg.scripts["verify:leonida-gta"]), "npm script verify:leonida-gta");

var libExists = fs.existsSync(path.join(root, "scripts/leonida-vice-lib.cjs"));
assert(libExists, "scripts/leonida-vice-lib.cjs");

if (failed) {
  console.log("\nverify:leonida-gta FAILED —", failed, "erreur(s)");
  process.exit(1);
}
console.log("\nverify:leonida-gta OK —", gtaFromManifest.length, "articles GTA →", LEONIDA_ORIGIN);
