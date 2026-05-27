const { setCors } = require("../_lib/auth");

const ROUTES = {
  list: () => require("../_lib/routes/mailbox-list"),
  sync: () => require("../_lib/routes/mailbox-sync"),
  send: () => require("../_lib/routes/mailbox-send"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  var action = req.query.action;
  if (!action && req.url) {
    var m = String(req.url).match(/\/api\/mailbox\/([^/?]+)/);
    if (m) action = m[1];
  }
  const load = ROUTES[action];
  if (!load) {
    return res.status(404).json({ error: "Route mailbox inconnue" });
  }
  return load()(req, res);
};

module.exports.config = {
  maxDuration: 60,
};
