/**
 * Audit SERP / positionnement — rappel des cibles SEO.
 * Ne scrape pas Google (ToS) : documente l'état attendu + vérifie que les pages money existent.
 *
 * Usage : npm run seo:serp-audit
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const QUERIES = [
  { q: "assurance", expect: "absent_page1", why: "Générique national — hors portée court terme" },
  { q: "mutuelle", expect: "absent_page1", why: "Comparateurs nationaux" },
  { q: "crédit", expect: "absent_page1", why: "Banques + réseaux" },
  { q: "prêt", expect: "absent_page1", why: "Trop large" },
  { q: "courtier Nancy", expect: "target", why: "Priorité locale — hub /nancy-54/" },
  { q: "mutuelle Nancy", expect: "target", why: "/assurance-sante/nancy/" },
  { q: "crédit immobilier Nancy", expect: "target", why: "/credit-immo/nancy/" },
  { q: "prêt immobilier Nancy", expect: "target", why: "/pret-immobilier/nancy/" },
  { q: "courtier Varangéville", expect: "target", why: "/agence-varangeville/" },
  { q: "assurance VTC", expect: "target", why: "/assurance-vtc/ + landings" },
  { q: "Leads Opportunities", expect: "brand", why: "Marque — doit pointer vers le site" },
];

const MUST_EXIST = [
  "nancy-54/index.html",
  "agence-varangeville/index.html",
  "agence-varangeville.html",
  "credit-immo/nancy/index.html",
  "assurance-sante/nancy/index.html",
  "pret-immobilier/nancy/index.html",
  "assurance-vtc/index.html",
  "assurance-sante/index.html",
  "credit-immo/index.html",
  "docs/SEO-SERP-AUDIT.md",
];

var failed = 0;

console.log("=== SERP / SEO audit (Leads Opportunities) ===\n");
console.log("Requêtes (réalité marché — voir docs/SEO-SERP-AUDIT.md) :\n");
QUERIES.forEach(function (row) {
  var tag =
    row.expect === "absent_page1"
      ? "ABSENT (normal)"
      : row.expect === "brand"
        ? "MARQUE"
        : "CIBLE";
  console.log("  [" + tag + "] « " + row.q + " » — " + row.why);
});

console.log("\nPages money locales / piliers :\n");
MUST_EXIST.forEach(function (rel) {
  var ok = fs.existsSync(path.join(ROOT, rel));
  console.log((ok ? "  OK  " : "  FAIL") + " " + rel);
  if (!ok) failed += 1;
});

var indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
var checks = [
  { name: "Accueil title contient courtier ou mutuelle ou crédit", ok: /courtier|mutuelle|crédit|credit/i.test(indexHtml.match(/<title>[^<]+/)?.[0] || "") },
  { name: "Lien hub nancy-54 dans footer ou corps", ok: indexHtml.indexOf("nancy-54") !== -1 },
  { name: "Lien agence-varangeville", ok: indexHtml.indexOf("agence-varangeville") !== -1 },
];
checks.forEach(function (c) {
  console.log((c.ok ? "  OK  " : "  FAIL") + " " + c.name);
  if (!c.ok) failed += 1;
});

console.log("");
if (failed) {
  console.error("Échec : " + failed + " contrôle(s).");
  process.exit(1);
}
console.log("Audit OK. Positions live = Search Console + Google (manuel).");
console.log("Guide : docs/SEO-SERP-AUDIT.md · Indexation : npm run gsc:urls");
