#!/usr/bin/env node
/** Offre de prix visiteurs (visite virtuelle + fiche bien) — anti-abus IP. */
var fs = require("fs");
var path = require("path");
var root = path.join(__dirname, "..");
var failed = 0;
function ok(c, m) {
  if (!c) {
    failed++;
    console.log("FAIL", m);
  } else console.log("OK  ", m);
}
function read(r) {
  return fs.readFileSync(path.join(root, r), "utf8");
}

var lib = require(path.join(root, "js/immo-tour-price-offer-lib.js"));
ok(typeof lib.assessOffer === "function", "assessOffer");
ok(typeof lib.normalizePayload === "function", "normalizePayload");
var low = lib.assessOffer(80000, 200000);
ok(low.level === "critical" || low.level === "warn", "offre basse → avertissement");
var okAmt = lib.normalizePayload({ amount: "220000", comment_plus: "vue", comment_moins: "" });
ok(okAmt.ok && okAmt.amount === 220000, "parse montant");

var api = read("api/_lib/routes/public-immo-tour-access.js");
ok(api.indexOf("submit_price_offer") >= 0, "API submit_price_offer");
ok(api.indexOf("list_price_offers") >= 0, "API list_price_offers");
ok(api.indexOf("crm_immo_tour_price_offers") >= 0, "table price offers");
ok(api.indexOf("conn_fp") >= 0, "empreinte connexion");
ok(api.indexOf("isHoneypotFilled") >= 0, "honeypot");

var tourLib = read("js/immo-tour-access-lib.js");
ok(tourLib.indexOf("asking_price") >= 0, "publicMeta asking_price");

var page = read("js/immo-tour-access-page.js");
ok(page.indexOf("showPriceOfferPanel") >= 0, "UI visite prix");
ok(page.indexOf("submit_price_offer") >= 0, "POST offre depuis visite");

var html = read("immobilier/visite.html");
ok(html.indexOf("tourPriceOffer") >= 0, "bloc HTML offre");
ok(html.indexOf("immo-tour-price-offer-lib.js") >= 0, "script lib inclus");

var ads = read("js/immo-ad-pages.js");
ok(ads.indexOf("bindPriceOffer") >= 0, "fiche bien : formulaire offre");
ok(ads.indexOf("data-price-offer") >= 0, "bloc offre dans détail");

var biens = read("immobilier/biens.html");
ok(biens.indexOf("immo-tour-price-offer-lib.js") >= 0, "biens charge lib");

var crm = read("js/crm-immo-tour-requests.js");
ok(crm.indexOf("list_price_offers") >= 0, "CRM liste offres");
ok(crm.indexOf("Estimations de prix") >= 0, "CRM section estimations");

var css = read("css/immo-ad-listings.css");
ok(css.indexOf(".tour-price-offer") >= 0, "styles offre");

var pkg = JSON.parse(read("package.json"));
ok(!!pkg.scripts["verify:immo-price-offer"], "npm run verify:immo-price-offer");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK verify-immo-price-offer");
