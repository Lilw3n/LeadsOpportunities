/**
 * GET /api/crm/intelligent-alerts — alertes métier + opérationnelles
 */
const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { buildAllAlerts } = require("../crm-alerts-build");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(200).json({ ok: true, partial: true, alerts: [], counts: { total: 0 } });
  const scope = contactScopeFilter(user);

  try {
    const { alerts, counts } = await buildAllAlerts(sql, scope, 40);
    return res.status(200).json({ ok: true, alerts, counts });
  } catch (e) {
    console.error("[crm/intelligent-alerts]", e);
    try {
      const { buildInboundLeadAlerts } = require("../crm-alerts-build");
      const fallback = await buildInboundLeadAlerts(sql, 20);
      return res.status(200).json({
        ok: true,
        partial: true,
        alerts: fallback,
        counts: { total: fallback.length },
        diagnostics: { hint: e.message },
      });
    } catch (e2) {
      return res.status(200).json({ ok: true, partial: true, alerts: [], counts: { total: 0 } });
    }
  }
};
