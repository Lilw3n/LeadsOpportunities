#!/usr/bin/env node
/**
 * Vérifie la promesse « envoyez le lien, je vais chercher le mandat »
 * (secteur territorial, mission mandat côté landing et côté API).
 */
var fs = require("fs");
var path = require("path");
var Secteur = require("../js/immo-secteur-lib.js");

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

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

/* ---------- Secteur d'intervention ---------- */

assert(Secteur.BASE.department === "54", "base secteur : Meurthe-et-Moselle");
assert(Secteur.CORE_CITIES.length >= 20, "au moins 20 communes en secteur immédiat");
assert(Secteur.secteurLabel().indexOf("Meurthe-et-Moselle") !== -1, "libellé public du secteur");

assert(Secteur.departmentFromPostal("54110") === "54", "département depuis CP 54110");
assert(Secteur.departmentFromPostal("97400") === "974", "département DOM (974)");
assert(Secteur.departmentFromPostal("20000") === "20", "Corse (20)");
assert(Secteur.departmentFromPostal("") === "", "CP vide");

assert(Secteur.isCoreCity("varangeville"), "commune sans accent reconnue");
assert(Secteur.isCoreCity("VANDOEUVRE-LES-NANCY"), "œ / majuscules / tirets normalisés");
assert(!Secteur.isCoreCity("Marseille"), "commune hors liste non reconnue");

var coeur = Secteur.evaluate({ city: "Varangéville", postal_code: "54110" });
assert(coeur.level === "coeur" && coeur.canHunt, "Varangéville : secteur immédiat");
assert(Secteur.evaluate({ city: "Lunéville", postal_code: "54300" }).level === "coeur", "Lunéville : secteur immédiat");

var territoire = Secteur.evaluate({ city: "Longwy", postal_code: "54400" });
assert(territoire.level === "territoire" && territoire.canHunt, "Longwy : localité territoriale (54)");

var proche = Secteur.evaluate({ city: "Metz", postal_code: "57000" });
assert(proche.level === "proche" && proche.canHunt, "Metz : secteur élargi");

var hors = Secteur.evaluate({ city: "Marseille", postal_code: "13001" });
assert(hors.level === "hors" && hors.needsPartner && !hors.canHunt, "Marseille : hors secteur → confrère local");

assert(Secteur.evaluate({}).level === "inconnu", "sans ville ni CP : secteur inconnu");

var fb = Secteur.feedback({ city: "Dombasle-sur-Meurthe", postal_code: "54110" });
assert(fb.tone === "ok" && fb.text.indexOf("Dombasle-sur-Meurthe") !== -1, "feedback formulaire : ville + verdict");

assert(Secteur.mandateKind("acheteur").id === "chasse", "mission acquéreur : chasse de mandat");
assert(Secteur.mandateKind("vendeur").id === "vente", "mission vendeur : mandat de vente");
assert(Secteur.mandateKind("les_deux").id === "vente_recherche", "double casquette : vente + recherche");

assert(
  Secteur.missionMessage({ level: "inconnu", requested: true }).indexOf("chercher le mandat") !== -1,
  "message mission sans ville : on va chercher le mandat"
);
assert(
  Secteur.missionMessage({ level: "hors", requested: true }).indexOf("confrère") !== -1,
  "message mission hors secteur : confrère local"
);
assert(
  Secteur.missionMessage({ level: "coeur", requested: false }).indexOf("rappelle") !== -1,
  "message sans mission mandat : simple rappel"
);

/* ---------- Landing ---------- */

var html = read("landings/acheteur-immo.html");
assert(html.indexOf("data-mandate-service") !== -1, "landing : bloc service mandat");
assert(html.indexOf('id="chercher-le-mandat"') !== -1, "landing : ancre #chercher-le-mandat");
assert(html.indexOf("je vais chercher le mandat") !== -1, "landing : promesse mandat en clair");
assert(html.indexOf("localité territoriale") !== -1, "landing : localité territoriale annoncée");
assert(html.indexOf("data-secteur-label") !== -1, "landing : libellé secteur injecté par la lib");
assert(html.indexOf('name="mandateMission"') !== -1, "landing : case mission mandat");
assert(html.indexOf("data-secteur-feedback") !== -1, "landing : verdict secteur en direct");
assert(html.indexOf("immo-secteur-lib.js") !== -1, "landing : lib secteur chargée");
assert(
  html.indexOf("vous allez chercher le mandat ?") !== -1 && html.indexOf("Sur quel secteur intervenez-vous ?") !== -1,
  "landing : FAQ mandat + secteur"
);
assert(
  html.indexOf("Leboncoin") !== -1 && html.indexOf("PAP") !== -1,
  "landing : exemples de portails (Leboncoin, PAP)"
);

