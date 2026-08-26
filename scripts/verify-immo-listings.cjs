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

assert(Lib.filterListings, "filtre listings exposé");
assert(!Lib.DEMO_LISTINGS || Lib.DEMO_LISTINGS.length === 0, "pas d'annonces d'illustration dans la lib");

var SAMPLE = [
  Lib.toPublicListing({
    id: "s_stras",
    property_type: "appartement",
    city: "Strasbourg",
    postal_code: "67000",
    rooms: 3,
    surface_m2: 68,
    price_fai: 265000,
  }),
  Lib.toPublicListing({
    id: "s_illkirch",
    property_type: "maison",
    city: "Illkirch-Graffenstaden",
    postal_code: "67400",
    rooms: 5,
    surface_m2: 120,
    price_fai: 420000,
  }),
  Lib.toPublicListing({
    id: "s_studio",
    property_type: "appartement",
    city: "Strasbourg",
    postal_code: "67000",
    rooms: 1,
    surface_m2: 28,
    price_fai: 145000,
  }),
  Lib.toPublicListing({
    id: "s_lyon",
    property_type: "appartement",
    city: "Lyon",
    postal_code: "69003",
    rooms: 4,
    surface_m2: 82,
    price_fai: 389000,
  }),
  Lib.toPublicListing({
    id: "s_lille",
    property_type: "maison",
    city: "Lille",
    postal_code: "59000",
    rooms: 5,
    surface_m2: 110,
    price_fai: 275000,
  }),
];

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

var tinyJpeg =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP///wD/2wBDAf///wD/wgARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAG/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q==";
var media = Lib.sanitizeMedia([
  { url: tinyJpeg, kind: "photo" },
  { url: "javascript:alert(1)", kind: "photo" },
  { url: "https://images.unsplash.com/photo-x?w=800", kind: "capture" },
  { url: "data:image/jpeg;base64," + Array(300000).join("A"), kind: "photo" },
]);
assert(media.length === 2, "sanitizer : 2 médias sûrs (data jpeg + https)");
assert(media[0].kind === "photo" && media[1].kind === "capture", "sanitizer : kinds photo/capture");
assert(Lib.MAX_LISTING_PHOTOS === 40, "plafond 40 photos");
var many = [];
for (var i = 0; i < 45; i++) many.push({ url: tinyJpeg, kind: "photo" });
assert(Lib.sanitizeMedia(many).length === 40, "sanitizer : 40 photos max");
assert(!Lib.isSafeMediaUrl("javascript:alert(1)"), "refuse javascript:");
assert(!Lib.isSafeMediaUrl("http://example.com/x.jpg"), "refuse http non-https");

var withMedia = Lib.toPublicListing({
  id: "p1",
  title: "Maison 5 pièces",
  property_type: "maison",
  city: "Dombasle-sur-Meurthe",
  postal_code: "54110",
  rooms: 5,
  surface_m2: 105,
  price_fai: 209000,
  description: "Maison 5 pièces 105 m² avec grand jardin plein centre dans rue au calme.",
  photos: [{ url: tinyJpeg, kind: "photo" }, { url: "https://images.unsplash.com/photo-x", kind: "capture" }],
  listing_url: "https://www.leboncoin.fr/ad/ventes_immobilieres/secret",
  phone: "0612345678",
});
assert(withMedia.cover && withMedia.cover.url.indexOf("data:image/jpeg") === 0, "fiche : cover jpeg");
assert(withMedia.capture && withMedia.capture.kind === "capture", "fiche : capture séparée");
assert(withMedia.description.indexOf("grand jardin") !== -1, "fiche : description publique");
assert(withMedia.listing_url == null && withMedia.phone == null, "fiche : pas d'URL portail ni tél");

var lyon = Lib.filterListings(SAMPLE, { city: "lyon" });
assert(lyon.length === 1 && lyon[0].city === "Lyon", "filtre ville Lyon");

var maisons = Lib.filterListings(SAMPLE, { types: "maison" });
assert(
  maisons.length >= 2 && maisons.every(function (p) { return p.property_type === "maison"; }),
  "filtre type maison"
);

var budget = Lib.filterListings(SAMPLE, { budgetMax: 200000 });
assert(
  budget.length >= 1 && budget.every(function (p) { return p.price_fai <= 200000; }),
  "filtre budget max 200k"
);

