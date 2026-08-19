/**
 * Dossiers Google Drive par bien immobilier — structure intelligente.
 */
const { getDriveAccessToken, getRootFolderId, isDriveConfigured } = require("./google-drive-auth");

const IMMO_SUBFOLDERS = [
  { id: "01_photos_publiques", label: "Photos publiques", kind: "photos", confidential: false },
  { id: "02_photos_confidentielles", label: "Photos confidentielles", kind: "photos", confidential: true },
  { id: "03_documents_publics", label: "Documents publics", kind: "docs", confidential: false },
  { id: "04_documents_confidentiels", label: "Documents confidentiels", kind: "docs", confidential: true },
  { id: "05_diagnostics", label: "Diagnostics", kind: "docs", confidential: false },
  { id: "06_mandat_pieces", label: "Mandat & pièces", kind: "docs", confidential: true },
  { id: "07_medias_3d_video", label: "Médias 3D / vidéo", kind: "media", confidential: false },
  { id: "08_documents_imprimes", label: "Documents imprimés", kind: "docs", confidential: false },
];

function safeName(s, max) {
  return String(s || "bien")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, max || 48);
}

async function getToken() {
  var oauth = await getDriveAccessToken({ forUpload: true });
  if (oauth && oauth.accessToken) return oauth.accessToken;
  var auth = await getDriveAccessToken({ forUpload: false });
  return auth ? auth.accessToken : null;
}

async function driveCreateFolder(token, name, parentId) {
  const meta = {
    name: name,
    mimeType: "application/vnd.google-apps.folder",
    parents: parentId ? [parentId] : undefined,
  };
  const resp = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meta),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error((data.error && data.error.message) || "Drive folder create failed");
  return data;
}

async function findChildFolder(token, parentId, name) {
  const q =
    "mimeType='application/vnd.google-apps.folder' and name='" +
    name.replace(/'/g, "\\'") +
    "' and '" +
    parentId +
    "' in parents and trashed=false";
  const resp = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=" + encodeURIComponent(q) + "&fields=files(id,name,webViewLink)&pageSize=1",
    { headers: { Authorization: "Bearer " + token } }
  );
  const data = await resp.json();
  if (data.files && data.files.length) return data.files[0];
  return driveCreateFolder(token, name, parentId);
}

/**
 * Classifie intelligemment un fichier vers le bon sous-dossier.
 */
function classifyImmoFile({ fileName, mimeType, confidential, hint }) {
  var name = String(fileName || "").toLowerCase();
  var mime = String(mimeType || "").toLowerCase();
  var conf = !!confidential;
  var h = String(hint || "").toLowerCase();

  if (h === "pub" || h === "photos_publiques" || h === "annonce") {
    if (mime.indexOf("image/") === 0 || /\.(jpe?g|png|webp|gif|heic)$/i.test(name)) {
      return "01_photos_publiques";
    }
    return "03_documents_publics";
  }
  if (h === "diagnostics" || /dpe|erp|amiante|plomb|termite|gaz|elec|carrez|parasite/.test(name)) {
    return "05_diagnostics";
  }
  if (h === "mandat" || /mandat|compromis|offre|titre|identite|kbis|notaire/.test(name)) {
    return "06_mandat_pieces";
  }
  if (h === "media" || /video|360|visite|plan.?3d|myphoto|drone/.test(name) || mime.indexOf("video/") === 0) {
    return "07_medias_3d_video";
  }
  if (mime.indexOf("image/") === 0 || /\.(jpe?g|png|webp|gif|heic)$/i.test(name)) {
    return conf ? "02_photos_confidentielles" : "01_photos_publiques";
  }
  if (h === "imprime" || /capture.?annonce|print|listing|affiche/.test(name)) return "08_documents_imprimes";
  return conf ? "04_documents_confidentiels" : "03_documents_publics";
}

/** Dossier Drive pour photos / capture dépôt annonce (Leboncoin, vitrine). */
function resolveListingMediaFolder(kind) {
  if (kind === "capture") return "01_photos_publiques";
  return "01_photos_publiques";
}

var VENDEUR_GROUP_FOLDER = {
  identite: "04_documents_confidentiels",
  titre: "06_mandat_pieces",
  copro: "04_documents_confidentiels",
  diagnostics: "05_diagnostics",
  pub_docs: "03_documents_publics",
  fiscalite: "04_documents_confidentiels",
  location: "04_documents_confidentiels",
  travaux: "04_documents_confidentiels",
  divers: "04_documents_confidentiels",
};

