/**
 * API CRM — pack Buchet Immobilier (routes immo + socle minimal).
 */
const { setCors } = require("../_lib/auth");

const ROUTES = {
  immo: () => require("../_lib/routes/crm-immo"),
  "immo-users-contact": () => require("../_lib/routes/crm-immo-users-contact"),
  // Socle souvent appelé par la sidebar / shell CRM
  overview: () => require("../_lib/routes/crm-overview"),
  contacts: () => require("../_lib/routes/crm-contacts"),
  contact: () => require("../_lib/routes/crm-contact"),
  users: () => require("../_lib/routes/crm-users"),
  events: () => require("../_lib/routes/crm-events"),
  "universal-search": () => require("../_lib/routes/crm-universal-search"),
  relations: () => require("../_lib/routes/crm-relations"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) {
    return res.status(404).json({ error: "Route CRM inconnue (pack immo)" });
  }
  try {
    return await load()(req, res);
  } catch (e) {
    console.error("[crm/" + action + "]", e);
    return res.status(200).json({
      ok: false,
      error: "Erreur serveur",
      detail: e.message,
      action: action,
    });
  }
};
