/**
 * GET /api/crm/traffic-stats — comparaison visites semaine vs semaine précédente
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { buildTrafficStats } = require("../traffic-stats");
const { loadHubConfig } = require("../ad-platform-hub");

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
    var trendDays = req.query.trendDays || req.query.days || 30;
    var stats = await buildTrafficStats({ trendDays: trendDays });
    if (!stats.ok) {
      return res.status(503).json(stats);
    }

    var hub = loadHubConfig();
    var analyticsLinks = [];
    (hub.platforms || []).forEach(function (p) {
      if (p.id === "clarity" || p.id === "google") {
        (p.links || []).forEach(function (l) {
          if (l.primary) {
            analyticsLinks.push({
              platform: p.id,
              label: l.label,
              url: l.url,
            });
          }
        });
      }
    });

    return res.status(200).json(
      Object.assign({}, stats, {
        analytics_links: analyticsLinks,
      })
    );
  } catch (e) {
    console.error("[crm/traffic-stats]", e);
    return res.status(500).json({ ok: false, error: e.message });
  }
};
