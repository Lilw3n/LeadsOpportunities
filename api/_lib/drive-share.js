/**
 * Partage dossiers Drive avec le courtier + résolution webViewLink.
 */
const { getDriveAccessToken } = require("./google-drive-auth");

function brokerEmail() {
  return (process.env.GOOGLE_DRIVE_USER_EMAIL || "courtier972@gmail.com").trim();
}

function isValidDriveId(folderId) {
  if (!folderId) return false;
  var id = String(folderId).trim();
  if (!id || id.indexOf("sim_") === 0) return false;
  return /^[\w-]{10,}$/.test(id);
}

function isSimulatedDriveId(id) {
  return !id || String(id).trim().indexOf("sim_") === 0;
}

function rootFolderWebLink() {
  var rootId = (process.env.GOOGLE_DRIVE_FOLDER_ID || "").trim();
  return rootId ? fallbackFolderUrl(rootId) : null;
}

function fallbackFolderUrl(folderId) {
  if (!isValidDriveId(folderId)) return null;
  return "https://drive.google.com/drive/folders/" + encodeURIComponent(String(folderId));
}

async function shareFolderWithBroker(token, folderId) {
  var email = brokerEmail();
  if (!token || !isValidDriveId(folderId) || !email) {
    return { ok: false, skipped: true };
  }
  try {
    var resp = await fetch(
      "https://www.googleapis.com/drive/v3/files/" +
        encodeURIComponent(folderId) +
        "/permissions?sendNotificationEmail=false&supportsAllDrives=true",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "user",
          role: "writer",
          emailAddress: email,
        }),
      }
    );
    if (resp.ok) return { ok: true, shared: true };
    var data = await resp.json().catch(function () {
      return {};
    });
    var msg = (data.error && data.error.message) || "";
    if (/already exists|duplicate|permission/i.test(msg)) {
      return { ok: true, shared: false, existing: true };
    }
    console.warn("[drive-share] permission", folderId, msg);
    return { ok: false, error: msg };
  } catch (e) {
    console.warn("[drive-share]", e.message);
    return { ok: false, error: e.message };
  }
}

async function resolveFolderWebLink(folderId, opts) {
  opts = opts || {};
  if (!isValidDriveId(folderId)) {
    return { ok: false, folderId: folderId, webViewLink: null, error: "id_invalide" };
  }

  var auth = await getDriveAccessToken({ forUpload: false });
  if (!auth || !auth.accessToken) {
    return {
      ok: true,
      folderId: folderId,
      webViewLink: fallbackFolderUrl(folderId),
      fallback: true,
    };
  }

  if (opts.share !== false) {
    await shareFolderWithBroker(auth.accessToken, folderId);
  }

  try {
    var resp = await fetch(
      "https://www.googleapis.com/drive/v3/files/" +
        encodeURIComponent(folderId) +
        "?fields=id,name,webViewLink,trashed&supportsAllDrives=true",
      { headers: { Authorization: "Bearer " + auth.accessToken } }
    );
    var data = await resp.json();
    if (!resp.ok) {
      return {
        ok: false,
        folderId: folderId,
        webViewLink: fallbackFolderUrl(folderId),
        error: (data.error && data.error.message) || "Dossier inaccessible",
      };
    }
    if (data.trashed) {
      return { ok: false, folderId: folderId, webViewLink: null, error: "Dossier supprimé sur Drive" };
    }
    return {
      ok: true,
      folderId: data.id || folderId,
      name: data.name || null,
      webViewLink: data.webViewLink || fallbackFolderUrl(folderId),
    };
  } catch (e) {
    return {
      ok: true,
      folderId: folderId,
      webViewLink: fallbackFolderUrl(folderId),
      fallback: true,
      error: e.message,
    };
  }
}

module.exports = {
  brokerEmail,
  isValidDriveId,
  isSimulatedDriveId,
  rootFolderWebLink,
  fallbackFolderUrl,
  shareFolderWithBroker,
  resolveFolderWebLink,
};
