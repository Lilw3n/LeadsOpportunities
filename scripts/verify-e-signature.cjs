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

[
  "js/e-signature-lib.js",
  "landings/signature-electronique.html",
  "crm-e-signature.html",
  "api/_lib/routes/e-signature.js",
  "api/_lib/e-signature-store.js",
  "docs/E-SIGNATURE-GRATUITE.md",
].forEach(function (f) {
  assert(fs.existsSync(path.join(root, f)), f);
});

var lib = require("../js/e-signature-lib.js");
assert(typeof lib.attachPad === "function", "attachPad");
assert(typeof lib.buildSignedHtml === "function", "buildSignedHtml");
assert(lib.buildSignedHtml({ title: "Test", body: "Hello", signerName: "A" }).indexOf("Test") >= 0, "HTML signé");

var crm = read("api/crm/[action].js");
assert(crm.indexOf('"e-signature"') >= 0, "route CRM e-signature");

var side = read("js/crm-sidebar.js");
assert(side.indexOf("crm-e-signature.html") >= 0, "lien sidebar");

var landing = read("landings/signature-electronique.html");
assert(landing.indexOf("public-sign") >= 0, "landing public-sign");
assert(landing.indexOf("sigPad") >= 0, "canvas signature");

process.exit(failed ? 1 : 0);
