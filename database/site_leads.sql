-- Executer sur Neon (ou Postgres Vercel) une fois. Variable DATABASE_URL sur Vercel.

CREATE TABLE IF NOT EXISTS site_leads (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT,
  vertical TEXT,
  lead_score INT NOT NULL DEFAULT 0,
  email TEXT,
  phone TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  gclid TEXT,
  visitor_id TEXT,
  payload TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS site_leads_created_at_idx ON site_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS site_leads_email_idx ON site_leads (email);
