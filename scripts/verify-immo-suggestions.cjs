#!/usr/bin/env node
/** Suggestions intelligentes dossier immo (année → plomb/amiante, appart → Carrez, etc.). */
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

var libPath = path.join(root, "js/crm-immo-suggestions-lib.js");
ok(fs.existsSync(libPath), "js/crm-immo-suggestions-lib.js présent");

var Sug = require(libPath);
ok(typeof Sug.collectSuggestions === "function", "collectSuggestions");
ok(typeof Sug.summary === "function", "summary");
ok(typeof Sug.isDocSuggestedRequired === "function", "isDocSuggestedRequired");
ok(typeof Sug.renderPanelHtml === "function", "renderPanelHtml");

var appartVieux = {
  property_type: "appartement",
  transaction: "vente",
  details: {
    localisation: { annee_construction: 1930, ville: "Nancy" },
    surfaces: {},
    diagnostics: {},
    interieur: { chauffage: "Individuel gaz" },
    copropriete: {},
    finances: {},
  },
  docs_checklist: {},
};
var items = Sug.collectSuggestions(appartVieux);
var ids = items.map(function (i) {
  return i.id;
});
ok(ids.indexOf("diag_plomb") >= 0, "appart 1930 → CREP/plomb");
ok(ids.indexOf("diag_amiante") >= 0, "appart 1930 → amiante");
ok(ids.indexOf("surface_carrez") >= 0 || ids.indexOf("diag_carrez") >= 0, "appart → Carrez");
ok(ids.indexOf("diag_dpe") >= 0, "logement → DPE");
ok(ids.indexOf("diag_erp") >= 0, "→ ERP");
ok(Sug.isDocSuggestedRequired("plomb", appartVieux), "doc plomb suggéré requis");
ok(Sug.isDocSuggestedRequired("carrez", appartVieux), "doc carrez suggéré requis");

var neuf = {
  property_type: "appartement",
  transaction: "vente",
  details: {
    localisation: { annee_construction: 2015, ville: "Nancy" },
    surfaces: { surface_carrez: 45, surface_habitable: 48, nb_pieces: 3 },
    diagnostics: {
      date_dpe: "2024-01-01",
      conso_energie_primaire: "C",
      erp: "yes",
      date_erp: "2024-06-01",
      carrez: "yes",
      date_carrez: "2023-01-01",
      annee_installation_gaz: 2018,
      annee_installation_elec: 2018,
      diag_gaz: "yes",
      diag_elec: "yes",
    },
    finances: { prix_net: 180000 },
    mandat: { n_mandat: "M-1", date_mandat: "2024-01-01" },
    copropriete: { syndic: "Syndic Test", tantiemes: "120/1000" },
    interieur: { chauffage: "Individuel gaz" },
  },
  images: ["a", "b", "c", "d"],
  docs_checklist: {
    dpe: { recu: true },
    erp: { recu: true },
    carrez: { recu: true },
    titre: { recu: true },
    reglement_copro: { recu: true },
    pv_ag: { recu: true },
    pre_etat_date: { recu: true },
    gaz: { recu: true },
    elec: { recu: true },
  },
};
var neufItems = Sug.collectSuggestions(neuf);
ok(
  !neufItems.some(function (i) {
    return i.id === "diag_plomb";
  }),
  "appart 2015 → pas de plomb"
);
ok(
  !neufItems.some(function (i) {
    return i.id === "diag_amiante";
  }),
  "appart 2015 → pas d’amiante"
);

var loc = {
  property_type: "maison",
  transaction: "location",
  details: {
    localisation: { annee_construction: 1985, ville: "Jarville" },
    surfaces: {},
    exterieur: { piscine: "yes" },
    bail: {},
    finances: {},
    diagnostics: {},
  },
  docs_checklist: {},
};
var locIds = Sug.collectSuggestions(loc).map(function (i) {
  return i.id;
});
ok(locIds.indexOf("surface_boutin") >= 0, "location → surface Boutin");
ok(locIds.indexOf("secu_piscine") >= 0, "piscine → sécurité");

var panel = Sug.renderPanelHtml(appartVieux, { limit: 5 });
ok(panel.indexOf("immo-suggest-panel") >= 0, "HTML panneau");
ok(panel.indexOf("data-section") >= 0, "liens sections");

var sum = Sug.summary(appartVieux);
ok(sum.total > 5 && sum.critique >= 1, "summary priorise");

var page = read("js/crm-immo-property-page.js");
ok(page.indexOf("CrmImmoSuggestions") >= 0, "page référence CrmImmoSuggestions");
ok(page.indexOf("renderPanelHtml") >= 0, "page appelle renderPanelHtml");
ok(page.indexOf("bindSuggestPanel") >= 0, "bindSuggestPanel");
ok(page.indexOf("suggestionsPanelHtml") >= 0, "suggestionsPanelHtml");

var schema = read("js/crm-immo-property-schema.js");
ok(schema.indexOf("annee_construction") >= 0, "schéma année construction");
ok(schema.indexOf("annee_installation_gaz") >= 0, "schéma année gaz");
ok(schema.indexOf("annee_installation_elec") >= 0, "schéma année élec");
ok(schema.indexOf("isDocSuggestedRequired") >= 0, "schéma branche suggestions");

var html = read("crm-immo-property.html");
ok(html.indexOf("crm-immo-suggestions-lib.js") >= 0, "script suggestions inclus");
ok(html.indexOf(".immo-suggest-panel") >= 0, "styles panneau");

var pkg = JSON.parse(read("package.json"));
ok(!!pkg.scripts["verify:immo-suggestions"], "npm run verify:immo-suggestions");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nOK verify-immo-suggestions");
