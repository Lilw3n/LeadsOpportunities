const { setCors } = require("./_lib/auth");

const ROUTES = {
  lead: () => require("./_lib/routes/public-lead"),
  "lead-touchpoint": () => require("./_lib/routes/public-lead-touchpoint"),
  "cross-sell": () => require("./_lib/routes/public-cross-sell"),
  "eligibility-check": () => require("./_lib/routes/public-eligibility-check"),
  "tariff-quote": () => require("./_lib/routes/public-tariff-quote"),
  "lead-progress": () => require("./_lib/routes/public-lead-progress"),
  "journey-event": () => require("./_lib/routes/public-journey-event"),
  dashboard: () => require("./dashboard/[action].js"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) return res.status(404).json({ error: "Route API inconnue" });
  return load()(req, res);
};
