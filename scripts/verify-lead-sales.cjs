#!/usr/bin/env node
/**
 * Vérifie le système vente leads + split partenaire + Stripe.
 */
var fs = require("fs");
var path = require("path");
var Split = require("../js/lead-sale-split-lib.js");

function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

function ok(c, m) {
  if (!c) throw new Error("FAIL: " + m);
  console.log("OK ", m);
}

var ex = Split.compute({
  supplierPriceEur: 80,
  partnerSharePct: 50,
  salePriceEur: 180,
});
ok(ex.partnerDueEur === 40, "80 @ 50% → dû 40");
ok(ex.youKeepEur === 140, "vente 180 → garde 140");

var pv = Split.partnerView(ex);
ok(pv.partnerDueEur === 40, "vue partenaire : dû");
ok(pv.salePriceEur === undefined, "vue partenaire sans prix de vente");
ok(pv.youKeepEur === undefined, "vue partenaire sans marge");

var page = read("crm-lead-sales.html");
ok(page.indexOf("lsSupplierPrice") !== -1, "form prix fournisseur");
ok(page.indexOf("lsSalePrice") !== -1, "form prix vente");
ok(page.indexOf("lead-sale-split-lib.js") !== -1, "lib chargée");
ok(page.indexOf("crm-lead-sales.js") !== -1, "JS CRM");

var js = read("js/crm-lead-sales.js");
ok(js.indexOf("/api/crm/lead-sales") !== -1, "API lead-sales");
ok(js.indexOf("/api/stripe/create-lead-sale-checkout") !== -1, "API Stripe lead sale");
ok(js.indexOf("partnerSettled") !== -1, "marquer pote payé");

var apiCrm = read("api/crm/[action].js");
ok(apiCrm.indexOf("lead-sales") !== -1, "route CRM enregistrée");

var apiStripe = read("api/stripe/[action].js");
ok(apiStripe.indexOf("create-lead-sale-checkout") !== -1, "route Stripe enregistrée");

var webhook = read("api/stripe/webhook.js");
ok(webhook.indexOf("markLeadSalePaidBySession") !== -1, "webhook marque vente payée");

var store = read("api/_lib/lead-sales-store.js");
ok(store.indexOf("CREATE TABLE IF NOT EXISTS lead_sales") !== -1, "schema lead_sales");

var sidebar = read("js/crm-sidebar.js");
ok(sidebar.indexOf("crm-lead-sales.html") !== -1, "sidebar");

var hub = read("crm-stripe.html");
ok(hub.indexOf("crm-lead-sales.html") !== -1, "hub Stripe");

ok(fs.existsSync(path.join(__dirname, "..", "css/crm-lead-sales.css")), "CSS");

ok(fs.existsSync(path.join(__dirname, "..", "espace-leads/index.html")), "Espace Leads index");
ok(fs.existsSync(path.join(__dirname, "..", "espace-leads/connexion.html")), "connexion");
ok(fs.existsSync(path.join(__dirname, "..", "espace-leads/acces.html")), "acces pack");
ok(fs.existsSync(path.join(__dirname, "..", "crm-lead-sales-partenaire.html")), "vue fournisseur");

var portalApi = read("api/_lib/routes/public-espace-leads-pack.js");
ok(portalApi.indexOf("portal_token") !== -1, "API pack public");
ok(portalApi.indexOf("partner_due") === -1, "API pack sans dû partenaire");

var publicApi = read("api/[action].js");
ok(publicApi.indexOf("espace-leads-pack") !== -1, "route publique enregistrée");

var stripeSale = read("api/_lib/routes/stripe-create-lead-sale-checkout.js");
ok(stripeSale.indexOf("Accès Espace Leads") !== -1, "libellé Stripe opaque");
ok(stripeSale.indexOf("espace-leads/acces.html") !== -1, "success → portail");

var robots = read("robots.txt");
ok(robots.indexOf("/espace-leads/") !== -1, "robots disallow portail");

console.log("\nverify-lead-sales: OK");
