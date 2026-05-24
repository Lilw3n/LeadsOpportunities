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

    var totals = [{ total: 0 }];
    var today = [{ total: 0 }];
    var byVertical = [];
    var byStatus = [];
    var avgScore = [{ avg_score: 0 }];
    var recentTrend = [];
    var thisWeek = { count: 0 };
    var lastWeek = { count: 0 };

    try {
      [totals, today, byVertical, byStatus, avgScore, recentTrend] = await Promise.all([
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
    } catch (coreErr) {
      console.warn("[dashboard/stats] core fallback", coreErr.message);
      [totals, today, byVertical, avgScore] = await Promise.all([
        sql`SELECT COUNT(*)::int AS total FROM site_leads`,
        sql`SELECT COUNT(*)::int AS total FROM site_leads WHERE created_at >= CURRENT_DATE`,
        sql`SELECT vertical, COUNT(*)::int AS count FROM site_leads GROUP BY vertical ORDER BY count DESC`,
        sql`SELECT ROUND(AVG(lead_score), 1) AS avg_score FROM site_leads WHERE lead_score IS NOT NULL`,
      ]);
      byStatus = [{ status: "new", count: totals[0].total }];
    }

    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    try {
      [thisWeek] = await sql`SELECT COUNT(*)::int AS count FROM site_leads WHERE created_at >= ${weekAgo}`;
      [lastWeek] = await sql`
        SELECT COUNT(*)::int AS count FROM site_leads
        WHERE created_at >= ${twoWeeksAgo} AND created_at < ${weekAgo}
      `;
    } catch (weekErr) {
      console.warn("[dashboard/stats] week counts", weekErr.message);
    }

    const weekGrowth =
      lastWeek.count > 0
        ? Math.round(((thisWeek.count - lastWeek.count) / lastWeek.count) * 100)
        : thisWeek.count > 0
          ? 100
          : 0;

    var leadMgmt = { newUnopened: 0, unopened: 0, relevant: 0 };
    try {
      const [nu] = await sql`
        SELECT COUNT(*)::int AS count FROM site_leads
        WHERE COALESCE(status, 'new') = 'new'
          AND COALESCE(
            CASE
              WHEN payload IS NULL OR trim(payload) = '' THEN NULL
              WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'openedAt')
              ELSE NULL
            END,
            ''
          ) = ''
      `;
      const [uo] = await sql`
        SELECT COUNT(*)::int AS count FROM site_leads
        WHERE COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'openedAt')
            ELSE NULL
          END,
          ''
        ) = ''
      `;
      const [rel] = await sql`
        SELECT COUNT(*)::int AS count FROM site_leads
        WHERE COALESCE(
          CASE
            WHEN payload IS NULL OR trim(payload) = '' THEN NULL
            WHEN left(trim(payload), 1) = '{' THEN (payload::jsonb->>'relevance')
            ELSE NULL
          END,
          ''
        ) = 'high'
      `;
      leadMgmt = { newUnopened: nu.count, unopened: uo.count, relevant: rel.count };
    } catch (mgmtErr) {
      console.warn("[dashboard/stats] payload filters fallback", mgmtErr.message);
      try {
        const [nu] = await sql`
          SELECT COUNT(*)::int AS count FROM site_leads WHERE COALESCE(status, 'new') = 'new'
        `;
        const [uo] = await sql`SELECT COUNT(*)::int AS count FROM site_leads`;
        const [rel] = await sql`
          SELECT COUNT(*)::int AS count FROM site_leads WHERE lead_score >= 70
        `;
        leadMgmt = { newUnopened: nu.count, unopened: uo.count, relevant: rel.count };
      } catch (e2) {
        leadMgmt = { newUnopened: 0, unopened: totals[0].total, relevant: 0 };
      }
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
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};
