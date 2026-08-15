#!/usr/bin/env node
/**
 * Prêt immo : pas de partenaires assurance (VTC, mutuelle, animaux).
 */
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

var src = fs.readFileSync(path.join(__dirname, "..", "js/public-partners-trust.js"), "utf8");
var vm = require("vm");
var sandbox = {
  window: { location: { pathname: "/landings/credit-immo.html" } },
  document: {
    readyState: "complete",
    addEventListener: function () {},
    querySelectorAll: function () {
      return [];
    },
  },
  globalThis: {},
};
sandbox.window.document = sandbox.document;
sandbox.globalThis = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(src, sandbox);
var PPT = sandbox.PublicPartnersTrust || sandbox.window.PublicPartnersTrust;
assert(!!PPT, "PublicPartnersTrust exposé");

var credit = PPT.COPY.credit;
assert(credit.partnerCategories && credit.partnerCategories.indexOf("credit") >= 0, "contexte credit filtre category credit");
assert(credit.categories && credit.categories.indexOf("credit") >= 0, "contexte credit affiche la catégorie crédit");
assert(credit.categories.indexOf("vtc") < 0, "contexte credit sans VTC");
assert(credit.categories.indexOf("animaux") < 0, "contexte credit sans animaux");
assert(credit.categories.indexOf("sante") < 0, "contexte credit sans santé");

var creditPartners = PPT.PARTNERS.filter(function (p) {
  return p.category === "credit";
});
assert(creditPartners.length >= 1, "au moins un partenaire crédit");
assert(
  creditPartners.some(function (p) {
    return /centrale/i.test(p.name);
  }),
  "La Centrale de Financement listée"
);

var insuranceNames = ["Santévet", "Bulle Bleue", "Kozoo", "Solly Azar", "Zéphir", "April", "Allianz", "AXA", "Generali", "Swiss Life"];
var html = PPT.renderMarkup("credit", "featured", { getAttribute: function () { return ""; } });
insuranceNames.forEach(function (name) {
  assert(html.indexOf(name) < 0, "HTML crédit sans " + name);
});
assert(/Centrale/i.test(html), "HTML crédit cite La Centrale");
assert(html.indexOf("Crédit immobilier") >= 0 || html.indexOf("credit") >= 0, "catégorie crédit dans le HTML");

var home = PPT.renderMarkup("default", "showcase", { getAttribute: function () { return ""; } });
assert(home.indexOf("Solly Azar") >= 0, "accueil garde les assureurs");
assert(home.indexOf("Santévet") >= 0, "accueil garde les animaux");

["landings/credit-immo.html", "landings/acheteur-immo.html"].forEach(function (rel) {
  var page = fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
  assert(page.indexOf('data-partners-context="credit"') >= 0, rel + " utilise le contexte credit");
});

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nPartenaires prêt immo : OK (plus d’assureurs).");
