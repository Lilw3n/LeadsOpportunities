/**
 * GET/POST /api/webhooks/:action — Meta Lead Ads, WithAllo (1 fonction Vercel)
 */
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

const ROUTES = {
  "meta-lead": () => require("../_lib/routes/webhook-meta-lead"),
  withallo: () => require("../_lib/routes/webhook-withallo"),
  "make-einvoice": () => require("../_lib/routes/webhook-make-einvoice"),
};

module.exports = async (req, res) => {
  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) {
    return res.status(404).json({ error: "Webhook inconnu", action: action || null });
  }
  return load()(req, res);
};
