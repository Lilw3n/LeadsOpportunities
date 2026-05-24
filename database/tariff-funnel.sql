-- Tarification indicative + suivi funnel questionnaire
-- Exécuter sur Neon après site_leads-acquisition.sql

CREATE TABLE IF NOT EXISTS lead_funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL,
  event TEXT NOT NULL,
  step INT,
  step_name TEXT,
  journey TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lead_funnel_events_lead_idx ON lead_funnel_events (lead_id);
CREATE INDEX IF NOT EXISTS lead_funnel_events_event_idx ON lead_funnel_events (event);
CREATE INDEX IF NOT EXISTS lead_funnel_events_created_idx ON lead_funnel_events (created_at DESC);

ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS journey TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS last_step_name TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS quote_snapshot JSONB;

COMMENT ON TABLE lead_funnel_events IS 'Étapes wizard, blocages et abandons pour analyse conversion';
COMMENT ON COLUMN site_leads.quote_snapshot IS 'Devis indicatif interne (JSON) — non contractuel';
