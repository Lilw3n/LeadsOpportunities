#!/usr/bin/env node
/** Vérifie recherche leads multi-canaux (mail, tél, réseau…). */
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

assert(fs.existsSync(path.join(root, "api/_lib/lead-search.js")), "lead-search.js existe");

var lib = require("../api/_lib/lead-search");
assert(typeof lib.leadListSearchMatch === "function", "leadListSearchMatch exporté");
assert(typeof lib.parseSearchScopes === "function", "parseSearchScopes exporté");
assert(lib.digitsOnly("06 12-34.56") === "06123456", "digitsOnly normalise le téléphone");
assert(lib.statusSearchValue("Nouveau") === "new", "alias statut Nouveau → new");
assert(lib.parseSearchScopes("email,phone")["email"] === true, "scopes email");
assert(lib.parseSearchScopes("") === null, "scopes vides = tous");

var lead = {
  id: "abc",
  email: "test@example.fr",
  phone: "+33 6 12 34 56 78",
  platform: "landing_quick",
  source: "landing_quick",
  vertical: "vendeur_immo",
  status: "new",
};
assert(lib.leadMatchesQuery(lead, "test@example"), "match email");
assert(lib.leadMatchesQuery(lead, "061234"), "match téléphone normalisé");
assert(lib.leadMatchesQuery(lead, "landing_quick"), "match réseau / source");
assert(lib.leadMatchesQuery(lead, "vendeur"), "match vertical");
assert(lib.leadMatchesQuery(lead, "Nouveau"), "match statut FR");

var leadsRoute = read("api/_lib/routes/leads.js");
assert(leadsRoute.indexOf("lead-search") >= 0, "leads.js utilise lead-search");
assert(leadsRoute.indexOf("searchIn") >= 0 || leadsRoute.indexOf("searchScopes") >= 0, "param searchIn / scopes");
assert(leadsRoute.indexOf("platform") >= 0, "SELECT platform");

var dash = read("dashboard.html");
assert(dash.indexOf("leads-search-scopes") >= 0, "cases à cocher canaux");
assert(dash.indexOf('value="email"') >= 0, "case Mail");
assert(dash.indexOf('value="phone"') >= 0, "case Tél");
assert(dash.indexOf('value="platform"') >= 0, "case Réseau");
assert(dash.indexOf("searchIn") >= 0, "dashboard envoie searchIn");

process.exit(failed ? 1 : 0);
