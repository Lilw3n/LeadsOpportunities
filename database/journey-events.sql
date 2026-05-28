-- Parcours prospects multi-pages (abandons, étapes, conversions)
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
);

CREATE INDEX IF NOT EXISTS journey_events_created_idx ON journey_events (created_at DESC);
CREATE INDEX IF NOT EXISTS journey_events_visitor_idx ON journey_events (visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS journey_events_event_idx ON journey_events (event_type, created_at DESC);
