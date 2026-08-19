#!/usr/bin/env node
/** Vérifie upload photos vendeur + sync Google Drive immo. */
var fs = require("fs");
var path = require("path");
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

[
  "js/immo-photo-compress-lib.js",
  "js/acheteur-immo-sell-photos.js",
  "js/acheteur-immo-deposit-vente.js",
  "api/_lib/immo-listing-drive.js",
].forEach(function (f) {
  assert(fs.existsSync(path.join(root, f)), f + " existe");
});

var listingSubmit = read("api/_lib/routes/public-immo-listing-submit.js");
assert(listingSubmit.indexOf("immo-listing-drive") >= 0, "listing-submit appelle immo-listing-drive");
assert(listingSubmit.indexOf("sellDossier") >= 0, "listing-submit enregistre sellDossier");

var store = read("api/_lib/immo-properties-store.js");
assert(store.indexOf("patchPropertyMedia") >= 0, "immo-properties-store expose patchPropertyMedia");
assert(store.indexOf("drive_folder_id") >= 0, "schema drive_folder_id");

var driveLib = read("api/_lib/immo-listing-drive.js");
assert(driveLib.indexOf("01_photos_publiques") >= 0, "photos → 01_photos_publiques");
assert(driveLib.indexOf("syncPropertyPhotosToDrive") >= 0, "syncPropertyPhotosToDrive exporté");

var html = read("landings/acheteur-immo.html");
assert(html.indexOf("data-deposit-vente-toggle") >= 0, "coche dossier vente dans dépôt");
assert(html.indexOf("data-deposit-vente-mount") >= 0, "mount dossier vente dépôt");
assert(html.indexOf("acheteur-immo-deposit-vente.js") >= 0, "script fusion dépôt/vente");
assert(html.indexOf("immo-photo-compress-lib.js") >= 0, "compress lib chargée");

var tracking = read("landings/tracking.js");
assert(tracking.indexOf("SellPhotosState") >= 0, "tracking envoie photos après lead");

var hasSa = !!(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "").trim();
var hasRoot = !!(process.env.GOOGLE_DRIVE_FOLDER_ID || "").trim();
if (hasSa && hasRoot) {
  var auth = require("../api/_lib/google-drive-auth");
  assert(auth.isDriveConfigured(), "Drive configuré (env présents)");
  auth
    .testDriveConnection()
    .then(function (t) {
      assert(t.ok, "connexion Drive API OK — " + (t.folderName || t.error || ""));
      process.exit(failed ? 1 : 0);
    })
    .catch(function (e) {
      assert(false, "test Drive: " + (e.message || e));
      process.exit(1);
    });
} else {
  console.log("INFO Drive env absents — skip test connexion live (voir docs/DRIVE-SETUP.md)");
  process.exit(failed ? 1 : 0);
}
