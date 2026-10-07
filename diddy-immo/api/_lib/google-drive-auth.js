/**
 * Authentification Google Drive pour Vercel.
 *
 * Gmail perso (courtier972@gmail.com) : le compte de service peut créer des dossiers
 * partagés mais PAS déposer de fichiers (quota = 0). Les uploads exigent OAuth utilisateur
 * (GOOGLE_DRIVE_REFRESH_TOKEN ou GOOGLE_DRIVE_ACCESS_TOKEN).
 */
const jwt = require("jsonwebtoken");

let cachedOAuth = { token: null, expiresAt: 0, source: null, email: null };
let cachedSa = { token: null, expiresAt: 0, source: null, email: null };

function parseServiceAccount() {
  var raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "";
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("[drive-auth] JSON compte de service invalide");
    return null;
  }
}

async function tokenFromServiceAccount(sa) {
  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/drive",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    },
    sa.private_key,
    { algorithm: "RS256" }
  );

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: assertion,
    }).toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Service account token failed");
  }
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 3600,
    source: "service_account",
    email: sa.client_email,
  };
}

async function tokenFromRefreshToken() {
  var refresh = (process.env.GOOGLE_DRIVE_REFRESH_TOKEN || "").trim();
  if (!refresh) return null;
  const { refreshGoogleAccessToken } = require("./google-oauth");
  const data = await refreshGoogleAccessToken(refresh);
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 3600,
    source: "oauth_refresh",
    email: (process.env.GOOGLE_DRIVE_USER_EMAIL || "courtier972@gmail.com").trim(),
  };
}

function hasOAuthCredentials() {
  return !!(
    (process.env.GOOGLE_DRIVE_REFRESH_TOKEN || "").trim() ||
    (process.env.GOOGLE_DRIVE_ACCESS_TOKEN || "").trim()
  );
}

function isServiceAccountQuotaError(message) {
  var m = String(message || "").toLowerCase();
  return m.indexOf("storage quota") >= 0 || m.indexOf("shared drives") >= 0;
}

/**
 * @param {{ forUpload?: boolean }} options — forUpload:true exclut le compte de service (Gmail perso).
 */
async function getDriveAccessToken(options) {
  options = options || {};
  var forUpload = options.forUpload === true;
  var now = Date.now();
  var manual = (process.env.GOOGLE_DRIVE_ACCESS_TOKEN || "").trim();
  var refresh = (process.env.GOOGLE_DRIVE_REFRESH_TOKEN || "").trim();

  if (refresh) {
    if (cachedOAuth.token && cachedOAuth.expiresAt > now + 60000 && cachedOAuth.source === "oauth_refresh") {
      return { accessToken: cachedOAuth.token, source: cachedOAuth.source, email: cachedOAuth.email };
    }
    try {
      var tRefresh = await tokenFromRefreshToken();
      cachedOAuth = {
        token: tRefresh.accessToken,
        expiresAt: now + (tRefresh.expiresIn - 120) * 1000,
        source: tRefresh.source,
        email: tRefresh.email,
      };
      return { accessToken: tRefresh.accessToken, source: tRefresh.source, email: tRefresh.email };
    } catch (e) {
      console.warn("[drive-auth] refresh token", e.message);
      if (forUpload && !manual) throw e;
    }
  }

  if (manual) {
    return { accessToken: manual, source: "access_token_env", email: null };
  }

  if (forUpload) {
    return null;
  }

  var sa = parseServiceAccount();
  if (sa) {
    if (cachedSa.token && cachedSa.expiresAt > now + 60000) {
      return { accessToken: cachedSa.token, source: cachedSa.source, email: cachedSa.email };
    }
    try {
      var tSa = await tokenFromServiceAccount(sa);
      cachedSa = {
        token: tSa.accessToken,
        expiresAt: now + (tSa.expiresIn - 120) * 1000,
        source: tSa.source,
        email: tSa.email,
      };
      return { accessToken: tSa.accessToken, source: tSa.source, email: tSa.email };
    } catch (e) {
      console.warn("[drive-auth] service account", e.message);
    }
  }

  return null;
}

