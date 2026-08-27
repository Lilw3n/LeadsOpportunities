#!/usr/bin/env node
/**
 * Vérifie le cluster blog verticales (VTC, auto, MRH, moto, chasse, etc.).
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

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

var articles = require("./blog-verticales-articles.cjs");
assert(articles.length >= 30, ">= 30 articles verticales (got " + articles.length + ")");

var files = {};
articles.forEach(function (a) {
  assert(a.file && !files[a.file], "fichier unique " + (a.file || "?"));
  files[a.file] = true;
  assert(a.keywords && a.keywords.length >= 3, a.file + " mots-clés");
  assert(
    a.blocks &&
      a.blocks.some(function (b) {
        return b.type === "bridge";
      }),
    a.file + " pont questionnaire"
  );
  assert(a.cta && a.cta.href, a.file + " CTA");
  var text = JSON.stringify(a);
  assert(text.indexOf("Varengeville") < 0, a.file + " pas Varengeville");
});

var vtc = articles.filter(function (a) {
  return a.section === "vtc";
});
var auto = articles.filter(function (a) {
  return a.section === "auto";
});
var habitat = articles.filter(function (a) {
  return a.section === "habitat";
});
assert(vtc.length >= 8, ">= 8 articles VTC");
assert(auto.length >= 6, ">= 6 articles auto/moto/loisirs");
assert(habitat.length >= 4, ">= 4 articles MRH");
assert(
  files["assurance-vtc-ile-de-france-paris-2026.html"] &&
    files["tarif-assurance-vtc-2026.html"] &&
    files["assurance-vtc-nancy-varangeville-54.html"],
  "piliers VTC IDF / tarif / 54"
);
assert(
  files["assurance-auto-paris-ile-de-france-2026.html"] &&
    files["assurance-auto-nancy-varangeville-54.html"],
  "auto Paris + Nancy"
);
assert(
  files["assurance-habitation-paris-ile-de-france-2026.html"] &&
    files["assurance-habitation-nancy-varangeville-54.html"],
  "MRH Paris + Nancy"
);

var src = read("scripts/blog-verticales-articles.cjs");
assert(src.indexOf("Varangéville") >= 0, "orthographe Varangéville dans la source");
assert(src.indexOf('u("vtc"') >= 0 || src.indexOf("QVTC") >= 0, "CTA need=vtc");
assert(src.indexOf("need=auto") >= 0, "CTA need=auto");
assert(src.indexOf("need=habitation") >= 0, "CTA need=habitation");
assert(src.indexOf("need=moto") >= 0, "CTA need=moto");

assert(read("scripts/blog-articles-manifest.cjs").indexOf("blog-verticales-articles") >= 0, "manifeste charge verticales");

var map = JSON.parse(read("data/blog-questionnaire-map.json"));
assert(map.sections.vtc && map.sections.auto && map.sections.habitat, "map sections vtc/auto/habitat");
assert(map.sections.moto && map.sections.moto.need === "moto", "map section moto");
assert(
  (map.keywordRules || []).some(function (r) {
    return r.id === "moto-scooter";
  }),
  "keywordRule moto"
);

var LT = require("./seo-long-term-related.cjs");
assert(LT.VTC_IDF && LT.VTC_IDF.length >= 8, "cluster VTC_IDF");
assert(LT.AUTO_MRH && LT.AUTO_MRH.length >= 8, "cluster AUTO_MRH");
assert(LT.NICHES_CHASSE.some(function (l) {
  return l.href.indexOf("tarif-assurance-chasse") >= 0;
}), "chasse tarifs dans NICHES_CHASSE");

assert(read("scripts/seo-geo-lib.cjs").indexOf("tarif-assurance-auto-2026") >= 0, "geo auto extraRelated blog");
assert(read("scripts/seo-geo-lib.cjs").indexOf("assurance-habitation-vol-cambriolage") >= 0, "geo MRH extraRelated blog");

assert(exists("ads/google-auto-search.csv"), "CSV Google auto");
assert(read("ads/google-auto-search.csv").indexOf("FR_Search_Auto_HotIntent") >= 0, "campagne Search auto");
assert(exists("ads/google-habitation-search.csv"), "CSV Google habitation");
assert(read("ads/google-habitation-search.csv").indexOf("FR_Search_Habitation_HotIntent") >= 0, "campagne Search MRH");
assert(read("ads/google-ads-editor-ready-utm.csv").indexOf("FR_Search_Auto_HotIntent") >= 0, "CSV UTM auto");
assert(read("ads/google-ads-editor-ready-utm.csv").indexOf("FR_Search_Habitation_HotIntent") >= 0, "CSV UTM habitation");

assert(read("package.json").indexOf("verify:blog-verticales") >= 0, "npm run verify:blog-verticales");

var generated = [
  "blog/assurance-vtc-ile-de-france-paris-2026.html",
  "blog/tarif-assurance-auto-2026.html",
  "blog/assurance-auto-nancy-varangeville-54.html",
  "blog/assurance-habitation-nancy-varangeville-54.html",
  "blog/assurance-moto-scooter-2026.html",
];
generated.forEach(function (rel) {
  if (!exists(rel)) return;
  assert(exists(rel), rel);
  var html = read(rel);
  assert(html.indexOf("Varengeville") < 0, rel + " HTML sans Varengeville");
  if (rel.indexOf("nancy") >= 0) {
    assert(html.indexOf("Varangéville") >= 0, rel + " Varangéville");
  }
});

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK cluster blog verticales (VTC, auto, MRH, niches)");
