#!/usr/bin/env node
/**
 * Vérifie les configs documents P1 (auto, VTC, santé, entreprise).
 */
var cfg = require("../js/devis-document-config.js");
// browser IIFE — load via vm
var fs = require("fs");
var path = require("path");
var code = fs.readFileSync(path.join(__dirname, "../js/devis-document-config.js"), "utf8");
var sandbox = { window: {}, global: {} };
sandbox.global = sandbox;
require("vm").runInNewContext(code + "; this.DEVIS_DOCUMENT_CONFIG = window.DEVIS_DOCUMENT_CONFIG || global.DEVIS_DOCUMENT_CONFIG;", sandbox);
var DC = sandbox.window.DEVIS_DOCUMENT_CONFIG || sandbox.DEVIS_DOCUMENT_CONFIG;
if (!DC) {
  console.error("FAIL: DEVIS_DOCUMENT_CONFIG non chargé");
  process.exit(1);
}

function hasType(need, type) {
  return DC.getConfig(need).items.some(function (i) {
    return i.type === type;
  });
}

var checks = [
  ["auto", "permis"],
  ["auto", "carte_grise"],
  ["auto", "releve_info"],
  ["vtc", "carte_vtc"],
  ["vtc", "kbis"],
  ["vtc", "avis_insee"],
  ["vtc", "permis"],
  ["sante", "carte_vitale"],
  ["collective", "kbis"],
  ["collective", "avis_insee"],
  ["rc-pro", "kbis"],
  ["credit-immo", "piece_identite"],
];

var ok = true;
checks.forEach(function (c) {
  if (hasType(c[0], c[1])) console.log("[OK]", c[0], "→", c[1]);
  else {
    console.error("[FAIL]", c[0], "manque", c[1]);
    ok = false;
  }
});

var sante = DC.getConfig("sante");
if (!sante.extraFields || !sante.extraFields.some(function (f) { return f.name === "numero_secu"; })) {
  console.error("[FAIL] sante numero_secu");
  ok = false;
} else {
  console.log("[OK] sante extraFields numero_secu");
}

