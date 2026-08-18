#!/usr/bin/env node
/**
 * Recherche leads poussée — dont par ID Slack (UUID).
 */
var fs = require("fs");
var path = require("path");
var Search = require("../api/_lib/lead-search");
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

var slackId = "734978c7-8710-41b7-969a-07a88ab307d5";
assert(Search.isLeadUuid(slackId), "UUID Slack du 16 août reconnu");
assert(Search.isLeadUuid(slackId.toUpperCase()), "UUID insensible à la casse");
assert(!Search.isLeadUuid("ed145c4e"), "fragment ≠ UUID");
assert(!Search.isLeadUuid(""), "vide ≠ UUID");

var hay = Search.leadHaystack({
  id: slackId,
  email: "",
  phone: "",
  source: "landing_quick",
  vertical: "acheteur_immo",
});
assert(hay.indexOf(slackId) >= 0, "haystack contient l’ID même sans email");
assert(Search.leadMatchesQuery({ id: slackId, email: "" }, slackId), "match exact par ID");
assert(Search.leadMatchesQuery({ id: slackId, email: "a@b.fr" }, "a@b"), "match email inchangé");
assert(Search.crmLeadDetailPath(slackId).indexOf(slackId) >= 0, "lien fiche lead");
assert(Search.dashboardLeadPath(slackId).indexOf("section=leads") >= 0, "lien dashboard");

var ingest = read("api/_lib/lead-post-ingest.js");
assert(ingest.indexOf("crm-lead-detail.html?id=") >= 0, "Slack ouvre la fiche par ID");
assert(ingest.indexOf("dashboard.html?section=leads&lead=") >= 0, "Slack lien dashboard");
assert(ingest.indexOf("Sans email ni téléphone") >= 0, "Slack signale l’absence de coordonnées");

var leadsApi = read("api/_lib/routes/leads.js");
assert(leadsApi.indexOf("LOWER(id)") >= 0, "liste dashboard cherche l’ID");
assert(leadsApi.indexOf("exactId") >= 0, "lookup UUID hors pagination");
assert(leadsApi.indexOf("leadListSearchMatch") >= 0, "clause recherche partagée");

var uni = read("api/_lib/routes/crm-universal-search.js");
assert(uni.indexOf("entity === \"leads\"") >= 0, "recherche universelle : entité leads");
assert(uni.indexOf("results.leads") >= 0, "résultats leads");

var acq = read("api/_lib/routes/crm-leads-acquisition.js");
assert(acq.indexOf("fetchLeadRowById") >= 0, "pipeline : lookup ID hors 150");
assert(acq.indexOf("leadMatchesQuery") >= 0, "pipeline : match ID/email/tél");

var hub = read("api/_lib/routes/crm-leads-hub.js");
assert(hub.indexOf("isLeadUuid") >= 0, "hub : UUID");
assert(hub.indexOf("it.id") >= 0, "hub filtre sur id");

var detail = read("api/_lib/routes/lead-detail.js");
assert(detail.indexOf("LOWER(id) = LOWER(${leadId})") >= 0, "fiche dashboard ID insensible à la casse");

var crmDetail = read("api/_lib/routes/crm-lead-acquisition.js");
assert(crmDetail.indexOf("LOWER(id) = LOWER(${leadId})") >= 0, "fiche CRM ID insensible à la casse");

var dash = read("dashboard.html");
assert(dash.indexOf("ID Slack") >= 0, "dashboard placeholder ID");
assert(dash.indexOf("lead-search-lib.js") >= 0, "dashboard charge lead-search-lib");
assert(dash.indexOf("params.get(\"lead\") || params.get(\"id\")") >= 0, "dashboard ?lead= et ?id=");

var searchPage = read("crm-search.html");
assert(searchPage.indexOf('value="leads"') >= 0, "recherche : option Leads");
assert(searchPage.indexOf(slackId) >= 0, "exemple UUID Slack");

var searchJs = read("crm-search.js");
assert(searchJs.indexOf("crm-lead-detail.html?id=") >= 0, "résultats leads → fiche");
assert(searchJs.indexOf("boot.get(\"q\")") >= 0, "deep-link crm-search.html?q=");

var acqJs = read("crm-acquisition.js");
assert(acqJs.indexOf("crm-lead-detail.html?id=") >= 0, "acquisition redirige UUID vers fiche");
assert(acqJs.indexOf("&q=") >= 0, "acquisition envoie q à l’API");

var libJs = read("js/lead-search-lib.js");
assert(libJs.indexOf("isLeadUuid") >= 0, "lib navigateur UUID");

[
  "api/_lib/lead-search.js",
  "js/lead-search-lib.js",
  "api/_lib/routes/leads.js",
  "api/_lib/routes/crm-universal-search.js",
  "api/_lib/routes/crm-leads-hub.js",
  "api/_lib/routes/crm-leads-acquisition.js",
  "api/_lib/lead-post-ingest.js",
  "crm-acquisition.js",
  "crm-leads.js",
  "crm-search.js",
  "crm-lead-detail.js",
].forEach(function (rel) {
  require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
  assert(true, "syntaxe " + rel);
});

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nContrôles recherche leads par ID OK.");
