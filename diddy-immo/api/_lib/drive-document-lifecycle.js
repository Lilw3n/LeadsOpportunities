/**
 * Cycle de vie documents Drive : corbeille (client) / suppression définitive (admin).
 */
const { getDriveAccessToken } = require("./google-drive-auth");
const { resolveContactUploadFolderId } = require("./drive-folders");

async function getToken() {
  var oauth = await getDriveAccessToken({ forUpload: true });
  if (oauth && oauth.accessToken) return oauth.accessToken;
  var sa = await getDriveAccessToken({ forUpload: false });
  return sa ? sa.accessToken : null;
}

async function driveGetFile(token, fileId) {
  const resp = await fetch(
    "https://www.googleapis.com/drive/v3/files/" +
      encodeURIComponent(fileId) +
      "?fields=id,name,parents,mimeType,trashed,webViewLink",
    { headers: { Authorization: "Bearer " + token } }
  );
  if (!resp.ok) return null;
  return resp.json();
}

async function findOrCreateChildFolder(token, parentId, name) {
  const q =
    "mimeType='application/vnd.google-apps.folder' and name='" +
    name.replace(/'/g, "\\'") +
    "' and '" +
    parentId +
    "' in parents and trashed=false";
  const resp = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=" +
      encodeURIComponent(q) +
      "&fields=files(id,name)&pageSize=1",
    { headers: { Authorization: "Bearer " + token } }
  );
  const data = await resp.json();
  if (data.files && data.files.length) return data.files[0];
  const created = await fetch("https://www.googleapis.com/drive/v3/files?fields=id,name", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });
  const body = await created.json();
  if (!created.ok) throw new Error((body.error && body.error.message) || "Corbeille create failed");
  return body;
}

async function driveMove(token, fileId, newParentId, oldParentIds) {
  var remove = (oldParentIds || []).filter(Boolean).join(",");
  var url =
    "https://www.googleapis.com/drive/v3/files/" +
    encodeURIComponent(fileId) +
    "?addParents=" +
    encodeURIComponent(newParentId) +
    (remove ? "&removeParents=" + encodeURIComponent(remove) : "") +
    "&fields=id,parents";
  const resp = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token },
  });
  if (!resp.ok) {
    var err = await resp.text();
    throw new Error("Drive move " + resp.status + ": " + err.slice(0, 180));
  }
  return resp.json();
}

/** Supprime définitivement un fichier Drive (admin uniquement). */
async function drivePermanentDelete(fileId) {
  if (!fileId || String(fileId).indexOf("sim_") === 0) {
    return { ok: true, skipped: true, reason: "simulated_or_missing" };
  }
  const token = await getToken();
  if (!token) return { ok: false, error: "Drive non configuré" };
  const resp = await fetch(
    "https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(fileId),
    { method: "DELETE", headers: { Authorization: "Bearer " + token } }
  );
  if (resp.status === 404 || resp.status === 204 || resp.ok) {
    return { ok: true, permanent: true, fileId: fileId };
  }
  var err = await resp.text();
  throw new Error("Drive delete " + resp.status + ": " + err.slice(0, 180));
}

/**
 * Déplace le fichier vers {dossierContact}/_corbeille/
 * (suppression soft côté client).
 */
async function moveToContactTrash(contactId, fileId) {
  if (!fileId || String(fileId).indexOf("sim_") === 0) {
    return { ok: true, skipped: true, reason: "simulated_or_missing" };
  }
  const token = await getToken();
  if (!token) return { ok: false, error: "Drive non configuré" };

  const contactFolderId = await resolveContactUploadFolderId(contactId);
  if (!contactFolderId) return { ok: false, error: "Dossier contact introuvable" };

  const trashFolder = await findOrCreateChildFolder(token, contactFolderId, "_corbeille");
  const meta = await driveGetFile(token, fileId);
  if (!meta || meta.trashed) {
    return { ok: true, alreadyGone: true, trashFolderId: trashFolder.id };
  }
  await driveMove(token, fileId, trashFolder.id, meta.parents || []);
  return {
    ok: true,
    softDeleted: true,
    fileId: fileId,
    trashFolderId: trashFolder.id,
    fileName: meta.name || null,
  };
}

/**
 * Marque un crm_event document comme corbeille / supprimé.
 */
async function markEventDocumentRemoved(sql, eventId, opts) {
  opts = opts || {};
  if (!sql || !eventId) return null;
  const rows = await sql`
    SELECT id, extra_data, status FROM crm_events WHERE id = ${eventId} LIMIT 1
  `;
  if (!rows.length) return null;
  var extra = {};
  try {
    extra = typeof rows[0].extra_data === "string"
      ? JSON.parse(rows[0].extra_data || "{}")
      : rows[0].extra_data || {};
  } catch (e) {
    extra = {};
  }
  extra.trashed = true;
  extra.trashedAt = new Date().toISOString();
  extra.trashMode = opts.permanent ? "permanent" : "corbeille";
  if (opts.by) extra.trashedBy = opts.by;
  if (opts.driveFileId && Array.isArray(extra.attachments)) {
    extra.attachments = extra.attachments.map(function (a) {
      if (!a) return a;
      if (a.driveFileId === opts.driveFileId || (a.drive && a.drive.fileId === opts.driveFileId)) {
        return Object.assign({}, a, {
          trashed: true,
          trashedAt: extra.trashedAt,
          trashMode: extra.trashMode,
        });
      }
      return a;
    });
  }
  var newStatus = opts.permanent ? "cancelled" : "cancelled";
  await sql`
    UPDATE crm_events
    SET status = ${newStatus},
        extra_data = ${JSON.stringify(extra)}
    WHERE id = ${eventId}
  `;
  return { ok: true, eventId: eventId };
}

/**
 * Retire une entrée documents[] d'un bien immo.
 */
async function markPropertyDocumentRemoved(sql, propertyId, driveFileId, opts) {
  opts = opts || {};
  if (!sql || !propertyId || !driveFileId) return null;
  const rows = await sql`
    SELECT id, metadata_json FROM crm_immo_properties WHERE id = ${propertyId} LIMIT 1
  `;
  if (!rows.length) return null;
  var meta = {};
  try {
    meta = typeof rows[0].metadata_json === "string"
      ? JSON.parse(rows[0].metadata_json || "{}")
      : rows[0].metadata_json || {};
  } catch (e) {
    meta = {};
  }
  var docs = Array.isArray(meta.documents) ? meta.documents : [];
  meta.documents = docs.map(function (d) {
    if (d && d.driveFileId === driveFileId) {
      return Object.assign({}, d, {
        trashed: true,
        trashedAt: new Date().toISOString(),
        trashMode: opts.permanent ? "permanent" : "corbeille",
      });
    }
    return d;
  });
  if (opts.permanent) {
    meta.documents = meta.documents.filter(function (d) {
      return !(d && d.driveFileId === driveFileId);
    });
  }
  await sql`
    UPDATE crm_immo_properties
    SET metadata_json = ${JSON.stringify(meta)}, updated_at = NOW()
    WHERE id = ${propertyId}
  `;
  return { ok: true };
}

function drivePreviewUrl(fileId) {
  if (!fileId || String(fileId).indexOf("sim_") === 0) return null;
  return "https://drive.google.com/file/d/" + encodeURIComponent(fileId) + "/preview";
}

module.exports = {
  moveToContactTrash,
  drivePermanentDelete,
  markEventDocumentRemoved,
  markPropertyDocumentRemoved,
  drivePreviewUrl,
  driveGetFile,
};
