/**
 * Hiérarchie Drive vendeur : Famille (si 2+ mandants) → Personne → Bien → type de pièce.
 * Création paresseuse — uniquement les dossiers nécessaires à chaque upload.
 */
const { getDriveAccessToken, getRootFolderId, isDriveConfigured } = require("./google-drive-auth");

var PERSON_DOC_TYPES = {
  identite: true,
  domicile: true,
  livret_famille: true,
  kbis_sci: true,
};

var MAX_FILES_BY_TYPE = {
  identite: 24,
  domicile: 12,
  livret_famille: 12,
  titre_propriete: 80,
  acte_vente: 80,
  acte_notarie: 80,
  default: 80,
};

function safeName(s, max) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, max || 48) || "sans_nom";
}

function fileExtension(fileName, mimeType) {
  var m = String(fileName || "").match(/(\.[a-z0-9]{2,5})$/i);
  if (m) return m[1].toLowerCase();
  if (/pdf/i.test(mimeType || "")) return ".pdf";
  if (/png/i.test(mimeType || "")) return ".png";
  if (/webp/i.test(mimeType || "")) return ".webp";
  return ".jpg";
}

async function getToken() {
  var oauth = await getDriveAccessToken({ forUpload: true });
  if (oauth && oauth.accessToken) return oauth.accessToken;
  var auth = await getDriveAccessToken({ forUpload: false });
  return auth ? auth.accessToken : null;
}

async function driveCreateFolder(token, name, parentId) {
  var resp = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : undefined,
    }),
  });
  var data = await resp.json();
  if (!resp.ok) throw new Error((data.error && data.error.message) || "Drive folder create failed");
  return data;
}

async function findChildFolder(token, parentId, name) {
  var q =
    "mimeType='application/vnd.google-apps.folder' and name='" +
    name.replace(/'/g, "\\'") +
    "' and '" +
    parentId +
    "' in parents and trashed=false";
  var resp = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=" +
      encodeURIComponent(q) +
      "&fields=files(id,name,webViewLink)&pageSize=1",
    { headers: { Authorization: "Bearer " + token } }
  );
  var data = await resp.json();
  if (data.files && data.files.length) return data.files[0];
  return driveCreateFolder(token, name, parentId);
}

async function ensureImmoYearFolder(token, rootId) {
  var immo = await findChildFolder(token, rootId, "Immo");
  var year = String(new Date().getFullYear());
  return findChildFolder(token, immo.id, year);
}

async function ensureFolderChain(token, parentId, segments) {
  var currentId = parentId;
  var currentLink = null;
  for (var i = 0; i < segments.length; i++) {
    var seg = segments[i];
    if (!seg) continue;
    var folder = await findChildFolder(token, currentId, seg);
    currentId = folder.id;
    currentLink = folder.webViewLink || currentLink;
  }
  return { folderId: currentId, webViewLink: currentLink };
}

function ownerDisplayName(owner) {
  owner = owner || {};
  var fn = String(owner.firstName || owner.first_name || "").trim();
  var ln = String(owner.lastName || owner.last_name || "").trim();
  return { firstName: fn, lastName: ln, full: (fn + " " + ln).trim() };
}

function normalizeOwners(owners, depositor) {
  owners = Array.isArray(owners) ? owners : [];
  var list = owners
    .map(function (o, idx) {
      var n = ownerDisplayName(o);
      if (!n.full && !n.lastName) return null;
      return {
        index: idx,
        firstName: n.firstName,
        lastName: n.lastName,
        role: o.role || "",
      };
    })
    .filter(Boolean);

  if (!list.length && depositor) {
    var d = ownerDisplayName(depositor);
    if (d.full || d.lastName) {
      list.push({ index: 0, firstName: d.firstName, lastName: d.lastName, role: "deposant" });
    }
  }
  if (!list.length) {
    list.push({ index: 0, firstName: "Mandant", lastName: "", role: "inconnu" });
  }
  return list;
}

function isMultiOwnerFamily(owners) {
  return normalizeOwners(owners).length >= 2;
}

function familyFolderName(owners) {
  owners = normalizeOwners(owners);
  if (owners.length < 2) return null;
  var lastNames = [];
  owners.forEach(function (o) {
    var ln = safeName(o.lastName || o.firstName, 20);
    if (ln && lastNames.indexOf(ln) < 0) lastNames.push(ln);
  });
  if (lastNames.length >= 2) {
    return "Famille_" + lastNames.sort().join("_");
  }
  var ln = safeName(owners[0].lastName || "famille", 20);
  var firsts = owners
    .map(function (o) {
      return safeName(o.firstName, 14);
    })
    .filter(Boolean)
    .sort();
  return "Famille_" + ln + "_" + firsts.join("_");
}

