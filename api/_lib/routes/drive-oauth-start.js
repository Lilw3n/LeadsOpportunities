/**
 * GET /api/drive/oauth-start — admin : lancer OAuth Drive courtier972@gmail.com
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { isGoogleConfigured, signOAuthState, buildGoogleDriveAuthUrl, getAppUrl } = require("../google-oauth");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;
  if (user.role !== "admin" && user.crmRole !== "admin") {
    return res.status(403).json({ error: "Admin requis" });
  }

  if (!isGoogleConfigured()) {
    return res.status(400).json({
      error: "GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET requis sur Vercel",
    });
  }

  try {
    const state = signOAuthState({
      purpose: "google_drive",
      userId: user.userId || user.id || "",
      returnTo: "/test-drive.html",
    });
    const loginHint =
      (process.env.GOOGLE_DRIVE_USER_EMAIL || "courtier972@gmail.com").trim() || "courtier972@gmail.com";
    const url = buildGoogleDriveAuthUrl(state, loginHint);
    res.writeHead(302, { Location: url });
    res.end();
  } catch (e) {
    console.error("[drive/oauth-start]", e);
    return res.status(500).json({ error: e.message || "OAuth Drive indisponible" });
  }
};
