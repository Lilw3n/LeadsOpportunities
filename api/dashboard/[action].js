const { setCors } = require("../_lib/auth");

const ROUTES = {
  stats: () => require("../_lib/routes/stats"),
  leads: () => require("../_lib/routes/leads"),
  "lead-update": () => require("../_lib/routes/lead-update"),
  "lead-delete": () => require("../_lib/routes/lead-delete"),
  "lead-detail": () => require("../_lib/routes/lead-detail"),
  partners: () => require("../_lib/routes/partners-admin"),
  "leads-recent": () => require("../_lib/routes/leads-recent"),
  "leads-notify": () => require("../_lib/routes/leads-notify"),
  "mailbox-list": () => require("../_lib/routes/mailbox-list"),
  "mailbox-sync": () => require("../_lib/routes/mailbox-sync"),
  "mailbox-send": () => require("../_lib/routes/mailbox-send"),
  "payment-links": () => require("../_lib/routes/dashboard-payment-links"),
  "journey-dropoffs": () => require("../_lib/routes/journey-dropoffs"),
  "meta-rotation": () => require("../_lib/routes/dashboard-meta-rotation"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  var action = req.query.action;
  if (!action && req.url) {
    var m = String(req.url).match(/\/api\/dashboard\/([^/?]+)/);
    if (m) action = m[1];
  }
  const load = ROUTES[action];
  if (!load) {
    return res.status(404).json({ error: "Route dashboard inconnue" });
  }
  return load()(req, res);
};
