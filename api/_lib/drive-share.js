/**
 * Partage dossiers Drive avec le courtier + résolution webViewLink.
 * Multi-destinataires : GOOGLE_DRIVE_SHARE_EMAILS (virgule) ou primary + miroir contact@.
 */
const { getDriveAccessToken } = require("./google-drive-auth");

function brokerEmail() {
  return (process.env.GOOGLE_DRIVE_USER_EMAIL || "courtier972@gmail.com").trim();
}

/** Liste des e-mails à qui partager dossiers / fichiers (doublon sécurité). */
function brokerEmails() {
  var raw = (process.env.GOOGLE_DRIVE_SHARE_EMAILS || "").trim();
  var list = [];
  if (raw) {
    list = raw.split(/[,;]/).map(function (s) {
      return s.trim().toLowerCase();
    }).filter(Boolean);
  } else {
    var primary = brokerEmail();
    if (primary) list.push(primary.toLowerCase());
    var mirror = (process.env.GOOGLE_DRIVE_MIRROR_EMAIL || "contact@leadsopportunities.fr").trim();
    if (mirror && list.indexOf(mirror.toLowerCase()) < 0) {
      // Activé par défaut si GOOGLE_DRIVE_MIRROR=true ou SHARE inclut contact
      if (process.env.GOOGLE_DRIVE_MIRROR === "true" || process.env.GOOGLE_DRIVE_MIRROR === "1") {
        list.push(mirror.toLowerCase());
      }
    }
  }
  // dédoublonnage
  var seen = {};
  return list.filter(function (e) {
    if (seen[e]) return false;
    seen[e] = true;
    return true;
  });
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

async function shareWithEmail(token, fileOrFolderId, email, role) {
  if (!token || !isValidDriveId(fileOrFolderId) || !email) {
    return { ok: false, skipped: true };
  }
  try {
    var resp = await fetch(
      "https://www.googleapis.com/drive/v3/files/" +
        encodeURIComponent(fileOrFolderId) +
        "/permissions?sendNotificationEmail=false&supportsAllDrives=true",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "user",
          role: role || "writer",
          emailAddress: email,
        }),
      }
    );
    if (resp.ok) return { ok: true, shared: true, email: email };
    var data = await resp.json().catch(function () {
      return {};
    });
    var msg = (data.error && data.error.message) || "";
    if (/already exists|duplicate|permission/i.test(msg)) {
      return { ok: true, shared: false, existing: true, email: email };
    }
    console.warn("[drive-share] permission", fileOrFolderId, email, msg);
    return { ok: false, error: msg, email: email };
  } catch (e) {
    console.warn("[drive-share]", e.message);
    return { ok: false, error: e.message, email: email };
  }
}

async function shareFolderWithBroker(token, folderId) {
  var emails = brokerEmails();
  if (!emails.length) {
    var single = brokerEmail();
    if (single) emails = [single];
  }
  if (!token || !isValidDriveId(folderId) || !emails.length) {
    return { ok: false, skipped: true };
  }
  var results = [];
  for (var i = 0; i < emails.length; i++) {
    results.push(await shareWithEmail(token, folderId, emails[i], "writer"));
  }
  var ok = results.some(function (r) {
    return r.ok;
  });
  return { ok: ok, results: results, emails: emails };
}

async function shareFileWithBrokers(token, fileId) {
  return shareFolderWithBroker(token, fileId);
}

/**
 * Copie un fichier vers le dossier miroir (ex. Drive contact@ Workspace).
 * Le dossier GOOGLE_DRIVE_MIRROR_FOLDER_ID doit être accessible en écriture
 * par le compte OAuth principal (partagé writer).
 */
