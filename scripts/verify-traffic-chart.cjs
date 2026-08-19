#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var Chart = require("../js/traffic-chart-lib");
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
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

var iso = "2026-06-20T00:00:00.000Z";
assert(Chart.normalizeDay(iso) === "2026-06-20", "ISO Neon → YYYY-MM-DD (got " + Chart.normalizeDay(iso) + ")");
assert(Chart.formatDayLabel(iso) === "20/06", "libellé jj/mm, pas de T00:00 (got " + Chart.formatDayLabel(iso) + ")");
assert(Chart.formatDayLabel("2026-08-19") === "19/08", "date déjà normalisée");

var filled = Chart.fillTrendDays(
  [{ day: iso, visitors: 12, page_views: 20 }],
  3,
  "2026-06-21"
);
assert(filled.length === 3, "3 jours remplis");
assert(filled[0].day === "2026-06-19" && filled[0].visitors === 0, "jour manquant à 0");
assert(filled[1].day === "2026-06-20" && filled[1].visitors === 12, "jour ISO fusionné");

var svg = Chart.renderSvg(filled);
assert(svg.indexOf("<svg") >= 0, "SVG généré");
assert(svg.indexOf("T00:00") < 0, "pas d’ISO brut dans le SVG");
assert(svg.indexOf("20/06") >= 0, "axe X en jj/mm");
assert(/path d="M/.test(svg), "courbe SVG (path)");
assert(svg.indexOf("visiteurs") >= 0, "tooltip visiteurs");

var html = read("crm-trafic.html");
assert(html.indexOf("traffic-chart-lib.js") >= 0, "page charge la lib courbe");
assert(html.indexOf("traf-bar-label") < 0, "plus de labels ISO rotatés");

var js = read("crm-trafic.js");
assert(js.indexOf("TrafficChart") >= 0, "JS utilise TrafficChart");
assert(js.indexOf("slice(5)") < 0, "plus de slice(5) sur la date");

var api = read("api/_lib/traffic-stats.js");
assert(api.indexOf("fillTrendDays") >= 0, "API normalise la série");
assert(api.indexOf("normalizeDay") >= 0, "API normalise day");

["js/traffic-chart-lib.js", "crm-trafic.js", "api/_lib/traffic-stats.js"].forEach(function (rel) {
  require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
  assert(true, "syntaxe " + rel);
});

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nContrôles courbe trafic OK.");
