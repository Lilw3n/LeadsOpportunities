#!/usr/bin/env node
/**
 * Vérifie le marché public + annuaire super-admin contactable.
 */
var fs = require("fs");
var path = require("path");
var Users = require("../js/immo-marche-users-lib.js");

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

assert(typeof Users.buildUsers === "function", "buildUsers exposé");
assert(typeof Users.filterUsers === "function", "filterUsers exposé");
assert(typeof Users.toCsv === "function", "toCsv exposé");
assert(typeof Users.mailtoBcc === "function", "mailtoBcc exposé");

var sample = Users.buildUsers({
  parties: [
    {
      id: "p1",
      email: "vendeur@example.com",
      phone: "0601020304",
      name: "Alice Vendeur",
      role: "vendeur",
      updated_at: "2026-03-01",
    },
  ],
  leads: [
    {
      id: "l1",
      email: "acheteur@example.com",
      vertical: "acheteur_immo",
      created_at: "2026-03-02",
      payload: { first_name: "Bob" },
    },
  ],
  criteria: [],
  tourRequests: [
    {
      id: "t1",
      email: "visite@example.com",
      first_name: "Carla",
      phone: "0611223344",
      created_at: "2026-03-03",
      property_title: "T3 Nancy",
    },
  ],
  contacts: [],
  contactsById: {},
});

assert(sample.length === 3, "3 utilisateurs agrégés");
assert(
  sample.some(function (u) {
    return u.email === "vendeur@example.com" && u.roles.indexOf("vendeur") >= 0;
  }),
  "vendeur présent"
);
assert(
  sample.some(function (u) {
    return u.email === "acheteur@example.com" && u.roles.indexOf("acheteur") >= 0;
  }),
  "acheteur présent"
);
assert(
  sample.some(function (u) {
    return u.email === "visite@example.com" && u.roles.indexOf("visiteur") >= 0;
  }),
  "visiteur présent"
);

var filtered = Users.filterUsers(sample, { role: "vendeur", channel: "email" });
assert(filtered.length === 1, "filtre rôle vendeur + email");

var stats = Users.stats(sample);
assert(stats.total === 3 && stats.emailable === 3, "stats cohérentes");

var csv = Users.toCsv(sample);
assert(csv.indexOf("vendeur@example.com") >= 0, "CSV contient e-mail");

var mailto = Users.mailtoBcc(sample, "Test", "Bonjour");
assert(mailto.indexOf("mailto:") === 0 && mailto.indexOf("bcc=") > 0, "mailto BCC");

var files = [
  "immobilier/marche.html",
  "crm-immo-utilisateurs.html",
  "js/crm-immo-utilisateurs-page.js",
  "js/immo-marche-users-lib.js",
  "api/_lib/routes/crm-immo-users-contact.js",
  "docs/CRM-IMMO.md",
];
files.forEach(function (f) {
  assert(fs.existsSync(path.join(ROOT, f)), f + " présent");
});

var marche = read("immobilier/marche.html");
assert(marche.indexOf("data-immo-search") >= 0, "marché : moteur de recherche");
assert(marche.indexOf("acheteur-immo.html?role=vendeur") >= 0, "marché : CTA dépôt");
assert(marche.indexOf("Leads Opportunities") >= 0, "marché : marque hero");

var crmPage = read("crm-immo-utilisateurs.html");
assert(crmPage.indexOf("imuSendAll") >= 0, "CRM : envoi filtre");
assert(crmPage.indexOf("CONTACTER TOUS") >= 0, "CRM : phrase confirmation");
assert(crmPage.indexOf("immo-marche-users-lib.js") >= 0, "CRM charge la lib");

var api = read("api/_lib/routes/crm-immo-users-contact.js");
assert(api.indexOf("sendViaResend") >= 0, "API : Resend");
assert(api.indexOf("isSiteAdmin") >= 0, "API : garde super-admin");
assert(api.indexOf("CONFIRM_ALL") >= 0, "API : confirmation bulk");
assert(api.indexOf("MAX_BULK") >= 0 || api.indexOf("40") >= 0, "API : plafond envoi");

var router = read("api/crm/[action].js");
assert(router.indexOf("immo-users-contact") >= 0, "route CRM enregistrée");

var sidebar = read("js/crm-sidebar.js");
assert(sidebar.indexOf("crm-immo-utilisateurs.html") >= 0, "sidebar CRM liée");

var hub = read("immobilier/index.html");
assert(hub.indexOf("marche.html") >= 0, "hub immobilier pointe vers marché");

var pageJs = read("js/crm-immo-utilisateurs-page.js");
assert(pageJs.indexOf("/api/crm/immo-users-contact") >= 0, "page appelle l’API");
assert(pageJs.indexOf("lo_token") >= 0, "page auth lo_token");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nAll checks passed");
