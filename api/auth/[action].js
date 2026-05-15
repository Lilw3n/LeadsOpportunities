const { setCors } = require("../_lib/auth");

const ROUTES = {
  login: () => require("../_lib/routes/login"),
  register: () => require("../_lib/routes/register"),
  me: () => require("../_lib/routes/me"),
  "change-password": () => require("../_lib/routes/change-password"),
  "forgot-password": () => require("../_lib/routes/forgot-password"),
  "reset-password": () => require("../_lib/routes/reset-password"),
};

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) {
    return res.status(404).json({ error: "Route auth inconnue" });
  }
  return load()(req, res);
};
