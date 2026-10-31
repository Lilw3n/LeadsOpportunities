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

var immoDrive = read("api/_lib/immo-drive.js");
assert(immoDrive.indexOf("resolveVendeurDocumentFolder") >= 0, "resolveVendeurDocumentFolder exporté");
assert(immoDrive.indexOf("resolveListingMediaFolder") >= 0, "resolveListingMediaFolder exporté");
assert(immoDrive.indexOf("ensurePropertySubfolder") >= 0, "ensurePropertySubfolder exporté");
assert(immoDrive.indexOf("lookupChildFolder") >= 0, "lookup sans création");
assert(immoDrive.indexOf("lazy: true") >= 0, "création paresseuse des sous-dossiers");
assert(
  immoDrive.indexOf("Création paresseuse") >= 0 || immoDrive.indexOf("opts.subfolder") >= 0,
  "sous-dossier créé uniquement à l'upload"
);
// Ne doit plus créer les 8 sous-dossiers en boucle systématique
assert(
  !/for \(var j = 0; j < IMMO_SUBFOLDERS\.length; j\+\+\)[\s\S]{0,120}driveCreateFolder\(token, sf\.id/.test(
    immoDrive
  ),
  "pas de création anticipée des 8 sous-dossiers"
);
var classify = require("../api/_lib/immo-drive");
assert(
  classify.resolveVendeurDocumentFolder({ documentGroup: "identite", documentType: "identite" }) ===
    "04_documents_confidentiels",
  "identité → 04_documents_confidentiels"
);
assert(
  classify.resolveVendeurDocumentFolder({ documentGroup: "diagnostics", documentType: "dpe" }) === "05_diagnostics",
  "DPE → 05_diagnostics"
);
assert(
  classify.resolveVendeurDocumentFolder({ documentGroup: "pub_docs", documentType: "capture_annonce" }) ===
    "01_photos_publiques",
  "capture annonce → 01_photos_publiques"
);
assert(classify.resolveListingMediaFolder("capture") === "01_photos_publiques", "capture listing → 01_photos_publiques");
assert(
  classify.buildProspectFolderName({
    firstName: "Marie",
    lastName: "Dupont",
    city: "Varangeville",
    surface_m2: 85,
  }) === "Dupont_Marie_Varangeville_85m2",
  "titre dossier = Nom_Prenom_Ville_m2"
);
assert(
  classify.buildPropIdFolderName({ id: "prop_eefbd6f48a349182" }) === "prop_eefbd6f48a349182",
  "sous-dossier technique = prop_id"
);

var docCfg = read("js/immo-documents-config.js");
assert(docCfg.indexOf('id: "pub"') >= 0, "zone pub vendeur");
assert(docCfg.indexOf('id: "perso"') >= 0, "zone perso vendeur");

var html = read("landings/acheteur-immo.html");
assert(html.indexOf("data-deposit-vente-toggle") >= 0, "coche dossier vente dans dépôt");
assert(html.indexOf("data-deposit-vente-mount") >= 0, "mount dossier vente dépôt");
assert(html.indexOf("acheteur-immo-deposit-vente.js") >= 0, "script fusion dépôt/vente");
assert(html.indexOf("immo-photo-compress-lib.js") >= 0, "compress lib chargée");

var ficheLib = require("../api/_lib/immo-property-fiche-text");
assert(typeof ficheLib.buildFicheContent === "function", "buildFicheContent exporté");
var ficheTxt = ficheLib.buildFicheContent({
  firstName: "Michèle",
  lastName: "Haffner",
  city: "Dombasle-sur-Meurthe",
  postal_code: "54110",
  rooms: 4,
  surface_m2: 85,
  sellDossier: {
    roomDetails: [{ level: "RDC", name: "Séjour", surface: "28", flooring: "Parquet", exposure: "S" }],
    owners: [{ firstName: "Michèle", lastName: "Haffner", phone: "0612345678" }],
  },
});
assert(/Séjour/.test(ficheTxt) && /28 m²/.test(ficheTxt), "fiche texte contient le détail pièces");
assert(/Haffner/.test(ficheTxt), "fiche texte contient le client");
assert(ficheLib.FICHE_NAME === "00_fiche_bien.txt", "nom fichier fiche Drive");

var listingSubmit2 = read("api/_lib/routes/public-immo-listing-submit.js");
assert(listingSubmit2.indexOf("immo-property-fiche-drive") >= 0, "listing-submit écrit la fiche bien sur Drive");

var driveFolder = read("api/_lib/routes/crm-drive-folder.js");
assert(driveFolder.indexOf("immo-property-fiche-drive") >= 0, "ouverture Drive CRM met à jour la fiche bien");
assert(
  read("api/_lib/immo-property-fiche-drive.js").indexOf("syncPropertyFicheToDrive") >= 0,
  "syncPropertyFicheToDrive dans le module Drive"
);

var qTools = read("js/crm-questionnaire-tools.js");
assert(qTools.indexOf("defaultAuthHeaders") >= 0, "Drive CRM : jeton lo_token par défaut");
assert(qTools.indexOf('localStorage.getItem("lo_token")') >= 0, "fallback Authorization Bearer");

var contactJs = read("crm-contact.js");
assert(contactJs.indexOf("authHeaders: authHeaders") >= 0, "fiche interlocuteur passe le jeton au bouton Drive");

var contactHtml = read("crm-contact.html");
assert(contactHtml.indexOf("crm-questionnaire-tools.js?v=20260826driveauth1") >= 0, "cache-bust questionnaire-tools");
assert(contactHtml.indexOf("crm-contact.js?v=20260826driveauth1") >= 0, "cache-bust crm-contact.js");

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
