#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var failed = 0;
function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}
var nav = fs.readFileSync(path.join(__dirname, "..", "js/admin-nav.js"), "utf8");
assert(nav.indexOf('href: "/dashboard.html?section=leads"') >= 0, "nav Leads en racine");
assert(nav.indexOf('href: "./dashboard.html') < 0, "plus de ./dashboard relatif");
assert(nav.indexOf('href: "/niches/"') >= 0, "nav Niches en racine");
var stub = fs.readFileSync(path.join(__dirname, "..", "niches/dashboard.html"), "utf8");
assert(stub.indexOf("/dashboard.html") >= 0, "stub niches redirige");
var vercel = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "vercel.json"), "utf8"));
assert(
  (vercel.redirects || []).some(function (r) {
    return r.source === "/niches/dashboard.html" && r.destination === "/dashboard.html";
  }),
  "redirect Vercel niches/dashboard"
);
if (failed) process.exit(1);
console.log("\nRedirect niches → dashboard OK.");