var VENDEUR_TYPE_FOLDER = {
  mandat_signe: "06_mandat_pieces",
  titre_propriete: "06_mandat_pieces",
  acte_vente: "06_mandat_pieces",
  kbis_sci: "06_mandat_pieces",
  cadastre: "06_mandat_pieces",
  identite: "04_documents_confidentiels",
  domicile: "04_documents_confidentiels",
  livret_famille: "04_documents_confidentiels",
  dpe: "05_diagnostics",
  amiante: "05_diagnostics",
  plomb: "05_diagnostics",
  termites: "05_diagnostics",
  erp: "05_diagnostics",
  gaz_elec: "05_diagnostics",
  assainissement: "05_diagnostics",
  carrez: "05_diagnostics",
  taxe_fonciere: "04_documents_confidentiels",
  taxe_habitation: "04_documents_confidentiels",
  releve_pret: "04_documents_confidentiels",
  descriptif_annonce: "03_documents_publics",
  plan_pub: "03_documents_publics",
  capture_annonce: "01_photos_publiques",
};

/** Classe un document vendeur (section 3) — perso vs pub. */
function resolveVendeurDocumentFolder({ documentGroup, documentType, fileName, mimeType }) {
  var type = String(documentType || "").toLowerCase();
  var group = String(documentGroup || "").toLowerCase();
  if (VENDEUR_TYPE_FOLDER[type]) return VENDEUR_TYPE_FOLDER[type];
  if (VENDEUR_GROUP_FOLDER[group]) return VENDEUR_GROUP_FOLDER[group];
  var isPub = group === "diagnostics" || group === "pub_docs";
  return classifyImmoFile({
    fileName: fileName,
    mimeType: mimeType,
    confidential: !isPub,
    hint: isPub ? "pub" : group === "titre" ? "mandat" : "docs",
  });
}

async function ensureImmoRoot(token, rootId) {
  const immo = await findChildFolder(token, rootId, "Immo");
  const year = String(new Date().getFullYear());
  return findChildFolder(token, immo.id, year);
}

async function ensurePropertyDriveFolders(property) {
  const token = await getToken();
  const rootId = getRootFolderId();
  const configured = !!(token && rootId && isDriveConfigured());

  const label =
    safeName(property.id, 24) +
    "_" +
    safeName(property.city || property.postal_code || "ville", 16) +
    "_" +
    safeName(property.title || "bien", 28);

  if (!configured) {
    return {
      ok: true,
      simulated: true,
      configured: false,
      folderName: label,
      subfolders: IMMO_SUBFOLDERS,
      message: "Drive non configuré — mode local intelligent actif (voir docs/DRIVE-SETUP.md)",
    };
  }

  // Réutilise dossier existant si déjà lié
  if (property.drive_folder_id) {
    const subs = {};
    for (var i = 0; i < IMMO_SUBFOLDERS.length; i++) {
      const sf = IMMO_SUBFOLDERS[i];
      const found = await findChildFolder(token, property.drive_folder_id, sf.id);
      subs[sf.id] = { id: found.id, name: sf.id, label: sf.label, webViewLink: found.webViewLink || null };
    }
    return {
      ok: true,
      configured: true,
      folderId: property.drive_folder_id,
      folderName: label,
      subfolders: IMMO_SUBFOLDERS,
      subfolderIds: subs,
      existing: true,
    };
  }

  const yearFolder = await ensureImmoRoot(token, rootId);
  const propFolder = await driveCreateFolder(token, label, yearFolder.id);
  const subs = {};
  for (var j = 0; j < IMMO_SUBFOLDERS.length; j++) {
    const sf = IMMO_SUBFOLDERS[j];
    const created = await driveCreateFolder(token, sf.id, propFolder.id);
    subs[sf.id] = { id: created.id, name: sf.id, label: sf.label, webViewLink: created.webViewLink || null };
  }

  return {
    ok: true,
    configured: true,
    folderId: propFolder.id,
    folderName: label,
    webViewLink: propFolder.webViewLink || null,
    subfolders: IMMO_SUBFOLDERS,
    subfolderIds: subs,
  };
}

async function listFolderFiles(folderId, pageSize) {
  const token = await getToken();
  if (!token || !folderId) return { configured: false, files: [] };
  const q = "'" + folderId + "' in parents and trashed=false";
  const url =
    "https://www.googleapis.com/drive/v3/files?q=" +
    encodeURIComponent(q) +
    "&pageSize=" +
    (pageSize || 50) +
    "&fields=files(id,name,mimeType,modifiedTime,webViewLink,webContentLink,thumbnailLink,size,parents)&orderBy=modifiedTime desc";
  const resp = await fetch(url, { headers: { Authorization: "Bearer " + token } });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error("Drive list " + resp.status + ": " + err.slice(0, 160));
  }
  const data = await resp.json();
  return { configured: true, files: data.files || [] };
}

