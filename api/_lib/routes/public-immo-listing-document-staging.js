/**
 * POST /api/immo-listing-document-staging
 * Upload immédiat vers Drive (dossier staging par session) — avant validation du dossier vendeur.
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { uploadBase64File } = require("../drive-upload-core");
const {
  ensureStagingClassifiedFolder,
  resolveVendeurDocumentFolder,
} = require("../immo-drive");
const { isDriveUploadConfigured } = require("../google-drive-auth");

function str(v, max) {
  return String(v == null ? "" : v).trim().slice(0, max || 200);
}

module.exports = async function publicImmoListingDocumentStaging(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var ip = getClientIp(req);
  var rl = rateLimit("immo-listing-doc-staging:" + ip, 60, 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(Math.ceil(rl.retryAfterMs / 1000)));
    return res.status(429).json({ error: "Trop de requêtes" });
  }

  var parsed = parseJsonBody(req, 14 * 1024 * 1024);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  var body = parsed.body || {};

  var depositSessionId = str(body.depositSessionId || body.deposit_session_id, 80);
  var fileName = str(body.fileName, 180);
  var documentType = str(body.documentType, 80) || "autre_doc";
  var documentGroup = str(body.documentGroup, 80);

  if (!depositSessionId || !fileName || !body.fileBase64) {
    return res.status(400).json({
      ok: false,
      error: "depositSessionId, fileName et fileBase64 requis",
    });
  }

  if (!/^dep_|^d_/.test(depositSessionId)) {
    return res.status(400).json({ ok: false, error: "depositSessionId invalide" });
  }

  try {
    var classified = resolveVendeurDocumentFolder({
      documentGroup: documentGroup,
      documentType: documentType,
      fileName: fileName,
      mimeType: body.mimeType,
    });

    var staging = await ensureStagingClassifiedFolder(depositSessionId, classified);
    if (staging.simulated && isDriveUploadConfigured()) {
      return res.status(503).json({
        ok: false,
        error: "Upload Drive staging echoue — vérifiez la configuration Google Drive.",
      });
    }

    var targetFolder = staging.classifiedFolderId || staging.folderId;
    var uploaded = await uploadBase64File({
      fileName: documentType + "_" + fileName,
      base64: body.fileBase64,
      mimeType: body.mimeType || "application/octet-stream",
      folderId: targetFolder,
      kind: "document",
    });

    if (uploaded.simulated && isDriveUploadConfigured()) {
      return res.status(503).json({
        ok: false,
        error: "Google Drive non disponible — réessayez ou contactez votre conseiller",
        drive: uploaded,
      });
    }

    return res.status(201).json({
      ok: true,
      staging: true,
      depositSessionId: depositSessionId,
      documentType: documentType,
      classifiedAs: classified,
      drive: uploaded,
    });
  } catch (e) {
    console.error("[immo-listing-document-staging]", e);
    var msg = e.message || "Erreur upload staging";
    var code = /non autorise|refuse|correspond pas|volumineux|vide/i.test(msg) ? 400 : 502;
    return res.status(code).json({ ok: false, error: msg });
  }
};
