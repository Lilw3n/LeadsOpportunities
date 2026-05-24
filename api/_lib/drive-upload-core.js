/**
 * Upload texte vers Google Drive (partagé document-approve + route drive/upload)
 */
async function uploadTextFile({ fileName, content, mimeType, folderId, contactId }) {
  var token = process.env.GOOGLE_DRIVE_ACCESS_TOKEN;
  var targetFolder = folderId;

  if (!targetFolder && contactId) {
    const { resolveContactUploadFolderId } = require("./drive-folders");
    targetFolder = await resolveContactUploadFolderId(contactId);
  }
  if (!targetFolder) {
    targetFolder = process.env.GOOGLE_DRIVE_FOLDER_ID;
  }

  if (!token || !targetFolder) {
    return {
      ok: true,
      simulated: true,
      message: "Upload simulé — configurez GOOGLE_DRIVE_ACCESS_TOKEN et GOOGLE_DRIVE_FOLDER_ID",
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
