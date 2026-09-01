#!/usr/bin/env node
/** Vérifie Workspace mail (IMAP multi) + Drive miroir contact@. */
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

[
  "api/_lib/mail-imap.js",
  "api/_lib/drive-share.js",
  "docs/GOOGLE-WORKSPACE-DNS.md",
].forEach(function (f) {
  assert(fs.existsSync(path.join(root, f)), f + " existe");
});

var mail = require("../api/_lib/mail-imap");
assert(typeof mail.listImapSources === "function", "listImapSources");
assert(typeof mail.syncImapInbox === "function", "syncImapInbox");

process.env.MAIL_IMAP_PROVIDER = "both";
process.env.MAIL_IMAP_PASS_WORKSPACE = "ws-test";
process.env.MAIL_IMAP_PASS_O2SWITCH = "o2-test";
delete process.env.MAIL_IMAP_PASS;
var sources = mail.listImapSources();
assert(sources.length === 2, "both → 2 sources");
assert(sources.some(function (s) { return s.id === "workspace"; }), "source workspace");
assert(sources.some(function (s) { return s.id === "o2switch"; }), "source o2switch");

var shareSrc = read("api/_lib/drive-share.js");
assert(shareSrc.indexOf("function brokerEmails") >= 0, "brokerEmails");
assert(shareSrc.indexOf("function mirrorCopyFile") >= 0, "mirrorCopyFile");
assert(shareSrc.indexOf("GOOGLE_DRIVE_SHARE_EMAILS") >= 0, "SHARE_EMAILS");
assert(shareSrc.indexOf("contact@leadsopportunities.fr") >= 0, "mirror email défaut");

var uploadSrc = read("api/_lib/drive-upload-core.js");
assert(uploadSrc.indexOf("mirrorCopyFile") >= 0, "upload appelle mirror");
assert(uploadSrc.indexOf("shareFileWithBrokers") >= 0, "upload partage multi");

var dash = read("dashboard.html");
assert(dash.indexOf("mailboxWebmailWorkspaceBtn") >= 0, "bouton Gmail Workspace");
assert(dash.indexOf("mailboxWebmailBtn") >= 0, "bouton o2switch");

var mbxJs = read("js/dashboard-mailbox.js");
assert(mbxJs.indexOf("webmailWorkspaceUrl") >= 0, "JS webmail workspace");

var envEx = read(".env.example");
assert(envEx.indexOf("MAIL_IMAP_PASS_WORKSPACE") >= 0, "env workspace pass");
assert(envEx.indexOf("GOOGLE_DRIVE_MIRROR") >= 0, "env drive mirror");

var pkg = JSON.parse(read("package.json"));
assert(pkg.scripts["verify:workspace-mail-drive"], "npm script");

process.exit(failed ? 1 : 0);
