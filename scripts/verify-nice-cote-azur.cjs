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

function hasLocalAnchor(html) {
  return (
    html.indexOf("Côte") !== -1 ||
    html.indexOf("Cote") !== -1 ||
    html.indexOf("06") !== -1 ||
    html.indexOf("Alpes-Maritimes") !== -1 ||
    html.indexOf("Nice") !== -1
  );
}

bassin.allSlugs().forEach(function (slug) {
  ["assurance-animaux", "assurance-chien", "assurance-chat", "assurance-vtc", "assurance-chasse"].forEach(function (dir) {
    var rel = dir + "/" + slug + "/index.html";
    assert(exists(rel), "geo " + rel);
    if (!exists(rel)) return;
    var html = read(rel);
    assert(html.indexOf("undefined") === -1, rel + " pas de undefined");
    assert(hasLocalAnchor(html), rel + " ancre locale");
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

/** Retire le libellé région PACA pour détecter la copie Nice (NCE / Côte d'Azur) hors bassin. */
function withoutPacaRegionLabel(html) {
  return String(html || "")
    .replace(/Provence-Alpes-C[oô]te d['’ ]?Azur/gi, "")
    .replace(/provence-alpes-cote-d-azur/gi, "");
}

function assertNoNiceVtcCopy(rel) {
  if (!exists(rel)) {
    assert(true, rel + " absente (pas de copie NCE)");
    return;
  }
  var html = read(rel);
  var rest = withoutPacaRegionLabel(html);
  assert(html.indexOf("NCE") === -1, rel + " sans NCE");
  assert(rest.indexOf("Cote d Azur") === -1, rel + " sans « Cote d Azur » hors PACA");
  assert(rest.indexOf("Côte d'Azur") === -1 && rest.indexOf("Côte d’Azur") === -1, rel + " sans « Côte d'Azur » hors PACA");
  assert(html.indexOf("Promenade des Anglais") === -1, rel + " sans Promenade des Anglais");
  assert(html.indexOf("axe VTC Cote d Azur") === -1, rel + " sans H2 axe VTC Côte d Azur");
}

["assurance-vtc/marseille/index.html", "assurance-vtc/toulon/index.html", "assurance-vtc/avignon/index.html", "assurance-vtc/aix-en-provence/index.html"].forEach(assertNoNiceVtcCopy);

function hasNancyCreditLink(html) {
  return html.indexOf("/pret-immobilier/nancy-metropole/") !== -1 || html.indexOf("/credit-immo/nancy-metropole/") !== -1;
}

function hasNoindex(html) {
  return /name=["']robots["']\s+content=["'][^"']*noindex/i.test(html);
}

function hasIndexFollow(html) {
  return /name=["']robots["']\s+content=["']index,follow["']/i.test(html);
}

bassin.allSlugs().forEach(function (slug) {
  ["pret-immobilier", "credit-immo"].forEach(function (dir) {
    var rel = dir + "/" + slug + "/index.html";
    if (!exists(rel)) {
      assert(true, slug + " " + dir + " absente (OK : pas de hub crédit 06)");
      return;
    }
    var html = read(rel);
    assert(hasNoindex(html) || hasNancyCreditLink(html), slug + " " + dir + " absente/noindex/lien nancy-metropole");
    if (bassin.isNewBassinCity(slug)) {
      assert(hasNoindex(html), slug + " " + dir + " noindex (nouvelle commune 06)");
      assert(!hasIndexFollow(html), slug + " " + dir + " CTA/robots pas index,follow");
      assert(hasNancyCreditLink(html), slug + " " + dir + " lien /…/nancy-metropole/");
      assert(html.indexOf("ville=Nancy") !== -1, slug + " " + dir + " CTA ville=Nancy");
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
