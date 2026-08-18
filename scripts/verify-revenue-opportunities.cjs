#!/usr/bin/env node
/** Vérifie le hub Revenus & opportunités CRM. */
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

assert(fs.existsSync(path.join(root, "crm-revenue-opportunities.html")), "page CRM hub");
assert(fs.existsSync(path.join(root, "crm-revenue-opportunities.js")), "script hub");
assert(fs.existsSync(path.join(root, "data/revenue-opportunities.json")), "registre JSON");

var data = JSON.parse(read("data/revenue-opportunities.json"));
assert(Array.isArray(data.ideas) && data.ideas.length >= 8, "au moins 8 idées");
assert(
  data.ideas.some(function (i) {
    return i.source === "agent_cursor";
  }),
  "idées agent_cursor présentes"
);

var sidebar = read("js/crm-sidebar.js");
assert(sidebar.indexOf("crm-revenue-opportunities.html") >= 0, "lien sidebar");

var shell = read("js/crm-subpage-shell.js");
assert(shell.indexOf("crm-revenue-opportunities.html") >= 0, "PAGE_META hub");

var crm = read("crm.html");
assert(crm.indexOf("crm-revenue-opportunities.html") >= 0, "carte workflow crm.html");

var js = read("crm-revenue-opportunities.js");
assert(js.indexOf("revenue-opportunities.json") >= 0, "charge le JSON");
assert(js.indexOf("meta-rotation") >= 0, "CPL Meta live");

process.exit(failed ? 1 : 0);
