-- Hub partenaires assurance — a executer sur Neon

CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  portal_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority INT NOT NULL DEFAULT 100,
  verticals JSONB NOT NULL DEFAULT '[]',
  integration JSONB NOT NULL DEFAULT '{}',
  min_lead_score INT DEFAULT 35,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_dispatch_log (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  partner_id TEXT NOT NULL REFERENCES partners(id),
  status TEXT NOT NULL,
  http_status INT,
  error_message TEXT,
  response_snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_dispatch_lead ON partner_dispatch_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_partner_dispatch_partner ON partner_dispatch_log(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
