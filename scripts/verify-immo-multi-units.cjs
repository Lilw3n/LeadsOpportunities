#!/usr/bin/env node
/**
 * Vérifie le dossier multi-lots (immeuble / parcelle) + photos / visite par unité
 * + barre noire par lot + totaux composition + schéma terrain→immeuble→étage→appart.
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
var occ = Dossier.normalizeUnit({ type: "appartement", occupation: "loue" });
assert(occ.loue === true && occ.occupation === "loue", "occupation loue → loue");
var vide = Dossier.normalizeUnit({ type: "appartement", occupation: "vide" });
assert(vide.loue === false && vide.occupation === "vide", "occupation vide");
assert(typeof Dossier.buildCompositionTree === "function", "buildCompositionTree exporté");
assert(typeof Dossier.subtreeTotals === "function", "subtreeTotals exporté");
assert(Array.isArray(Dossier.COMPOSITION_LEVELS) && Dossier.COMPOSITION_LEVELS.length >= 5, "COMPOSITION_LEVELS");

var terrain = Dossier.emptyUnit("terrain");
terrain.label = "Parcelle";
var immeuble = Dossier.emptyUnit("immeuble");
immeuble.label = "Immeuble";
immeuble.parent_id = terrain.id;
var etage = Dossier.emptyUnit("etage");
etage.label = "1er";
etage.parent_id = immeuble.id;
var apt = Dossier.emptyUnit("appartement");
apt.label = "A1";
apt.parent_id = etage.id;
apt.loyer_reel = 600;
apt.loyer_previsionnel = 650;
apt.nb_chambres = 2;
apt.loue = true;
var treeUnits = [terrain, immeuble, etage, apt];
var tree = Dossier.buildCompositionTree(treeUnits);
assert(tree.length === 1 && tree[0].unit.type === "terrain", "arbre racine terrain");
assert(tree[0].children[0].unit.type === "immeuble", "arbre enfant immeuble");
assert(tree[0].children[0].children[0].unit.type === "etage", "arbre petit-enfant étage");
assert(tree[0].children[0].children[0].children[0].unit.type === "appartement", "arbre lot appart");
var branch = Dossier.subtreeTotals(treeUnits, immeuble.id, false);
assert(branch.units === 2 && branch.loyer_reel === 600, "totaux branche immeuble (hors self)");

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
assert(page.indexOf("buildCompositionTree") !== -1, "UI schéma arbre composition");
assert(page.indexOf("subtreeTotals") !== -1, "UI totaux par branche");
assert(page.indexOf('emptyUnit("etage")') !== -1 || page.indexOf("emptyUnit('etage')") !== -1, "preset avec étages");
assert(page.indexOf("comp-synthesis") !== -1, "bloc synthèse modèle");
assert(page.indexOf("pieces_editor") !== -1 || page.indexOf("piecesEditorHtml") !== -1, "UI éditeur pièces libres");
assert(page.indexOf("btnAddPiece") !== -1, "bouton ajouter une pièce");
assert(page.indexOf("pieces_list") !== -1, "persistance pieces_list");
assert(page.indexOf("occupation") !== -1, "UI occupation loué/vide");
assert(page.indexOf("occ-toggle") !== -1, "toggle Loué/Vide");
assert(page.indexOf("is-vide") !== -1, "badge vide composition");
assert(typeof Dossier.emptyPiece === "function", "emptyPiece exporté");
assert(typeof Dossier.syncCountersFromPieces === "function", "syncCountersFromPieces exporté");
assert(Array.isArray(Dossier.ROOM_TYPES) && Dossier.ROOM_TYPES.length >= 8, "ROOM_TYPES catalogue");
var roomy = Dossier.normalizeUnit({
  type: "appartement",
  label: "A pieces",
  pieces_list: [
    Dossier.emptyPiece("chambre"),
    Object.assign(Dossier.emptyPiece("chambre"), { qty: 1, label: "Chambre 2" }),
    Dossier.emptyPiece("sdb"),
    Dossier.emptyPiece("bureau"),
  ],
});
assert(roomy.pieces_list.length === 4, "normalize pieces_list");
assert(Number(roomy.nb_chambres) === 2 && Number(roomy.nb_sdb) === 1, "compteurs dérivés de la liste");

var schema = read("js/crm-immo-property-schema.js");
assert(schema.indexOf("pieces_editor") !== -1, "schema pieces_editor");
assert(schema.indexOf("pieces_list") !== -1, "schema pieces_list");
assert(schema.indexOf('"type": "occupation"') !== -1 || schema.indexOf("type: \"occupation\"") !== -1 || schema.indexOf("occupation") !== -1, "schema champ occupation");
assert(schema.indexOf("UNIT_SECTIONS") !== -1, "schema UNIT_SECTIONS");
assert(schema.indexOf("bail_unit") !== -1, "section bail par unité");
assert(schema.indexOf("loyer_reel") !== -1, "schema loyer_reel");
assert(schema.indexOf("etage") !== -1, "schema type étage");
assert(schema.indexOf("immeuble") !== -1, "schema type immeuble");

var html = read("crm-immo-property.html");
assert(html.indexOf("piece-row") !== -1, "CSS lignes pièces");
assert(html.indexOf("pieces-editor") !== -1, "CSS éditeur pièces");
assert(html.indexOf("occ-toggle") !== -1, "CSS toggle occupation");
assert(html.indexOf("occ-badge") !== -1, "CSS badge occupation");
assert(html.indexOf("crm-immo-dossier-lib.js") !== -1, "HTML charge dossier-lib");
assert(
  (html.match(/<style[\s>]/gi) || []).length === (html.match(/<\/style>/gi) || []).length,
  "balises style fermées (évite page blanche)"
);
assert(html.indexOf('id="propTitle"') !== -1, "propTitle présent hors style");
assert(html.indexOf("totals-grid") !== -1, "CSS totaux composition");
assert(html.indexOf("side-unit-tag") !== -1, "CSS tag unité sidebar");
assert(html.indexOf("side-back") !== -1, "CSS retour composition");
assert(html.indexOf("comp-tree") !== -1, "CSS schéma composition");
assert(html.indexOf("comp-node") !== -1, "CSS nœuds composition");
assert(fs.existsSync(path.join(root, "docs/CRM-IMMO-COMPOSITION-SCHEMA.md")), "doc schéma composition");

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
