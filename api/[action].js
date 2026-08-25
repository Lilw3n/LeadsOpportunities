const { setCors } = require("./_lib/auth");

const ROUTES = {
  lead: () => require("./_lib/routes/public-lead"),
  "lead-touchpoint": () => require("./_lib/routes/public-lead-touchpoint"),
  "cross-sell": () => require("./_lib/routes/public-cross-sell"),
  "eligibility-check": () => require("./_lib/routes/public-eligibility-check"),
  "tariff-quote": () => require("./_lib/routes/public-tariff-quote"),
  "lead-progress": () => require("./_lib/routes/public-lead-progress"),
  "journey-event": () => require("./_lib/routes/public-journey-event"),
  "blog-actu-ingest": () => require("./_lib/routes/blog-actu-ingest"),
  "geo-hint": () => require("./_lib/routes/public-geo-hint"),
  "immo-listings": () => require("./_lib/routes/public-immo-listings"),
  "immo-listing-submit": () => require("./_lib/routes/public-immo-listing-submit"),
  "immo-listing-draft": () => require("./_lib/routes/public-immo-listing-draft"),
  "immo-listing-document": () => require("./_lib/routes/public-immo-listing-document"),
  "immo-network": () => require("./_lib/routes/immo-network-dispatch"),
  "acquisition-focus": () => require("./_lib/routes/public-acquisition-focus"),
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
