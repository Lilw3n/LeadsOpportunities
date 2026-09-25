const { getSql } = require("./db");
const { ensureJourneySchema } = require("./journey-store");

function pctGrowth(current, previous) {
  if (previous > 0) return Math.round(((current - previous) / previous) * 100);
  if (current > 0) return 100;
  return 0;
}

async function buildTrafficStats(options) {
  options = options || {};
  var sql = getSql();
  if (!sql) {
    return { ok: false, error: "Base de données non configurée" };
  }
  await ensureJourneySchema(sql);

  var trendDays = Math.min(Math.max(Number(options.trendDays) || 30, 7), 90);

  var weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  var twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
  var trendSince = new Date(Date.now() - trendDays * 86400000).toISOString();

  var periodRows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE created_at >= ${weekAgo} AND event_type = 'page_view')::int AS page_views_this_week,
      COUNT(*) FILTER (WHERE created_at >= ${twoWeeksAgo} AND created_at < ${weekAgo} AND event_type = 'page_view')::int AS page_views_last_week,
      COUNT(DISTINCT COALESCE(NULLIF(session_id, ''), visitor_id)) FILTER (WHERE created_at >= ${weekAgo})::int AS visitors_this_week,
      COUNT(DISTINCT COALESCE(NULLIF(session_id, ''), visitor_id)) FILTER (WHERE created_at >= ${twoWeeksAgo} AND created_at < ${weekAgo})::int AS visitors_last_week,
      COUNT(*) FILTER (WHERE created_at >= ${weekAgo} AND event_type = 'form_start')::int AS form_starts_this_week,
      COUNT(*) FILTER (WHERE created_at >= ${twoWeeksAgo} AND created_at < ${weekAgo} AND event_type = 'form_start')::int AS form_starts_last_week,
      COUNT(*) FILTER (WHERE created_at >= ${weekAgo} AND event_type = 'lead_submit_success')::int AS leads_journey_this_week,
      COUNT(*) FILTER (WHERE created_at >= ${twoWeeksAgo} AND created_at < ${weekAgo} AND event_type = 'lead_submit_success')::int AS leads_journey_last_week
    FROM journey_events
    WHERE created_at >= ${twoWeeksAgo}
  `;

  var p = periodRows[0] || {};

  var trendRows = await sql`
    SELECT DATE(created_at) AS day,
      COUNT(*) FILTER (WHERE event_type = 'page_view')::int AS page_views,
      COUNT(DISTINCT COALESCE(NULLIF(session_id, ''), visitor_id))::int AS visitors
    FROM journey_events
    WHERE created_at >= ${trendSince}
    GROUP BY DATE(created_at)
    ORDER BY day
  `;

  var topPages = await sql`
    SELECT page_path, COUNT(*)::int AS views
    FROM journey_events
    WHERE created_at >= ${weekAgo}
      AND event_type = 'page_view'
      AND page_path IS NOT NULL
      AND trim(page_path) <> ''
    GROUP BY page_path
    ORDER BY views DESC
    LIMIT 15
  `;

  var leadsWeek = { count: 0 };
  var leadsLastWeek = { count: 0 };
  try {
    [leadsWeek] = await sql`
      SELECT COUNT(*)::int AS count FROM site_leads WHERE created_at >= ${weekAgo}
    `;
    [leadsLastWeek] = await sql`
      SELECT COUNT(*)::int AS count FROM site_leads
      WHERE created_at >= ${twoWeeksAgo} AND created_at < ${weekAgo}
    `;
  } catch (e) {
    /* site_leads optional */
  }

  return {
    ok: true,
    generated_at: new Date().toISOString(),
    periods: {
      this_week_label: "7 derniers jours",
      last_week_label: "7 jours précédents",
    },
    comparison: {
      visitors: {
        this_week: p.visitors_this_week || 0,
        last_week: p.visitors_last_week || 0,
        growth_pct: pctGrowth(p.visitors_this_week, p.visitors_last_week),
      },
      page_views: {
        this_week: p.page_views_this_week || 0,
        last_week: p.page_views_last_week || 0,
        growth_pct: pctGrowth(p.page_views_this_week, p.page_views_last_week),
      },
      form_starts: {
        this_week: p.form_starts_this_week || 0,
        last_week: p.form_starts_last_week || 0,
        growth_pct: pctGrowth(p.form_starts_this_week, p.form_starts_last_week),
      },
      leads_journey: {
        this_week: p.leads_journey_this_week || 0,
        last_week: p.leads_journey_last_week || 0,
        growth_pct: pctGrowth(p.leads_journey_this_week, p.leads_journey_last_week),
      },
      leads_crm: {
        this_week: leadsWeek.count || 0,
        last_week: leadsLastWeek.count || 0,
        growth_pct: pctGrowth(leadsWeek.count, leadsLastWeek.count),
      },
    },
    trend: trendRows.map(function (r) {
      return {
        day: r.day,
        page_views: r.page_views,
        visitors: r.visitors,
      };
    }),
    top_pages: topPages.map(function (r) {
      return { path: r.page_path, views: r.views };
    }),
    trend_days: trendDays,
    note: "Visiteurs = sessions uniques (visitor_id) sur journey_events. Pour le trafic global (bots, SEO), utilisez GA4 et Clarity.",
  };
}

module.exports = { buildTrafficStats, pctGrowth };
