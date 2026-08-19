/**
 * GET /api/external/google?returnTo=... — OAuth Google portail client
 */
const { applyApiGuards } = require("../security");
const { isGoogleConfigured, signOAuthState, buildGoogleAuthUrl, getAppUrl } = require("../google-oauth");
const { safeReturnPath } = require("../external-client-auth");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (!isGoogleConfigured()) {
    var msg = encodeURIComponent("Connexion Google non configurée sur le serveur.");
    res.writeHead(302, { Location: getAppUrl() + "/external/login.html?oauth_error=" + msg });
    res.end();
    return;
  }

  var url = new URL(req.url, "http://localhost");
  var returnTo = safeReturnPath(url.searchParams.get("returnTo") || "/external/dashboard.html");
  try {
    var state = signOAuthState({ purpose: "external_client", returnTo: returnTo });
    res.writeHead(302, { Location: buildGoogleAuthUrl(state) });
    res.end();
  } catch (e) {
    console.error("[external/google-start]", e);
    res.writeHead(302, {
      Location: getAppUrl() + "/external/login.html?oauth_error=" + encodeURIComponent("Connexion Google indisponible"),
    });
    res.end();
  }
};
