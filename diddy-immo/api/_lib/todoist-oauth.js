const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { requireJwtSecret } = require("./security");

function getAppUrl() {
  var raw =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.leadsopportunities.fr";
  return String(raw)
    .trim()
    .replace(/[\r\n\t]/g, "")
    .replace(/\/$/, "");
}

function getRedirectUri() {
  return getAppUrl() + "/api/auth/todoist-callback";
}

function isTodoistOAuthConfigured() {
  return !!(process.env.TODOIST_CLIENT_ID && process.env.TODOIST_CLIENT_SECRET);
}

function signTodoistOAuthState(opts) {
  var o = opts || {};
  return jwt.sign(
    {
      purpose: "todoist_oauth",
      userId: o.userId || "",
      n: crypto.randomBytes(16).toString("hex"),
      returnTo: o.returnTo || "/crm-todoist.html",
    },
    requireJwtSecret(),
    { expiresIn: "15m", algorithm: "HS256" }
  );
}

function verifyTodoistOAuthState(state) {
  var decoded = jwt.verify(state, requireJwtSecret(), { algorithms: ["HS256"] });
  if (!decoded || decoded.purpose !== "todoist_oauth") {
    throw new Error("Invalid oauth state");
  }
  return decoded;
}

var SCOPES = "data:read,data:read_write,task:add";

function buildTodoistAuthUrl(state) {
  var params = new URLSearchParams({
    client_id: process.env.TODOIST_CLIENT_ID,
    scope: SCOPES,
    state: state,
    response_type: "code",
    redirect_uri: getRedirectUri(),
  });
  return "https://app.todoist.com/oauth/authorize?" + params.toString();
}

async function exchangeTodoistCode(code) {
  var body = new URLSearchParams({
    client_id: process.env.TODOIST_CLIENT_ID,
    client_secret: process.env.TODOIST_CLIENT_SECRET,
    code: code,
    redirect_uri: getRedirectUri(),
  });
  var res = await fetch("https://api.todoist.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  var data = await res.json().catch(function () {
    return {};
  });
  if (!res.ok || !data.access_token) {
    throw new Error(data.error || data.error_description || "Echange jeton Todoist impossible");
  }
  return data.access_token;
}

module.exports = {
  getAppUrl,
  getRedirectUri,
  isTodoistOAuthConfigured,
  signTodoistOAuthState,
  verifyTodoistOAuthState,
  buildTodoistAuthUrl,
  exchangeTodoistCode,
  SCOPES: SCOPES,
};
