const { setCors } = require("../_lib/auth");

const ROUTES = {
  analyze: () => require("../_lib/routes/ai-analyze"),
  summarize: () => require("../_lib/routes/ai-summarize"),
  ask: () => require("../_lib/routes/ai-ask"),
  "batch-analyze": () => require("../_lib/routes/ai-batch-analyze"),
  "batch-summarize": () => require("../_lib/routes/ai-batch-summarize"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) return res.status(404).json({ error: "Route IA inconnue" });
  return load()(req, res);
};
