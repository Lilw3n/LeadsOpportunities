const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const {
  isTodoistOAuthConfigured,
  signTodoistOAuthState,
  buildTodoistAuthUrl,
  getAppUrl,
} = require("../todoist-oauth");

module.exports = async function (req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  var user = await requireCrm(req, res);
  if (!user) return;

  if (!isTodoistOAuthConfigured()) {
    var msg = encodeURIComponent(
      "Todoist OAuth non configuré. Ajoutez TODOIST_CLIENT_ID et TODOIST_CLIENT_SECRET, ou un TODOIST_API_TOKEN."
    );
    res.writeHead(302, { Location: getAppUrl() + "/crm-todoist.html?todoist_error=" + msg });
    res.end();
    return;
  }

  var url = new URL(req.url, "http://localhost");
  var returnTo = url.searchParams.get("returnTo") || "/crm-todoist.html";
  try {
    var state = signTodoistOAuthState({ userId: user.id, returnTo: returnTo });
    res.writeHead(302, { Location: buildTodoistAuthUrl(state) });
    res.end();
  } catch (e) {
    console.error("[auth/todoist-start]", e);
    var err = encodeURIComponent(
      e && e.message && e.message.indexOf("JWT_SECRET") !== -1
        ? "JWT_SECRET manquant ou trop court sur Vercel."
        : "Connexion Todoist indisponible."
    );
    res.writeHead(302, { Location: getAppUrl() + "/crm-todoist.html?todoist_error=" + err });
    res.end();
  }
};
