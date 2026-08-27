#!/usr/bin/env node
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

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

assert(exists("crm-todoist.html"), "page CRM Todoist");
assert(exists("crm-todoist.js"), "js CRM Todoist");
assert(exists("docs/TODOIST.md"), "doc TODOIST.md");
assert(exists("api/_lib/todoist.js"), "lib todoist");
assert(exists("api/_lib/todoist-oauth.js"), "oauth todoist");
assert(read("api/auth/[action].js").indexOf("todoist-callback") >= 0, "auth callback");
assert(read("api/crm/[action].js").indexOf("crm-todoist") >= 0, "route crm/todoist");
assert(read("api/_lib/lead-post-ingest.js").indexOf("createTaskForLead") >= 0, "lead → tâche");
assert(read("api/_lib/ensure-schema.js").indexOf("todoist_access_token") >= 0, "colonne users");
assert(read("js/crm-sidebar.js").indexOf("crm-todoist.html") >= 0, "menu CRM");
assert(read("crm-contact.html").indexOf("btnTodoistFiche") >= 0, "bouton fiche");
assert(read("CONNECT.md").indexOf("TODOIST_API_TOKEN") >= 0, "CONNECT.md");
assert(read(".env.example").indexOf("TODOIST_API_TOKEN") >= 0, ".env.example");
assert(read("api/_lib/todoist-oauth.js").indexOf("app.todoist.com/oauth/authorize") >= 0, "authorize URL");
assert(read("crm-todoist.js").indexOf("op=connect") >= 0, "connect authentifié");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK Todoist CRM");
