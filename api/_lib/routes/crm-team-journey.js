/**
 * GET /api/crm/team-journey — parcours équipe CRM (pages + clics nav)
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { buildTeamJourneyStats } = require("../team-journey-stats");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const auth = await requireCrm(req, res);
  if (!auth) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    var data = await buildTeamJourneyStats({ days: req.query.days });
    if (!data.ok) return res.status(503).json(data);
    return res.status(200).json(data);
  } catch (e) {
    console.error("[crm/team-journey]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
