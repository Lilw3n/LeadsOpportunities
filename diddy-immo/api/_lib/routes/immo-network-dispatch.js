/**
 * Dispatch /api/immo-network et /api/immo-network/:op
 * (routé via api/[action].js pour respecter la limite Hobby 12 fonctions).
 */
module.exports = async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  // Sous-action : rewrite vercel (?op=) ou chemin historique
  let op = String(url.searchParams.get("op") || "").trim();
  if (!op) {
    const pathAction = String(req.query.action || "").trim();
    if (pathAction && pathAction !== "immo-network") op = pathAction;
  }

  if (op === "register") {
    return require("./immo-network-register")(req, res);
  }
  if (op === "login") {
    return require("./immo-network-login")(req, res);
  }

  if (op && op !== "api" && op !== "immo-network") {
    url.searchParams.set("op", op);
    req.url = url.pathname + "?" + url.searchParams.toString();
  }

  return require("./immo-network-api")(req, res);
};