function personFolderName(owner) {
  var o = ownerDisplayName(owner);
  var parts = ["Personne"];
  if (o.firstName) parts.push(safeName(o.firstName, 18));
  if (o.lastName) parts.push(safeName(o.lastName, 18));
  if (parts.length === 1) parts.push("Mandant");
  return parts.join("_");
}

function bienFolderName(property, depositSessionId) {
  property = property || {};
  var city = safeName(property.city || "ville", 18);
  var postal = safeName(property.postal_code || property.postalCode || "", 8);
  var id = safeName(property.id || "", 20);
  if (id && id !== "sans_nom") {
    return "Bien_" + city + (postal ? "_" + postal : "") + "_" + id;
  }
  if (depositSessionId) {
    return "Bien_" + city + (postal ? "_" + postal : "") + "_brouillon_" + safeName(depositSessionId, 16);
  }
  return "Bien_" + city + (postal ? "_" + postal : "") + "_brouillon";
}

function docFolderName(documentType, documentLabel) {
  if (documentLabel) {
    return safeName(
      String(documentLabel)
        .replace(/\([^)]*\)/g, "")
        .replace(/\s+/g, " ")
        .trim(),
      52
    );
  }
  return safeName(documentType || "autre_doc", 48);
}

function isPersonSpecificDoc(documentType) {
  return !!PERSON_DOC_TYPES[String(documentType || "").toLowerCase()];
}

function buildDriveFileName(opts) {
  opts = opts || {};
  var label = safeName(
    String(opts.documentLabel || opts.documentType || "Document")
      .replace(/\([^)]*\)/g, "")
      .trim(),
    40
  );
  var owner = ownerDisplayName(opts);
  var person =
    safeName(owner.firstName, 16) +
    (owner.lastName ? "_" + safeName(owner.lastName, 16) : owner.firstName ? "" : "_Mandant");
  if (!owner.firstName && !owner.lastName) person = "Mandant";
  var ext = fileExtension(opts.originalFileName || opts.fileName, opts.mimeType);
  var page =
    typeof opts.fileIndex === "number"
      ? "_p" + String(opts.fileIndex + 1).padStart(2, "0")
      : "";
  return label + "_" + person + page + ext;
}

function buildPathSegments(opts) {
  var owners = normalizeOwners(opts.owners, opts.depositor);
  var multi = owners.length >= 2;
  var family = multi ? familyFolderName(owners) : null;
  var ownerIdx = typeof opts.ownerIndex === "number" ? opts.ownerIndex : 0;
  var owner = owners[ownerIdx] || owners[0];
  var person = personFolderName(owner);
  var bien = bienFolderName(opts.property, opts.depositSessionId);
  var doc = docFolderName(opts.documentType, opts.documentLabel);
  var personDoc = isPersonSpecificDoc(opts.documentType);

  var segments = [];
  if (opts.depositSessionId) {
    segments.push("_staging", safeName(opts.depositSessionId, 56));
  }
  if (multi) {
    segments.push(family);
    if (personDoc) {
      segments.push(person, bien, doc);
    } else {
      segments.push(bien, doc);
    }
  } else {
    segments.push(person, bien, doc);
  }
  return {
    segments: segments,
    owners: owners,
    multi: multi,
    family: family,
    person: person,
    bien: bien,
    doc: doc,
    owner: owner,
  };
}

function bienPathSegments(opts) {
  var built = buildPathSegments(opts);
  var segs = built.segments.slice();
  if (segs[segs.length - 1] === built.doc) segs.pop();
  return segs;
}

/**
 * Résout le dossier cible (création paresseuse) + nom de fichier lisible.
 */
async function resolveVendeurUploadFolder(opts) {
  var token = await getToken();
  var rootId = getRootFolderId();
  var configured = !!(token && rootId && isDriveConfigured());
  var built = buildPathSegments(opts);

  if (!configured) {
    return {
      ok: true,
      simulated: true,
      configured: false,
      path: built.segments.join("/"),
      driveFileName: buildDriveFileName(
        Object.assign({}, opts, {
          firstName: built.owner.firstName,
          lastName: built.owner.lastName,
        })
      ),
    };
  }

  var yearFolder = await ensureImmoYearFolder(token, rootId);
  var uploadFolder = await ensureFolderChain(token, yearFolder.id, built.segments);
  var bienFolder = await ensureFolderChain(token, yearFolder.id, bienPathSegments(opts));

  return {
    ok: true,
    configured: true,
    simulated: false,
    folderId: uploadFolder.folderId,
    bienFolderId: bienFolder.folderId,
    webViewLink: uploadFolder.webViewLink || bienFolder.webViewLink || null,
    path: built.segments.join("/"),
    multiOwner: built.multi,
    familyFolder: built.family,
    driveFileName: buildDriveFileName(
      Object.assign({}, opts, {
        firstName: built.owner.firstName,
        lastName: built.owner.lastName,
      })
    ),
  };
}

