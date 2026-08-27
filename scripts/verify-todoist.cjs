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
assert(read("api/_lib/todoist.js").indexOf("syncCrmEventToTodoist") >= 0, "événement → tâche");
assert(read("api/_lib/routes/crm-events.js").indexOf("syncCrmEventToTodoist") >= 0, "POST events sync Todoist");
assert(read("api/_lib/routes/crm-events.js").indexOf("applyTodoistEventChange") >= 0, "PATCH events close Todoist");
assert(read("api/_lib/ensure-schema.js").indexOf("todoist_task_id") >= 0, "colonne crm_events.todoist_task_id");
assert(read("api/_lib/routes/crm-todoist.js").indexOf("sync-events") >= 0, "op sync-events");
assert(read("crm-todoist.js").indexOf("sync-events") >= 0, "bouton sync événements");
assert(read("crm-event-manager.html").indexOf("emTodoistBar") >= 0, "barre Todoist gestionnaire");
assert(read("crm-event-create.js").indexOf("todoistSync") >= 0, "message création Todoist");
assert(read("api/_lib/ensure-schema.js").indexOf("todoist_access_token") >= 0, "colonne users");
assert(read("js/crm-sidebar.js").indexOf("crm-todoist.html") >= 0, "menu CRM");
assert(read("crm-contact.html").indexOf("btnTodoistFiche") >= 0, "bouton fiche");
assert(read("CONNECT.md").indexOf("TODOIST_API_TOKEN") >= 0, "CONNECT.md");
assert(read(".env.example").indexOf("TODOIST_API_TOKEN") >= 0, ".env.example");
assert(read("api/_lib/todoist-oauth.js").indexOf("app.todoist.com/oauth/authorize") >= 0, "authorize URL");
assert(read("crm-todoist.js").indexOf("op=connect") >= 0, "connect authentifié");

var todoist = require(path.join(root, "api/_lib/todoist.js"));
var timed = todoist.eventDuePayload("2026-09-01", "14:30");
assert(timed.dueString === "2026-09-01 14:30", "échéance RDV avec heure");
var day = todoist.eventDuePayload("2026-09-01", "");
assert(day.dueDate === "2026-09-01", "échéance journée entière");
assert(todoist.isoDateOnly(new Date("2026-08-27T00:00:00.000Z")) === "2026-08-27", "isoDateOnly Date");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK Todoist CRM");
