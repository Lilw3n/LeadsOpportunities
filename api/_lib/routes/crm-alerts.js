const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { buildAllAlerts, buildInboundLeadAlerts } = require("../crm-alerts-build");

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error((label || "timeout") + " (" + ms + "ms)"));
      }, ms);
    }),
  ]);
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) {
    return res.status(200).json({
      ok: true,
      partial: true,
      databaseConfigured: false,
      alerts: [],
      diagnostics: {
        hint: "DATABASE_URL manquant — les formulaires du site ne sont pas enregistrés.",
      },
    });
  }
  const scope = contactScopeFilter(user);

  try {
    const { alerts } = await withTimeout(buildAllAlerts(sql, scope, 25), 8000, "alertes CRM");
    return res.status(200).json({ ok: true, alerts });
  } catch (e) {
    console.error("[crm/alerts]", e);
    try {
      const fallback = await buildInboundLeadAlerts(sql, 15);
      return res.status(200).json({
        ok: true,
        partial: true,
        alerts: fallback,
        diagnostics: { hint: e.message },
      });
    } catch (e2) {
      return res.status(200).json({ ok: true, partial: true, alerts: [] });
    }
  }
};