async function listAllFilesInFolder(token, folderId, acc, pathPrefix) {
  acc = acc || [];
  pathPrefix = pathPrefix || "";
  var q = "'" + folderId + "' in parents and trashed=false";
  var url =
    "https://www.googleapis.com/drive/v3/files?q=" +
    encodeURIComponent(q) +
    "&pageSize=200&fields=files(id,name,mimeType,webViewLink,parents)";
  var resp = await fetch(url, { headers: { Authorization: "Bearer " + token } });
  if (!resp.ok) return acc;
  var data = await resp.json();
  var files = data.files || [];
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    if (f.mimeType === "application/vnd.google-apps.folder") {
      await listAllFilesInFolder(token, f.id, acc, pathPrefix + f.name + "/");
    } else {
      acc.push({ file: f, relativePath: pathPrefix + f.name });
    }
  }
  return acc;
}

async function driveCopyFile(token, fileId, newParentId, newName) {
  var resp = await fetch(
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
  var data = await resp.json();
  if (!resp.ok) throw new Error((data.error && data.error.message) || "Drive copy failed");
  return data;
}

/**
 * Promotion staging → hiérarchie définitive (remplace Bien_brouillon_* par Bien_*_{propertyId}).
 */
async function promoteStagingHierarchy(depositSessionId, property, owners, depositor) {
  if (!depositSessionId || !property || !property.id) {
    return { ok: true, promoted: 0, files: [] };
  }

  var token = await getToken();
  var rootId = getRootFolderId();
  if (!token || !rootId) return { ok: true, promoted: 0, simulated: true, files: [] };

  var yearFolder = await ensureImmoYearFolder(token, rootId);
  var stagingFolder = await ensureFolderChain(token, yearFolder.id, [
    "_staging",
    safeName(depositSessionId, 56),
  ]);
  var allFiles = await listAllFilesInFolder(token, stagingFolder.folderId, [], "");

  var normalized = normalizeOwners(owners, depositor);
  var promoted = [];

  function ownerIndexFromPersonFolder(folderName) {
    if (!folderName || folderName.indexOf("Personne_") !== 0) return 0;
    var bits = folderName.replace("Personne_", "").split("_").filter(Boolean);
    var fn = bits[0] || "";
    var ln = bits.slice(1).join("_") || "";
    for (var i = 0; i < normalized.length; i++) {
      var o = normalized[i];
      if (
        safeName(o.firstName, 16) === safeName(fn, 16) &&
        (!ln || safeName(o.lastName, 16) === safeName(ln, 16))
      ) {
        return i;
      }
    }
    return 0;
  }

  for (var i = 0; i < allFiles.length; i++) {
    var entry = allFiles[i];
    var rel = entry.relativePath || entry.file.name;
    var parts = rel.split("/").filter(Boolean);
    if (!parts.length) continue;
    var fileName = parts[parts.length - 1];
    var docFolder = parts.length >= 2 ? parts[parts.length - 2] : "Documents";
    var personFolder = parts.filter(function (p) {
      return p.indexOf("Personne_") === 0;
    })[0];
    var ownerIndex = ownerIndexFromPersonFolder(personFolder);

    var target = await resolveVendeurUploadFolder({
      property: property,
      owners: owners,
      depositor: depositor,
      documentType: docFolder,
      documentLabel: docFolder.replace(/_/g, " "),
      ownerIndex: ownerIndex,
      fileIndex: 0,
      originalFileName: fileName,
    });

    try {
      var copied = await driveCopyFile(token, entry.file.id, target.folderId, fileName);
      promoted.push({
        fileName: fileName,
        driveFileId: copied.id,
        webViewLink: copied.webViewLink || entry.file.webViewLink || null,
        path: target.path,
        source: "staging_promote",
      });
    } catch (err) {
      console.warn("[immo-drive-hierarchy] promote", fileName, err.message);
    }
  }

  var finalBien = await resolveVendeurUploadFolder({
    property: property,
    owners: owners,
    depositor: depositor,
    documentType: "Documents",
    documentLabel: "Documents",
  });

  return {
    ok: true,
    promoted: promoted.length,
    files: promoted,
    bienFolderId: finalBien.bienFolderId || null,
    stagingFolderId: stagingFolder.folderId,
  };
}

function maxFilesForType(documentType) {
  var t = String(documentType || "").toLowerCase();
  return MAX_FILES_BY_TYPE[t] || MAX_FILES_BY_TYPE.default;
}

module.exports = {
  PERSON_DOC_TYPES,
  MAX_FILES_BY_TYPE,
  maxFilesForType,
  safeName,
  normalizeOwners,
  isMultiOwnerFamily,
  familyFolderName,
  personFolderName,
  bienFolderName,
  docFolderName,
  buildDriveFileName,
  buildPathSegments,
  resolveVendeurUploadFolder,
  promoteStagingHierarchy,
  ensureFolderChain,
  ensureImmoYearFolder,
};
