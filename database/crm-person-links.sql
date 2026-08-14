-- Liaison / fusion de personnes (leads & prospects) — validation admin
CREATE TABLE IF NOT EXISTS crm_person_links (
  id TEXT PRIMARY KEY,
  keep_kind TEXT NOT NULL,
  keep_id TEXT NOT NULL,
  other_kind TEXT NOT NULL,
  other_id TEXT NOT NULL,
  link_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  match_reasons TEXT,
  snapshot TEXT,
  created_by TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS crm_person_links_status_idx ON crm_person_links (status, created_at DESC);

ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS client_ua TEXT;
