const { setCors } = require("../_lib/auth");

const ROUTES = {
  overview: () => require("../_lib/routes/crm-overview"),
  contacts: () => require("../_lib/routes/crm-contacts"),
  contact: () => require("../_lib/routes/crm-contact"),
  users: () => require("../_lib/routes/crm-users"),
  "convert-lead": () => require("../_lib/routes/crm-convert-lead"),
  modules: () => require("../_lib/routes/crm-modules"),
  events: () => require("../_lib/routes/crm-events"),
  transfer: () => require("../_lib/routes/crm-transfer"),
  "duplicate-event": () => require("../_lib/routes/crm-duplicate-event"),
  "bulk-events": () => require("../_lib/routes/crm-bulk-events"),
  "set-parent": () => require("../_lib/routes/crm-set-parent"),
  "bulk-duplicate-events": () => require("../_lib/routes/crm-bulk-duplicate-events"),
  alerts: () => require("../_lib/routes/crm-alerts"),
  "create-complete": () => require("../_lib/routes/crm-create-complete"),
  quotes: () => require("../_lib/routes/crm-quotes"),
  "quote-document": () => require("../_lib/routes/crm-quote-document"),
  "devis-prefill": () => require("../_lib/routes/devis-prefill"),
  statistics: () => require("../_lib/routes/crm-statistics"),
  "module-link": () => require("../_lib/routes/crm-module-link"),
  "insurance-hub": () => require("../_lib/routes/crm-insurance-hub"),
  "modules-global": () => require("../_lib/routes/crm-modules-global"),
  "bank-details": () => require("../_lib/routes/crm-bank-details"),
  periods: () => require("../_lib/routes/crm-periods"),
  "financial-overview": () => require("../_lib/routes/crm-financial-overview"),
  "pending-documents": () => require("../_lib/routes/crm-pending-documents"),
  "contact-documents": () => require("../_lib/routes/crm-contact-documents"),
  "universal-search": () => require("../_lib/routes/crm-universal-search"),
  "insurance-requests": () => require("../_lib/routes/crm-insurance-requests"),
  products: () => require("../_lib/routes/crm-products"),
  "intelligent-alerts": () => require("../_lib/routes/crm-intelligent-alerts"),
  "document-approve": () => require("../_lib/routes/crm-document-approve"),
  "document-download": () => require("../_lib/routes/crm-document-download"),
  "financial-entries": () => require("../_lib/routes/crm-financial-entries"),
  export: () => require("../_lib/routes/crm-export"),
  "driver-import": () => require("../_lib/routes/crm-driver-import"),
  "leads-acquisition": () => require("../_lib/routes/crm-leads-acquisition"),
  "leads-hub": () => require("../_lib/routes/crm-leads-hub"),
  "lead-lifecycle": () => require("../_lib/routes/crm-lead-lifecycle"),
  "leads-sources": () => require("../_lib/routes/crm-leads-sources"),
  "traffic-stats": () => require("../_lib/routes/crm-traffic-stats"),
  "traffic-alert-test": () => require("../_lib/routes/crm-traffic-alert-test"),
  "markets-presence": () => require("../_lib/routes/crm-markets-presence"),
  "pubs-hub": () => require("../_lib/routes/crm-pubs-hub"),
  "test-slack": () => require("../_lib/routes/crm-test-slack"),
  "lead-acquisition": () => require("../_lib/routes/crm-lead-acquisition"),
  "contact-duplicates": () => require("../_lib/routes/crm-contact-duplicates"),
  "merge-contacts": () => require("../_lib/routes/crm-merge-contacts"),
  "private-offer-match": () => require("../_lib/routes/crm-private-offer-match"),
  "meta-rotation": () => require("../_lib/routes/crm-meta-rotation"),
  "tariff-rates": () => require("../_lib/routes/crm-tariff-rates"),
  "calendar-sync": () => require("../_lib/routes/crm-calendar-sync"),
  "pro-accounting": () => require("../_lib/routes/crm-pro-accounting"),
  "agent-tax-prefs": () => require("../_lib/routes/crm-agent-tax-prefs"),
  "agent-payment-splits": () => require("../_lib/routes/crm-agent-payment-splits"),
  immo: () => require("../_lib/routes/crm-immo"),
};

module.exports = async (req, res) => {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = req.query.action;
  const load = ROUTES[action];
  if (!load) {
    return res.status(404).json({ error: "Route CRM inconnue" });
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
