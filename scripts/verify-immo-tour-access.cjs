#!/usr/bin/env node
/** Vérifie le lien visite virtuelle acquéreur (gate e-mail/tél + quotas). */
var fs = require("fs");
var path = require("path");
var AdLib = require("../js/immo-ad-listings-lib.js");
var Tour = require("../js/immo-tour-access-lib.js");

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

[
  "immobilier/visite.html",
  "js/immo-tour-access-lib.js",
  "js/immo-tour-access-page.js",
  "api/_lib/routes/public-immo-tour-access.js",
  "crm-immo-pubs.html",
].forEach(function (f) {
  assert(fs.existsSync(path.join(ROOT, f)), f + " existe");
});

assert(Tour.normalizeEmail(" Wendy@Exemple.FR ") === "wendy@exemple.fr", "normalize email");
assert(Tour.normalizePhone("06 12 34 56 78") === "0612345678", "normalize phone");
assert(Tour.isTourToken(Tour.makeTourToken()), "token vt_");
assert(!Tour.isTourToken("ad_abc_def"), "token démo vendeur ≠ visite");

var gated = AdLib.applyAdToProperty(
  {
    id: "prop_tour",
    title: "T2 Nancy",
    city: "Nancy",
    status: "mandat",
    price_fai: 180000,
  },
  {
    headline: "T2 centre",
    virtual_tour: "https://my.matterport.com/show/?m=abc",
    channel_public: true,
    tour_gate: true,
    tour_days: 30,
    tour_max_views: 50,
    tour_max_per_contact: 8,
  }
);
var ta = gated.metadata && gated.metadata.ad && gated.metadata.ad.tour_access;
assert(ta && ta.enabled && Tour.isTourToken(ta.token), "tour_access généré");
assert(ta.max_views === 50, "max 50 vues");
assert(ta.expires_at && Date.parse(ta.expires_at) > Date.now(), "date de fin dans le futur");

var listing = AdLib.toAdListing(gated);
assert(listing.tour_gate === true, "listing public : porte activée");
assert(!listing.virtual_tour, "Matterport non exposé en public");
assert(listing.has_virtual_tour === true, "badge visite conservé");
assert(listing.tour_href.indexOf("/immobilier/visite.html?t=") === 0, "href porte");

var raw = AdLib.toAdListing(gated, { includeTourUrl: true });
assert(raw.virtual_tour.indexOf("matterport") !== -1, "URL brute seulement en interne");

assert(AdLib.findByTourToken([gated], ta.token).id === "prop_tour", "findByTourToken");
assert(!AdLib.findByTourToken([gated], "vt_inconnu_xxxx"), "token inconnu");

var st = Tour.tourLinkStatus(ta);
assert(st.ok && st.remaining === 50, "quota initial 50");
var burned = Object.assign({}, ta, { view_count: 50 });
assert(Tour.tourLinkStatus(burned).reason === "quota", "quota atteint");
var expired = Object.assign({}, ta, { expires_at: "2020-01-01T00:00:00.000Z" });
assert(Tour.tourLinkStatus(expired).reason === "expired", "lien expiré");

var otp = Tour.otpCode(ta.token, "email|wendy@exemple.fr");
assert(/^\d{6}$/.test(otp), "OTP e-mail 6 chiffres");
assert(Tour.verifyOtp(ta.token, "email|wendy@exemple.fr", otp), "verify OTP");
var grant = Tour.makeGrant(ta.token, "wendy@exemple.fr|0612345678");
assert(Tour.verifyGrant(grant, ta.token).contact.indexOf("wendy@exemple.fr") === 0, "grant HMAC");

var ungated = AdLib.applyAdToProperty(
  { id: "prop_old", status: "mandat", title: "X", city: "Nancy" },
  { virtual_tour: "https://my.matterport.com/show/?m=xyz", channel_public: true }
);
assert(AdLib.toAdListing(ungated).virtual_tour.indexOf("matterport") !== -1, "sans tour_gate : comportement historique");

var html = read("immobilier/visite.html");
assert(html.indexOf("noindex") !== -1, "visite noindex");
assert(html.indexOf("tourEmail") !== -1 && html.indexOf("tourPhone") !== -1, "champs e-mail + tél");
assert(html.indexOf("immo-tour-access-page.js") !== -1, "script page");

var crm = read("crm-immo-pubs.html");
assert(crm.indexOf("chTourGate") !== -1 && crm.indexOf("adTourDays") !== -1, "CRM : durée + gate");
assert(crm.indexOf("btnCopyTourLink") !== -1 && crm.indexOf("btnRotateTourLink") !== -1, "CRM : copier / renouveler");

var api = read("api/_lib/routes/public-immo-tour-access.js");
assert(api.indexOf("request_access") !== -1 && api.indexOf("view_tour") !== -1, "API actions");
assert(api.indexOf("acheteur_immo") !== -1, "lead vertical acquéreur");

var pages = read("js/immo-ad-pages.js");
assert(pages.indexOf("tour_href") !== -1, "vitrine pointe vers la porte");

var routes = read("api/[action].js");
assert(routes.indexOf("immo-tour-access") !== -1, "route enregistrée");

var vercel = read("vercel.json");
assert(vercel.indexOf("/immobilier/visite") !== -1, "rewrite Vercel");

var pkg = JSON.parse(read("package.json"));
assert(pkg.scripts["verify:immo-tour-access"], "script npm");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nContrôles visite acquéreur OK.");
