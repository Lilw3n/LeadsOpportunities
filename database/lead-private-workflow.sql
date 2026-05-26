-- Workflow prive leads : ouverture, archivage, collaboration, evenements supplementaires
-- A executer apres database/site_leads-acquisition.sql

ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS opened_by TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS archived_by TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS archive_reason TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS shared_with TEXT DEFAULT '[]';
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS last_event_at TIMESTAMPTZ;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS last_event_type TEXT;

CREATE TABLE IF NOT EXISTS lead_events (
  id TEXT PRIMARY KEY,
  lead_id TEXT REFERENCES site_leads(id) ON DELETE CASCADE,
  contact_id TEXT,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'crm',
  title TEXT,
  body TEXT,
  payload TEXT,
  actor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_leads_archived_idx ON site_leads (archived_at);
CREATE INDEX IF NOT EXISTS site_leads_opened_idx ON site_leads (opened_at);
CREATE INDEX IF NOT EXISTS site_leads_assigned_idx ON site_leads (assigned_to);
CREATE INDEX IF NOT EXISTS site_leads_last_event_idx ON site_leads (last_event_at);
CREATE INDEX IF NOT EXISTS lead_events_lead_idx ON lead_events (lead_id, created_at DESC);
