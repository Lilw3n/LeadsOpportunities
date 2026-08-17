#!/usr/bin/env node
/**
 * Vérifie que les questionnaires demandent :
 * - plaque d'immatriculation (besoins mobilité)
 * - SIREN ou SIRET (besoins pro)
 * - adresse postale complète (rue + CP + ville)
 */
var fs = require("fs");
var path = require("path");
var vm = require("vm");

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

function loadScripts(files) {
  var sandbox = {
    console: console,
    URLSearchParams: URLSearchParams,
  };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  files.forEach(function (rel) {
    vm.runInNewContext(read(rel), sandbox, { filename: rel });
  });
  return sandbox;
}

function fieldTag(html, name) {
  var re = new RegExp("<input[^>]*name=\"" + name + "\"[^>]*>|<input[^>]*name=\"" + name + "\"[^>]*/>", "i");
  var m = html.match(re);
  return m ? m[0] : "";
}

function hasRequiredField(html, names) {
  var list = Array.isArray(names) ? names : [names];
  return list.some(function (name) {
    var tag = fieldTag(html, name);
    return tag && /\srequired(\s|\/|>)/.test(tag);
  });
}

function hasAnyField(html, names) {
  return names.some(function (name) {
    return html.indexOf('name="' + name + '"') !== -1;
  });
}

var sandbox = loadScripts([
  "js/service-catalog.js",
  "js/contact-pair.js",
  "js/questionnaire-config.js",
  "landings/devis-steps.js",
  "js/devis-express-config.js",
]);

var QC = sandbox.QUESTIONNAIRE_CONFIG;
var catalog = sandbox.SERVICE_CATALOG;
var steps = sandbox.DEVIS_STEPS;
var express = sandbox.DEVIS_EXPRESS_CONFIG;

assert(QC && catalog && steps && express, "configs questionnaire chargées");
assert(QC.MOBILITY_NEEDS.length >= 5, "liste besoins mobilité");
assert(QC.PRO_NEEDS.length >= 8, "liste besoins pro");

var identity = steps.buildWizardHtml({ need: "sante", category: "sante", label: "Sante" });
assert(hasRequiredField(identity, "phone"), "identité : téléphone obligatoire");
assert(hasRequiredField(identity, "email"), "identité : e-mail obligatoire");
assert(hasRequiredField(identity, "street"), "identité : adresse (rue) obligatoire");
assert(hasRequiredField(identity, "postalCode"), "identité : code postal obligatoire");
assert(hasRequiredField(identity, "cityFull"), "identité : ville obligatoire");
assert(identity.indexOf("Comment vous joindre") < identity.indexOf("Votre adresse"), "téléphone+email avant adresse");

QC.MOBILITY_NEEDS.forEach(function (need) {
  var service = catalog.getService(need) || { need: need, category: "mobilite", label: need };
  var html = QC.contextForService(service);
  assert(
    hasRequiredField(html, QC.PLATE_FIELD_NAMES),
    "complet " + need + " : plaque d'immatriculation obligatoire"
  );
  var ex = express.fieldsHtmlForService(service);
  assert(
    hasRequiredField(ex, QC.PLATE_FIELD_NAMES),
    "express " + need + " : plaque d'immatriculation obligatoire"
  );
});

QC.PRO_NEEDS.forEach(function (need) {
  var service = catalog.getService(need) || { need: need, category: "pro", label: need };
  var html = QC.contextForService(service);
  assert(
    hasRequiredField(html, QC.SIRET_FIELD_NAMES),
    "complet " + need + " : SIREN/SIRET obligatoire"
  );
  assert(
    /SIREN/.test(html) && /SIRET/.test(html),
    "complet " + need + " : libellé SIREN ou SIRET"
  );
  var ex = express.fieldsHtmlForService(service);
  assert(
    hasRequiredField(ex, QC.SIRET_FIELD_NAMES),
    "express " + need + " : SIREN/SIRET obligatoire"
  );
});

assert(
  hasRequiredField(QC.CATEGORY_CONTEXT.mobilite(), QC.PLATE_FIELD_NAMES),
  "fallback mobilité : plaque obligatoire"
);
assert(
  hasRequiredField(QC.CATEGORY_CONTEXT.pro(), QC.SIRET_FIELD_NAMES),
  "fallback pro : SIREN/SIRET obligatoire"
);

var wizard = read("landings/quote-wizard.js");
assert(wizard.indexOf("[0-9]{9}") !== -1 && wizard.indexOf("[0-9]{14}") !== -1, "wizard : validation SIREN 9 ou SIRET 14");
assert(wizard.indexOf("autoPlate") !== -1 && wizard.indexOf("vehiclePlate") !== -1, "wizard : validation plaque");

var vtc = read("landings/vtc.html");
assert(hasRequiredField(vtc, "vehiclePlate"), "landing VTC : plaque obligatoire");
assert(hasRequiredField(vtc, "siret"), "landing VTC : SIREN/SIRET obligatoire");
assert(hasRequiredField(vtc, "street") && hasRequiredField(vtc, "postalCode") && hasRequiredField(vtc, "cityFull"), "landing VTC : adresse complète");

var rapide = read("landings/devis-rapide.html");
assert(hasRequiredField(rapide, "vehiclePlate"), "express VTC : plaque obligatoire");
assert(hasRequiredField(rapide, "siret"), "express VTC : SIREN/SIRET obligatoire");
assert(
  hasRequiredField(rapide, "street") && hasRequiredField(rapide, "postalCode") && hasRequiredField(rapide, "cityFull"),
  "express VTC : adresse complète"
);

["landings/devis-express.html", "landings/animaux-express.html", "js/pet-journey.js"].forEach(function (rel) {
  var html = read(rel);
  assert(
    hasRequiredField(html, "street") && hasRequiredField(html, "postalCode") && hasRequiredField(html, "cityFull"),
    rel + " : adresse complète"
  );
});

["landings/sante.html", "landings/credit-immo.html", "landings/acheteur-immo.html"].forEach(function (rel) {
  var html = read(rel);
  assert(
    hasAnyField(html, ["street"]) && hasAnyField(html, ["postalCode"]) && hasAnyField(html, ["cityFull"]),
    rel + " : adresse postale (rue, CP, ville)"
  );
});

var intel = read("js/intelligent-quote-wizard.js");
assert(intel.indexOf("vehiclePlate") !== -1, "wizard intelligent : plaque auto/VTC");
assert(intel.indexOf("SIREN") !== -1, "wizard intelligent : SIREN/SIRET");
assert(intel.indexOf("Adresse postale requise") !== -1, "wizard intelligent : adresse requise");

if (failed) {
  console.log("\n" + failed + " contrôle(s) en échec");
  process.exit(1);
}
console.log("\nTous les contrôles questionnaires (plaque, SIREN/SIRET, adresse) sont OK");
