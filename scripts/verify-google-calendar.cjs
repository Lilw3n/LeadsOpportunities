#!/usr/bin/env node
var fs = require("fs");
var path = require("path");

var ROOT = path.join(__dirname, "..");
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
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

var oauth = read("api/_lib/google-oauth.js");
assert(oauth.indexOf("auth/calendar") !== -1, "OAuth : scope Calendar complet");
assert(oauth.indexOf("access_type") !== -1 && oauth.indexOf("offline") !== -1, "OAuth : access_type offline");
assert(oauth.indexOf("prompt") !== -1 && oauth.indexOf("consent") !== -1, "OAuth : prompt consent");
assert(oauth.indexOf("include_granted_scopes") !== -1, "OAuth : include_granted_scopes");

var schema = read("api/_lib/ensure-schema.js");
assert(schema.indexOf("ensureCalendarSchema") !== -1, "ensure-schema : colonnes agenda");
assert(schema.indexOf("google_refresh_token") !== -1, "colonne google_refresh_token");
assert(schema.indexOf("google_event_id") !== -1, "colonne google_event_id");

var cal = read("api/_lib/google-calendar.js");
assert(cal.indexOf("pushUnsyncedCrmEvents") !== -1, "push des RDV CRM vers Google");
assert(cal.indexOf("ensureGoogleAgendaContact") !== -1, "contact technique Agenda Google");
assert(cal.indexOf("ensureCalendarSchema") !== -1, "calendar lib appelle le schéma");

var sync = read("api/_lib/routes/crm-calendar-sync.js");
assert(sync.indexOf("resolveInnerOp") !== -1, "sync : ignore collision ?action=");
assert(sync.indexOf('op === "connect"') !== -1, "route connect");
assert(sync.indexOf('op === "sync"') !== -1, "route sync bidirectionnelle");
assert(sync.indexOf("pushUnsyncedCrmEvents") !== -1, "sync pousse les RDV");
assert(sync.indexOf("runCalendarPull") !== -1, "sync importe Google");

var ca = require("../api/_lib/catch-all-action");
var routes = { "calendar-sync": true, events: true };
assert(
  ca.resolveCatchAllAction(
    { query: { action: ["calendar-sync", "sync"] }, url: "/api/crm/calendar-sync?action=sync" },
    routes,
    /\/api\/crm\/([^/?#]+)/
  ) === "calendar-sync",
  "routeur : collision query action"
);
assert(
  ca.resolveInnerOp(
    { query: { action: ["calendar-sync", "connect"] }, url: "/api/crm/calendar-sync?action=connect" },
    { status: 1, connect: 1, sync: 1 },
    "status",
    {}
  ) === "connect",
  "inner op : connect malgré collision"
);
assert(
  ca.resolveInnerOp(
    { query: { action: "calendar-sync", op: "sync" }, url: "/api/crm/calendar-sync?op=sync" },
    { status: 1, connect: 1, sync: 1 },
    "status",
    {}
  ) === "sync",
  "inner op : query op"
);
assert(
  ca.resolveInnerOp(
    { query: { action: "calendar-sync" }, url: "/api/crm/calendar-sync" },
    { status: 1, connect: 1, sync: 1 },
    "status",
    { op: "connect" }
  ) === "connect",
  "inner op : body POST"
);

var pull = read("api/_lib/routes/crm-calendar-pull.js");
assert(pull.indexOf("runCalendarPull") !== -1, "pull exporté");
assert(pull.indexOf("ct_google_agenda") !== -1 || read("api/_lib/google-calendar.js").indexOf("ct_google_agenda") !== -1, "id contact Google");

var cb = read("api/_lib/routes/google-callback.js");
assert(cb.indexOf("google_calendar") !== -1, "callback purpose agenda");
assert(cb.indexOf("refresh_token") !== -1, "callback exige refresh_token");
assert(cb.indexOf("calendar=connected") !== -1, "redirect calendar=connected");
assert(cb.indexOf("ensureCalendarSchema") !== -1, "callback crée les colonnes");

var ui = read("crm-calendar.js");
assert(ui.indexOf("startGoogleConnect") !== -1, "UI : Connecter Google");
assert(ui.indexOf("calendarApi") !== -1, "UI : helper API agenda");
assert(ui.indexOf('calendarApi("sync")') !== -1, "UI : Synchroniser = op sync");
assert(ui.indexOf('calendarApi("connect")') !== -1, "UI : Connecter = op connect");
assert(ui.indexOf('get("calendar")') !== -1, "UI : auto-sync après OAuth");
assert(ui.indexOf("calendar_error") !== -1, "UI : erreur OAuth affichée");

var html = read("crm-calendar.html");
assert(html.indexOf("btnConnectCal") !== -1, "bouton Connecter Google");
assert(html.indexOf("btnPullCal") !== -1, "bouton Synchroniser Google");

var routes = read("api/crm/[action].js");
assert(routes.indexOf("calendar-sync") !== -1, "route CRM calendar-sync enregistrée");
assert(routes.indexOf("resolveCatchAllAction") !== -1, "routeur CRM : collision [action]");

["api/_lib/catch-all-action.js", "api/_lib/google-calendar.js", "api/_lib/google-oauth.js", "api/_lib/routes/crm-calendar-sync.js", "api/_lib/routes/crm-calendar-pull.js", "api/_lib/routes/google-callback.js", "api/_lib/ensure-schema.js"].forEach(function (rel) {
  try {
    require("fs");
    require("child_process").execFileSync(process.execPath, ["--check", path.join(ROOT, rel)], { stdio: "pipe" });
    assert(true, "syntaxe " + rel);
  } catch (e) {
    assert(false, "syntaxe " + rel + " " + (e.stderr || e.message));
  }
});

if (failed) {
  console.log("\n" + failed + " contrôle(s) en échec");
  process.exit(1);
}
console.log("\nConnexion / sync Google Calendar : OK");
