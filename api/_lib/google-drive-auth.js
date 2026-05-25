/**
 * Authentification Google Drive pour Vercel.
 * Priorite : compte de service (JSON) > token OAuth manuel.
 */
const jwt = require("jsonwebtoken");

let cached = { token: null, expiresAt: 0 };

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

/**
 * Retourne un access token Drive valide.
 */
async function getDriveAccessToken() {
  const manual = (process.env.GOOGLE_DRIVE_ACCESS_TOKEN || "").trim();
  const now = Date.now();

  if (cached.token && cached.expiresAt > now + 60000) {
    return { accessToken: cached.token, source: cached.source, email: cached.email };
  }

  const sa = parseServiceAccount();
  if (sa) {
    const t = await tokenFromServiceAccount(sa);
    cached = {
      token: t.accessToken,
      expiresAt: now + (t.expiresIn - 120) * 1000,
      source: t.source,
      email: t.email,
    };
    return { accessToken: t.accessToken, source: t.source, email: t.email };
  }

  if (manual) {
    return { accessToken: manual, source: "access_token_env", email: null };
  }

  return null;
}

function getRootFolderId() {
  return (process.env.GOOGLE_DRIVE_FOLDER_ID || "").trim() || null;
}

function isDriveConfigured() {
  return !!(parseServiceAccount() || (process.env.GOOGLE_DRIVE_ACCESS_TOKEN || "").trim());
}

async function testDriveConnection() {
  const rootId = getRootFolderId();
  if (!rootId) {
    return { ok: false, error: "GOOGLE_DRIVE_FOLDER_ID manquant" };
  }

  const auth = await getDriveAccessToken();
  if (!auth) {
    return {
      ok: false,
      error: "Configurez GOOGLE_SERVICE_ACCOUNT_JSON ou GOOGLE_DRIVE_ACCESS_TOKEN",
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
        "Verifiez que le dossier est partage avec le compte de service (editeur) ou que le token a acces au Drive courtier972@gmail.com",
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

  return {
    ok: true,
    authSource: auth.source,
    serviceAccountEmail: auth.email,
    rootFolder: { id: folderData.id, name: folderData.name },
    sampleChildren: listData.files || [],
  };
}

module.exports = {
  getDriveAccessToken,
  getRootFolderId,
  isDriveConfigured,
  testDriveConnection,
};
