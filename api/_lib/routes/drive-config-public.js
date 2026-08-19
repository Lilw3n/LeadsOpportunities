/**
 * GET /api/drive/config — indicateurs config Drive (sans secret, sans auth).
 */
const { applyApiGuards } = require("../security");
const {
  isDriveConfigured,
  isDriveUploadConfigured,
  getRootFolderId,
} = require("../google-drive-auth");
const { isGoogleConfigured } = require("../google-oauth");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  return res.status(200).json({
    ok: true,
    folderIdConfigured: !!getRootFolderId(),
    refreshTokenConfigured: isDriveUploadConfigured(),
    driveConfigured: isDriveConfigured(),
    googleOAuthConfigured: isGoogleConfigured(),
    ready: isDriveConfigured() && !!getRootFolderId() && isDriveUploadConfigured(),
    setupUrl: "https://www.leadsopportunities.fr/test-drive.html",
    rootFolderId: getRootFolderId() || null,
  });
};
