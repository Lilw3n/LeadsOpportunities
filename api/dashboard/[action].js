const { setCors } = require("../_lib/auth");

const ROUTES = {
  stats: () => require("../_lib/routes/stats"),
  leads: () => require("../_lib/routes/leads"),
  "lead-update": () => require("../_lib/routes/lead-update"),
  "lead-detail": () => require("../_lib/routes/lead-detail"),
  partners: () => require("../_lib/routes/partners-admin"),
};

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) {
    return res.status(404).json({ error: "Route dashboard inconnue" });
  }
  return load()(req, res);
};