function getRootFolderId() {
  return (process.env.GOOGLE_DRIVE_FOLDER_ID || "").trim() || null;
}

function isDriveConfigured() {
  return !!(hasOAuthCredentials() || parseServiceAccount());
}

function isDriveUploadConfigured() {
  return hasOAuthCredentials();
}

function uploadConfigHint() {
  return (
    "Gmail perso : ajoutez GOOGLE_DRIVE_REFRESH_TOKEN (OAuth courtier972@gmail.com). " +
    "Le compte de service seul ne peut pas deposer de fichiers — voir docs/DRIVE-SETUP.md"
  );
}

async function testDriveConnection() {
  const rootId = getRootFolderId();
  if (!rootId) {
    return { ok: false, error: "GOOGLE_DRIVE_FOLDER_ID manquant" };
  }

  const auth = await getDriveAccessToken({ forUpload: false });
  if (!auth) {
    return {
      ok: false,
      error: "Configurez GOOGLE_DRIVE_REFRESH_TOKEN ou GOOGLE_SERVICE_ACCOUNT_JSON",
    };
  }

  const folderRes = await fetch(
    "https://www.googleapis.com/drive/v3/files/" +
      encodeURIComponent(rootId) +
      "?fields=id,name,mimeType,owners",
    { headers: { Authorization: "Bearer " + auth.accessToken } }
  );
  const folderData = await folderRes.json();
  if (!folderRes.ok) {
    return {
      ok: false,
      error: folderData.error?.message || "Dossier racine inaccessible",
      hint:
        "Verifiez que le dossier est partage avec le compte de service (editeur) ou que le token OAuth a acces au Drive courtier972@gmail.com",
    };
  }

  const listRes = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=" +
      encodeURIComponent("'" + rootId + "' in parents and trashed=false") +
      "&pageSize=5&fields=files(id,name,mimeType)",
    { headers: { Authorization: "Bearer " + auth.accessToken } }
  );
  const listData = await listRes.json();
  if (!listRes.ok) {
    return { ok: false, error: listData.error?.message || "Liste fichiers impossible" };
  }

  var uploadAuth = await getDriveAccessToken({ forUpload: true });
  var uploadTest = null;
  if (uploadAuth) {
    try {
      var probeName = "_drive_probe_" + Date.now() + ".txt";
      var boundary = "probe_" + Date.now();
      var meta = { name: probeName, parents: [rootId], mimeType: "text/plain" };
      var probeBody =
        "--" +
        boundary +
        "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(meta) +
        "\r\n--" +
        boundary +
        "\r\nContent-Type: text/plain\r\n\r\n" +
        "probe\r\n--" +
        boundary +
        "--";
      var probeRes = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + uploadAuth.accessToken,
            "Content-Type": "multipart/related; boundary=" + boundary,
          },
          body: probeBody,
        }
      );
      var probeData = await probeRes.json();
      if (!probeRes.ok) {
        uploadTest = { ok: false, error: probeData.error?.message || "Upload probe failed" };
      } else {
        uploadTest = { ok: true, fileId: probeData.id, fileName: probeData.name };
      }
    } catch (e) {
      uploadTest = { ok: false, error: e.message };
    }
  }

  return {
    ok: true,
    authSource: auth.source,
    serviceAccountEmail: auth.email,
    uploadConfigured: isDriveUploadConfigured(),
    uploadAuthSource: uploadAuth ? uploadAuth.source : null,
    uploadTest: uploadTest,
    uploadHint: !isDriveUploadConfigured() ? uploadConfigHint() : null,
    rootFolder: { id: folderData.id, name: folderData.name },
    sampleChildren: listData.files || [],
  };
}

module.exports = {
  getDriveAccessToken,
  getRootFolderId,
  isDriveConfigured,
  isDriveUploadConfigured,
  isServiceAccountQuotaError,
  uploadConfigHint,
  testDriveConnection,
};
