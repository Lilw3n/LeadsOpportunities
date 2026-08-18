/**
 * Upload texte ou binaire (base64) vers Google Drive (partagé document-approve + route drive/upload)
 */
function buildMultipartBody(boundary, meta, mimeType, binaryBuffer) {
  var metaPart =
    "--" +
    boundary +
    "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(meta) +
    "\r\n--" +
    boundary +
    "\r\nContent-Type: " +
    (mimeType || "application/octet-stream") +
    "\r\n\r\n";
  var endPart = "\r\n--" + boundary + "--";
  return Buffer.concat([Buffer.from(metaPart, "utf8"), binaryBuffer, Buffer.from(endPart, "utf8")]);
}

async function resolveTargetFolder(folderId, contactId, subfolder) {
  var targetFolder = folderId;
  if (!targetFolder && contactId) {
    const { resolveContactUploadFolderId, resolveContactSubfolderId } = require("./drive-folders");
    if (subfolder) {
      targetFolder = await resolveContactSubfolderId(contactId, subfolder);
    } else {
      targetFolder = await resolveContactUploadFolderId(contactId);
    }
  }
  if (!targetFolder) {
    const { getRootFolderId } = require("./google-drive-auth");
    targetFolder = getRootFolderId();
  }
  return targetFolder;
}

async function uploadBuffer({ fileName, buffer, mimeType, folderId, contactId, subfolder }) {
  const { getDriveAccessToken } = require("./google-drive-auth");
  const auth = await getDriveAccessToken();
  var token = auth ? auth.accessToken : null;
  var targetFolder = await resolveTargetFolder(folderId, contactId, subfolder);

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
  };
  var boundary = "boundary_" + Date.now();
  var body = buildMultipartBody(boundary, meta, mimeType || "application/octet-stream", buffer);
  var resp = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,thumbnailLink",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "multipart/related; boundary=" + boundary,
      },
      body: body,
    }
  );
  if (!resp.ok) {
    var errText = await resp.text();
    throw new Error("Drive upload " + resp.status + ": " + errText.slice(0, 200));
  }
  var data = await resp.json();
  return {
    ok: true,
    fileId: data.id,
    fileName: data.name,
    mimeType: data.mimeType,
    webViewLink: data.webViewLink || null,
    webContentLink: data.webContentLink || null,
    thumbnailLink: data.thumbnailLink || null,
  };
}

async function uploadBase64File({ fileName, base64, mimeType, folderId, contactId, subfolder }) {
  if (!base64) throw new Error("base64 requis");
  const { parseBase64Payload, validateUploadBuffer } = require("./file-validation");
  var buffer = parseBase64Payload(base64);
  var checked = validateUploadBuffer(buffer, fileName, mimeType);
  if (!checked.ok) {
    var err = new Error(checked.message || "Fichier refuse");
    err.code = checked.error;
    throw err;
  }
  return uploadBuffer({
    fileName: checked.fileName,
    buffer: buffer,
    mimeType: checked.mimeType,
    folderId: folderId,
    contactId: contactId,
    subfolder: subfolder,
  });
}

async function uploadTextFile({ fileName, content, mimeType, folderId, contactId, subfolder }) {
  return uploadBuffer({
    fileName: fileName,
    buffer: Buffer.from(String(content || ""), "utf8"),
    mimeType: mimeType || "text/plain",
    folderId: folderId,
    contactId: contactId,
    subfolder: subfolder,
  });
}

module.exports = { uploadTextFile, uploadBase64File, uploadBuffer };
