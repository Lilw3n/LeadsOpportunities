/**
 * API publique — pack Buchet Immobilier / DiddyImmo
 * Sous-ensemble des routes immo de Leads Opportunities.
 */
const { setCors } = require("./_lib/auth");

const ROUTES = {
  "immo-listings": () => require("./_lib/routes/public-immo-listings"),
  "immo-ads": () => require("./_lib/routes/public-immo-ads"),
  "immo-ad-demo-access": () => require("./_lib/routes/public-immo-ad-demo-access"),
  "immo-tour-access": () => require("./_lib/routes/public-immo-tour-access"),
  "immo-tour-og": () => require("./_lib/routes/public-immo-tour-og"),
  "immo-tour-player": () => require("./_lib/routes/public-immo-tour-player"),
  "immo-listing-submit": () => require("./_lib/routes/public-immo-listing-submit"),
  "immo-listing-draft": () => require("./_lib/routes/public-immo-listing-draft"),
  "immo-listing-document": () => require("./_lib/routes/public-immo-listing-document"),
  "immo-listing-photos": () => require("./_lib/routes/crm-immo-listing-photos"),
  "immo-network": () => require("./_lib/routes/immo-network-dispatch"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) return res.status(404).json({ error: "Route API inconnue" });
  return load()(req, res);
};
