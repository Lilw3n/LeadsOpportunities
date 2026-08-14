#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var Portals = require("../js/immo-listing-portals-lib.js");
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

assert(Portals.PORTALS.length >= 20, "catalogue ≥ 20 portails");
["leboncoin", "leboncoin_ubiflow", "paruvendu", "seloger", "bienici", "figaro_immo", "fnaim", "etreproprio", "xml_libre"].forEach(function (id) {
  assert(
    Portals.PORTALS.some(function (p) {
      return p.id === id;
    }),
    "portail " + id
  );
});

var lbc = Portals.detectFromUrl("https://www.leboncoin.fr/ad/ventes_immobilieres/1234567890");
assert(lbc.ok && lbc.portal === "leboncoin" && lbc.listingId === "1234567890", "détecte Leboncoin + id");

var sel = Portals.detectFromUrl("https://www.seloger.com/annonces/achat/appartement/paris-11eme-75/12345678.htm");
assert(sel.ok && sel.portal === "seloger", "détecte SeLoger");

var pv = Portals.detectFromUrl("https://www.paruvendu.fr/immobilier/vente/maison/strasbourg-67000/9876543");
assert(pv.ok && pv.portal === "paruvendu", "détecte ParuVendu");

var bi = Portals.detectFromUrl("https://www.bienici.com/annonce/vente/lille/abc-def");
assert(bi.ok && bi.portal === "bienici", "détecte Bien'ici");

var many = Portals.detectMany(
  "voir https://www.leboncoin.fr/ad/ventes_immobilieres/1 et https://www.seloger.com/annonces/achat/x/22222222.htm"
);
assert(many.filter(function (d) { return d.ok; }).length === 2, "extrait 2 URLs d'un texte");

assert(
  Matcher.LISTING_SOURCES.some(function (s) {
    return s.id === "leboncoin";
  }) && Matcher.LISTING_SOURCES.length >= 20,
  "matcher expose le catalogue élargi"
);

var html = read("landings/acheteur-immo.html");
assert(html.indexOf("data-listing-url-capture") !== -1, "landing : bloc coller URL");
assert(html.indexOf("immo-listing-portals-lib.js") !== -1, "landing charge le catalogue");
assert(html.indexOf("acheteur-immo-listing-url.js") !== -1, "landing charge le formulaire URL");
assert(html.indexOf("sellerPhone") !== -1 && html.indexOf("sellerName") !== -1, "champs vendeur");
assert(html.indexOf("data-listing-photos") !== -1 && html.indexOf("data-listing-capture") !== -1, "champs photos + capture");
assert(html.indexOf("name=\"description\"") !== -1, "champ description d'annonce");
assert(html.indexOf("data-listing-preview") !== -1, "aperçu de fiche");
assert(html.indexOf("id=\"listingLightbox\"") !== -1, "lightbox fiche");

var api = read("api/[action].js");
assert(api.indexOf("immo-listing-submit") !== -1, "route API enregistrée");

var handler = require("../api/_lib/routes/public-immo-listing-submit.js");

function call(body) {
  var captured = { status: 0, body: null };
  var res = {
    setHeader: function () {},
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
  return Promise.resolve(handler({ method: "POST", body: body, headers: {}, query: {} }, res)).then(function () {
    return captured;
  });
}

Promise.resolve()
  .then(function () {
    return call({ urls: ["https://www.leboncoin.fr/ad/ventes_immobilieres/111"] });
  })
  .then(function (c) {
    assert(c.status === 400 && c.body && c.body.error === "contact_required", "API refuse sans e-mail/tél");
    return call({
      urls: ["https://www.leboncoin.fr/ad/ventes_immobilieres/111"],
      email: "test@example.fr",
      sellerName: "M. Vendeur",
      sellerPhone: "0612345678",
      city: "Strasbourg",
      price_fai: 265000,
    });
  })
  .then(function (c) {
    assert(c.status === 200 && c.body && c.body.ok, "API accepte URL + contact");
    assert(c.body.received === 1, "1 annonce reçue");
    assert(c.body.listings[0].portal === "leboncoin", "portail renvoyé");
    var tinyJpeg =
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP///wD/2wBDAf///wD/wgARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAG/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q==";
    return call({
      urls: ["https://www.leboncoin.fr/ad/ventes_immobilieres/222"],
      email: "test@example.fr",
      city: "Dombasle-sur-Meurthe",
      postal_code: "54110",
      property_type: "maison",
      price_fai: 209000,
      rooms: 5,
      bedrooms: 4,
      surface_m2: 105,
      dpe: "D",
      description: "Maison 5 pièces 105 m² avec grand jardin plein centre dans rue au calme.",
      photos: [
        { url: tinyJpeg, kind: "photo" },
        { url: tinyJpeg, kind: "capture" },
        { url: "javascript:alert(1)", kind: "photo" },
      ],
    });
  })
  .then(function (c) {
    assert(c.status === 200 && c.body && c.body.ok, "API accepte photos + description + capture");
    assert(c.body.photos === 2, "2 médias conservés (javascript: rejeté)");
    assert(c.body.hasCapture === true, "capture détectée");
    assert(c.body.hasDescription === true, "description enregistrée");
    return call({ urls: ["https://www.leboncoin.fr/ad/x/1"], email: "a@b.fr", _hp: "bot" });
  })
  .then(function (c) {
    assert(c.status === 200 && c.body && c.body.received === 0, "honeypot ignoré");
    if (failed) {
      console.log("\n" + failed + " échec(s)");
      process.exit(1);
    }
    console.log("\nTous les checks URL portails OK");
  })
  .catch(function (err) {
    console.error(err);
    process.exit(1);
  });
