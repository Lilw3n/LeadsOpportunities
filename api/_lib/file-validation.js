/**
 * Validation serveur des pièces jointes (PDF, images) avant envoi Drive.
 */
const ALLOWED = {
  "application/pdf": { ext: [".pdf"], magic: [[0x25, 0x50, 0x44, 0x46]] },
  "image/jpeg": { ext: [".jpg", ".jpeg"], magic: [[0xff, 0xd8, 0xff]] },
  "image/png": { ext: [".png"], magic: [[0x89, 0x50, 0x4e, 0x47]] },
  "image/webp": { ext: [".webp"], magic: [[0x52, 0x49, 0x46, 0x46]] },
};

const MAX_BYTES = 12 * 1024 * 1024;

function sanitizeFileName(name) {
  var base = String(name || "document")
    .replace(/[/\\<>:"|?*\x00-\x1f]/g, "_")
    .replace(/\.\./g, "_")
    .trim();
  if (!base || base === "." || base === "..") base = "document";
  return base.slice(0, 180);
}

function extOf(name) {
  var m = String(name || "").toLowerCase().match(/(\.[a-z0-9]{1,8})$/i);
  return m ? m[1] : "";
}

function matchesMagic(buffer, signatures) {
  if (!buffer || !buffer.length) return false;
  return signatures.some(function (sig) {
    if (buffer.length < sig.length) return false;
    for (var i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) return false;
    }
    return true;
  });
}

function detectMime(buffer, fileName, declared) {
  var ext = extOf(fileName);
  var keys = Object.keys(ALLOWED);
  for (var i = 0; i < keys.length; i++) {
    var mime = keys[i];
    var rule = ALLOWED[mime];
    if (matchesMagic(buffer, rule.magic)) return mime;
  }
  if (declared && ALLOWED[declared]) return declared;
  if (ext && ext === ".pdf") return "application/pdf";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return null;
}

function validateUploadBuffer(buffer, fileName, declaredMime) {
  if (!buffer || !buffer.length) {
    return { ok: false, error: "fichier_vide", message: "Fichier vide." };
  }
  if (buffer.length > MAX_BYTES) {
    return { ok: false, error: "fichier_trop_lourd", message: "Fichier trop volumineux (max 12 Mo)." };
  }
  var mime = detectMime(buffer, fileName, declaredMime);
  if (!mime || !ALLOWED[mime]) {
    return {
      ok: false,
      error: "type_non_autorise",
      message: "Type de fichier non accepté. Formats autorisés : PDF, JPG, PNG, WEBP.",
    };
  }
  var ext = extOf(fileName);
  if (ext && ALLOWED[mime].ext.indexOf(ext) === -1) {
    return {
      ok: false,
      error: "extension_invalide",
      message: "Extension incompatible avec le contenu du fichier.",
    };
  }
  return {
    ok: true,
    mimeType: mime,
    fileName: sanitizeFileName(fileName),
    size: buffer.length,
  };
}

function parseBase64Payload(base64) {
  var raw = String(base64 || "").replace(/^data:[^;]+;base64,/, "");
  return Buffer.from(raw, "base64");
}

module.exports = {
  ALLOWED_MIME_TYPES: Object.keys(ALLOWED),
  MAX_BYTES: MAX_BYTES,
  sanitizeFileName: sanitizeFileName,
  validateUploadBuffer: validateUploadBuffer,
  parseBase64Payload: parseBase64Payload,
};
