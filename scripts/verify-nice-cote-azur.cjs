#!/usr/bin/env node
/** Vérifie le SEO bassin Nice / Côte d'Azur (animaux, VTC, chasse, puis le reste). */
var fs = require("fs");
var path = require("path");
var bassin = require("./nice-cote-azur-lib.cjs");
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

assert(bassin.COMMUNES.length >= 20, "communes bassin >= 20 (" + bassin.COMMUNES.length + ")");
assert(bassin.isBassinCity({ slug: "nice" }), "Nice");
assert(bassin.isBassinCity({ slug: "cagnes-sur-mer" }), "Cagnes-sur-Mer");
assert(bassin.isBassinCity({ slug: "saint-laurent-du-var" }), "Saint-Laurent-du-Var");
assert(bassin.isBassinCity({ slug: "vence" }), "Vence");
assert(bassin.isBassinCity({ slug: "saint-martin-vesubie" }), "Saint-Martin-Vésubie");
assert(bassin.PRIORITY_PRODUCTS.indexOf("animaux") !== -1, "priorité animaux");
assert(bassin.PRIORITY_PRODUCTS.indexOf("vtc") !== -1, "priorité VTC");
assert(bassin.PRIORITY_PRODUCTS.indexOf("chasse") !== -1, "priorité chasse");

[
  "nice-cote-azur/index.html",
  "assurance-animaux/nice-cote-azur/index.html",
  "assurance-vtc/cote-d-azur/index.html",
  "assurance-vtc/aeroport-nice/index.html",
  "assurance-chasse/cote-d-azur/index.html",
  "assurance-equitation/cote-d-azur/index.html",
  "assurance-habitation/cote-d-azur/index.html",
  "assurance-sante/cote-d-azur/index.html",
].forEach(function (rel) {
  assert(exists(rel), "page " + rel);
  if (exists(rel)) {
    var html = read(rel);
    assert(html.indexOf("undefined") === -1, rel + " pas de undefined");
    assert(html.indexOf("Nice") !== -1 || html.indexOf("Côte") !== -1 || html.indexOf("Alpes-Maritimes") !== -1, rel + " contenu local");
  }
});

["cagnes-sur-mer", "saint-laurent-du-var", "vence", "le-cannet"].forEach(function (slug) {
  ["assurance-animaux", "assurance-chien", "assurance-chat", "assurance-vtc", "assurance-chasse"].forEach(function (dir) {
    var rel = dir + "/" + slug + "/index.html";
    assert(exists(rel), "geo " + rel);
    if (exists(rel)) {
      var html = read(rel);
      assert(html.indexOf("undefined") === -1, rel + " pas de undefined");
      assert(
        html.indexOf("Côte") !== -1 ||
          html.indexOf("Cote") !== -1 ||
          html.indexOf("06") !== -1 ||
          html.indexOf("Alpes-Maritimes") !== -1 ||
          html.indexOf("Nice") !== -1,
        rel + " ancre locale"
      );
    }
  });
});

assert(read("assurance-vtc/aeroport-nice/index.html").indexOf("NCE") !== -1, "aéroport NCE");
assert(read("assurance-animaux/nice-cote-azur/index.html").indexOf("Cagnes") !== -1, "hub animaux Cagnes");
assert(read("assurance-chasse/cote-d-azur/index.html").indexOf("Mercantour") !== -1, "chasse Mercantour");
assert(read("scripts/seo-gsc-priority-urls.cjs").indexOf("nice-cote-azur") !== -1, "GSC hub Nice");
assert(read("scripts/seo-gsc-priority-urls.cjs").indexOf("aeroport-nice") !== -1, "GSC aéroport Nice");
assert(read("AGENTS.md").indexOf("nice-cote-azur") !== -1 || read("AGENTS.md").indexOf("Côte d'Azur") !== -1, "AGENTS.md mention");

var cities = JSON.parse(read("seo/france-cities.json"));
bassin.allSlugs().forEach(function (slug) {
  assert(
    cities.some(function (c) {
      return c.slug === slug;
    }),
    "ville JSON " + slug
  );
});

assert(read("scripts/build-france-cities-json.cjs").indexOf("newCityRows()") !== -1, "newCityRows() utilisé pour france-cities");
assert(bassin.newCityRows().length === 17, "17 communes 06 nouvelles");

var marseilleVtc = read("assurance-vtc/marseille/index.html");
assert(marseilleVtc.indexOf("NCE") === -1, "Marseille VTC sans NCE");
assert(marseilleVtc.indexOf("axe VTC Cote d Azur") === -1, "Marseille VTC sans H2 Côte d Azur");
assert(marseilleVtc.indexOf("Promenade des Anglais") === -1, "Marseille VTC sans Promenade");
var toulonVtc = read("assurance-vtc/toulon/index.html");
assert(toulonVtc.indexOf("NCE") === -1, "Toulon VTC sans NCE");
var avignonVtc = exists("assurance-vtc/avignon/index.html") ? read("assurance-vtc/avignon/index.html") : "";
if (avignonVtc) assert(avignonVtc.indexOf("NCE") === -1, "Avignon VTC sans NCE");

bassin.allSlugs().forEach(function (slug) {
  ["pret-immobilier", "credit-immo"].forEach(function (dir) {
    var rel = dir + "/" + slug + "/index.html";
    assert(exists(rel), "page pret/credit " + rel);
    var html = read(rel);
    assert(html.indexOf("/pret-immobilier/nancy-metropole/") !== -1 || html.indexOf("/credit-immo/nancy-metropole/") !== -1, slug + " " + dir + " lien Nancy");
    if (bassin.isNewBassinCity(slug)) {
      assert(html.indexOf("noindex") !== -1, slug + " " + dir + " noindex");
      assert(html.indexOf("nancy-metropole") !== -1, slug + " " + dir + " canonique/lien Nancy");
      assert(html.indexOf("ville=Nancy") !== -1, slug + " " + dir + " CTA Nancy");
    }
  });
});

var smGeo = exists("sitemap-geo.xml") ? read("sitemap-geo.xml") : "";
assert(smGeo.indexOf("/pret-immobilier/cagnes-sur-mer/") === -1, "sitemap sans pret Cagnes");
assert(smGeo.indexOf("/credit-immo/cagnes-sur-mer/") === -1, "sitemap sans credit Cagnes");
assert(smGeo.indexOf("/pret-immobilier/nice/") !== -1, "sitemap garde pret Nice existant");

var sm = exists("sitemap-main.xml") ? read("sitemap-main.xml") : "";
assert(sm.indexOf("/nice-cote-azur/") >= 0, "sitemap hub Nice");
assert(sm.indexOf("/assurance-vtc/aeroport-nice/") >= 0, "sitemap aéroport Nice");
assert(sm.indexOf("/assurance-animaux/nice-cote-azur/") >= 0, "sitemap animaux Côte d'Azur");

process.exit(failed ? 1 : 0);