var faqBlock = html.slice(html.indexOf('class="faq-list landing-faq"'));
faqBlock = faqBlock.slice(0, faqBlock.indexOf("</ul>"));
var detailsOpen = count(faqBlock, '<details class="faq-item">');
assert(detailsOpen >= 6, "landing : au moins 6 questions FAQ");
assert(detailsOpen === count(faqBlock, "</details>"), "landing : FAQ équilibrée (details ouverts/fermés)");
assert(count(faqBlock, "<li>") === count(faqBlock, "</li>"), "landing : FAQ équilibrée (li ouverts/fermés)");
assert(count(faqBlock, "<li>") === detailsOpen, "landing : un <li> par question FAQ");
assert(count(faqBlock, "<summary>") === detailsOpen, "landing : un <summary> par question FAQ");

var ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
assert(!!ldMatch, "landing : JSON-LD présent");
var ld = null;
try {
  ld = JSON.parse(ldMatch[1]);
} catch (e) {
  ld = null;
}
assert(!!ld && ld["@type"] === "FAQPage", "landing : JSON-LD FAQPage valide");
assert(
  !!ld &&
    ld.mainEntity.some(function (q) {
      return /mandat/i.test(q.name);
    }),
  "landing : JSON-LD contient la question mandat"
);

var css = read("css/acheteur-immo-search.css");
assert(css.indexOf(".mandate-service") !== -1 && css.indexOf(".mandate-feedback") !== -1, "CSS : bloc mandat stylé");

var urlJs = read("js/acheteur-immo-listing-url.js");
assert(urlJs.indexOf("mandateMission") !== -1, "formulaire : mission mandat envoyée à l'API");
assert(urlJs.indexOf("renderSecteur") !== -1, "formulaire : verdict secteur calculé");

var searchJs = read("js/acheteur-immo-search.js");
assert(searchJs.indexOf("je vais chercher le mandat") !== -1, "vitrine vide : invite à envoyer un lien");

/* ---------- API ---------- */

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
    return call({
      urls: ["https://www.leboncoin.fr/ad/ventes_immobilieres/4242"],
      email: "acquereur@example.fr",
      city: "Varangéville",
      postal_code: "54110",
      price_fai: 189000,
    });
  })
  .then(function (c) {
    assert(c.status === 200 && c.body && c.body.ok, "API : lien d'annonce accepté");
    assert(c.body.mandate && c.body.mandate.requested === true, "API : mission mandat active par défaut");
    assert(c.body.mandate.kind === "chasse", "API : mission = chasse de mandat");
    assert(c.body.secteur && c.body.secteur.level === "coeur", "API : secteur immédiat détecté");
    assert(c.body.secteur.canHunt === true, "API : déplacement possible");
    return call({
      urls: ["https://www.leboncoin.fr/ad/ventes_immobilieres/4243"],
      email: "acquereur@example.fr",
      city: "Marseille",
      postal_code: "13001",
    });
  })
  .then(function (c) {
    assert(c.status === 200 && c.body.ok, "API : annonce hors secteur acceptée");
    assert(c.body.secteur.level === "hors" && c.body.secteur.needsPartner === true, "API : hors secteur → confrère");
    assert(/confrère/.test(c.body.secteur.message), "API : message hors secteur explicite");
    return call({
      urls: ["https://www.leboncoin.fr/ad/ventes_immobilieres/4244"],
      email: "acquereur@example.fr",
    });
  })
  .then(function (c) {
    assert(c.body.secteur.level === "inconnu", "API : secteur inconnu sans ville");
    assert(/chercher le mandat/.test(c.body.secteur.message), "API : on va quand même chercher le mandat");
    return call({
      urls: ["https://www.leboncoin.fr/ad/ventes_immobilieres/4245"],
      email: "acquereur@example.fr",
      city: "Nancy",
      postal_code: "54000",
      mandateMission: false,
    });
  })
  .then(function (c) {
    assert(c.body.mandate.requested === false, "API : mission mandat désactivable");
    return call({
      role: "vendeur",
      email: "vendeur@example.fr",
      firstName: "Frederic",
      city: "Dombasle-sur-Meurthe",
      postal_code: "54110",
      price_fai: 205000,
    });
  })
  .then(function (c) {
    assert(c.body.mandate.kind === "vente", "API vendeur : mandat de vente proposé");
    assert(c.body.secteur.level === "coeur", "API vendeur : bien dans le secteur immédiat");
    return call({
      role: "les_deux",
      email: "chaine@example.fr",
      firstName: "Marie",
      city: "Saint-Nicolas-de-Port",
      postal_code: "54210",
      price_fai: 230000,
      buyCity: "Nancy",
    });
  })
  .then(function (c) {
    assert(c.body.mandate.kind === "vente_recherche", "API double casquette : vente + recherche");
    if (failed) {
      console.log("\n" + failed + " échec(s)");
      process.exit(1);
    }
    console.log("\nTous les checks mandat / secteur OK");
  })
  .catch(function (err) {
    console.error(err);
    process.exit(1);
  });