var uploadJs = fs.readFileSync(path.join(__dirname, "../js/devis-document-upload.js"), "utf8");
if (uploadJs.indexOf("_firstEmail") === -1) {
  console.error("[FAIL] lecture e-mail multi-champs manquante");
  ok = false;
} else {
  console.log("[OK] e-mail : tous les champs + type=email");
}
if (uploadJs.indexOf("data-docs-retry") === -1) {
  console.error("[FAIL] bouton Réessayer manquant");
  ok = false;
} else {
  console.log("[OK] Réessayer après Erreur");
}
if (uploadJs.indexOf("_ignoreLeadId") === -1) {
  console.error("[FAIL] retry sans leadId périmé manquant");
  ok = false;
} else {
  console.log("[OK] nouvel essai sans leadId périmé");
}
if (uploadJs.indexOf("devis-doc-error-msg") === -1) {
  console.error("[FAIL] message d’erreur upload non affiché");
  ok = false;
} else {
  console.log("[OK] motif d’erreur affiché sous la pastille");
}
if (uploadJs.indexOf("immo-doc-line") === -1 || uploadJs.indexOf("Déposer") === -1) {
  console.error("[FAIL] UI devis n’utilise pas les lignes Déposer");
  ok = false;
} else {
  console.log("[OK] UI lignes Déposer (comme immo)");
}
if (uploadJs.indexOf("data-docs-drop") !== -1 || uploadJs.indexOf("Type de document") !== -1) {
  console.error("[FAIL] ancienne UI dropdown / zone glisser encore présente");
  ok = false;
} else {
  console.log("[OK] plus de dropdown Type ni zone Glissez");
}
if (uploadJs.indexOf("s.leadId") !== -1 && /return !!\(s\.email \|\| s\.phone \|\| s\.contactId \|\| s\.leadId/.test(uploadJs)) {
  console.error("[FAIL] hasIdentity accepte encore un leadId seul (Erreur si id périmé)");
  ok = false;
} else {
  console.log("[OK] hasIdentity exige nom+prénom / e-mail / téléphone / contactId");
}

if (typeof DC.getGroups !== "function") {
  console.error("[FAIL] getGroups manquant");
  ok = false;
} else {
  var vtcGroups = DC.getGroups("vtc");
  var autoGroups = DC.getGroups("auto");
  var habGroups = DC.getGroups("habitation");
  var hasDrive = vtcGroups.some(function (g) { return g.driveFolder; });
  var hasIdentite = vtcGroups.some(function (g) { return g.driveFolder === "01_identite"; });
  var hasEntreprise = vtcGroups.some(function (g) { return g.driveFolder === "06_entreprise_collective"; });
  if (!hasDrive || !hasIdentite || !hasEntreprise) {
    console.error("[FAIL] groupes VTC Drive incomplets");
    ok = false;
  } else {
    console.log("[OK] getGroups(vtc) → Drive 01_identite + 06_entreprise_collective");
  }
  if (!autoGroups.length || !habGroups.length) {
    console.error("[FAIL] getGroups auto/habitation vide");
    ok = false;
  } else {
    console.log("[OK] getGroups auto + habitation");
  }
  Object.keys(DC.BY_NEED).forEach(function (need) {
    DC.getConfig(need).items.forEach(function (it) {
      if (!DC.DOC_TYPE_DRIVE[it.type]) {
        console.error("[FAIL] type sans dossier Drive :", need, it.type);
        ok = false;
      }
    });
  });
}

var tracking = fs.readFileSync(path.join(__dirname, "../landings/tracking.js"), "utf8");
if (tracking.indexOf("data-docs-drop") !== -1 || tracking.indexOf("data-docs-type") !== -1) {
  console.error("[FAIL] panel merci tracking.js encore en dropdown");
  ok = false;
} else {
  console.log("[OK] panel merci = lignes Déposer");
}

["vtc.html", "devis.html", "questionnaire.html", "sante.html", "credit-immo.html", "sante-collective.html"].forEach(function (page) {
  var html = fs.readFileSync(path.join(__dirname, "../landings", page), "utf8");
  if (html.indexOf("immo-documents.css?v=20260826docfix") === -1) {
    console.error("[FAIL]", page, "sans CSS lignes Déposer");
    ok = false;
  } else {
    console.log("[OK]", page, "CSS immo-documents");
  }
  if (html.indexOf("devis-document-upload.js?v=20260826docfix") === -1) {
    console.error("[FAIL]", page, "cache-bust upload manquant");
    ok = false;
  }
});

var extHtml = fs.readFileSync(path.join(__dirname, "../external/upload-document.html"), "utf8");
if (extHtml.indexOf("name=\"documentType\"") !== -1 || extHtml.indexOf("dropZone") !== -1) {
  console.error("[FAIL] page /external/upload-document encore en dropdown");
  ok = false;
} else {
  console.log("[OK] page dépôt publique = lignes Déposer");
}

var driveFolders = fs.readFileSync(path.join(__dirname, "../api/_lib/drive-folders.js"), "utf8");
if (driveFolders.indexOf("avis_insee: \"06_entreprise_collective\"") === -1) {
  console.error("[FAIL] avis_insee pas mappé vers 06_entreprise_collective");
  ok = false;
} else {
  console.log("[OK] Drive avis_insee → 06_entreprise_collective");
}

var api = fs.readFileSync(path.join(__dirname, "../api/_lib/routes/external-upload.js"), "utf8");
if (api.indexOf("hasName") === -1 || api.indexOf("nom+prénom") === -1) {
  console.error("[FAIL] API upload n’accepte pas nom+prénom");
  ok = false;
} else {
  console.log("[OK] API /external/upload accepte nom+prénom");
}

var ingest = fs.readFileSync(path.join(__dirname, "../api/_lib/crm-ingest-from-lead.js"), "utf8");
if (ingest.indexOf("firstNameEarly") === -1) {
  console.error("[FAIL] ensureContactLinked sans création par nom+prénom");
  ok = false;
} else {
  console.log("[OK] ensureContactLinked crée un contact avec nom+prénom");
}

process.exit(ok ? 0 : 1);
