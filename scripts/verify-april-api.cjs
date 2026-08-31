#!/usr/bin/env node
/** Vérifie l'intégration API APRIL (client OAuth + CRM). */
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
  "api/_lib/april-client.js",
  "api/_lib/routes/crm-april.js",
  "crm-april.html",
  "crm-april.js",
  "docs/APRIL-API.md",
].forEach(function (f) {
  assert(fs.existsSync(path.join(root, f)), f + " existe");
});

var April = require("../api/_lib/april-client");
assert(typeof April.fetchAccessToken === "function", "fetchAccessToken");
assert(typeof April.firstCall === "function", "firstCall");
assert(typeof April.testConnection === "function", "testConnection");
assert(April.gatewayBase().indexOf("april.fr") >= 0, "gateway défaut april.fr");
assert(April.isConfigured() === false || April.isConfigured() === true, "isConfigured bool");

var status = April.configStatus();
assert(status.hasClientSecret === false || status.hasClientSecret === true, "status secret bool");
assert(!JSON.stringify(status).match(/client_secret=[^&*]+\w{8}/i), "pas de secret en clair dans status");

var clientSrc = read("api/_lib/april-client.js");
assert(clientSrc.indexOf("client_credentials") >= 0, "grant client_credentials");
assert(clientSrc.indexOf("firstCall") >= 0, "firstCall path");
assert(clientSrc.indexOf("D9mw") < 0 && clientSrc.indexOf("D9mv") < 0, "aucun secret capture dans le code");

var route = read("api/_lib/routes/crm-april.js");
assert(route.indexOf("requireCrm") >= 0, "CRM auth");
assert(route.indexOf("isAdmin") >= 0, "admin pour tests");

var crmAction = read("api/crm/[action].js");
assert(crmAction.indexOf('april:') >= 0 || crmAction.indexOf('"april"') >= 0, "route enregistrée");

var html = read("crm-april.html");
assert(html.indexOf("btnAprilTest") >= 0, "bouton test UI");
assert(html.indexOf("PARTNER_APRIL_CLIENT_ID") >= 0, "mention env UI");

var envEx = read(".env.example");
assert(envEx.indexOf("PARTNER_APRIL_CLIENT_ID") >= 0, ".env.example CLIENT_ID");
assert(envEx.indexOf("PARTNER_APRIL_CLIENT_SECRET") >= 0, ".env.example CLIENT_SECRET");

var partners = JSON.parse(read("config/partners.json"));
var april = partners.partners.filter(function (p) {
  return p.id === "april";
})[0];
assert(april && april.integration && april.integration.mode === "oauth_client_credentials", "partners.json oauth mode");

var adapters = read("api/_lib/partners/adapters.js");
assert(adapters.indexOf("april-client") >= 0, "adapters utilise april-client");

var ins = read("crm-insurance.html");
assert(ins.indexOf("crm-april.html") >= 0, "lien hub assurance");

var pkg = JSON.parse(read("package.json"));
assert(pkg.scripts["verify:april-api"], "npm script verify:april-api");

process.exit(failed ? 1 : 0);
