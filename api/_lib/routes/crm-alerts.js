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
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  const scope = contactScopeFilter(user);

  try {
    const { alerts } = await buildAllAlerts(sql, scope, 25);
    return res.status(200).json({ ok: true, alerts });
  } catch (e) {
    console.error("[crm/alerts]", e);
    return res.status(200).json({ ok: true, partial: true, alerts: [] });
  }
};
