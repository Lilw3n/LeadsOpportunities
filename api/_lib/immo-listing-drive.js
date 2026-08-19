/**
 * Sync photos bien immo → Google Drive (hiérarchie Personne → Bien → Photos).
 */
const { ensurePropertyDriveFolders, resolveListingMediaFolder } = require("./immo-drive");
const { resolveVendeurUploadFolder } = require("./immo-drive-hierarchy");
const { uploadBase64File } = require("./drive-upload-core");
const { isDriveConfigured } = require("./google-drive-auth");

function stripBase64(dataUrl) {
  return String(dataUrl || "").replace(/^data:[^;]+;base64,/, "");
}

function mimeFromDataUrl(dataUrl) {
  var m = String(dataUrl || "").match(/^data:([^;]+);base64,/i);
  return m ? m[1] : "image/jpeg";
}

function safePhotoName(index, kind) {
  var prefix = kind === "capture" ? "capture_annonce" : "photo_" + (index + 1);
  return prefix + "_" + Date.now() + ".jpg";
}

/**
 * @param {object} property — { id, title, city, postal_code, drive_folder_id? }
 * @param {Array<{url:string, kind?:string}>} photos
 * @param {object} opts — owners, depositor
 */
async function syncPropertyPhotosToDrive(property, photos, opts) {
  opts = opts || {};
  photos = Array.isArray(photos) ? photos.filter(function (p) {
    return p && p.url && /^data:image\//i.test(p.url);
  }) : [];

  if (!photos.length) {
    return { ok: true, uploaded: 0, photos: [], configured: isDriveConfigured() };
  }

  var prop = Object.assign({}, property, { id: property.id });
  var ensured = await ensurePropertyDriveFolders(prop);
  var folderId = ensured.folderId || property.drive_folder_id || null;
  var subMap = ensured.subfolderIds || {};
  var useLegacy = !!(ensured.legacy && subMap && Object.keys(subMap).length);
  var bienFolderId = folderId;

  if (ensured.simulated && !useLegacy) {
    return {
      ok: true,
      simulated: true,
      configured: false,
      uploaded: 0,
      driveFolderId: folderId,
      message: ensured.message || "Drive non configuré — photos conservées en base uniquement",
      photos: photos,
    };
  }

  var enriched = [];
  var uploaded = 0;

  for (var i = 0; i < photos.length; i++) {
    var p = photos[i];
    var uploadFolder = null;
    var photoLabel = p.kind === "capture" ? "Capture annonce" : "Photos publiques";
    var photoName =
      (p.kind === "capture" ? "Capture_annonce" : "Photo_publique") +
      (opts.depositor && opts.depositor.lastName ? "_" + String(opts.depositor.lastName).replace(/\s+/g, "_") : "") +
      "_p" +
      String(i + 1).padStart(2, "0") +
      ".jpg";

    if (useLegacy) {
      var folderKey = resolveListingMediaFolder(p.kind === "capture" ? "capture" : "photo");
      uploadFolder = (subMap[folderKey] && subMap[folderKey].id) || folderId;
      photoName = safePhotoName(i, p.kind);
    } else {
      var hierarchy = await resolveVendeurUploadFolder({
        property: prop,
        owners: opts.owners,
        depositor: opts.depositor,
        documentType: p.kind === "capture" ? "capture_annonce" : "photos",
        documentLabel: photoLabel,
        fileIndex: i,
        originalFileName: photoName,
      });
      uploadFolder = hierarchy.folderId;
      photoName = hierarchy.driveFileName || photoName;
      bienFolderId = hierarchy.bienFolderId || bienFolderId;
    }

    if (!uploadFolder) continue;

    try {
      var uploadedFile = await uploadBase64File({
        fileName: photoName,
        base64: stripBase64(p.url),
        mimeType: mimeFromDataUrl(p.url),
        folderId: uploadFolder,
        kind: "photo",
      });
      if (uploadedFile.simulated) {
        enriched.push(p);
        continue;
      }
      uploaded++;
      enriched.push(
        Object.assign({}, p, {
          driveFileId: uploadedFile.fileId,
          webViewLink: uploadedFile.webViewLink || null,
          thumbnailLink: uploadedFile.thumbnailLink || null,
          url: uploadedFile.thumbnailLink || uploadedFile.webViewLink || p.url,
          storage: "drive",
        })
      );
    } catch (err) {
      console.warn("[immo-listing-drive] upload", i, err && err.message);
      enriched.push(p);
    }
  }

  return {
    ok: true,
    configured: true,
    simulated: false,
    uploaded: uploaded,
    driveFolderId: bienFolderId,
    subfolderIds: subMap,
    photos: enriched,
  };
}

module.exports = { syncPropertyPhotosToDrive, safePhotoName };
