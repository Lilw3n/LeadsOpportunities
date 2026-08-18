#!/usr/bin/env node
/** Vérifie le parcours chasseur de bien / signalement terrain. */
var fs = require("fs");
var path = require("path");
var Msg = require("./chasseur-bien-messaging-lib.cjs");
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

assert(/chasseur/i.test(Msg.CHASSEUR_TAGLINE), "tagline chasseur");
assert(Msg.CHASSEUR_DISCLAIMER.indexOf("mandat") !== -1, "disclaimer sans mandat garanti");
assert(/promettre|promesse/i.test(Msg.CHASSEUR_DISCLAIMER), "disclaimer pas de promesse client");
assert(Msg.SIGNALEMENT_INTRO.indexOf("photo") !== -1, "intro signalement photo");

var landing = read("landings/chasseur-bien.html");
assert(landing.indexOf("data-listing-url-capture") !== -1, "formulaire signalement");
assert(landing.indexOf('name="role" value="signalement"') !== -1, "rôle signalement");
assert(landing.indexOf("signalementSource") !== -1, "champ source");
assert(landing.indexOf("data-listing-photos") !== -1, "upload photos");

var acheteur = read("landings/acheteur-immo.html");
assert(acheteur.indexOf('value="signalement"') !== -1, "casquette signalement acheteur-immo");

assert(read("index.html").indexOf("chasseur-bien.html") !== -1, "lien accueil");
assert(read("js/service-catalog.js").indexOf("chasseur-bien") !== -1, "catalogue service");
assert(read("scripts/seo-gsc-priority-urls.cjs").indexOf("chasseur-bien.html") !== -1, "URL GSC prioritaire");

var api = read("api/_lib/routes/public-immo-listing-submit.js");
assert(api.indexOf("signalement-bien") !== -1, "API need signalement");
assert(api.indexOf('role: "signaleur"') !== -1, "party signaleur CRM");

var handler = require("../api/_lib/routes/public-immo-listing-submit.js");
var tinyJpeg =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP///wD/2wBDAf///wD/wgARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAG/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q==";

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
    return call({ role: "signalement", email: "tip@example.fr", city: "Nancy" });
  })
  .then(function (c) {
    assert(c.status === 400 && c.body && c.body.error === "photo_or_desc_required", "signalement sans photo refusé");
    return call({
      role: "signalement",
      email: "tip@example.fr",
      city: "Jarville-la-Malgrange",
      postal_code: "54140",
      signalementSource: "panneau",
      addressHint: "Rue principale",
      photos: [{ url: tinyJpeg, kind: "photo" }],
    });
  })
  .then(function (c) {
    assert(c.status === 200 && c.body && c.body.ok, "API signalement photo + ville");
    assert(c.body.role === "signalement", "rôle signalement renvoyé");
    assert(c.body.hats && c.body.hats.indexOf("chasseur") !== -1, "casquette chasseur");
    assert(c.body.vertical === "chasseur_immo" || (c.body.listings && c.body.listings.length), "signalement enregistré");
    if (failed) {
      console.log("\n" + failed + " échec(s)");
      process.exit(1);
    }
    console.log("\nTous les checks chasseur de bien OK");
  })
  .catch(function (err) {
    console.error(err);
    process.exit(1);
  });
