const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const {
  isGoogleConfigured,
  signOAuthState,
  buildGoogleCalendarAuthUrl,
  getAppUrl,
} = require("../google-oauth");
const { getCalendarConnectionStatus } = require("../google-calendar");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const url = new URL(req.url, "http://localhost");
  const action = url.searchParams.get("action") || "status";

  if (req.method === "GET" && action === "status") {
    try {
      const status = await getCalendarConnectionStatus(user.id);
      return res.status(200).json({ ok: true, ...status, email: user.email });
    } catch (e) {
      console.error("[crm/calendar-sync status]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "GET" && action === "pull") {
    const pull = require("./crm-calendar-pull");
    return pull(req, res);
  }

  if (req.method === "GET" && action === "connect") {
    if (!isGoogleConfigured()) {
      return res.status(500).json({
        error: "Google non configure. Ajoutez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.",
      });
    }
    const returnTo = url.searchParams.get("returnTo") || "/crm-calendar.html";
    const state = signOAuthState({
      purpose: "google_calendar",
      userId: user.id,
      returnTo: returnTo,
    });
    const authUrl = buildGoogleCalendarAuthUrl(
      state,
      user.email === "courtier972@gmail.com" ? user.email : undefined
    );
    return res.status(200).json({ ok: true, url: authUrl });
  }

  if (req.method === "POST") {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    if (body.action === "connect") {
      if (!isGoogleConfigured()) {
        return res.status(500).json({ error: "Google non configure." });
      }
      const returnTo = body.returnTo || "/crm-calendar.html";
      const state = signOAuthState({
        purpose: "google_calendar",
        userId: user.id,
        returnTo: returnTo,
      });
      const authUrl = buildGoogleCalendarAuthUrl(state, user.email);
      return res.status(200).json({ ok: true, url: authUrl });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
