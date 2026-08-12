/**
 * GET/POST /api/drive/immo — cloud immobilier (Google Drive) par bien.
 *
 * GET  ?propertyId=&folderId=  — statut + liste
 * POST { action: ensure|upload|list, property, fileName, base64, mimeType, confidential, hint, folderId, subfolder }
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { uploadBase64File } = require("../drive-upload-core");
const {
  IMMO_SUBFOLDERS,
  classifyImmoFile,
  ensurePropertyDriveFolders,
  listFolderFiles,
} = require("../immo-drive");
const { isDriveConfigured } = require("../google-drive-auth");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  try {
    if (req.method === "GET") {
      const folderId = req.query.folderId || "";
      const subfolder = req.query.subfolder || "";
      if (!folderId) {
        return res.status(200).json({
          ok: true,
          configured: isDriveConfigured(),
          subfolders: IMMO_SUBFOLDERS,
          files: [],
          message: isDriveConfigured()
            ? "Appelez ensure puis list avec folderId"
            : "Drive non configuré — UI locale disponible",
        });
      }
      // If subfolder provided as drive id, list it; else list root property folder
      const target = subfolder || folderId;
      const listed = await listFolderFiles(target, 80);
      return res.status(200).json({
        ok: true,
        configured: listed.configured,
        files: listed.files,
        subfolders: IMMO_SUBFOLDERS,
      });
    }

    if (req.method === "POST") {
      const parsed = parseJsonBody(req, 14 * 1024 * 1024);
      if (parsed.error) return res.status(400).json({ error: parsed.error });
      const body = parsed.body || {};
      const action = body.action || "ensure";

      if (action === "ensure") {
        const property = body.property || {};
        const ensured = await ensurePropertyDriveFolders(property);
        return res.status(200).json(ensured);
      }

      if (action === "classify") {
        const sub = classifyImmoFile({
          fileName: body.fileName,
          mimeType: body.mimeType,
          confidential: body.confidential,
          hint: body.hint,
        });
        return res.status(200).json({ ok: true, subfolder: sub, subfolders: IMMO_SUBFOLDERS });
      }

      if (action === "upload") {
        const property = body.property || {};
        let folderMap = body.subfolderIds || null;
        let propFolderId = body.folderId || property.drive_folder_id || null;

        if (!propFolderId || !folderMap) {
          const ensured = await ensurePropertyDriveFolders(property);
          propFolderId = ensured.folderId || propFolderId;
          folderMap = ensured.subfolderIds || folderMap;
          if (ensured.simulated) {
            return res.status(200).json({
              ok: true,
              simulated: true,
              configured: false,
              message: ensured.message,
              classifiedAs: classifyImmoFile(body),
              fileName: body.fileName,
            });
          }
        }

        const classified = body.subfolder || classifyImmoFile(body);
        const target =
          (folderMap && folderMap[classified] && folderMap[classified].id) || propFolderId;

        const uploaded = await uploadBase64File({
          fileName: body.fileName || "fichier",
          base64: body.base64,
          mimeType: body.mimeType || "application/octet-stream",
          folderId: target,
        });

        return res.status(200).json({
          ok: true,
          configured: !uploaded.simulated,
          classifiedAs: classified,
          folderId: propFolderId,
          subfolderIds: folderMap,
          file: uploaded,
        });
      }

      if (action === "list") {
        const folderId = body.folderId;
        if (!folderId) return res.status(400).json({ error: "folderId requis" });
        const listed = await listFolderFiles(body.subfolderId || folderId, body.pageSize || 80);
        return res.status(200).json({ ok: true, ...listed, subfolders: IMMO_SUBFOLDERS });
      }

      return res.status(400).json({ error: "action invalide" });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("[drive/immo]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur Drive immo" });
  }
};
