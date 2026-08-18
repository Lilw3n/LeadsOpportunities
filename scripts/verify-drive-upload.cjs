#!/usr/bin/env node
/** Vérifie le dépôt sécurisé de documents (token JWT + validation fichiers + landings immo). */
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
  "api/_lib/file-validation.js",
  "api/_lib/routes/external-upload-init.js",
  "js/lead-dossier-upload.js",
  "css/lead-dossier-upload.css",
].forEach(function (f) {
  assert(fs.existsSync(path.join(root, f)), f + " existe");
});

var uploadRoute = read("api/_lib/routes/external-upload.js");
assert(uploadRoute.indexOf("verifyUploadToken") >= 0, "external-upload exige un token");
assert(uploadRoute.indexOf("authorizeUpload") >= 0, "external-upload autorise via JWT");

var docsList = read("api/_lib/routes/external-documents-list.js");
assert(docsList.indexOf("verifyUploadToken") >= 0, "documents-list exige un token");

var publicLead = read("api/_lib/routes/public-lead.js");
assert(publicLead.indexOf("uploadToken") >= 0, "public-lead renvoie uploadToken");

var validation = read("api/_lib/file-validation.js");
assert(validation.indexOf("application/pdf") >= 0, "PDF autorisé");
assert(validation.indexOf("image/webp") >= 0, "WEBP autorisé");
assert(validation.indexOf("12 * 1024 * 1024") >= 0, "limite 12 Mo");

var devisUpload = read("js/devis-document-upload.js");
assert(devisUpload.indexOf("uploadToken") >= 0, "devis-document-upload utilise uploadToken");
assert(devisUpload.indexOf(".webp") >= 0, "devis-document-upload accepte WEBP");

var tracking = read("landings/tracking.js");
assert(tracking.indexOf("loTrackingRenderDocuments") >= 0, "tracking expose renderDocumentsCta");
assert(tracking.indexOf("uploadToken: uploadToken") >= 0, "tracking propage uploadToken au panneau");

var callback = read("js/callback-form.js");
assert(callback.indexOf("loTrackingRenderDocuments") >= 0, "callback-form affiche le panneau documents");

var extPage = read("external/upload-document.js");
assert(extPage.indexOf("upload-init") >= 0, "page upload utilise upload-init");
assert(extPage.indexOf("X-Upload-Token") >= 0, "page upload envoie le token");

["landings/credit-immo.html", "landings/acheteur-immo.html", "landings/projection-achat.html"].forEach(
  function (page) {
    var html = read(page);
    assert(html.indexOf("devis-document-upload.js") >= 0, page + " charge devis-document-upload.js");
    assert(html.indexOf("lead-dossier-upload.js") >= 0, page + " charge lead-dossier-upload.js");
    assert(html.indexOf("data-lead-dossier") >= 0, page + " a un bloc data-lead-dossier");
  }
);

var actionRouter = read("api/external/[action].js");
assert(actionRouter.indexOf('"upload-init"') >= 0, "route upload-init enregistrée");

process.exit(failed ? 1 : 0);
