/**
 * Upload texte vers Google Drive (partagé document-approve + route drive/upload)
 */
async function uploadTextFile({ fileName, content, mimeType, folderId, contactId, leadId, email, docType }) {
  const { getDriveAccessToken, getRootFolderId } = require("./google-drive-auth");
  const auth = await getDriveAccessToken();
  var token = auth ? auth.accessToken : null;
  var targetFolder = folderId;

  if (!targetFolder && (contactId || leadId)) {
    const { resolveDocumentUploadFolder } = require("./drive-folders");
    targetFolder = await resolveDocumentUploadFolder({
      contactId: contactId,
      leadId: leadId,
      email: email,
      docType: docType,
    });
  }
  if (!targetFolder) {
    targetFolder = getRootFolderId();
  }

  if (!token || !targetFolder) {
    return {
      ok: true,
      simulated: true,
      message: "Upload simule — configurez GOOGLE_SERVICE_ACCOUNT_JSON + GOOGLE_DRIVE_FOLDER_ID (voir docs/DRIVE-SETUP.md)",
      fileId: "sim_" + Date.now(),
      fileName: fileName,
    };
  }
  var meta = {
    name: fileName,
    parents: [targetFolder],
    mimeType: mimeType || "application/pdf",
  };
  var boundary = "boundary_" + Date.now();
  var bodyStr =
    "--" +
    boundary +
    "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(meta) +
    "\r\n--" +
    boundary +
    "\r\nContent-Type: " +
    (mimeType || "text/plain") +
    "\r\n\r\n" +
    content +
    "\r\n--" +
    boundary +
    "--";
  var resp = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "multipart/related; boundary=" + boundary,
    },
    body: bodyStr,
  });
  if (!resp.ok) throw new Error("Drive upload " + resp.status);
  var data = await resp.json();
  return { ok: true, fileId: data.id, fileName: data.name };
}

module.exports = { uploadTextFile };
