#!/usr/bin/env node
/**
 * Vérifie le dossier multi-lots (immeuble / parcelle) + photos / visite par unité
 * + barre noire par lot + totaux composition.
 */
var path = require("path");
var fs = require("fs");
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

var Dossier = require(path.join(root, "js/crm-immo-dossier-lib.js"));
assert(Dossier.emptyUnit, "emptyUnit");
assert(Dossier.packMetadata, "packMetadata");
assert(Dossier.hydrateProperty, "hydrateProperty");
assert(typeof Dossier.unitTotals === "function", "unitTotals exporté");

var u = Dossier.emptyUnit("appartement");
assert(u.type === "appartement" && Array.isArray(u.photos), "unité appartement + photos[]");
assert(u.virtual_tour === "" && u.parent_id == null, "visite + parent_id");
assert("loyer_reel" in u || u.loyer_reel === "" || u.loyer_reel == null, "champs loyer_reel normalisés");

var packed = Dossier.packMetadata({
  title: "Immeuble test",
  property_type: "immeuble",
  transaction: "vente",
  details: { localisation: { ville: "Nancy" } },
  units: [
    Dossier.normalizeUnit({
      type: "appartement",
      label: "A1",
      floor: "1",
      lot_number: "12",
      loue: true,
      loyer_reel: 600,
      loyer_previsionnel: 650,
      nb_pieces: 3,
      nb_chambres: 2,
      nb_sdb: 1,
      nb_wc: 1,
      nb_cuisines: 1,
      type_bail: "Nu (loi 89)",
      locataire_nom: "Dupont",
      photos: ["https://example.com/a.jpg"],
      virtual_tour: "https://my.matterport.com/show/?m=ABC",
    }),
    Dossier.normalizeUnit({
      type: "appartement",
      label: "A2",
      loue: true,
      loyer: 700,
      nb_chambres: 1,
      nb_sdb: 1,
      nb_wc: 1,
      nb_cuisines: 1,
    }),
  ],
});
assert(packed.units && packed.units.length === 2, "pack units");
assert(packed.units[0].photos.length === 1, "pack photos unit");
assert(packed.units[0].virtual_tour.indexOf("matterport") !== -1, "pack virtual_tour");
assert(packed.details && packed.details.localisation.ville === "Nancy", "pack details");
assert(Number(packed.units[0].loyer_reel) === 600, "pack loyer_reel");
assert(Number(packed.units[1].loyer_reel) === 700, "loyer → loyer_reel sync");

var totals = Dossier.unitTotals(packed.units);
assert(totals.units === 2, "totaux: unités");
assert(totals.loyer_reel === 1300, "totaux: loyers réels");
assert(totals.loyer_previsionnel === 650, "totaux: loyers prévisionnels");
assert(totals.nb_chambres === 3, "totaux: chambres");
assert(totals.nb_sdb === 2 && totals.nb_wc === 2 && totals.nb_cuisines === 2, "totaux: SDB/WC/cuisines");
assert(totals.baux_actifs >= 1, "totaux: baux actifs");
assert(totals.loues === 2, "totaux: loués");

var hydrated = Dossier.hydrateProperty({
  id: "prop_1",
  title: "Immeuble",
  property_type: "immeuble",
  metadata_json: JSON.stringify(packed),
});
assert(hydrated.units.length === 2, "hydrate units");
assert(hydrated.units[0].label === "A1", "hydrate label");
assert(hydrated.is_parent_dossier === true, "parent dossier auto");

var summary = Dossier.unitSummary(hydrated.units);
assert(summary.appartements === 2 && summary.with_tour === 1 && summary.with_photos === 1, "unitSummary");

var storeSrc = read("api/_lib/immo-properties-store.js");
assert(storeSrc.indexOf("crm-immo-dossier-lib") !== -1, "store Neon utilise dossier-lib");
assert(storeSrc.indexOf("packMetadata") !== -1, "upsert packMetadata");
assert(storeSrc.indexOf("hydrateProperty") !== -1, "rowToProperty hydrate");

var page = read("js/crm-immo-property-page.js");
assert(page.indexOf("virtual_tour") !== -1, "UI visite par unité");
assert(page.indexOf("cadastre_ref") !== -1, "UI cadastre par unité");
assert(page.indexOf("btnPresetImmeuble") !== -1, "preset immeuble");
assert(page.indexOf("parent_id") !== -1, "rattachement parent");
assert(page.indexOf("renderUnitsOverview") !== -1, "vue composition avec totaux");
assert(page.indexOf("renderUnitSection") !== -1, "fiche unité (barre noire)");
assert(page.indexOf("data-open-unit") !== -1, "bouton ouvrir fiche unité");
assert(page.indexOf("activeUnitId") !== -1, "état mode unité");
assert(page.indexOf("UNIT_SECTIONS") !== -1, "UNIT_SECTIONS utilisé");
assert(page.indexOf("loyer_previsionnel") !== -1, "UI loyer prévisionnel");
assert(page.indexOf("nb_cuisines") !== -1, "UI cuisines unitaires");
assert(page.indexOf("function renderUnits(") === -1, "ancien renderUnits retiré");

var schema = read("js/crm-immo-property-schema.js");
assert(schema.indexOf("UNIT_SECTIONS") !== -1, "schema UNIT_SECTIONS");
assert(schema.indexOf("bail_unit") !== -1, "section bail par unité");
assert(schema.indexOf("loyer_reel") !== -1, "schema loyer_reel");

var html = read("crm-immo-property.html");
assert(html.indexOf("crm-immo-dossier-lib.js") !== -1, "HTML charge dossier-lib");
assert((html.match(/<style[\s>]/gi) || []).length === (html.match(/<\/style>/gi) || []).length, "balises style fermées (évite page blanche)");
assert(html.indexOf('id="propTitle"') !== -1, "propTitle présent hors style");
assert(html.indexOf("totals-grid") !== -1, "CSS totaux composition");
assert(html.indexOf("side-unit-tag") !== -1, "CSS tag unité sidebar");
assert(html.indexOf("side-back") !== -1, "CSS retour composition");

var clientStore = read("js/crm-immo-store.js");
assert(clientStore.indexOf("packMetadata") !== -1, "client packMetadata");
assert(clientStore.indexOf("hydrateProperty") !== -1, "client hydrate");

["js/crm-immo-dossier-lib.js", "api/_lib/immo-properties-store.js", "js/crm-immo-property-page.js"].forEach(function (rel) {
  require("child_process").execFileSync(process.execPath, ["--check", path.join(root, rel)]);
  assert(true, "syntaxe " + rel);
});

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les checks immeuble multi-lots OK");
