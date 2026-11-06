/**
 * API Drive — pack immo (dossiers biens / piges).
 */
const { setCors } = require("../_lib/auth");

const ROUTES = {
  immo: () => require("../_lib/routes/drive-immo"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) return res.status(404).json({ error: "Route Drive inconnue (pack immo)" });
  try {
    return await load()(req, res);
  } catch (e) {
    console.error("[drive/" + action + "]", e);
    return res.status(500).json({ ok: false, error: "Erreur serveur", detail: e.message });
  }
};
