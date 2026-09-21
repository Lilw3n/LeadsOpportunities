/**
 * Upload texte ou binaire (base64) vers Google Drive (partagé document-approve + route drive/upload)
 */
const { validateUpload, MAX_BYTES } = require("./upload-guard");

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

async function uploadBuffer({ fileName, buffer, mimeType, folderId, contactId, subfolder, skipValidation }) {
  const { getDriveAccessToken, isDriveUploadConfigured, uploadConfigHint, isServiceAccountQuotaError } =
    require("./google-drive-auth");
  var auth = await getDriveAccessToken({ forUpload: true });
  var token = auth ? auth.accessToken : null;
  var targetFolder = await resolveTargetFolder(folderId, contactId, subfolder);

  if (!token || !targetFolder) {
    var hint = !isDriveUploadConfigured() ? uploadConfigHint() : "Token ou dossier cible manquant";
    return {
      ok: true,
      simulated: true,
      message: "Upload simule — " + hint,
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
    if (isServiceAccountQuotaError(errText)) {
      throw new Error("Drive upload refuse (quota compte de service). " + uploadConfigHint());
    }
    throw new Error("Drive upload " + resp.status + ": " + errText.slice(0, 280));
  }
  var data = await resp.json();
  var share = { skipped: true };
  var mirror = { skipped: true };
  try {
    const { shareFileWithBrokers, mirrorCopyFile } = require("./drive-share");
    share = await shareFileWithBrokers(token, data.id);
    mirror = await mirrorCopyFile(token, data.id, data.name || fileName);
  } catch (e) {
    console.warn("[drive-upload] share/mirror", e.message);
  }
  return {
    ok: true,
    fileId: data.id,
    fileName: data.name,
    mimeType: data.mimeType,
    webViewLink: data.webViewLink || null,
    webContentLink: data.webContentLink || null,
    thumbnailLink: data.thumbnailLink || null,
    sharedWith: (share && share.emails) || [],
    mirror: mirror && mirror.ok ? mirror : null,
  };
}

async function uploadBase64File({ fileName, base64, mimeType, folderId, contactId, subfolder, kind }) {
  if (!base64) throw new Error("base64 requis");
  var checked = validateUpload({
    base64: base64,
    fileName: fileName,
    mimeType: mimeType,
    kind: kind || "document",
  });
  return uploadBuffer({
    fileName: checked.fileName,
    buffer: checked.buffer,
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
    skipValidation: true,
  });
}

module.exports = { uploadTextFile, uploadBase64File, uploadBuffer, MAX_BYTES };