async function listFolderChildren(folderId, pageSize) {
  const token = await getToken();
  if (!token || !folderId) return [];
  const q =
    "'" +
    folderId +
    "' in parents and trashed=false and mimeType='application/vnd.google-apps.folder'";
  const url =
    "https://www.googleapis.com/drive/v3/files?q=" +
    encodeURIComponent(q) +
    "&pageSize=" +
    (pageSize || 30) +
    "&fields=files(id,name,mimeType)";
  const resp = await fetch(url, { headers: { Authorization: "Bearer " + token } });
  if (!resp.ok) return [];
  const data = await resp.json();
  return data.files || [];
}

async function driveCopyFile(token, fileId, newParentId, newName) {
  const resp = await fetch(
    "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId) + "/copy?fields=id,name,webViewLink,mimeType",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newName, parents: newParentId ? [newParentId] : undefined }),
    }
  );
  const data = await resp.json();
  if (!resp.ok) throw new Error((data.error && data.error.message) || "Drive copy failed");
  return data;
}

/** Dossier temporaire par session de dépôt (avant validation du dossier). */
async function ensureStagingDriveFolder(depositSessionId) {
  const token = await getToken();
  const rootId = getRootFolderId();
  const configured = !!(token && rootId && isDriveConfigured());
  const sessionKey = safeName(depositSessionId, 56);

  if (!configured) {
    return {
      ok: true,
      simulated: true,
      configured: false,
      sessionKey: sessionKey,
      message: "Drive non configuré — staging simulé",
    };
  }

  const yearFolder = await ensureImmoRoot(token, rootId);
  const stagingRoot = await findChildFolder(token, yearFolder.id, "_staging");
  const sessionFolder = await findChildFolder(token, stagingRoot.id, sessionKey);
  return {
    ok: true,
    configured: true,
    simulated: false,
    sessionKey: sessionKey,
    folderId: sessionFolder.id,
    webViewLink: sessionFolder.webViewLink || null,
  };
}

async function ensureStagingClassifiedFolder(depositSessionId, classifiedKey) {
  const staging = await ensureStagingDriveFolder(depositSessionId);
  if (!staging.configured || staging.simulated) return staging;
  const token = await getToken();
  const subKey = safeName(classifiedKey || "04_documents_confidentiels", 48);
  const sub = await findChildFolder(token, staging.folderId, subKey);
  return Object.assign({}, staging, { classifiedFolderId: sub.id, classifiedKey: subKey });
}

/**
 * Après validation du dossier : copie les pièces staging vers le dossier bien définitif.
 */
async function promoteStagingToProperty(depositSessionId, property) {
  if (!depositSessionId || !property || !property.id) {
    return { ok: true, promoted: 0, files: [] };
  }

  const staging = await ensureStagingDriveFolder(depositSessionId);
  if (!staging.configured || staging.simulated || !staging.folderId) {
    return { ok: true, promoted: 0, simulated: !!staging.simulated, files: [] };
  }

  const token = await getToken();
  const ensured = await ensurePropertyDriveFolders(property);
  if (!ensured.folderId || !ensured.subfolderIds) {
    return { ok: true, promoted: 0, files: [] };
  }

  const promoted = [];
  const subfolders = await listFolderChildren(staging.folderId, 40);
  const buckets = subfolders.length
    ? subfolders.map(function (sf) {
        return { id: sf.id, key: sf.name };
      })
    : [{ id: staging.folderId, key: null }];

  for (var b = 0; b < buckets.length; b++) {
    var bucket = buckets[b];
    var classified = bucket.key || "04_documents_confidentiels";
    var target =
      (ensured.subfolderIds[classified] && ensured.subfolderIds[classified].id) || ensured.folderId;
    var listed = await listFolderFiles(bucket.id, 100);
    for (var i = 0; i < (listed.files || []).length; i++) {
      var f = listed.files[i];
      if (!f || !f.id || f.mimeType === "application/vnd.google-apps.folder") continue;
      try {
        var copied = await driveCopyFile(token, f.id, target, f.name);
        promoted.push({
          type: classified,
          fileName: f.name,
          driveFileId: copied.id,
          webViewLink: copied.webViewLink || f.webViewLink || null,
          source: "staging_promote",
          stagingSessionId: depositSessionId,
        });
      } catch (copyErr) {
        console.warn("[immo-drive] promote copy", f.name, copyErr.message);
      }
    }
  }

  return {
    ok: true,
    promoted: promoted.length,
    files: promoted,
    propertyFolderId: ensured.folderId,
    stagingFolderId: staging.folderId,
  };
}

module.exports = {
  IMMO_SUBFOLDERS,
  classifyImmoFile,
  resolveListingMediaFolder,
  resolveVendeurDocumentFolder,
  ensurePropertyDriveFolders,
  ensureStagingDriveFolder,
  ensureStagingClassifiedFolder,
  promoteStagingToProperty,
  listFolderFiles,
  safeName,
};
