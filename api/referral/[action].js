const { setCors } = require("../_lib/auth");

const ROUTES = {
  lookup: () => require("../_lib/routes/referral-lookup"),
  visit: () => require("../_lib/routes/referral-visit"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) return res.status(404).json({ error: "Route parrainage inconnue" });
  return load()(req, res);
};
