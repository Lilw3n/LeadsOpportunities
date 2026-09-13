#!/usr/bin/env node
/**
 * Vérifie le dossier multi-lots (immeuble / parcelle) + photos / visite par unité.
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

var u = Dossier.emptyUnit("appartement");
assert(u.type === "appartement" && Array.isArray(u.photos), "unité appartement + photos[]");
assert(u.virtual_tour === "" && u.parent_id == null, "visite + parent_id");

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
      photos: ["https://example.com/a.jpg"],
      virtual_tour: "https://my.matterport.com/show/?m=ABC",
    }),
  ],
});
assert(packed.units && packed.units.length === 1, "pack units");
assert(packed.units[0].photos.length === 1, "pack photos unit");
assert(packed.units[0].virtual_tour.indexOf("matterport") !== -1, "pack virtual_tour");
assert(packed.details && packed.details.localisation.ville === "Nancy", "pack details");

var hydrated = Dossier.hydrateProperty({
  id: "prop_1",
  title: "Immeuble",
  property_type: "immeuble",
  metadata_json: JSON.stringify(packed),
});
assert(hydrated.units.length === 1, "hydrate units");
assert(hydrated.units[0].label === "A1", "hydrate label");
assert(hydrated.is_parent_dossier === true, "parent dossier auto");

var summary = Dossier.unitSummary(hydrated.units);
assert(summary.appartements === 1 && summary.with_tour === 1 && summary.with_photos === 1, "unitSummary");

var storeSrc = read("api/_lib/immo-properties-store.js");
assert(storeSrc.indexOf("crm-immo-dossier-lib") !== -1, "store Neon utilise dossier-lib");
assert(storeSrc.indexOf("packMetadata") !== -1, "upsert packMetadata");
assert(storeSrc.indexOf("hydrateProperty") !== -1, "rowToProperty hydrate");

var page = read("js/crm-immo-property-page.js");
assert(page.indexOf("virtual_tour") !== -1, "UI visite par unité");
assert(page.indexOf("cadastre_ref") !== -1, "UI cadastre par unité");
assert(page.indexOf("btnPresetImmeuble") !== -1, "preset immeuble");
assert(page.indexOf("parent_id") !== -1, "rattachement parent");

var html = read("crm-immo-property.html");
assert(html.indexOf("crm-immo-dossier-lib.js") !== -1, "HTML charge dossier-lib");
assert((html.match(/<style[\s>]/gi) || []).length === (html.match(/<\/style>/gi) || []).length, "balises style fermées (évite page blanche)");
assert(html.indexOf('id="propTitle"') !== -1, "propTitle présent hors style");

var clientStore = read("js/crm-immo-store.js");
assert(clientStore.indexOf("packMetadata") !== -1, "client packMetadata");
assert(clientStore.indexOf("hydrateProperty") !== -1, "client hydrate");

["js/crm-immo-dossier-lib.js", "api/_lib/immo-properties-store.js"].forEach(function (rel) {
  require("child_process").execFileSync(process.execPath, ["--check", path.join(root, rel)]);
  assert(true, "syntaxe " + rel);
});

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nTous les checks immeuble multi-lots OK");