var cp67 = Lib.filterListings(SAMPLE, { postal: "67" });
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
assert(html.indexOf("Déposer / coller un bien") !== -1, "landing : CTA dépôt / URL");
assert(html.indexOf("id=\"deposer-bien\"") !== -1, "landing : ancre dépôt vendeur");
assert(html.indexOf("name=\"immoHat\"") !== -1, "landing : casquettes acquéreur / vendeur");
assert(html.indexOf("data-listings-demo") === -1, "landing : pas de bandeau d'illustration");
assert(html.indexOf("Annonces d'illustration") === -1, "landing : pas de texte d'illustration");
assert(html.indexOf("id=\"listingLightbox\"") !== -1, "landing : lightbox photos/capture");
assert(html.indexOf("data-listing-view") === -1 || html.indexOf("Voir photos") !== -1, "landing : bouton voir photos (JS)");
assert(html.indexOf("acheteur-immo-search.js") !== -1, "script recherche chargé");
assert(html.indexOf("immo-public-listings-lib.js") !== -1, "lib listings chargée");
assert(html.indexOf("max 40") !== -1, "landing : jusqu'à 40 photos");
assert(html.indexOf("immo-photo-thumbs.js") !== -1, "landing : réordonnancement photos");
assert(html.indexOf("data-listing-photos-count") !== -1, "landing : compteur photos");

var Thumbs = require("../js/immo-photo-thumbs.js");
assert(Thumbs.MAX === 40, "thumbs : MAX 40");
assert(
  Thumbs.moveItem(["a", "b", "c"], 0, 2).join("") === "bca",
  "thumbs : déplacer 1re photo en dernière"
);
assert(
  Thumbs.moveItem(["a", "b", "c"], 2, 0).join("") === "cab",
  "thumbs : déplacer dernière photo en 1re"
);

var listingUrl = read("js/acheteur-immo-listing-url.js");
assert(listingUrl.indexOf("ImmoPhotoThumbs") !== -1, "dépôt : ordre des photos");
assert(listingUrl.indexOf("MAX_PHOTOS") !== -1, "dépôt : plafond photos");

var sellPhotos = read("js/acheteur-immo-sell-photos.js");
assert(sellPhotos.indexOf("ImmoPhotoThumbs") !== -1, "dossier vente : ordre des photos");

var submit = read("api/_lib/routes/public-immo-listing-submit.js");
assert(submit.indexOf("14 * 1024 * 1024") !== -1, "submit listing : corps assez grand pour 40 photos");

var qinit = read("landings/questionnaire-init.js");
assert(
  qinit.indexOf('need === "acheteur-immo"') !== -1 &&
    qinit.indexOf("vendeur-immo") !== -1 &&
    qinit.indexOf("acheteur-immo.html") !== -1,
  "questionnaire universel redirige vers la vitrine (acquéreur / vendeur)"
);

var qcfg = read("js/questionnaire-config.js");
assert(qcfg.indexOf("Quel bien recherchez-vous") !== -1, "overlay wizard : étape recherche de bien");

var apiIndex = read("api/[action].js");
assert(apiIndex.indexOf("immo-listings") !== -1, "route API immo-listings enregistrée");

var route = read("api/_lib/routes/public-immo-listings.js");
assert(route.indexOf("toPublicListing") !== -1, "route : sanitizer public");
assert(route.indexOf("DEMO_LISTINGS") === -1, "route : pas de fallback démo");

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
  assert(captured.body.source === "crm", "source crm (pas de démo)");
  assert(Array.isArray(captured.body.listings), "réponse : listings[]");
  assert(
    captured.body.listings.every(function (p) {
      return p.notes == null && p.email == null && p.phone == null && p.address == null;
    }),
    "API : aucune PII dans les cartes"
  );
  if (!captured.body.listings.length) {
    assert(true, "API : grille vide tant qu'aucun bien n'est collé");
  } else {
    assert(
      captured.body.listings.every(function (p) {
        return p.city && String(p.city).toLowerCase().indexOf("strasbourg") !== -1;
      }),
      "filtre API ville Strasbourg"
    );
  }

  if (failed) {
    console.log("\n" + failed + " échec(s)");
    process.exit(1);
  }
  console.log("\nTous les checks listings OK");
});
