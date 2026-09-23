/**
 * GET /api/crm/blog-stats — vues, clics CTA, leads blog/forum (first-party)
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { buildBlogStats } = require("../blog-stats");

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
    var days = req.query.days || 30;
    var stats = await buildBlogStats({ days: days });
    if (!stats.ok) {
      return res.status(503).json(stats);
    }
    return res.status(200).json(stats);
  } catch (e) {
    console.error("[crm/blog-stats]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
