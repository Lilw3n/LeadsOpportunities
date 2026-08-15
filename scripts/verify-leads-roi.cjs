#!/usr/bin/env node
/**
 * Vérifie le dashboard leads avancé (volume × réseau × CPL).
 */
var fs = require("fs");
var path = require("path");
var Roi = require("../api/_lib/leads-roi-lib");
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

var parts = Roi.distributeSpend(10, "2026-08-01", "2026-08-10");
assert(parts.length === 10, "répartition 10 jours (got " + parts.length + ")");
var sum = parts.reduce(function (s, p) {
  return s + p.amount_eur;
}, 0);
assert(Math.abs(sum - 10) < 0.02, "somme répartition = 10 (got " + sum + ")");

var spend = Roi.computeSpend(true, ["2026-08-01", "2026-08-02"], 1, { "2026-08-01": 4 });
assert(spend.spend_eur === 5, "mix réel + budget (got " + spend.spend_eur + ")");
assert(spend.actual_days === 1 && spend.actual_eur === 4, "1 jour validé = 4 €");
assert(spend.estimated_days === 1 && spend.estimated_eur === 1, "1 jour non validé = 1 €");
assert(spend.period_days === 2, "période 2 jours");
assert(Roi.computeSpend(false, ["2026-08-01"], 9, {}).spend_eur === 0, "organique = 0 €");

var rows = [
  {
    source: "landing_form",
    vertical: "chasse",
    lead_score: 100,
    created_at: "2026-08-10T10:00:00.000Z",
    payload: { parcours_id: "meta_lead_rapide", fbclid: "IwAR0x" },
  },
  {
    source: "landing_form",
    vertical: "vtc",
    lead_score: 80,
    created_at: "2026-08-11T10:00:00.000Z",
    payload: { source: "landing_form" },
  },
  {
    source: "landing_quick",
    vertical: "sante",
    lead_score: 40,
    gclid: "Cj0KCQ",
    created_at: "2026-08-12T10:00:00.000Z",
    payload: {},
  },
];

var agg = Roi.aggregateLeadsRoi(rows, {
  days: 7,
  since: "2026-08-08T00:00:00.000Z",
  costs: {
    facebook: { daily_budget_eur: 1, actualByDay: {} },
    google: { daily_budget_eur: 2, actualByDay: {} },
  },
});

assert(agg.total === 3, "3 leads agrégés");
var meta = agg.platforms.filter(function (p) {
  return p.id === "facebook";
})[0];
var site = agg.platforms.filter(function (p) {
  return p.id === "site_web";
})[0];
var google = agg.platforms.filter(function (p) {
  return p.id === "google";
})[0];
assert(meta && meta.leads === 1, "chasse fbclid → Meta");
assert(site && site.leads === 1 && site.spend_eur === 0, "landing_form sans clic → organique 0 €");
assert(google && google.leads === 1, "gclid → Google");
assert(meta.cpl_eur === 7, "CPL Meta = 7 € sur 7 j à 1 €/j (got " + (meta && meta.cpl_eur) + ")");
assert(google.cpl_eur === 14, "CPL Google = 14 € (got " + (google && google.cpl_eur) + ")");

var html = read("crm-leads-roi.html");
assert(html.indexOf("roiSpendForm") >= 0, "formulaire dépense réelle");
assert(html.indexOf("Dashboard leads avancé") >= 0, "titre page");

var js = read("crm-leads-roi.js");
assert(js.indexOf("/api/crm/leads-roi") >= 0, "JS appelle l’API");
assert(js.indexOf("op: \"budget\"") >= 0 || js.indexOf("op: 'budget'") >= 0, "POST budget");
assert(js.indexOf("Jours non validés") >= 0, "total jours non validés affiché");
assert(js.indexOf("Total période") >= 0, "total période par plateforme");
assert(js.indexOf("tableFootHtml") >= 0, "ligne total pubs du tableau");

var api = read("api/crm/[action].js");
assert(api.indexOf("leads-roi") >= 0, "route CRM enregistrée");

var side = read("js/crm-sidebar.js");
assert(side.indexOf("crm-leads-roi.html") >= 0, "sidebar : dashboard CPL");

["api/_lib/leads-roi-lib.js", "api/_lib/routes/crm-leads-roi.js", "api/_lib/ensure-schema.js"].forEach(
  function (rel) {
    require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
    assert(true, "syntaxe " + rel);
  }
);

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les contrôles dashboard leads avancé sont OK.");
