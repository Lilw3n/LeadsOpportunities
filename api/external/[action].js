const { setCors } = require("../_lib/auth");

const ROUTES = {
  login: () => require("../_lib/routes/external-login"),
  register: () => require("../_lib/routes/external-register"),
  profile: () => require("../_lib/routes/external-profile"),
  "quote-request": () => require("../_lib/routes/external-quote-request"),
  claim: () => require("../_lib/routes/external-claim"),
  upload: () => require("../_lib/routes/external-upload"),
  "documents-list": () => require("../_lib/routes/external-documents-list"),
  google: () => require("../_lib/routes/external-google-start"),
  "send-verify": () => require("../_lib/routes/external-send-verify"),
  "verify-email": () => require("../_lib/routes/external-verify-email"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) return res.status(404).json({ error: "Route externe inconnue" });
  return load()(req, res);
};
