const { getSql } = require("./db");
const { ensureJourneySchema } = require("./journey-store");

async function buildTeamJourneyStats(options) {
  options = options || {};
  var sql = getSql();
  if (!sql) return { ok: false, error: "Base de données non configurée" };

  await ensureJourneySchema(sql);
  var days = Math.min(Math.max(Number(options.days) || 14, 1), 90);

  var topPages = await sql`
    SELECT page_path, COUNT(*)::int AS views,
      COUNT(DISTINCT COALESCE(NULLIF(session_id, ''), visitor_id))::int AS sessions
    FROM journey_events
    WHERE created_at > NOW() - (${days}::text || ' days')::interval
      AND event_type = 'page_view'
      AND (
        source = 'crm_team'
        OR page_path LIKE '/crm%'
        OR page_path LIKE '%/crm-%'
        OR page_path LIKE '%dashboard.html%'
      )
    GROUP BY page_path
    ORDER BY views DESC
    LIMIT 20
  `;

  var topNav = await sql`
    SELECT
      COALESCE(step_name, meta->>'label', '(sans libellé)') AS target,
      COUNT(*)::int AS clicks
    FROM journey_events
    WHERE created_at > NOW() - (${days}::text || ' days')::interval
      AND event_type = 'crm_nav_click'
    GROUP BY 1
    ORDER BY clicks DESC
    LIMIT 15
  `;

  var kpisRows = await sql`
    SELECT
      COUNT(DISTINCT COALESCE(NULLIF(session_id, ''), visitor_id)) FILTER (
        WHERE source = 'crm_team' OR page_path LIKE '%crm%' OR page_path LIKE '%dashboard.html%'
      )::int AS team_sessions,
      COUNT(*) FILTER (WHERE event_type = 'page_view' AND source = 'crm_team')::int AS team_page_views,
      COUNT(*) FILTER (WHERE event_type = 'crm_nav_click')::int AS team_nav_clicks
    FROM journey_events
    WHERE created_at > NOW() - (${days}::text || ' days')::interval
  `;

  var publicTop = await sql`
    SELECT page_path, COUNT(*)::int AS views
    FROM journey_events
    WHERE created_at > NOW() - (${days}::text || ' days')::interval
      AND event_type = 'page_view'
      AND source IS DISTINCT FROM 'crm_team'
      AND page_path NOT LIKE '%crm%'
      AND page_path NOT LIKE '%dashboard.html%'
    GROUP BY page_path
    ORDER BY views DESC
    LIMIT 10
  `;

  var k = kpisRows[0] || {};
  return {
    ok: true,
    days: days,
    kpis: {
      team_sessions: k.team_sessions || 0,
      team_page_views: k.team_page_views || 0,
      team_nav_clicks: k.team_nav_clicks || 0,
    },
    top_team_pages: topPages.map(function (r) {
      return { path: r.page_path, views: r.views, sessions: r.sessions };
    }),
    top_nav_clicks: topNav.map(function (r) {
      return { target: r.target, clicks: r.clicks };
    }),
    top_public_pages: publicTop.map(function (r) {
      return { path: r.page_path, views: r.views };
    }),
    clarity_filters: [
      { label: "Sessions équipe CRM", tag: "team_session", value: "yes" },
      { label: "Page CRM", tag: "crm_page", value: "crm-acquisition.html" },
      { label: "Zone dashboard", tag: "page_section", value: "dashboard" },
      { label: "Clic navigation CRM", event: "crm_nav_click" },
    ],
    note:
      "Données équipe = journey_events (source crm_team). Clarity : filtre team_session=yes. Le tracking équipe est actif depuis ce déploiement — l'historique antérieur peut être incomplet.",
  };
}

module.exports = { buildTeamJourneyStats };
