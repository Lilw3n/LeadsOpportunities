/**
 * POST /api/crm/traffic-alert-test — déclenche manuellement la vérif alerte trafic (CRM)
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { runTrafficAlertCheck, getAlertConfig } = require("../traffic-alert");

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
    var force = req.query.force === "1" || req.query.force === "true";
    var result = await runTrafficAlertCheck({ force: force });
    return res.status(200).json(result);
  } catch (e) {
    console.error("[crm/traffic-alert-test]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
