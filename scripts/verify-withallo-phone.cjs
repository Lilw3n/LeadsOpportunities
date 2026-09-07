#!/usr/bin/env node
/** Vérifie le numéro public WithAllo temporaire (09 71 18 53 99). */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
var failed = 0;

function ok(cond, msg) {
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

var DISP = "09 71 18 53 99";
var E164 = "+33971185399";
var OLD = "06 95 82 08 66";
var OLD_E164 = "+33695820866";

[
  "agence-varangeville/index.html",
  "agence-varangeville.html",
  "nancy-54/index.html",
  "index.html",
].forEach(function (rel) {
  var t = read(rel);
  ok(t.indexOf(E164) !== -1, rel + " : E.164 Allo");
  ok(t.indexOf(OLD_E164) === -1, rel + " : ancien E.164 retiré");
  if (rel.indexOf("agence") !== -1 || rel.indexOf("nancy") !== -1) {
    ok(t.indexOf("tel:" + E164) !== -1, rel + " : lien tel:");
  }
});

ok(read("agence-varangeville/index.html").indexOf(DISP) !== -1, "NAP affichage 09…");
ok(read("config/quote-brand.json").indexOf(DISP) !== -1, "quote-brand phone");
ok(JSON.parse(read("config/tenant-brand.json")).contact.phone === DISP, "tenant-brand phone");
ok(JSON.parse(read("config/tenant-brand.json")).contact.phoneE164 === E164, "tenant-brand E.164");
ok(read("docs/SLACK-WITHALLO-NOTIFS.md").indexOf(DISP) !== -1, "doc WithAllo numéro");
ok(read(".env.example").indexOf("PUBLIC_PHONE_E164") !== -1, ".env.example PUBLIC_PHONE");

var pkg = JSON.parse(read("package.json"));
ok(!!(pkg.scripts && pkg.scripts["verify:withallo-phone"]), "npm script verify:withallo-phone");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les checks numéro WithAllo OK");
