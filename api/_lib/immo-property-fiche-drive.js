/**
 * Fiche texte du bien → Google Drive (03_documents_publics / 00_fiche_bien.txt).
 * Visible dans le dossier client (année / Nom_Prenom / prop_…).
 */
const { ensurePropertyDriveFolders } = require("./immo-drive");
const { upsertTextFile } = require("./drive-upload-core");
const { isDriveConfigured } = require("./google-drive-auth");
const Text = require("./immo-property-fiche-text");

async function syncPropertyFicheToDrive(property) {
  property = property || {};
  if (!property.id && !property.drive_folder_id) {
    return { ok: false, skipped: true, reason: "no_property" };
  }
  if (!isDriveConfigured()) {
    return { ok: true, simulated: true, skipped: true, reason: "drive_not_configured" };
  }

  var ensured = await ensurePropertyDriveFolders(property, { subfolder: Text.FICHE_FOLDER });
  if (ensured.simulated || !ensured.folderId) {
    return { ok: true, simulated: true, skipped: true, driveFolderId: ensured.folderId || null };
  }
  var subMap = ensured.subfolderIds || {};
  var target =
    (subMap[Text.FICHE_FOLDER] && subMap[Text.FICHE_FOLDER].id) || ensured.folderId;

  var content = Text.buildFicheContent(property);
  var uploaded = await upsertTextFile({
    fileName: Text.FICHE_NAME,
    content: content,
    mimeType: "text/plain; charset=UTF-8",
    folderId: target,
  });

  return {
    ok: true,
    fileId: uploaded.fileId || null,
    webViewLink: uploaded.webViewLink || ensured.webViewLink || null,
    driveFolderId: ensured.folderId,
    updated: !!uploaded.updated,
    fileName: Text.FICHE_NAME,
  };
}

module.exports = {
  FICHE_NAME: Text.FICHE_NAME,
  FICHE_FOLDER: Text.FICHE_FOLDER,
  buildFicheContent: Text.buildFicheContent,
  roomRowsFrom: Text.roomRowsFrom,
  syncPropertyFicheToDrive: syncPropertyFicheToDrive,
};
