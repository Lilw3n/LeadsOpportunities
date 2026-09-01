#!/usr/bin/env node
/** Vérifie que le fix spinner + historique o2switch est présent dans le code. */
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

var mbx = fs.readFileSync(path.join(root, "js/dashboard-mailbox.js"), "utf8");
try {
  require("child_process").execSync("node --check " + JSON.stringify(path.join(root, "js/dashboard-mailbox.js")), {
    stdio: "pipe",
  });
  assert(true, "dashboard-mailbox.js syntaxe JS valide");
} catch (e) {
  assert(false, "dashboard-mailbox.js syntaxe JS INVALIDE");
}
var svc = fs.readFileSync(path.join(root, "api/_lib/mailbox-sync-service.js"), "utf8");
var html = fs.readFileSync(path.join(root, "dashboard.html"), "utf8");

assert(mbx.indexOf("backfillMailboxO2switch") >= 0, "backfillMailboxO2switch");
assert(mbx.indexOf("showDetailPane(false);\n    renderList();") >= 0, "pickDefaultSelection appelle renderList");
assert(mbx.indexOf("renderList();") >= 0 && mbx.indexOf("skipAutoSelect: true") >= 0, "ingestMessages robuste");
assert(mbx.indexOf("AbortController") >= 0, "timeout client mailbox-list");
assert(svc.indexOf('reason: "list_only"') >= 0, "listWithAutoSync sans sync bloquante par défaut");
assert(html.indexOf("mailboxBackfillBtn") >= 0, "bouton Historique o2switch");
assert(html.indexOf('data-mailbox-source="unified"') >= 0, "filtre vue unifiée");
assert(mbx.indexOf("setMailboxSource") >= 0, "setMailboxSource export");
assert(mbx.indexOf("parseLeadPayload(m.body_text) || {}") >= 0, "isExpressCallback null-safe");
assert(mbx.indexOf("p.callbackRequested") >= 0, "callbackRequested check");
assert(typeof require("../api/_lib/mail-imap").backfillImapInbox === "function", "backfillImapInbox export");

process.exit(failed ? 1 : 0);
