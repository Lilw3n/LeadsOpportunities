#!/usr/bin/env node
/**
 * Niches partenariat LO — ramonage, esthétique, loisirs, padel,
 * immeuble pro, décennale, convoyage (pas AVF).
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

var articles = require("./blog-partenariat-niches-articles.cjs");
assert(articles.length >= 8, "au moins 8 articles partenariat (got " + articles.length + ")");

var must = [
  "assurance-ramoneur-rc-pro-multirisque-2026.html",
  "assurance-institut-beaute-esthetique-rc-pro-2026.html",
  "assurance-salle-loisirs-escape-game-accrobranche-trampoline-2026.html",
  "assurance-terrain-padel-club-rc-pro-2026.html",
  "assurance-immeuble-professionnel-multirisque-2026.html",
  "assurance-decennale-artisan-guide-2026.html",
  "assurance-convoyeur-vehicules-rc-pro-2026.html",
  "niches-assurance-pro-ramonage-loisirs-padel-strategie-2026.html",
];
var files = articles.map(function (a) {
  return a.file;
});
must.forEach(function (f) {
  assert(files.indexOf(f) >= 0, "module contient " + f);
});

articles.forEach(function (a) {
  assert(a.keywords && a.keywords.length >= 3, a.file + " mots-clés");
  assert(a.blocks && a.blocks.length >= 4, a.file + " contenu");
  assert(
    a.blocks.some(function (b) {
      return b.type === "bridge";
    }),
    a.file + " pont conversion"
  );
  assert(a.cta && a.cta.href, a.file + " CTA");
  assert(String(a.cta.href).indexOf("assurancevtcfrance") === -1, a.file + " pas de lien AVF");
});

assert(
  read("scripts/blog-articles-manifest.cjs").indexOf("blog-partenariat-niches-articles") >= 0,
  "manifeste charge le module"
);
assert(read("scripts/blog-articles-manifest.cjs").indexOf('id: "partenariat"') >= 0, "section partenariat");

var landings = [
  "landings/ramonage.html",
  "landings/esthetique-bien-etre.html",
  "landings/salles-loisirs.html",
  "landings/padel.html",
  "landings/immeuble-professionnel.html",
  "landings/decennale.html",
  "landings/convoyage-vehicules.html",
];
landings.forEach(function (rel) {
  assert(fs.existsSync(path.join(root, rel)), rel);
  var html = read(rel);
  assert(html.indexOf("leadsopportunities.fr") >= 0, rel + " marque LO");
  assert(html.indexOf("questionnaire.html") >= 0, rel + " CTA questionnaire");
  assert(html.indexOf("assurancevtcfrance") === -1, rel + " pas AVF");
});

var niches = JSON.parse(read("seo/niches.json"));
["ramonage", "esthetique", "salles-loisirs", "padel", "immeuble-pro", "decennale", "convoyage"].forEach(
  function (id) {
    var n = niches.niches.find(function (x) {
      return x.id === id;
    });
    assert(n && n.status === "live", "seo/niches.json " + id + " live");
  }
);

var markets = JSON.parse(read("data/seo-niche-markets.json"));
assert(markets.partenariatNiches && markets.partenariatNiches.length >= 7, "markets partenariatNiches");
assert(markets.blogPartenariatNiches && markets.blogPartenariatNiches.length >= 8, "markets blogPartenariat");

var map = JSON.parse(read("data/blog-questionnaire-map.json"));
assert(map.sections.ramonage, "map section ramonage");
assert(map.sections.padel, "map section padel");
assert(map.sections.decennale, "map section decennale");
must.forEach(function (f) {
  assert(map.articles[f], "map article " + f);
});

must.forEach(function (f) {
  var htmlPath = path.join(root, "blog", f);
  assert(fs.existsSync(htmlPath), "HTML " + f);
  if (fs.existsSync(htmlPath)) {
    var html = read("blog/" + f);
    assert(html.indexOf("landings/") >= 0, f + " lien landing");
    assert(html.indexOf("article-bridge") >= 0 || html.indexOf("bridge") >= 0, f + " bridge");
  }
});

var gsc = require("./seo-gsc-priority-urls.cjs");
assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/landings/ramonage.html") >= 0, "GSC ramonage");
assert(gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/landings/padel.html") >= 0, "GSC padel");
assert(
  gsc.GSC_INDEX_NOW_PRIORITY.indexOf("/blog/assurance-immeuble-professionnel-multirisque-2026.html") >= 0,
  "GSC immeuble"
);

var pkg = read("package.json");
assert(pkg.indexOf("verify:partenariat-niches") !== -1, "npm script verify:partenariat-niches");

if (failed) {
  console.log("\n" + failed + " failure(s)");
  process.exit(1);
}
console.log("\nverify:partenariat-niches OK");
