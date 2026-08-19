const { setCors } = require("../_lib/auth");

const ROUTES = {
  files: () => require("../_lib/routes/drive-files"),
  "file-content": () => require("../_lib/routes/drive-file-content"),
  "local-files": () => require("../_lib/routes/local-drive-files"),
  "local-read": () => require("../_lib/routes/local-drive-read"),
  upload: () => require("../_lib/routes/drive-upload"),
  status: () => require("../_lib/routes/drive-status"),
  config: () => require("../_lib/routes/drive-config-public"),
  "test-lead": () => require("../_lib/routes/drive-test-lead"),
  "oauth-start": () => require("../_lib/routes/drive-oauth-start"),
  immo: () => require("../_lib/routes/drive-immo"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) return res.status(404).json({ error: "Route Drive inconnue" });
  try {
    return await load()(req, res);
  } catch (e) {
    console.error("[drive/" + action + "]", e);
    if (!res.headersSent) {
      return res.status(200).json({
        ok: false,
        error: "Erreur serveur Drive",
        detail: e.message,
        action: action,
      });
    }
  }
};