async function mirrorCopyFile(token, fileId, fileName) {
  var mirrorFolder = (process.env.GOOGLE_DRIVE_MIRROR_FOLDER_ID || "").trim();
  if (!token || !isValidDriveId(fileId) || !isValidDriveId(mirrorFolder)) {
    return { ok: false, skipped: true };
  }
  try {
    var resp = await fetch(
      "https://www.googleapis.com/drive/v3/files/" +
        encodeURIComponent(fileId) +
        "/copy?supportsAllDrives=true&fields=id,name,webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fileName || undefined,
          parents: [mirrorFolder],
        }),
      }
    );
    if (!resp.ok) {
      var errText = await resp.text();
      console.warn("[drive-mirror]", errText.slice(0, 200));
      return { ok: false, error: errText.slice(0, 200) };
    }
    var data = await resp.json();
    // Partager aussi la copie avec la liste brokers (contact@ voit dans son Drive)
    await shareFolderWithBroker(token, data.id);
    return {
      ok: true,
      fileId: data.id,
      webViewLink: data.webViewLink || null,
      mirrorFolderId: mirrorFolder,
    };
  } catch (e) {
    console.warn("[drive-mirror]", e.message);
    return { ok: false, error: e.message };
  }
}

async function getDriveReadToken() {
  var auth = await getDriveAccessToken({ forUpload: true });
  if (auth && auth.accessToken) return auth;
  return getDriveAccessToken({ forUpload: false });
}

async function listFolderChildren(token, folderId, pageSize) {
  if (!token || !isValidDriveId(folderId)) return [];
  var q = "'" + folderId + "' in parents and trashed=false";
  var url =
    "https://www.googleapis.com/drive/v3/files?q=" +
    encodeURIComponent(q) +
    "&pageSize=" +
    (pageSize || 100) +
    "&fields=files(id,name,mimeType)&supportsAllDrives=true";
  var resp = await fetch(url, { headers: { Authorization: "Bearer " + token } });
  if (!resp.ok) return [];
  var data = await resp.json();
  return data.files || [];
}

/**
 * Compte fichiers (hors dossiers) dans l'arborescence, profondeur limitée.
 */
async function inspectDriveFolder(folderId, opts) {
  opts = opts || {};
  if (!isValidDriveId(folderId)) {
    return { ok: false, folderId: folderId, fileCount: 0, folderCount: 0, isEmpty: true, error: "id_invalide" };
  }

  var resolved = await resolveFolderWebLink(folderId, { share: opts.share !== false });
  var auth = await getDriveReadToken();
  if (!auth || !auth.accessToken) {
    return {
      ok: !!resolved.webViewLink,
      folderId: folderId,
      webViewLink: resolved.webViewLink || fallbackFolderUrl(folderId),
      fileCount: null,
      folderCount: null,
      isEmpty: null,
      inaccessible: true,
      name: resolved.name || null,
    };
  }

  var maxDepth = typeof opts.maxDepth === "number" ? opts.maxDepth : 4;
  var fileCount = 0;
  var folderCount = 0;

  async function walk(id, depth) {
    if (depth > maxDepth) return;
    var children = await listFolderChildren(auth.accessToken, id, 80);
    for (var i = 0; i < children.length; i++) {
      var f = children[i];
      if (f.mimeType === "application/vnd.google-apps.folder") {
        folderCount++;
        await walk(f.id, depth + 1);
      } else {
        fileCount++;
      }
    }
  }

  try {
    await walk(folderId, 0);
  } catch (e) {
    return {
      ok: !!resolved.webViewLink,
      folderId: folderId,
      webViewLink: resolved.webViewLink || fallbackFolderUrl(folderId),
      fileCount: null,
      folderCount: null,
      isEmpty: null,
      inaccessible: true,
      error: e.message,
      name: resolved.name || null,
    };
  }

  return {
    ok: true,
    folderId: folderId,
    webViewLink: resolved.webViewLink || fallbackFolderUrl(folderId),
    name: resolved.name || null,
    fileCount: fileCount,
    folderCount: folderCount,
    isEmpty: fileCount === 0,
    inaccessible: false,
    error: resolved.error || null,
  };
}

async function resolveFolderWebLink(folderId, opts) {
  opts = opts || {};
  if (!isValidDriveId(folderId)) {
    return { ok: false, folderId: folderId, webViewLink: null, error: "id_invalide" };
  }

  var auth = await getDriveReadToken();
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
  brokerEmails,
  isValidDriveId,
  isSimulatedDriveId,
  rootFolderWebLink,
  fallbackFolderUrl,
  shareWithEmail,
  shareFolderWithBroker,
  shareFileWithBrokers,
  mirrorCopyFile,
  resolveFolderWebLink,
  inspectDriveFolder,
  getDriveReadToken,
};
