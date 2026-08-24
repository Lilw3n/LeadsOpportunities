#!/usr/bin/env node
/** Vérifie upload documents sécurisé + fiable. */
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
  "api/_lib/upload-token.js",
  "api/_lib/routes/external-upload-init.js",
  "api/_lib/upload-guard.js",
  "api/_lib/drive-upload-core.js",
  "api/_lib/routes/external-upload.js",
].forEach(function (f) {
  assert(fs.existsSync(path.join(root, f)), f + " existe");
});

var upload = read("api/_lib/routes/external-upload.js");
assert(upload.indexOf("UPLOAD_JSON_MAX") >= 0 || upload.indexOf("5 * 1024 * 1024") >= 0, "limite JSON upload > 64 Ko");
assert(upload.indexOf("parseJsonBody(req, UPLOAD_JSON_MAX)") >= 0 || upload.indexOf("parseJsonBody(req, 5") >= 0, "parseJsonBody avec max");
assert(upload.indexOf("authorizeUpload") >= 0, "authorizeUpload");
assert(upload.indexOf("verifyUploadToken") >= 0, "token upload");
assert(upload.indexOf("getAuthUser") >= 0, "auth CRM");
assert(upload.indexOf("drive_upload_failed") >= 0 || upload.indexOf("simulated") >= 0, "refuse simulated");
assert(upload.indexOf("isDriveUploadConfigured") >= 0, "check Drive configuré");

var core = read("api/_lib/drive-upload-core.js");
assert(core.indexOf("allowSimulated") >= 0, "allowSimulated opt-in");
assert(core.indexOf('ok: true,\n      simulated: true') < 0, "plus de ok:true simulé par défaut");

var guard = read("api/_lib/upload-guard.js");
assert(guard.indexOf("3.5") >= 0, "max 3,5 Mo");
assert(guard.indexOf("detectMime") >= 0, "magic bytes");

var init = read("api/_lib/routes/external-upload-init.js");
assert(init.indexOf("createUploadToken") >= 0, "upload-init émet token");

var router = read("api/external/[action].js");
assert(router.indexOf('"upload-init"') >= 0, "route upload-init");

var lead = read("api/_lib/routes/public-lead.js");
assert(lead.indexOf("uploadToken") >= 0, "lead renvoie uploadToken");

var docsList = read("api/_lib/routes/external-documents-list.js");
assert(docsList.indexOf("verifyUploadToken") >= 0, "documents-list protégé");

var listing = read("api/_lib/routes/public-immo-listing-document.js");
assert(listing.indexOf("LOWER(email)") >= 0 || listing.indexOf('.email || "").toLowerCase() === email') >= 0, "contactId lié à email");
assert(listing.indexOf("allowSimulated: false") >= 0 || listing.indexOf("sim_") >= 0, "listing refuse simulé");

var immoDrive = read("api/_lib/immo-drive.js");
assert(immoDrive.indexOf("lookupChildFolder") >= 0, "lazy folders lookup");
assert(immoDrive.indexOf("lazy: true") >= 0, "lazy folders flag");

var crmTools = read("js/crm-questionnaire-tools.js");
assert(crmTools.indexOf("authHeaders") >= 0, "CRM envoie Bearer");
assert(crmTools.indexOf("assertDriveOk") >= 0, "CRM refuse simulé");

var devis = read("js/devis-document-upload.js");
assert(devis.indexOf("uploadToken") >= 0, "devis envoie uploadToken");
assert(devis.indexOf("3.5") >= 0 || devis.indexOf("3,5") >= 0, "devis max 3,5 Mo");

var tracking = read("landings/tracking.js");
assert(tracking.indexOf("uploadToken") >= 0, "tracking propage uploadToken");

var tok = require("../api/_lib/upload-token");
assert(typeof tok.createUploadToken === "function", "createUploadToken exporté");
assert(typeof tok.verifyUploadToken === "function", "verifyUploadToken exporté");

process.exit(failed ? 1 : 0);
