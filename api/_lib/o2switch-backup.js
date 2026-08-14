/**
 * Copie de secours des documents sur l’hébergement o2switch (disque PHP).
 * Vercel n’a pas de stockage persistant — le PHP `o2switch/lo-docs-backup.php`
 * reçoit le fichier en HTTPS et l’écrit hors webroot.
 */
const { UPLOAD_MAX_BYTES } = require("./upload-limits");

const PING_TIMEOUT_MS = 8000;
const UPLOAD_TIMEOUT_MS = 25000;

function getBackupUrl() {
  return String(process.env.O2SWITCH_BACKUP_URL || "").trim();
}

function getBackupSecret() {
  return String(process.env.O2SWITCH_BACKUP_SECRET || "").trim();
}

function isBackupConfigured() {
  return !!(getBackupUrl() && getBackupSecret());
}

function withTimeout(ms) {
  var ctrl = new AbortController();
  var t = setTimeout(function () {
    ctrl.abort();
  }, ms);
  return { signal: ctrl.signal, clear: function () { clearTimeout(t); } };
}

function backupAuthHeaders() {
  var secret = getBackupSecret();
  return {
    Authorization: "Bearer " + secret,
    "X-LO-Backup-Secret": secret,
    Accept: "application/json",
  };
}

async function testBackupConnection() {
  if (!isBackupConfigured()) {
    return {
      ok: false,
      configured: false,
      error: "O2SWITCH_BACKUP_URL et O2SWITCH_BACKUP_SECRET manquants",
    };
  }
  var url = getBackupUrl();
  var pingUrl = url + (url.indexOf("?") >= 0 ? "&" : "?") + "ping=1";
  var abort = withTimeout(PING_TIMEOUT_MS);
  try {
    var resp = await fetch(pingUrl, {
      method: "GET",
      headers: backupAuthHeaders(),
      signal: abort.signal,
    });
    var data = await resp.json().catch(function () {
      return {};
    });
    if (!resp.ok || data.ok === false) {
      return {
        ok: false,
        configured: true,
        status: resp.status,
        error: data.error || "Ping o2switch HTTP " + resp.status,
      };
    }
    return {
      ok: true,
      configured: true,
      writable: data.writable !== false,
      dataDir: data.dataDir || null,
      php: data.php || null,
    };
  } catch (e) {
    return {
      ok: false,
      configured: true,
      error: e.name === "AbortError" ? "Timeout ping o2switch" : e.message,
    };
  } finally {
    abort.clear();
  }
}

function safeSegment(value, fallback) {
  var s = String(value || "")
    .replace(/[^\w.\-@]+/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 80);
  return s || fallback || "fichier";
}

async function backupBuffer({ fileName, buffer, mimeType, contactId, subfolder, documentType }) {
  if (!isBackupConfigured()) {
    return { ok: false, skipped: true, reason: "not_configured" };
  }
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return { ok: false, error: "buffer requis" };
  }
  if (buffer.length > UPLOAD_MAX_BYTES) {
    return { ok: false, error: "Fichier trop volumineux pour la copie o2switch (max 12 Mo)" };
  }

  var abort = withTimeout(UPLOAD_TIMEOUT_MS);
  try {
    var resp = await fetch(getBackupUrl(), {
      method: "POST",
      headers: Object.assign(
        { "Content-Type": "application/json" },
        backupAuthHeaders()
      ),
      signal: abort.signal,
      body: JSON.stringify({
        secret: getBackupSecret(),
        fileName: safeSegment(fileName, "document"),
        mimeType: mimeType || "application/octet-stream",
        contactId: safeSegment(contactId, "sans_contact"),
        subfolder: safeSegment(subfolder, "01_identite"),
        documentType: documentType || "generic",
        contentBase64: buffer.toString("base64"),
        bytes: buffer.length,
      }),
    });
    var data = await resp.json().catch(function () {
      return {};
    });
    if (!resp.ok || data.ok === false) {
      return {
        ok: false,
        error: data.error || "Copie o2switch HTTP " + resp.status,
        status: resp.status,
      };
    }
    return {
      ok: true,
      path: data.path || null,
      relativePath: data.relativePath || null,
      bytes: data.bytes || buffer.length,
      storedAt: data.storedAt || new Date().toISOString(),
    };
  } catch (e) {
    return {
      ok: false,
      error: e.name === "AbortError" ? "Timeout copie o2switch" : e.message,
    };
  } finally {
    abort.clear();
  }
}

module.exports = {
  isBackupConfigured,
  testBackupConnection,
  backupBuffer,
  getBackupUrl,
  safeSegment,
};
