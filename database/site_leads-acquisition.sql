-- Extension acquisition multi-plateformes + questionnaire + pipeline assurance
-- Exécuter sur Neon après site_leads.sql / users.sql

ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS platform TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'new';
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS questionnaire_step INT DEFAULT 0;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS questionnaire_total INT DEFAULT 10;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS form_id TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS fbclid TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS ttclid TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS msclkid TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS next_followup_at TIMESTAMPTZ;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS tariff_insurer TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS tariff_snapshot TEXT;

CREATE INDEX IF NOT EXISTS site_leads_platform_idx ON site_leads (platform);
CREATE INDEX IF NOT EXISTS site_leads_pipeline_idx ON site_leads (pipeline_stage);
CREATE INDEX IF NOT EXISTS site_leads_followup_idx ON site_leads (next_followup_at);
