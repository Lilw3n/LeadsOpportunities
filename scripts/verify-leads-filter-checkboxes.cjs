#!/usr/bin/env node
/** Vérifie filtres leads multi cases à cocher. */
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

var filters = require("../api/_lib/leads-filters");
assert(typeof filters.parseLeadListFilters === "function", "parseLeadListFilters");
assert(typeof filters.leadMatchesPlatforms === "function", "leadMatchesPlatforms");

var url = new URL("http://x/api?status=new,contacted&vertical=vtc,sante&platform=google,tiktok&view=new,relevant");
var parsed = filters.parseLeadListFilters(url);
assert(parsed.statuses && parsed.statuses.join(",") === "new,contacted", "multi status");
assert(parsed.verticals && parsed.verticals.indexOf("vtc") >= 0, "multi vertical");
assert(parsed.platforms && parsed.platforms.indexOf("tiktok") >= 0, "multi platform");
assert(parsed.views && parsed.views.indexOf("relevant") >= 0, "multi view");

assert(
  filters.leadMatchesPlatforms({ source: "landing_quick", utm_source: "google" }, ["google"]),
  "match google"
);
assert(
  !filters.leadMatchesPlatforms({ source: "landing_quick", utm_source: "newsletter" }, ["google"]),
  "no match google"
);

var leads = read("api/_lib/routes/leads.js");
assert(leads.indexOf("statusList") >= 0, "leads.js statusList");
assert(leads.indexOf("= ANY(${statusList})") >= 0 || leads.indexOf("ANY(${statusList})") >= 0, "SQL ANY status");
assert(leads.indexOf("viewsList") >= 0, "multi views");

var dash = read("dashboard.html");
assert(dash.indexOf("filter-cb") >= 0, "cases à cocher UI");
assert(dash.indexOf("filter-check-dd") >= 0, "menus multi-select");
assert(dash.indexOf("getCheckedFilterValues") >= 0, "JS lit les cases");
assert(dash.indexOf('data-group="status"') >= 0, "groupe status");
assert(dash.indexOf('data-group="platform"') >= 0, "groupe platform");
assert(dash.indexOf("Cases rapides") >= 0, "ligne cases rapides");

process.exit(failed ? 1 : 0);
