-- Gestion leads avancee : ouverture, tarifs, pertinence, WithAllo
-- Executer sur Neon apres site_leads-acquisition.sql

ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS competitor_monthly NUMERIC(10, 2);
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS our_offer_monthly NUMERIC(10, 2);
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS relevance TEXT;

CREATE INDEX IF NOT EXISTS site_leads_opened_idx ON site_leads (opened_at);
CREATE INDEX IF NOT EXISTS site_leads_relevance_idx ON site_leads (relevance);
