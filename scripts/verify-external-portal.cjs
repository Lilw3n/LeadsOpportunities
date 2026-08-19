#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var Portal = require("../api/_lib/external-portal");
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

assert(Portal.normalizePortalRole("buyer") === "buyer", "role buyer");
assert(Portal.normalizePortalRole("SELLER") === "seller", "role seller normalisé");
assert(Portal.normalizePortalRole("x") === "visitor", "role par défaut visitor");

var meta = Portal.mergeContactMetadata("{}", {
  portalRole: "buyer",
  acquisitionStage: "recherche-active",
  preferredCity: "Nancy",
  budget: "250000",
  need: "achat_immo",
});
assert(meta.portal.portalRole === "buyer", "metadata portail");
assert(meta.portal.preferredCity === "Nancy", "ville préférée");

[
  "api/_lib/external-portal.js",
  "api/_lib/routes/external-register.js",
  "api/_lib/routes/external-login.js",
  "api/_lib/routes/external-profile.js",
  "api/_lib/routes/external-visits.js",
  "external/register.js",
  "external/login.js",
  "external/profile.js",
  "external/dashboard.js",
  "external/visits.js",
].forEach(function (rel) {
  require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "..", rel)]);
  assert(true, "syntaxe " + rel);
});

var sql = read("database/external-portal-accounts.sql");
assert(sql.indexOf("crm_visit_feedback") >= 0, "migration visites");

var router = read("api/external/[action].js");
assert(router.indexOf("visits") >= 0, "route external visits");

var registerHtml = read("external/register.html");
assert(registerHtml.indexOf("portalRole") >= 0, "inscription rôle portail");

var visitsHtml = read("external/visits.html");
assert(visitsHtml.indexOf("Mes visites") >= 0, "page visites");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nContrôles portail externe OK.");
