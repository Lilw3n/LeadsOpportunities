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

function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

var hub = read("crm-stripe.html");
assert(hub.indexOf("stripeHubForm") !== -1, "formulaire generation lien");
assert(hub.indexOf("subscription") !== -1, "option abonnement");
assert(hub.indexOf("paiement.html") !== -1, "lien page publique");
assert(hub.indexOf("section=mailbox") !== -1, "lien messagerie");

var js = read("js/crm-stripe.js");
assert(js.indexOf("/api/stripe/create-mailbox-payment-link") !== -1, "API mailbox payment link");
assert(js.indexOf("paymentKind") !== -1, "payload paymentKind");

var sidebar = read("js/crm-sidebar.js");
assert(sidebar.indexOf("crm-stripe.html") !== -1, "sidebar finance");

var publicHub = read("paiements/index.html");
assert(publicHub.indexOf("paiement.html") !== -1, "hub public acompte");
assert(publicHub.indexOf("abonnement") !== -1, "hub public abonnement");

var robots = read("robots.txt");
assert(robots.indexOf("/paiements/") !== -1, "robots paiements");

var pay = read("paiement.html");
assert(pay.indexOf("investissement_locatif") !== -1, "categorie investissement locatif");
assert(pay.indexOf("credit_immo") !== -1, "categorie credit immo");
assert(pay.indexOf("banque") !== -1, "categorie banque");
assert(pay.indexOf("recherche_bien") !== -1, "categorie recherche bien");

if (failed) {
  console.log("\n" + failed + " echec(s)");
  process.exit(1);
}
console.log("\nHub Stripe paiements / abonnements : OK.");
