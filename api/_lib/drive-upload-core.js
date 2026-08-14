/**
 * Upload texte ou binaire (base64) vers Google Drive, avec copie o2switch.
 */
const { UPLOAD_MAX_BYTES } = require("./upload-limits");

function isProductionLike() {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

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

async function uploadToDriveOnly({ fileName, buffer, mimeType, folderId, contactId, subfolder }) {
  const { getDriveAccessToken } = require("./google-drive-auth");
  const auth = await getDriveAccessToken();
  var token = auth ? auth.accessToken : null;
  var targetFolder = await resolveTargetFolder(folderId, contactId, subfolder);

  if (!token || !targetFolder) {
    return {
      ok: false,
      simulated: true,
      message:
        "Drive non configuré — GOOGLE_SERVICE_ACCOUNT_JSON + GOOGLE_DRIVE_FOLDER_ID (voir docs/DRIVE-SETUP.md)",
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
    simulated: false,
    fileId: data.id,
    fileName: data.name,
    mimeType: data.mimeType,
    webViewLink: data.webViewLink || null,
    webContentLink: data.webContentLink || null,
    thumbnailLink: data.thumbnailLink || null,
    folderId: targetFolder,
  };
}

async function attachBackupAndRecord(driveResult, opts) {
  const { backupBuffer } = require("./o2switch-backup");
  var backup = await backupBuffer({
    fileName: opts.fileName,
    buffer: opts.buffer,
    mimeType: opts.mimeType,
    contactId: opts.contactId,
    subfolder: opts.subfolder,
    documentType: opts.documentType,
  });

  var simulated = !!(driveResult && driveResult.simulated);
  var backupOnly = !(!simulated && driveResult && driveResult.ok) && !!(backup && backup.ok);

  try {
    const { recordDocumentFile } = require("./document-files");
    await recordDocumentFile({
      contactId: opts.contactId,
      fileName: opts.fileName,
      mimeType: opts.mimeType || (driveResult && driveResult.mimeType) || null,
      bytes: opts.buffer ? opts.buffer.length : null,
      documentType: opts.documentType,
      subfolder: opts.subfolder,
      driveFileId: driveResult && !simulated ? driveResult.fileId : null,
      webViewLink: driveResult && driveResult.webViewLink,
      backupPath: backup && (backup.relativePath || backup.path),
      backupOk: !!(backup && backup.ok),
      simulated: simulated && !backupOnly,
      backupOnly: backupOnly,
      source: opts.source || "drive_upload",
      extra: {
        driveError: opts.driveError || null,
        backupError: backup && !backup.ok && !backup.skipped ? backup.error : null,
      },
    });
  } catch (e) {
    console.warn("[drive-upload] record", e.message);
  }

  return { backup: backup, backupOnly: backupOnly };
}

async function uploadBuffer({ fileName, buffer, mimeType, folderId, contactId, subfolder, documentType, source }) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("buffer requis");
  }
  if (buffer.length > UPLOAD_MAX_BYTES) {
    throw new Error("Fichier trop volumineux (max 12 Mo)");
  }

  var driveResult = null;
  var driveError = null;
  try {
    driveResult = await uploadToDriveOnly({
      fileName: fileName,
      buffer: buffer,
      mimeType: mimeType,
      folderId: folderId,
      contactId: contactId,
      subfolder: subfolder,
    });
  } catch (e) {
    driveError = e.message || String(e);
    driveResult = null;
  }

  var extras = await attachBackupAndRecord(driveResult, {
    fileName: fileName,
    buffer: buffer,
    mimeType: mimeType,
    contactId: contactId,
    subfolder: subfolder,
    documentType: documentType,
    source: source,
    driveError: driveError,
  });
  var backup = extras.backup;
  var backupOnly = extras.backupOnly;

  if (driveResult && driveResult.ok && !driveResult.simulated) {
    return Object.assign({}, driveResult, { backup: backup, backupOnly: false });
  }

  if (backup && backup.ok) {
    return {
      ok: true,
      backupOnly: true,
      simulated: false,
      fileId: "o2_" + Date.now(),
      fileName: fileName,
      mimeType: mimeType || "application/octet-stream",
      webViewLink: null,
      backup: backup,
      driveError: driveError || (driveResult && driveResult.message) || null,
      message: "Copie o2switch enregistrée — Drive indisponible",
    };
  }

  if (driveResult && driveResult.simulated && !isProductionLike()) {
    return Object.assign({}, driveResult, {
      ok: true,
      backup: backup,
      backupOnly: false,
    });
  }

  throw new Error(
    driveError ||
      (driveResult && driveResult.message) ||
      "Dépôt impossible — configurez Google Drive et/ou la copie o2switch (docs/DRIVE-SETUP.md)"
  );
}

async function uploadBase64File({ fileName, base64, mimeType, folderId, contactId, subfolder, documentType, source }) {
  if (!base64) throw new Error("base64 requis");
  var raw = String(base64).replace(/^data:[^;]+;base64,/, "");
  var buffer = Buffer.from(raw, "base64");
  if (buffer.length > UPLOAD_MAX_BYTES) {
    throw new Error("Fichier trop volumineux (max 12 Mo)");
  }
  return uploadBuffer({
    fileName: fileName,
    buffer: buffer,
    mimeType: mimeType,
    folderId: folderId,
    contactId: contactId,
    subfolder: subfolder,
    documentType: documentType,
    source: source,
  });
}

async function uploadTextFile({ fileName, content, mimeType, folderId, contactId, subfolder, documentType, source }) {
  return uploadBuffer({
    fileName: fileName,
    buffer: Buffer.from(String(content || ""), "utf8"),
    mimeType: mimeType || "text/plain",
    folderId: folderId,
    contactId: contactId,
    subfolder: subfolder,
    documentType: documentType,
    source: source,
  });
}

module.exports = { uploadTextFile, uploadBase64File, uploadBuffer, uploadToDriveOnly };
