const { setCors } = require("../_lib/auth");

const ROUTES = {
  files: () => require("../_lib/routes/drive-files"),
  "file-content": () => require("../_lib/routes/drive-file-content"),
  "local-files": () => require("../_lib/routes/local-drive-files"),
  "local-read": () => require("../_lib/routes/local-drive-read"),
  upload: () => require("../_lib/routes/drive-upload"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) return res.status(404).json({ error: "Route Drive inconnue" });
  return load()(req, res);
};
