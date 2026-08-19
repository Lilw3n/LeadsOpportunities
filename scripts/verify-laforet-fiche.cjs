#!/usr/bin/env node
/** Vérifie fiche Laforêt complète (checklist, copro, construction, mobilier, matrice). */
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

[
  "js/acheteur-immo-copro-works.js",
  "js/acheteur-immo-laforet-extras.js",
].forEach(function (f) {
  assert(fs.existsSync(path.join(root, f)), f + " existe");
});

var html = read("landings/acheteur-immo.html");
assert(html.indexOf("data-copro-works-mount") >= 0, "table travaux copro");
assert(html.indexOf("data-sell-recent-build-toggle") >= 0, "construction <10 ans");
assert(html.indexOf("data-sell-furniture-toggle") >= 0, "mobilier inclus");
assert(html.indexOf("data-timeline-matrix") >= 0, "matrice passé/présent/futur");
assert(html.indexOf("data-sell-docs-mount") >= 0, "checklist pièces justificatives");
assert(html.indexOf('name="sellDoc[]"') >= 0, "checkboxes documents");
assert(html.indexOf("sellGes") >= 0, "GES descriptif");

var css = read("landings/css/immo-parcours.css");
assert(css.indexOf("immo-timeline-matrix") >= 0, "CSS matrice timeline");
assert(css.indexOf("immo-docs-checklist") >= 0, "CSS checklist docs");

var printJs = read("js/acheteur-immo-print.js");
assert(printJs.indexOf("collectCoproWorks") >= 0, "impression travaux copro");
assert(printJs.indexOf("collectTimelineMatrix") >= 0, "impression matrice");

process.exit(failed ? 1 : 0);
