/**
 * Télécharge les DVF (geo-dvf) et produit :
 * - data/dvf-54-sales.json — ventes géolocalisées Meurthe-et-Moselle (estimation par adresse)
 * - data/dvf-france-communes.json — médianes €/m² par commune (France hors Alsace-Moselle)
 *
 * Usage: npm run dvf:build
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const {
  DVF_DEPT_URL,
  SKIP_DEPTS,
  ingestDvfText,
  aggregateCommune,
  compactSale,
} = require("./dvf-estimate-lib.cjs");

const ROOT = path.join(__dirname, "..");
const CACHE = path.join(ROOT, ".cache", "dvf");
const OUT_54 = path.join(ROOT, "data", "dvf-54-sales.json");
const OUT_FR = path.join(ROOT, "data", "dvf-france-communes.json");

function padDept(n) {
  return String(n).padStart(2, "0");
}

async function fetchDeptCsv(dept) {
  fs.mkdirSync(CACHE, { recursive: true });
  var cachePath = path.join(CACHE, dept + ".csv.gz");
  if (!fs.existsSync(cachePath)) {
    var url = DVF_DEPT_URL.replace("{dept}", dept);
    console.log("download", dept, url);
    var res = await fetch(url);
    if (!res.ok) throw new Error("DVF download failed " + dept + " " + res.status);
    var buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(cachePath, buf);
  }
  return zlib.gunzipSync(fs.readFileSync(cachePath)).toString("utf8");
}

async function main() {
  var france = {
    meta: {
      source: "DVF open data DGFiP / geo-dvf",
      builtAt: new Date().toISOString().slice(0, 10),
      note: "Médianes €/m² sur ventes 5 ans. Alsace-Moselle (67, 68, 57) non couverts par la DVF publique.",
    },
    communes: {},
  };
  var sales54 = [];

  for (var d = 1; d <= 95; d++) {
    var dept = padDept(d);
    if (SKIP_DEPTS[dept]) {
      console.log("skip", dept, "(pas de DVF publique)");
      continue;
    }
    var text;
    try {
      text = await fetchDeptCsv(dept);
    } catch (e) {
      console.warn("warn", dept, e.message);
      continue;
    }
    var byCommune = {};
    var n = ingestDvfText(text, function (sale) {
      if (!byCommune[sale.commune]) byCommune[sale.commune] = [];
      byCommune[sale.commune].push(sale);
      if (sale.dept === "54") sales54.push(sale);
    });
    Object.keys(byCommune).forEach(function (code) {
      var agg = aggregateCommune(byCommune[code]);
      var name = byCommune[code][0] && byCommune[code][0].communeName;
      france.communes[code] = Object.assign({ name: name, dept: dept }, agg);
    });
    console.log("dept", dept, "sales", n, "communes", Object.keys(byCommune).length);
  }

  fs.mkdirSync(path.dirname(OUT_FR), { recursive: true });
  fs.writeFileSync(OUT_FR, JSON.stringify(france));
  console.log("written", OUT_FR, "communes", Object.keys(france.communes).length);

  var compact = sales54.map(compactSale);
  fs.writeFileSync(
    OUT_54,
    JSON.stringify({
      meta: {
        dept: "54",
        builtAt: france.meta.builtAt,
        count: compact.length,
        source: france.meta.source,
      },
      sales: compact,
    })
  );
  console.log("written", OUT_54, "sales", compact.length);

  var priority = ["54549", "54159", "54483", "54395", "54528", "54547"];
  priority.forEach(function (code) {
    var c = france.communes[code];
    if (!c) return;
    console.log(
      " ",
      c.name,
      "maison",
      c.maison && c.maison.medianM2,
      "€/m²",
      "(" + (c.maison && c.maison.count) + " ventes)"
    );
  });
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
