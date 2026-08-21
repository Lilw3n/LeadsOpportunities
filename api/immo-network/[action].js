const { setCors } = require("../_lib/auth");

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = String(req.query.action || "");
  if (action === "register") {
    return require("../_lib/routes/immo-network-register")(req, res);
  }
  if (action === "login") {
    return require("../_lib/routes/immo-network-login")(req, res);
  }

  // Inject op from path action when useful
  const url = new URL(req.url, "http://localhost");
  if (!url.searchParams.get("op") && action && action !== "api") {
    url.searchParams.set("op", action === "me" ? "me" : action);
    req.url = url.pathname + "?" + url.searchParams.toString();
  }

  return require("../_lib/routes/immo-network-api")(req, res);
};
