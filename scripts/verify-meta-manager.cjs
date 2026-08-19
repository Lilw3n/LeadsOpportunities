#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var Meta = require("../api/_lib/meta-manager");
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

var pageUrl = Meta.parseFacebookUrl("https://www.facebook.com/1183829618147455");
assert(pageUrl && pageUrl.type === "page" && pageUrl.trackable, "parse page numérique");

var groupUrl = Meta.parseFacebookUrl("https://www.facebook.com/groups/123456789");
assert(groupUrl && groupUrl.type === "group" && groupUrl.trackable === false, "groupe non trackable");

var slugUrl = Meta.parseFacebookUrl("facebook.com/leadsopportunities");
assert(slugUrl && slugUrl.trackable, "parse slug page");

assert(Meta.leadChannel({ source: "meta_lead_ads" }) === "lead_ads", "canal lead_ads");
assert(
  Meta.leadChannel({ source: "site", fbclid: "abc", payload: "{}" }) === "site_meta",
  "canal site_meta fbclid"
);
assert(Meta.leadChannel({ source: "site", payload: "{}" }) === "other", "autre source ignorée");

var cfg = Meta.loadPagesConfig();
assert(Array.isArray(cfg.pages) && cfg.pages.length >= 1, "config pages principale");
assert(cfg.primary_page_id, "primary_page_id défini");

var tmpReg = path.join(__dirname, "..", "data/meta-pages-registry.json");
var backup = fs.existsSync(tmpReg) ? fs.readFileSync(tmpReg, "utf8") : null;
try {
  fs.writeFileSync(tmpReg, JSON.stringify({ pages: [], updated_at: null }, null, 2) + "\n");
  var added = Meta.registerPage({
    name: "Test verify",
    url: "https://www.facebook.com/groups/verify-test-857b",
    notes: "script verify",
  });
  assert(added.type === "group" && added.utm_template.indexOf("utm_source=facebook") >= 0, "register groupe + UTM");
  try {
    Meta.registerPage({ name: "dup", url: added.url });
    assert(false, "doublon doit échouer");
  } catch (e) {
    assert(/déjà/i.test(e.message), "refuse doublon");
  }
} finally {
  if (backup != null) fs.writeFileSync(tmpReg, backup);
  else if (fs.existsSync(tmpReg)) fs.unlinkSync(tmpReg);
}

[
  "api/_lib/meta-manager.js",
  "api/_lib/routes/crm-meta-manager.js",
  "crm-meta-manager.js",
].forEach(function (rel) {
  require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
  assert(true, "syntaxe " + rel);
});

var route = read("api/_lib/routes/crm-meta-manager.js");
assert(route.indexOf("isSiteAdmin") >= 0, "route utilise isSiteAdmin");

var action = read("api/crm/[action].js");
assert(action.indexOf('"meta-manager"') >= 0, "route CRM meta-manager");

var html = read("crm-meta-manager.html");
assert(html.indexOf("mmPanelOverview") >= 0 && html.indexOf("mmAddPageForm") >= 0, "UI gestionnaire");

var sidebar = read("js/crm-sidebar.js");
assert(sidebar.indexOf("crm-meta-manager.html") >= 0, "lien sidebar");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nContrôles gestionnaire Meta OK.");
