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

assert(fs.existsSync(path.join(__dirname, "..", "config/subscription-plans.json")), "config seed");
assert(fs.existsSync(path.join(__dirname, "..", "abonnements/index.html")), "page publique");
assert(fs.existsSync(path.join(__dirname, "..", "crm-subscription-plans.html")), "page CRM");

var plans = require("../api/_lib/subscription-plans");
var cfg = plans.normalizeConfig(plans.readSeed());
assert(cfg.plans.length >= 2, "au moins 2 formules seed");
assert(cfg.plans.some(function (p) { return p.ctaMode === "checkout"; }), "au moins 1 checkout");
assert(typeof plans.findPlan === "function", "findPlan");
assert(typeof plans.priceForInterval === "function", "priceForInterval");

var pub = read("abonnements/index.html");
assert(pub.indexOf("subscription-plans-page.js") !== -1, "script page publique");
assert(pub.indexOf("subscription-plans.css") !== -1, "css page publique");

var pageJs = read("js/subscription-plans-page.js");
assert(pageJs.indexOf("/api/subscription-plans") !== -1, "GET public plans");
assert(pageJs.indexOf("/api/stripe/create-subscription-checkout") !== -1, "POST checkout");

var crmHtml = read("crm-subscription-plans.html");
assert(crmHtml.indexOf("crm-subscription-plans.js") !== -1, "script CRM");
assert(crmHtml.indexOf("/abonnements/") !== -1, "lien page publique CRM");

var crmJs = read("js/crm-subscription-plans.js");
assert(crmJs.indexOf("/api/crm/subscription-plans") !== -1, "API CRM plans");

var apiPublic = read("api/[action].js");
assert(apiPublic.indexOf("subscription-plans") !== -1, "route API publique");

var apiCrm = read("api/crm/[action].js");
assert(apiCrm.indexOf("subscription-plans") !== -1, "route API CRM");

var apiStripe = read("api/stripe/[action].js");
assert(apiStripe.indexOf("create-subscription-checkout") !== -1, "route Stripe checkout abo");

var checkout = read("api/_lib/routes/stripe-create-subscription-checkout.js");
assert(checkout.indexOf('mode: "subscription"') !== -1, "checkout mode subscription");
assert(checkout.indexOf("trial_period_days") !== -1, "essai Stripe");

var webhook = read("api/stripe/webhook.js");
assert(webhook.indexOf("markSubscriptionCheckoutPaid") !== -1, "webhook marque abo paye");
assert(webhook.indexOf("subscription-plans") !== -1, "webhook contexte plans");

var sidebar = read("js/crm-sidebar.js");
assert(sidebar.indexOf("crm-subscription-plans.html") !== -1, "sidebar finance");

var payHub = read("paiements/index.html");
assert(payHub.indexOf("../abonnements/") !== -1, "hub paiements lien abonnements");

var robots = read("robots.txt");
assert(robots.indexOf("Allow: /abonnements/") !== -1, "robots allow abonnements");

var docs = read("docs/ABONNEMENTS-STRIPE.md");
assert(docs.indexOf("/abonnements/") !== -1, "doc liens");
assert(docs.indexOf("create-subscription-checkout") !== -1, "doc checkout");

if (failed) {
  console.log("\n" + failed + " echec(s)");
  process.exit(1);
}
console.log("\nAbonnements Stripe adaptables : OK.");
