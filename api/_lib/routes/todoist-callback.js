const { applyApiGuards } = require("../security");
const {
  getAppUrl,
  verifyTodoistOAuthState,
  exchangeTodoistCode,
} = require("../todoist-oauth");
const { saveUserConnection } = require("../todoist");

function redirect(res, path) {
  res.writeHead(302, { Location: getAppUrl() + path });
  res.end();
}

module.exports = async function (req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  var url = new URL(req.url, "http://localhost");
  var errParam = url.searchParams.get("error");
  if (errParam) {
    redirect(res, "/crm-todoist.html?todoist_error=" + encodeURIComponent(errParam));
    return;
  }

  var code = url.searchParams.get("code");
  var state = url.searchParams.get("state");
  if (!code || !state) {
    redirect(res, "/crm-todoist.html?todoist_error=" + encodeURIComponent("Réponse Todoist incomplète"));
    return;
  }

  try {
    var decoded = verifyTodoistOAuthState(state);
    var token = await exchangeTodoistCode(code);
    if (decoded.userId) {
      await saveUserConnection(decoded.userId, token, null);
    }
    var dest = decoded.returnTo && decoded.returnTo.indexOf("/crm") === 0 ? decoded.returnTo : "/crm-todoist.html";
    var sep = dest.indexOf("?") >= 0 ? "&" : "?";
    redirect(res, dest + sep + "todoist=connected");
  } catch (e) {
    console.error("[auth/todoist-callback]", e);
    redirect(
      res,
      "/crm-todoist.html?todoist_error=" + encodeURIComponent(e.message || "Connexion Todoist échouée")
    );
  }
};
