#!/usr/bin/env node
/**
 * Priorités acquisition 90 j (étude marché P1/P2).
 */
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

/* Meta override canicule prolongé */
var rot = JSON.parse(read("config/meta-campaign-rotation.json"));
assert(rot.actu_override && rot.actu_override.active === true, "actu_override actif");
assert(rot.actu_override.slot_id === "sante_senior_canicule", "override = sante_senior_canicule");
assert(String(rot.actu_override.valid_until).indexOf("2026-09-30") === 0, "valid_until 2026-09-30");

var active = JSON.parse(read("data/meta-campaign-rotation-active.json"));
assert(active.active_slot && active.active_slot.id === "sante_senior_canicule", "JSON actif = canicule");

/* CSV Meta canicule */
var caniculeCsv = read("ads/meta-canicule-maintenant.csv");
["sante_senior_canicule", "sante_canicule_teleconsult", "sante_canicule_famille", "sante_canicule_vigilance"].forEach(function (id) {
  assert(caniculeCsv.indexOf(id) >= 0, "meta-canicule contient " + id);
});

/* Blog-convert : VTC + canicule en tête */
var blogCsv = read("ads/meta-blog-conversions.csv");
assert(/^1,vtc,/.test(blogCsv.split("\n")[1]), "priorité 1 = VTC");
assert(blogCsv.indexOf("vtc-idf-hub") >= 0, "ligne VTC IDF hub");
assert(blogCsv.indexOf("canicule-mutuelle-coup-chaleur-seniors-2026") >= 0, "canicule seniors blog-convert");
/* article_url ne doit pas être le littéral direct_landing */
assert(!/,vtc-idf-hub,direct_landing,/.test(blogCsv), "vtc-idf-hub : article_url = URL (pas direct_landing)");
assert(/,vtc-idf-hub,https:\/\//.test(blogCsv), "vtc-idf-hub : URL absoute");

/* Google Ads VTC IDF */
var gads = read("ads/google-ads-editor-ready-utm.csv");
assert(gads.indexOf("FR_Search_VTC_IDF") >= 0, "campagne FR_Search_VTC_IDF");
assert(gads.indexOf("assurance-vtc/paris/") >= 0, "URL hub Paris");
assert(gads.indexOf("assurance-vtc/ile-de-france/") >= 0, "URL hub IDF");
assert(gads.indexOf("aeroport-cdg") >= 0 && gads.indexOf("aeroport-orly") >= 0, "mots-clés CDG/Orly");

var gadsLegacy = read("ads/google-ads-editor-ready.csv");
assert(gadsLegacy.indexOf("FR_Search_VTC_IDF") >= 0, "legacy CSV synchronisé VTC IDF");

/* GSC priorities */
var gsc = require("./seo-gsc-priority-urls.cjs");
var paths = gsc.GSC_INDEX_NOW_PRIORITY;
["/assurance-vtc/ile-de-france/", "/assurance-vtc/paris/", "/landings/projection-achat.html", "/blog/canicule-mutuelle-coup-chaleur-seniors-2026.html", "/recherche-bien/"].forEach(function (p) {
  assert(paths.indexOf(p) >= 0, "GSC prioritaire " + p);
});

/* Parcours immo */
["js/immo-parcours-strip.js", "landings/css/immo-parcours.css"].forEach(function (rel) {
  assert(fs.existsSync(path.join(root, rel)), "fichier " + rel);
});
["landings/acheteur-immo.html", "landings/projection-achat.html", "landings/credit-immo.html"].forEach(function (rel) {
  var html = read(rel);
  assert(html.indexOf("data-immo-parcours") >= 0, rel + " bandeau parcours");
  assert(html.indexOf("immo-parcours-strip.js") >= 0, rel + " charge le JS");
  assert(html.indexOf("immo-parcours.css") >= 0, rel + " charge le CSS");
});
assert(read("landings/acheteur-immo.html").indexOf('data-immo-step="bien"') >= 0, "step bien");
assert(read("landings/projection-achat.html").indexOf('data-immo-step="projection"') >= 0, "step projection");
assert(read("landings/credit-immo.html").indexOf('data-immo-step="credit"') >= 0, "step credit");
assert(read("landings/credit-immo.html").indexOf('id="formules"') >= 0, "ancre #formules emprunteur");
assert(read("landings/credit-immo.html").indexOf('id="demande"') >= 0, "ancre #demande crédit");

assert(fs.existsSync(path.join(root, "docs/ACQUISITION-PRIORITES-90J.md")), "doc ACQUISITION-PRIORITES-90J");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nAcquisition priorités 90 j : OK.");
