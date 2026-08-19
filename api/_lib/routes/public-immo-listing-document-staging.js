/**
 * POST /api/immo-listing-document-staging
 * Upload immédiat vers Drive (hiérarchie paresseuse) — avant validation du dossier vendeur.
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { uploadBase64File } = require("../drive-upload-core");
const { resolveVendeurUploadFolder } = require("../immo-drive-hierarchy");
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
  var documentLabel = str(body.documentLabel, 120);
  var ownerIndex = typeof body.ownerIndex === "number" ? body.ownerIndex : parseInt(body.ownerIndex, 10);
  if (!isFinite(ownerIndex) || ownerIndex < 0) ownerIndex = 0;
  var fileIndex = typeof body.fileIndex === "number" ? body.fileIndex : parseInt(body.fileIndex, 10);
  if (!isFinite(fileIndex) || fileIndex < 0) fileIndex = 0;

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
    var hierarchy = await resolveVendeurUploadFolder({
      depositSessionId: depositSessionId,
      property: {
        id: null,
        city: body.city || body.sellCity,
        postal_code: body.postal_code || body.sellPostalCode,
      },
      owners: body.owners,
      depositor: body.depositor || {
        firstName: body.depositorFirstName || body.firstName,
        lastName: body.depositorLastName || body.lastName,
      },
      documentType: documentType,
      documentGroup: documentGroup,
      documentLabel: documentLabel,
      ownerIndex: ownerIndex,
      fileIndex: fileIndex,
      originalFileName: fileName,
      fileName: fileName,
      mimeType: body.mimeType,
    });

    if (hierarchy.simulated && isDriveUploadConfigured()) {
      return res.status(503).json({
        ok: false,
        error: "Upload Drive staging echoue — vérifiez la configuration Google Drive.",
      });
    }

    var uploaded = await uploadBase64File({
      fileName: hierarchy.driveFileName || fileName,
      base64: body.fileBase64,
      mimeType: body.mimeType || "application/octet-stream",
      folderId: hierarchy.folderId,
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
      drivePath: hierarchy.path || null,
      drive: uploaded,
    });
  } catch (e) {
    console.error("[immo-listing-document-staging]", e);
    var msg = e.message || "Erreur upload staging";
    var code = /non autorise|refuse|correspond pas|volumineux|vide/i.test(msg) ? 400 : 502;
    return res.status(code).json({ ok: false, error: msg });
  }
};
