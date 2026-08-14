#!/usr/bin/env node
/**
 * Vérifie le pipeline dépôt Drive + copie o2switch + hub Stripe.
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

var root = path.join(__dirname, "..");

var folders = require("../api/_lib/drive-folders");
assert(folders.subfolderForDocumentType("piece_identite") === "01_identite", "CNI → 01_identite");
assert(folders.subfolderForDocumentType("avis_imposition") === "02_justificatifs_revenus", "avis → revenus");
assert(folders.subfolderForDocumentType("bulletins_salaire") === "02_justificatifs_revenus", "bulletins → revenus");
assert(folders.subfolderForDocumentType("compromis_offre") === "04_vehicule_ou_bien", "compromis → bien");
assert(folders.subfolderForDocumentType("kbis") === "06_entreprise_collective", "kbis → entreprise");
assert(folders.CLIENT_SUBFOLDERS.indexOf("01_identite") >= 0, "sous-dossiers client");

var backup = require("../api/_lib/o2switch-backup");
assert(backup.isBackupConfigured() === false, "backup non configuré sans env");
assert(backup.safeSegment("../etc/passwd", "x") === "etc_passwd" || backup.safeSegment("../etc/passwd", "x").indexOf("..") < 0, "segment sans traversal");
assert(backup.safeSegment("CNI Jean.pdf", "x").indexOf("/") < 0, "segment sans slash");

var limits = require("../api/_lib/upload-limits");
assert(limits.UPLOAD_MAX_BYTES === 12 * 1024 * 1024, "max fichier 12 Mo");
assert(limits.UPLOAD_JSON_MAX_BYTES > limits.UPLOAD_MAX_BYTES, "JSON > fichier (base64)");

var core = require("../api/_lib/drive-upload-core");
assert(typeof core.uploadBuffer === "function", "uploadBuffer exporté");
assert(typeof core.uploadBase64File === "function", "uploadBase64File exporté");

var php = fs.readFileSync(path.join(root, "o2switch/lo-docs-backup.php"), "utf8");
assert(php.indexOf("ping") >= 0, "PHP ping");
assert(php.indexOf("hash_equals") >= 0, "PHP secret timing-safe");
assert(php.indexOf("lo-docs-data") >= 0, "PHP hors webroot par défaut");
assert(php.indexOf("contentBase64") >= 0, "PHP accepte base64");

var example = fs.readFileSync(path.join(root, "o2switch/lo-docs-backup.config.example.php"), "utf8");
assert(example.indexOf("secret") >= 0, "exemple config secret");

var hubHtml = fs.readFileSync(path.join(root, "crm-depot-drive.html"), "utf8");
assert(hubHtml.indexOf("btnStripe") >= 0, "hub bouton Stripe");
assert(hubHtml.indexOf("btnDriveStatus") >= 0, "hub bouton Drive");
var hubJs = fs.readFileSync(path.join(root, "js/crm-depot-drive.js"), "utf8");
assert(hubJs.indexOf("/api/stripe/readiness") >= 0, "hub appelle Stripe readiness");
assert(hubJs.indexOf("/api/drive/status") >= 0, "hub appelle Drive status");
assert(hubJs.indexOf("/api/drive/upload") >= 0, "hub upload Drive");

var crmRoutes = fs.readFileSync(path.join(root, "api/crm/[action].js"), "utf8");
assert(crmRoutes.indexOf("document-files") >= 0, "route CRM document-files");

var driveRoutes = fs.readFileSync(path.join(root, "api/drive/[action].js"), "utf8");
assert(driveRoutes.indexOf("upload") >= 0 && driveRoutes.indexOf("status") >= 0, "routes Drive status+upload");

var stripeRoutes = fs.readFileSync(path.join(root, "api/stripe/[action].js"), "utf8");
assert(stripeRoutes.indexOf("readiness") >= 0, "route Stripe readiness");

var sidebar = fs.readFileSync(path.join(root, "js/crm-sidebar.js"), "utf8");
assert(sidebar.indexOf("crm-depot-drive.html") >= 0, "lien sidebar Dépôt Drive");

var envEx = fs.readFileSync(path.join(root, ".env.example"), "utf8");
assert(envEx.indexOf("O2SWITCH_BACKUP_URL") >= 0, ".env.example URL backup");
assert(envEx.indexOf("O2SWITCH_BACKUP_SECRET") >= 0, ".env.example secret backup");
assert(envEx.indexOf("STRIPE_SECRET_KEY") >= 0, ".env.example Stripe");

var extUpload = fs.readFileSync(path.join(root, "api/_lib/routes/external-upload.js"), "utf8");
assert(extUpload.indexOf("UPLOAD_JSON_MAX_BYTES") >= 0, "upload public accepte gros JSON");
assert(extUpload.indexOf("resolveOrCreateContact") >= 0, "création prospect si e-mail inconnu");

var driveUpload = fs.readFileSync(path.join(root, "api/_lib/routes/drive-upload.js"), "utf8");
assert(driveUpload.indexOf("fileBase64") >= 0, "upload CRM accepte binaire");

var coreSrc = fs.readFileSync(path.join(root, "api/_lib/drive-upload-core.js"), "utf8");
assert(coreSrc.indexOf("backupOnly") >= 0, "fallback o2switch si Drive HS");
assert(coreSrc.indexOf("isProductionLike") >= 0, "pas de simulation silencieuse en prod");

console.log(failed ? "\n" + failed + " échec(s)" : "\nPipeline dépôt Drive / o2switch / Stripe OK");
process.exit(failed ? 1 : 0);
