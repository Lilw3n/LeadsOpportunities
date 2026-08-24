#!/usr/bin/env node
/**
 * Checklist technique avant / après Google Search Console.
 * Usage: npm run verify:gsc
 */
const fs = require("fs");
const path = require("path");
const { absoluteUrls } = require("./seo-gsc-priority-urls.cjs");
const { robotsMetaForArticle } = require("./france-audience-lib.cjs");

const ROOT = path.join(__dirname, "..");
var ok = 0;
var warn = 0;
var fail = 0;

function pass(msg) {
  ok++;
  console.log("[OK]", msg);
}
function warning(msg) {
  warn++;
  console.log("[!!]", msg);
}
function bad(msg) {
  fail++;
  console.log("[KO]", msg);
}

function read(p) {
  try {
    return fs.readFileSync(path.join(ROOT, p), "utf8");
  } catch (e) {
    return "";
  }
}

console.log("=== Vérification SEO / Search Console ===\n");

var index = read("index.html");
if (index.indexOf("google-site-verification") !== -1) pass("Balise google-site-verification sur l'accueil");
else bad("Balise google-site-verification absente de index.html");

var verMatch = index.match(/google-site-verification" content="([^"]+)"/);
if (verMatch) console.log("     Token GSC:", verMatch[1]);

if (index.indexOf("SearchAction") !== -1) warning("WebSite SearchAction présent — retiré si pas de vraie recherche interne");
else pass("Pas de SearchAction fictif sur l'accueil");

if (index.indexOf("og:image") !== -1 || index.indexOf("og-default") !== -1) pass("Open Graph image configurée");
else warning("og:image manquante sur l'accueil");

if (index.indexOf("InsuranceAgency") !== -1 || index.indexOf('"@type": ["Organization"') !== -1) pass("Schema Organization / InsuranceAgency sur l'accueil");
else warning("Schema courtier ORIAS à enrichir sur l'accueil");

var robots = read("robots.txt");
if (robots.indexOf("Sitemap:") !== -1) pass("robots.txt référence le sitemap");
else bad("robots.txt sans Sitemap");

if (fs.existsSync(path.join(ROOT, "sitemap.xml"))) pass("sitemap.xml présent");
else bad("sitemap.xml absent — lancer npm run seo:build");

if (fs.existsSync(path.join(ROOT, "methode.html"))) pass("Page E-E-A-T methode.html présente");
else bad("methode.html absente — page confiance pour Google");

if (fs.existsSync(path.join(ROOT, "nancy-54", "index.html"))) pass("Hub local nancy-54/ présent");
else bad("nancy-54/index.html absente — hub SEO Nancy");

if (fs.existsSync(path.join(ROOT, "nice-cote-azur", "index.html"))) pass("Hub Nice Côte d'Azur présent");
else bad("nice-cote-azur/index.html absente — hub SEO 06");

if (fs.existsSync(path.join(ROOT, "agence-varangeville", "index.html")) || fs.existsSync(path.join(ROOT, "agence-varangeville.html"))) {
  pass("Page cabinet agence-varangeville présente");
} else bad("agence-varangeville absente");

if (fs.existsSync(path.join(ROOT, "data", "seo-page-meta.json"))) pass("Meta mots-clés centralisées (seo-page-meta.json)");
else warning("data/seo-page-meta.json absent");

var manifest = require("./blog-articles-manifest.cjs");
var noindexInSitemap = 0;
manifest.articles.forEach(function (a) {
  if (robotsMetaForArticle(a).indexOf("noindex") !== -1) {
    var sm = read("sitemap-main.xml");
    if (sm.indexOf("/blog/" + a.file) !== -1) noindexInSitemap++;
  }
});
if (noindexInSitemap === 0) pass("Articles blog noindex exclus du sitemap (ou aucun)");
else warning(noindexInSitemap + " article(s) noindex encore listés dans sitemap-main.xml — relancer seo:build");

console.log("\n--- URLs à indexer dans GSC (Inspection → Demander l'indexation) ---\n");
absoluteUrls().forEach(function (u, i) {
  console.log(String(i + 1).padStart(2, "0") + ".", u);
});

console.log("\n--- Rappel ---");
console.log("GSC ne permet pas d'« ajouter des mots-clés ».");
console.log("Soumettez le sitemap, indexez les URLs ci-dessus, puis lisez Performances après 7–14 jours.");
console.log("Clusters cibles : data/seo-keyword-clusters.json");
console.log("Guide pas à pas : docs/GSC-SOLO-GUIDE.md\n");

console.log("Résumé:", ok, "OK,", warn, "attention,", fail, "échec");
process.exit(fail > 0 ? 1 : 0);
