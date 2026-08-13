#!/usr/bin/env node
/**
 * Vérifie la vitrine publique de recherche de bien (listings, sanitizer, landing).
 */
var fs = require("fs");
var path = require("path");
var Lib = require("../js/immo-public-listings-lib.js");
var Matcher = require("../js/crm-immo-matcher.js");

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

assert(Lib.DEMO_LISTINGS.length >= 6, "au moins 6 annonces d'illustration");
assert(
  Lib.DEMO_LISTINGS.every(function (p) {
    return p.id && p.city && p.postal_code && p.property_type && p.price_fai > 0;
  }),
  "démo : id, ville, CP, type, prix"
);

var dirty = {
  id: "prop_secret",
  title: "T3 test",
  property_type: "appartement",
  city: "Lyon",
  postal_code: "69003",
  address: "12 rue des Lilas",
  notes: "vendeur pressé, tel 0612345678",
  email: "vendeur@example.com",
  phone: "0612345678",
  owner_contact_id: "ct_1",
  buyer_contact_id: "ct_2",
  lead_id: "ld_9",
  assigned_to: "agent@lo.fr",
  listing_url: "https://internal.example/secret",
  price_net: 240000,
  price_fai: 255000,
  honoraires: 15000,
  lat: 45.75,
  lng: 4.85,
  description: "Bel appartement proche métro.",
  rooms: 3,
  surface_m2: 67,
};
var pub = Lib.toPublicListing(dirty);
assert(pub.city === "Lyon" && pub.price_fai === 255000, "champs publics conservés");
assert(pub.address == null, "pas d'adresse précise");
assert(pub.notes == null && pub.email == null && pub.phone == null, "pas de notes / email / tel");
assert(pub.owner_contact_id == null && pub.lead_id == null, "pas d'ids contacts");
assert(pub.listing_url == null && pub.lat == null && pub.price_net == null, "pas d'URL / GPS / net vendeur");
assert(JSON.stringify(pub).indexOf("Lilas") === -1, "adresse absente du JSON public");
assert(JSON.stringify(pub).indexOf("0612345678") === -1, "téléphone absent du JSON public");

var lyon = Lib.filterListings(Lib.DEMO_LISTINGS, { city: "lyon" });
assert(lyon.length === 1 && lyon[0].city === "Lyon", "filtre ville Lyon");

var maisons = Lib.filterListings(Lib.DEMO_LISTINGS, { types: "maison" });
assert(
  maisons.length >= 2 && maisons.every(function (p) { return p.property_type === "maison"; }),
  "filtre type maison"
);

var budget = Lib.filterListings(Lib.DEMO_LISTINGS, { budgetMax: 200000 });
assert(
  budget.length >= 1 && budget.every(function (p) { return p.price_fai <= 200000; }),
  "filtre budget max 200k"
);

var cp67 = Lib.filterListings(Lib.DEMO_LISTINGS, { postal: "67" });
assert(
  cp67.length >= 2 && cp67.every(function (p) { return String(p.department) === "67"; }),
  "filtre département 67"
);

assert(Matcher.isMatchableStatus("mandat") === true, "mandat matchable");
assert(Matcher.isMatchableStatus("vendu_loue") === false, "vendu non matchable");

var html = read("landings/acheteur-immo.html");
assert(html.indexOf("data-immo-search") !== -1, "landing : bloc vitrine data-immo-search");
assert(html.indexOf("data-listings-grid") !== -1, "landing : grille d'annonces");
assert(html.indexOf("id=\"recherche\"") !== -1, "landing : ancre #recherche");
assert(html.indexOf("id=\"dossier\"") !== -1, "landing : dossier secondaire");
assert(
  html.indexOf("Appartements et maisons à vendre") !== -1,
  "landing : h1 visible (pas vide en attendant le JS)"
);
var idxSearch = html.indexOf("data-immo-search");
var idxNeeds = html.indexOf('name="buyerNeeds"');
assert(idxSearch !== -1 && idxNeeds !== -1 && idxSearch < idxNeeds, "vitrine avant les cases prêt/assurances");
assert(html.indexOf("acheteur-immo-search.js") !== -1, "script recherche chargé");
assert(html.indexOf("immo-public-listings-lib.js") !== -1, "lib listings chargée");

var qinit = read("landings/questionnaire-init.js");
assert(
  qinit.indexOf('need === "acheteur-immo"') !== -1 && qinit.indexOf("acheteur-immo.html") !== -1,
  "questionnaire universel redirige vers la vitrine"
);

var qcfg = read("js/questionnaire-config.js");
assert(qcfg.indexOf("Quel bien recherchez-vous") !== -1, "overlay wizard : étape recherche de bien");

var apiIndex = read("api/[action].js");
assert(apiIndex.indexOf("immo-listings") !== -1, "route API immo-listings enregistrée");

var route = read("api/_lib/routes/public-immo-listings.js");
assert(route.indexOf("toPublicListing") !== -1, "route : sanitizer public");
assert(route.indexOf("isMatchableStatus") !== -1, "route : statuts matchables seulement");

var handler = require("../api/_lib/routes/public-immo-listings.js");
var captured = { status: 0, body: null, headers: {} };
var res = {
  setHeader: function (k, v) {
    captured.headers[k] = v;
  },
  status: function (c) {
    captured.status = c;
    return this;
  },
  json: function (b) {
    captured.body = b;
    return this;
  },
  end: function () {
    return this;
  },
};
return Promise.resolve(handler({ method: "GET", query: { city: "Strasbourg" }, headers: {} }, res)).then(function () {
  assert(captured.status === 200 && captured.body && captured.body.ok, "GET /api/immo-listings 200");
  assert(Array.isArray(captured.body.listings), "réponse : listings[]");
  assert(captured.body.source === "demo" || captured.body.source === "crm", "source demo ou crm");
  assert(
    captured.body.listings.every(function (p) {
      return p.city && String(p.city).toLowerCase().indexOf("strasbourg") !== -1;
    }),
    "filtre API ville Strasbourg"
  );
  assert(
    captured.body.listings.every(function (p) {
      return p.notes == null && p.email == null && p.phone == null && p.address == null;
    }),
    "API : aucune PII dans les cartes"
  );

  if (failed) {
    console.log("\n" + failed + " échec(s)");
    process.exit(1);
  }
  console.log("\nTous les checks listings OK");
});
