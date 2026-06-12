const { setCors } = require("../_lib/auth");

const ROUTES = {
  "create-checkout-session": () => require("../_lib/routes/stripe-create-checkout-session"),
  "create-checkout-for-quote": () => require("../_lib/routes/stripe-create-checkout-for-quote"),
  "create-mailbox-payment-link": () =>
    require("../_lib/routes/stripe-create-mailbox-payment-link"),
  "session-status": () => require("../_lib/routes/stripe-session-status"),
  readiness: () => require("../_lib/routes/stripe-readiness"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) return res.status(404).json({ error: "Route Stripe inconnue" });
  return load()(req, res);
};
