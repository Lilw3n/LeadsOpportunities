/**
 * GET /api/drive/config — indicateurs config Drive (sans secret, sans auth).
 */
const { applyApiGuards } = require("../security");
const {
  isDriveConfigured,
  isDriveUploadConfigured,
  getRootFolderId,
  testDriveConnection,
} = require("../google-drive-auth");
const { isGoogleConfigured } = require("../google-oauth");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  var connection = null;
  if (isDriveConfigured() && getRootFolderId()) {
    try {
      connection = await testDriveConnection();
    } catch (e) {
      connection = { ok: false, error: e.message };
    }
  }

  return res.status(200).json({
    ok: true,
    folderIdConfigured: !!getRootFolderId(),
    refreshTokenConfigured: isDriveUploadConfigured(),
    driveConfigured: isDriveConfigured(),
    googleOAuthConfigured: isGoogleConfigured(),
    ready:
      isDriveConfigured() &&
      !!getRootFolderId() &&
      isDriveUploadConfigured() &&
      !!(connection && connection.ok && connection.uploadTest && connection.uploadTest.ok),
    uploadWorks: !!(connection && connection.uploadTest && connection.uploadTest.ok),
    connection: connection,
    setupUrl: "https://www.leadsopportunities.fr/test-drive.html",
    rootFolderId: getRootFolderId() || null,
    immoRootHint: "Les pièces vendeur sont dans Clients_LeadsOpportunities/Immo/2026/",
  });
};
