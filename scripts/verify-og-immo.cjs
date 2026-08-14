#!/usr/bin/env node
/**
 * Vérifie les visuels Open Graph immo (JPEG 1200×630) et les balises des pages partageables.
 */
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function jpegInfo(rel) {
  var buf = fs.readFileSync(path.join(ROOT, rel));
  var jpeg = buf[0] === 0xff && buf[1] === 0xd8;
  var w = 0;
  var h = 0;
  var i = 2;
  while (i < buf.length - 8) {
    if (buf[i] !== 0xff) break;
    var marker = buf[i + 1];
    var len = (buf[i + 2] << 8) + buf[i + 3];
    if (marker === 0xc0 || marker === 0xc2) {
      h = (buf[i + 5] << 8) + buf[i + 6];
      w = (buf[i + 7] << 8) + buf[i + 8];
      break;
    }
    i += 2 + len;
  }
  return { jpeg: jpeg, bytes: buf.length, w: w, h: h };
}

var files = [
  "og/og-acheteur-immo.jpg",
  "og/og-vendeur-immo.jpg",
  "og/og-acheteur-vendeur-immo.jpg",
  "og/og-immobilier.jpg",
  "og/og-negociateur-immo.jpg",
  "og/og-credit-immo.jpg",
];

files.forEach(function (rel) {
  var info = jpegInfo(rel);
  assert(info.jpeg, rel + " est un JPEG");
  assert(info.bytes > 20000, rel + " > 20 Ko (" + info.bytes + ")");
  assert(info.w === 1200 && info.h === 630, rel + " = 1200×630 (got " + info.w + "×" + info.h + ")");
});

function hasOg(rel, image, titleHint) {
  var html = read(rel);
  assert(html.indexOf('property="og:image"') !== -1, rel + " a og:image");
  assert(html.indexOf("/og/" + image) !== -1, rel + " pointe vers " + image);
  assert(html.indexOf("og-default.svg") === -1, rel + " n'utilise pas og-default.svg");
  assert(html.indexOf('name="twitter:card" content="summary_large_image"') !== -1, rel + " twitter:card large");
  if (titleHint) assert(html.indexOf(titleHint) !== -1, rel + " titre " + titleHint);
  assert(html.indexOf("http-equiv=\"refresh\"") === -1, rel + " pas de meta refresh (OG Facebook)");
}

hasOg("landings/acheteur-immo.html", "og-acheteur-immo.jpg", "Recherche de bien");
hasOg("landings/vendeur-immo.html", "og-vendeur-immo.jpg", "Déposer un bien");
hasOg("landings/acheteur-vendeur-immo.html", "og-acheteur-vendeur-immo.jpg", "Vendre et racheter");
hasOg("immobilier/index.html", "og-immobilier.jpg");
hasOg("negociateur-immobilier/index.html", "og-negociateur-immo.jpg");
hasOg("landings/credit-immo.html", "og-credit-immo.jpg");

var vendeur = read("landings/vendeur-immo.html");
assert(
  vendeur.indexOf('og:url" content="https://www.leadsopportunities.fr/landings/vendeur-immo.html"') !== -1,
  "vendeur-immo og:url = page dédiée (pas la vitrine)"
);
assert(vendeur.indexOf("role=vendeur") !== -1, "vendeur-immo redirige vers role=vendeur");

var dual = read("landings/acheteur-vendeur-immo.html");
assert(
  dual.indexOf('og:url" content="https://www.leadsopportunities.fr/landings/acheteur-vendeur-immo.html"') !== -1,
  "acheteur-vendeur og:url = page dédiée"
);
assert(dual.indexOf("role=les_deux") !== -1, "acheteur-vendeur redirige vers role=les_deux");

var catalog = read("js/service-catalog.js");
assert(catalog.indexOf("./landings/vendeur-immo.html") !== -1, "catalogue : landing vendeur dédiée");
assert(catalog.indexOf("./landings/acheteur-vendeur-immo.html") !== -1, "catalogue : landing double casquette");
assert(catalog.indexOf("acheteur-immo.html?role=vendeur") === -1, "catalogue : plus de query role pour le partage");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOG immo OK");
