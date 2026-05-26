const { applyApiGuards } = require("../security");
const {
  isGoogleConfigured,
  signOAuthState,
  buildGoogleAuthUrl,
  getAppUrl,
} = require("../google-oauth");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (!isGoogleConfigured()) {
    const msg = encodeURIComponent(
      "Connexion Google non configuree. Ajoutez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET sur Vercel."
    );
    res.writeHead(302, { Location: getAppUrl() + "/auth.html?oauth_error=" + msg });
    res.end();
    return;
  }

  const url = new URL(req.url, "http://localhost");
  const returnTo = url.searchParams.get("returnTo") || "";
  try {
    const state = signOAuthState(returnTo);
    res.writeHead(302, { Location: buildGoogleAuthUrl(state) });
    res.end();
  } catch (e) {
    console.error("[auth/google-start]", e);
    const msg = encodeURIComponent(
      e && e.message && e.message.indexOf("JWT_SECRET") !== -1
        ? "JWT_SECRET manquant ou trop court sur Vercel (minimum 32 caracteres)."
        : "Connexion Google indisponible, verifiez la configuration Vercel."
    );
    res.writeHead(302, { Location: getAppUrl() + "/auth.html?oauth_error=" + msg });
    res.end();
  }
};
