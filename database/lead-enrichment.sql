-- Enrichissement leads : touchpoints, SEO, geo, dedup

ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS landing_slug TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS seo_city TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS seo_department TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS seo_product TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS address_line TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS geo_lat DOUBLE PRECISION;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS geo_lng DOUBLE PRECISION;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS geo_confidence TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS parent_lead_id TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_site_leads_email ON site_leads (LOWER(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_site_leads_phone ON site_leads (phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_site_leads_seo_city ON site_leads (seo_city) WHERE seo_city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_site_leads_parent ON site_leads (parent_lead_id) WHERE parent_lead_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS lead_touchpoints (
  id TEXT PRIMARY KEY,
  visitor_id TEXT,
  lead_id TEXT,
  event_type TEXT NOT NULL DEFAULT 'page_view',
  page_path TEXT,
  page_title TEXT,
  seo_city TEXT,
  seo_product TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  payload TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_touchpoints_visitor ON lead_touchpoints (visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_touchpoints_lead ON lead_touchpoints (lead_id, created_at DESC);
