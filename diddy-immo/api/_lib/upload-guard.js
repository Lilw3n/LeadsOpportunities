/**
 * Garde-fou uploads Drive — PDF et images utiles uniquement (pas exé, HTML, SVG, etc.).
 */
var MAX_BYTES = 12 * 1024 * 1024;

var EXT_BY_MIME = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

var ALLOWED = {
  document: ["application/pdf", "image/jpeg", "image/png"],
  photo: ["image/jpeg", "image/png", "image/webp"],
};

var BLOCKED_EXT =
  /\.(exe|msi|bat|cmd|com|scr|pif|js|mjs|cjs|html?|htm|svg|xml|php|asp|aspx|jar|zip|rar|7z|tar|gz|bz2|dmg|apk|deb|rpm|vbs|wsf|ps1|sh|dll|so|docm|xlsm|pptm)$/i;

function decodeBase64(base64) {
  if (!base64) throw new Error("Fichier vide");
  var raw = String(base64).replace(/^data:[^;]+;base64,/, "").trim();
  if (!raw) throw new Error("Fichier vide");
  var buffer = Buffer.from(raw, "base64");
  if (!buffer.length) throw new Error("Fichier vide");
  if (buffer.length > MAX_BYTES) throw new Error("Fichier trop volumineux (max 12 Mo)");
  return buffer;
}

function detectMime(buffer) {
  if (buffer.length >= 5 && buffer.slice(0, 5).toString("ascii") === "%PDF-") {
    return "application/pdf";
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.slice(0, 4).toString("ascii") === "RIFF" &&
    buffer.slice(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

function sanitizeBaseName(name) {
  var base = String(name || "document")
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    .replace(/[^\w.\-()+\s]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 120);
  if (!base || base === "." || base === "..") return "document";
  return base;
}

function safeFileName(originalName, mime) {
  var ext = EXT_BY_MIME[mime] || "";
  var base = sanitizeBaseName(originalName).replace(/\.[^.]+$/, "");
  if (BLOCKED_EXT.test(originalName) || BLOCKED_EXT.test(base)) {
    throw new Error("Extension de fichier non autorisee");
  }
  return base + ext;
}

/**
 * @param {{ base64: string, fileName?: string, mimeType?: string, kind?: 'document'|'photo' }} opts
 * @returns {{ buffer: Buffer, mimeType: string, fileName: string, size: number }}
 */
function validateUpload(opts) {
  opts = opts || {};
  var kind = opts.kind === "photo" ? "photo" : "document";
  var allowed = ALLOWED[kind] || ALLOWED.document;
  var buffer = decodeBase64(opts.base64);
  var detected = detectMime(buffer);

  if (!detected) {
    throw new Error("Format non autorise — deposez un PDF ou une image JPG/PNG uniquement");
  }
  if (allowed.indexOf(detected) < 0) {
    throw new Error(
      kind === "photo"
        ? "Photo non autorisee — JPG, PNG ou WebP uniquement"
        : "Document non autorise — PDF, JPG ou PNG uniquement"
    );
  }

  var declared = String(opts.mimeType || "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (declared && declared !== "application/octet-stream" && declared !== detected) {
    throw new Error("Le type declare ne correspond pas au fichier");
  }

  if (detected === "application/pdf" && buffer.slice(0, 1024).toString("latin1").indexOf("/JavaScript") >= 0) {
    throw new Error("PDF avec script embarque refuse");
  }

  var fileName = safeFileName(opts.fileName || "document", detected);
  return {
    buffer: buffer,
    mimeType: detected,
    fileName: fileName,
    size: buffer.length,
  };
}

module.exports = {
  MAX_BYTES: MAX_BYTES,
  ALLOWED: ALLOWED,
  validateUpload: validateUpload,
  detectMime: detectMime,
  safeFileName: safeFileName,
};
