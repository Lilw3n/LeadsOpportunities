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
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_")
    .slice(0, max || 48);
}

function formatSurfaceLabel(surface) {
  var n = Number(surface);
  if (!isFinite(n) || n <= 0) return "";
  return Math.round(n) + "m2";
}

/**
 * Dossier visible : Prénom_Nom_Ville_85m2
 */
function buildProspectFolderName(property) {
  property = property || {};
  var parts = [
    safeName(property.firstName || property.first_name || property.prenom, 20),
    safeName(property.lastName || property.last_name || property.nom, 24),
    safeName(property.city || property.postal_code || property.ville, 20),
    formatSurfaceLabel(property.surface_m2 || property.surface || property.surfaceM2),
  ].filter(Boolean);
  if (!parts.length) {
    parts.push(safeName(property.title || property.sellerName || "prospect", 32) || "prospect");
  }
  return parts.join("_").slice(0, 96);
}

/** Sous-dossier technique : prop_xxxx */
function buildPropIdFolderName(property) {
  var id = String((property && property.id) || "prop").trim();
  if (!id) id = "prop";
  return safeName(id, 48) || "prop";
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

async function lookupChildFolder(token, parentId, name) {
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
  return null;
}

/** Trouve un sous-dossier ; ne crée que si createIfMissing=true (défaut true). */
async function findChildFolder(token, parentId, name, createIfMissing) {
  const found = await lookupChildFolder(token, parentId, name);
  if (found) return found;
  if (createIfMissing === false) return null;
  return driveCreateFolder(token, name, parentId);
}

function subfolderMeta(sf, found) {
  return {
    id: found.id,
    name: sf.id,
    label: sf.label,
    webViewLink: found.webViewLink || null,
  };
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

/**
 * Assure le dossier bien :
 *   Immo/année/Prénom_Nom_Ville_85m2/prop_xxxx[/01_photos_…]
 * Ne crée PAS les 8 sous-dossiers d’un coup — seulement le sous-dossier demandé.
 * @param {object} property — id, firstName, lastName, city, surface_m2, drive_folder_id?
 * @param {{ subfolder?: string }} [opts] — si subfolder fourni, crée aussi ce seul sous-dossier
 */
async function ensurePropertyDriveFolders(property, opts) {
  opts = opts || {};
  const onlySub = opts.subfolder ? String(opts.subfolder) : "";
  const token = await getToken();
  const rootId = getRootFolderId();
  const configured = !!(token && rootId && isDriveConfigured());

  const prospectLabel = buildProspectFolderName(property);
  const propIdLabel = buildPropIdFolderName(property);
  const label = prospectLabel + "/" + propIdLabel;

  if (!configured) {
    return {
      ok: true,
      simulated: true,
      configured: false,
      folderName: label,
      prospectFolderName: prospectLabel,
      propIdFolderName: propIdLabel,
      subfolders: IMMO_SUBFOLDERS,
      lazy: true,
      message: "Drive non configuré — mode local intelligent actif (voir docs/DRIVE-SETUP.md)",
    };
  }

  var propFolderId = property.drive_folder_id || null;
  var prospectFolderId = null;
  var webViewLink = null;
  var existing = false;

  if (propFolderId) {
    existing = true;
  } else {
    const yearFolder = await ensureImmoRoot(token, rootId);
    const prospectFolder = await findChildFolder(token, yearFolder.id, prospectLabel, true);
    prospectFolderId = prospectFolder.id;
    const propFolder = await findChildFolder(token, prospectFolder.id, propIdLabel, true);
    propFolderId = propFolder.id;
    webViewLink = propFolder.webViewLink || prospectFolder.webViewLink || null;
  }

  const subs = {};

  if (onlySub) {
    const foundOne = await lookupChildFolder(token, propFolderId, onlySub);
    var sfOnly = null;
    for (var j = 0; j < IMMO_SUBFOLDERS.length; j++) {
      if (IMMO_SUBFOLDERS[j].id === onlySub) {
        sfOnly = IMMO_SUBFOLDERS[j];
        break;
      }
    }
    const ensuredOne = foundOne || (await findChildFolder(token, propFolderId, onlySub, true));
    if (sfOnly) {
      subs[onlySub] = subfolderMeta(sfOnly, ensuredOne);
    } else {
      subs[onlySub] = {
        id: ensuredOne.id,
        name: onlySub,
        label: onlySub,
        webViewLink: ensuredOne.webViewLink || null,
      };
    }
  } else {
    for (var i = 0; i < IMMO_SUBFOLDERS.length; i++) {
      const sf = IMMO_SUBFOLDERS[i];
      const found = await lookupChildFolder(token, propFolderId, sf.id);
      if (found) subs[sf.id] = subfolderMeta(sf, found);
    }
  }

  return {
    ok: true,
    configured: true,
    folderId: propFolderId,
    prospectFolderId: prospectFolderId,
    folderName: label,
    prospectFolderName: prospectLabel,
    propIdFolderName: propIdLabel,
    webViewLink: webViewLink,
    subfolders: IMMO_SUBFOLDERS,
    subfolderIds: subs,
    existing: existing,
    lazy: true,
  };
}

/**
 * Assure le dossier bien + un seul sous-dossier cible (là où on upload).
 */
async function ensurePropertySubfolder(property, subfolderKey) {
  return ensurePropertyDriveFolders(property, { subfolder: subfolderKey });
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

module.exports = {
  IMMO_SUBFOLDERS,
  classifyImmoFile,
  resolveListingMediaFolder,
  resolveVendeurDocumentFolder,
  ensurePropertyDriveFolders,
  ensurePropertySubfolder,
  listFolderFiles,
  safeName,
  buildProspectFolderName,
  buildPropIdFolderName,
};
