/**
 * Sync photos bien immo → Google Drive (01_photos_publiques).
 */
const { ensurePropertyDriveFolders, resolveListingMediaFolder } = require("./immo-drive");
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
 */
async function syncPropertyPhotosToDrive(property, photos) {
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
  var pubFolderKey = resolveListingMediaFolder("photo");
  var targetFolder = (subMap[pubFolderKey] && subMap[pubFolderKey].id) || folderId;

  if (ensured.simulated || !targetFolder) {
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
    var folderKey = resolveListingMediaFolder(p.kind === "capture" ? "capture" : "photo");
    var uploadFolder =
      (subMap[folderKey] && subMap[folderKey].id) || targetFolder;
    try {
      var uploadedFile = await uploadBase64File({
        fileName: safePhotoName(i, p.kind),
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
          driveFolder: folderKey,
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
    driveFolderId: folderId,
    subfolderIds: subMap,
    webViewLink: ensured.webViewLink || null,
    photos: enriched,
  };
}

module.exports = { syncPropertyPhotosToDrive, safePhotoName };
