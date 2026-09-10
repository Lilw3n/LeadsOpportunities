const { setCors } = require("../_lib/auth");

const ROUTES = {
  login: () => require("../_lib/routes/login"),
  register: () => require("../_lib/routes/register"),
  me: () => require("../_lib/routes/me"),
  "change-password": () => require("../_lib/routes/change-password"),
  "forgot-password": () => require("../_lib/routes/forgot-password"),
  "reset-password": () => require("../_lib/routes/reset-password"),
  google: () => require("../_lib/routes/google-start"),
  "google-callback": () => require("../_lib/routes/google-callback"),
  "google-config-env": () => require("../_lib/routes/google-config-env"),
  "reviews-official-env": () => require("../_lib/routes/reviews-official-env"),
  todoist: () => require("../_lib/routes/todoist-start"),
  "todoist-callback": () => require("../_lib/routes/todoist-callback"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) {
    return res.status(404).json({ error: "Route auth inconnue" });
  }
  return load()(req, res);
};
