/**
 * GET /api/dashboard/markets-presence — prochaines présences (admin)
 */
const { applyApiGuards } = require("../security");
const { requireDashboardAdmin } = require("../dashboard-admin");
const { listMarketsPresence } = require("../markets-presence-store");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!(await requireDashboardAdmin(req, res))) return;

  try {
    var days = req.query.days || 14;
    var data = await listMarketsPresence({ days: days, seed: true });
    if (!data.ok) return res.status(503).json(data);

    var upcoming = (data.upcoming || []).filter(function (item) {
      var d = new Date(item.date + "T12:00:00");
      var t = new Date();
      t.setHours(0, 0, 0, 0);
      return d >= t;
    });

    return res.status(200).json({
      ok: true,
      upcoming: upcoming.slice(0, 20),
      unassigned: upcoming.filter(function (i) {
        return !i.has_assignment && i.status !== "cancelled";
      }).length,
      total: upcoming.length,
    });
  } catch (e) {
    console.error("[dashboard/markets-presence]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
