const { setCors } = require("../_lib/auth");

const ROUTES = {
  "traffic-alert": () => require("../_lib/routes/cron-traffic-alert"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  var action = req.query.action;
  if (!action && req.url) {
    var m = String(req.url).match(/\/api\/cron\/([^/?]+)/);
    if (m) action = m[1];
  }

  const load = ROUTES[action];
  if (!load) {
    return res.status(404).json({ error: "Route cron inconnue" });
  }
  return load()(req, res);
};

module.exports.config = {
  maxDuration: 60,
};
