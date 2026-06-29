/**
 * POST /api/crm/markets-presence-alert-test — déclenche manuellement l'alerte présence terrain (CRM)
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { runMarketsPresenceAlert, getAlertConfig } = require("../markets-presence-alert");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const auth = await requireCrm(req, res);
  if (!auth) return;

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, config: getAlertConfig() });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    var result = await runMarketsPresenceAlert({});
    return res.status(200).json(result);
  } catch (e) {
    console.error("[crm/markets-presence-alert-test]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
