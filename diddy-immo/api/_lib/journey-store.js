const { getSql } = require("./db");

async function ensureJourneySchema(sql) {
  if (!sql) return false;
  await sql`
    CREATE TABLE IF NOT EXISTS journey_events (
      id TEXT PRIMARY KEY,
      visitor_id TEXT,
      session_id TEXT,
      lead_id TEXT,
      event_type TEXT NOT NULL,
      page_path TEXT,
      step_name TEXT,
      vertical TEXT,
      source TEXT,
      meta JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS journey_events_created_idx ON journey_events (created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS journey_events_visitor_idx ON journey_events (visitor_id, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS journey_events_event_idx ON journey_events (event_type, created_at DESC)
  `;
  return true;
}

async function addJourneyEvent(input) {
  const sql = getSql();
  if (!sql) return { ok: false, reason: "no_database" };
  await ensureJourneySchema(sql);
  const id =
    input.id ||
    "je_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
  await sql`
    INSERT INTO journey_events (
      id, visitor_id, session_id, lead_id, event_type, page_path, step_name, vertical, source, meta
    ) VALUES (
      ${id},
      ${input.visitor_id || null},
      ${input.session_id || null},
      ${input.lead_id || input.leadId || null},
      ${String(input.event_type || "unknown").slice(0, 80)},
      ${input.page_path ? String(input.page_path).slice(0, 300) : null},
      ${input.step_name ? String(input.step_name).slice(0, 120) : null},
      ${input.vertical ? String(input.vertical).slice(0, 80) : null},
      ${input.source ? String(input.source).slice(0, 120) : null},
      ${JSON.stringify(input.meta || {})}::jsonb
    )
  `;
  return { ok: true, id };
}

async function getDropoffSummary(days) {
  const sql = getSql();
  if (!sql) return { ok: false, reason: "no_database", rows: [] };
  await ensureJourneySchema(sql);
  const d = Math.min(Math.max(Number(days) || 14, 1), 90);
  const rows = await sql`
    WITH scoped AS (
      SELECT *
      FROM journey_events
      WHERE created_at > NOW() - (${d}::text || ' days')::interval
    ),
    sessions AS (
      SELECT
        COALESCE(NULLIF(session_id, ''), visitor_id, id) AS skey,
        MAX(created_at) AS last_at
      FROM scoped
      GROUP BY 1
    ),
    last_event AS (
      SELECT DISTINCT ON (COALESCE(NULLIF(s.session_id, ''), s.visitor_id, s.id))
        COALESCE(NULLIF(s.session_id, ''), s.visitor_id, s.id) AS skey,
        s.event_type,
        COALESCE(s.step_name, s.page_path, '(unknown)') AS stop_point,
        s.page_path
      FROM scoped s
      ORDER BY COALESCE(NULLIF(s.session_id, ''), s.visitor_id, s.id), s.created_at DESC
    )
    SELECT
      l.event_type,
      l.stop_point,
      l.page_path,
      COUNT(*)::int AS sessions
    FROM last_event l
    WHERE l.event_type NOT IN ('lead_submit_success', 'lead_submit')
    GROUP BY l.event_type, l.stop_point, l.page_path
    ORDER BY sessions DESC
    LIMIT 100
  `;

  const kpisRows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE event_type = 'form_start')::int AS form_starts,
      COUNT(*) FILTER (WHERE event_type = 'lead_submit_success')::int AS leads_submitted,
      COUNT(*) FILTER (WHERE event_type = 'wizard_abandon')::int AS wizard_abandons,
      COUNT(DISTINCT COALESCE(NULLIF(session_id, ''), visitor_id))::int AS visitors
    FROM journey_events
    WHERE created_at > NOW() - (${d}::text || ' days')::interval
  `;
  return { ok: true, rows, kpis: kpisRows[0] || {}, days: d };
}

module.exports = {
  ensureJourneySchema,
  addJourneyEvent,
  getDropoffSummary,
};
