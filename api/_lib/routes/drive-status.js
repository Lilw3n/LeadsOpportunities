/**
 * GET /api/drive/status — test configuration Drive (admin CRM)
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { isDriveConfigured, isDriveUploadConfigured, getRootFolderId, testDriveConnection, uploadConfigHint } =
  require("../google-drive-auth");
const { getSql } = require("../db");
const { ensureClientDriveFolders } = require("../drive-folders");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;
  if (user.role !== "admin" && user.crmRole !== "admin") {
    return res.status(403).json({ error: "Admin requis pour ce test" });
  }

  const url = new URL(req.url, "http://localhost");
  const contactId = url.searchParams.get("contactId");

  try {
    const status = {
      configured: isDriveConfigured(),
      uploadConfigured: isDriveUploadConfigured(),
      rootFolderId: getRootFolderId() || null,
      hasServiceAccount: !!(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "").trim(),
      hasRefreshToken: !!(process.env.GOOGLE_DRIVE_REFRESH_TOKEN || "").trim(),
      hasManualToken: !!(process.env.GOOGLE_DRIVE_ACCESS_TOKEN || "").trim(),
      uploadHint: !isDriveUploadConfigured() ? uploadConfigHint() : null,
    };

    if (!status.configured || !status.rootFolderId) {
      return res.status(200).json({
        ok: false,
        ...status,
        error: "Variables manquantes — voir docs/DRIVE-SETUP.md",
      });
    }

    const test = await testDriveConnection();
    if (!test.ok) {
      return res.status(200).json({ ok: false, ...status, ...test });
    }

    var folderTest = null;
    if (contactId) {
      const sql = getSql();
      if (sql) {
        folderTest = await ensureClientDriveFolders(contactId);
      }
    }

    return res.status(200).json({
      ok: true,
      ...status,
      connection: test,
      contactFolder: folderTest,
    });
  } catch (e) {
    console.error("[drive/status]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
