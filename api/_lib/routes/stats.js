const { getAuthUser } = require("../auth");
const { applyApiGuards } = require("../security");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    const [totals, today, byVertical, byStatus, avgScore, recentTrend] = await Promise.all([
      sql`SELECT COUNT(*)::int AS total FROM site_leads`,
      sql`SELECT COUNT(*)::int AS total FROM site_leads WHERE created_at >= CURRENT_DATE`,
      sql`SELECT vertical, COUNT(*)::int AS count FROM site_leads GROUP BY vertical ORDER BY count DESC`,
      sql`SELECT COALESCE(status, 'new') AS status, COUNT(*)::int AS count FROM site_leads GROUP BY status ORDER BY count DESC`,
      sql`SELECT ROUND(AVG(lead_score), 1) AS avg_score FROM site_leads WHERE lead_score IS NOT NULL`,
      sql`
        SELECT DATE(created_at) AS day, COUNT(*)::int AS count
        FROM site_leads
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY day
      `,
    ]);

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const [thisWeek] = await sql`SELECT COUNT(*)::int AS count FROM site_leads WHERE created_at >= ${weekAgo}`;

    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    const [lastWeek] = await sql`
      SELECT COUNT(*)::int AS count FROM site_leads
      WHERE created_at >= ${twoWeeksAgo} AND created_at < ${weekAgo}
    `;

    const weekGrowth = lastWeek.count > 0
      ? Math.round(((thisWeek.count - lastWeek.count) / lastWeek.count) * 100)
      : thisWeek.count > 0 ? 100 : 0;

    var leadMgmt = { newUnopened: 0, unopened: 0, relevant: 0 };
    try {
      const [nu] = await sql`
        SELECT COUNT(*)::int AS count FROM site_leads
        WHERE COALESCE(status, 'new') = 'new' AND opened_at IS NULL
      `;
      const [uo] = await sql`SELECT COUNT(*)::int AS count FROM site_leads WHERE opened_at IS NULL`;
      const [rel] = await sql`SELECT COUNT(*)::int AS count FROM site_leads WHERE relevance = 'high'`;
      leadMgmt = { newUnopened: nu.count, unopened: uo.count, relevant: rel.count };
    } catch (mgmtErr) {
      const [nu2] = await sql`
        SELECT COUNT(*)::int AS count FROM site_leads
        WHERE COALESCE(status, 'new') = 'new' AND COALESCE(payload->>'openedAt', '') = ''
      `;
      const [uo2] = await sql`
        SELECT COUNT(*)::int AS count FROM site_leads
        WHERE COALESCE(payload->>'openedAt', '') = ''
      `;
      const [rel2] = await sql`
        SELECT COUNT(*)::int AS count FROM site_leads WHERE payload->>'relevance' = 'high'
      `;
      leadMgmt = { newUnopened: nu2.count, unopened: uo2.count, relevant: rel2.count };
    }

    return res.status(200).json({
      ok: true,
      stats: {
        total: totals[0].total,
        today: today[0].total,
        avgScore: avgScore[0].avg_score || 0,
        thisWeek: thisWeek.count,
        weekGrowth,
        byVertical,
        byStatus,
        trend: recentTrend,
        newUnopened: leadMgmt.newUnopened,
        unopened: leadMgmt.unopened,
        relevant: leadMgmt.relevant,
      },
    });
  } catch (e) {
    console.error("[dashboard/stats]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
