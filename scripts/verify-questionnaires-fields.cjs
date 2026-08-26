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
assert(hasAnyField(identity, ["phone"]), "identité : téléphone présent");
assert(hasAnyField(identity, ["email"]), "identité : e-mail présent");
assert(!hasRequiredField(identity, "phone"), "identité : téléphone non bloquant");
assert(!hasRequiredField(identity, "email"), "identité : e-mail non bloquant");
assert(hasAnyField(identity, ["street"]), "identité : adresse (rue) présente");
assert(hasAnyField(identity, ["postalCode"]), "identité : code postal présent");
assert(hasAnyField(identity, ["cityFull"]), "identité : ville présente");
assert(!hasRequiredField(identity, "street"), "adresse rue non bloquante");
assert(identity.indexOf("Comment vous joindre") < identity.indexOf("Votre adresse"), "téléphone+email avant adresse");
assert(hasRequiredField(identity, "rgpd"), "RGPD toujours obligatoire à l'envoi");

QC.MOBILITY_NEEDS.forEach(function (need) {
  var service = catalog.getService(need) || { need: need, category: "mobilite", label: need };
  var html = QC.contextForService(service);
  assert(
    hasAnyField(html, QC.PLATE_FIELD_NAMES),
    "complet " + need + " : plaque d'immatriculation demandée"
  );
  assert(
    !hasRequiredField(html, QC.PLATE_FIELD_NAMES),
    "complet " + need + " : plaque non bloquante"
  );
  var ex = express.fieldsHtmlForService(service);
  assert(
    hasAnyField(ex, QC.PLATE_FIELD_NAMES),
    "express " + need + " : plaque d'immatriculation demandée"
  );
});

QC.PRO_NEEDS.forEach(function (need) {
  var service = catalog.getService(need) || { need: need, category: "pro", label: need };
  var html = QC.contextForService(service);
  assert(
    hasAnyField(html, QC.SIRET_FIELD_NAMES),
    "complet " + need + " : SIREN/SIRET demandé"
  );
  assert(
    !hasRequiredField(html, QC.SIRET_FIELD_NAMES),
    "complet " + need + " : SIREN/SIRET non bloquant"
  );
  assert(
    /SIREN/.test(html) && /SIRET/.test(html),
    "complet " + need + " : libellé SIREN ou SIRET"
  );
  var ex = express.fieldsHtmlForService(service);
  assert(
    hasAnyField(ex, QC.SIRET_FIELD_NAMES),
    "express " + need + " : SIREN/SIRET demandé"
  );
});

assert(
  hasAnyField(QC.CATEGORY_CONTEXT.mobilite(), QC.PLATE_FIELD_NAMES),
  "fallback mobilité : plaque demandée"
);
assert(
  hasAnyField(QC.CATEGORY_CONTEXT.pro(), QC.SIRET_FIELD_NAMES),
  "fallback pro : SIREN/SIRET demandé"
);

var wizard = read("landings/quote-wizard.js");
assert(wizard.indexOf("[0-9]{9}") !== -1 && wizard.indexOf("[0-9]{14}") !== -1, "wizard : validation SIREN 9 ou SIRET 14");
assert(wizard.indexOf("autoPlate") !== -1 && wizard.indexOf("vehiclePlate") !== -1, "wizard : validation plaque");
assert(wizard.indexOf("relaxQuestionnaireRequired") !== -1, "wizard : champs non bloquants sauf RGPD");
assert(wizard.indexOf("phoneOk || emailOk") !== -1, "wizard : téléphone OU e-mail pour le rappel");

var qi = read("js/quote-intelligence.js");
assert(qi.indexOf("beforeunload") !== -1, "autosave à la fermeture (beforeunload)");
assert(qi.indexOf("pagehide") !== -1, "autosave pagehide");
assert(qi.indexOf("autosave_unload") !== -1 && qi.indexOf("partial_payload") !== -1, "autosave envoie le formulaire complet");
assert(qi.indexOf("lo_form_draft_v1") !== -1, "brouillon localStorage");
assert(qi.indexOf("keepalive") !== -1, "fetch keepalive à la sortie");

var vtc = read("landings/vtc.html");
assert(hasAnyField(vtc, ["vehiclePlate"]), "landing VTC : plaque demandée");
assert(!hasRequiredField(vtc, "vehiclePlate"), "landing VTC : plaque non bloquante");
assert(hasAnyField(vtc, ["siret"]), "landing VTC : SIREN/SIRET demandé");
assert(!hasRequiredField(vtc, "siret"), "landing VTC : SIRET non bloquant");
assert(hasAnyField(vtc, ["street"]) && hasAnyField(vtc, ["postalCode"]) && hasAnyField(vtc, ["cityFull"]), "landing VTC : adresse complète");
assert(hasRequiredField(vtc, "rgpd"), "landing VTC : RGPD obligatoire");

var rapide = read("landings/devis-rapide.html");
assert(hasAnyField(rapide, ["vehiclePlate"]), "express VTC : plaque demandée");
assert(!hasRequiredField(rapide, "vehiclePlate"), "express VTC : plaque non bloquante");
assert(hasAnyField(rapide, ["siret"]), "express VTC : SIREN/SIRET demandé");
assert(
  hasAnyField(rapide, ["street"]) && hasAnyField(rapide, ["postalCode"]) && hasAnyField(rapide, ["cityFull"]),
  "express VTC : adresse complète"
);

["landings/devis-express.html", "landings/animaux-express.html", "js/pet-journey.js"].forEach(function (rel) {
  var html = read(rel);
  assert(
    hasAnyField(html, ["street"]) && hasAnyField(html, ["postalCode"]) && hasAnyField(html, ["cityFull"]),
    rel + " : adresse complète"
  );
  assert(!hasRequiredField(html, "street"), rel + " : adresse non bloquante");
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
assert(intel.indexOf("Adresse postale requise") === -1, "wizard intelligent : adresse non bloquante");

if (failed) {
  console.log("\n" + failed + " contrôle(s) en échec");
  process.exit(1);
}
console.log("\nTous les contrôles questionnaires (champs utiles, non bloquants, autosave) sont OK");
