-- Bootstrap CRM acquisition — à exécuter une fois sur Neon (SQL Editor)
-- Projet : https://console.neon.tech — base LeadsOpportunities
-- Ordre : site_leads.sql → users.sql → ce fichier → lead-private-workflow.sql (optionnel)

-- Colonnes users / leads de base (si pas déjà fait)
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS contact_id TEXT;

-- Acquisition multi-plateformes
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

-- Workflow privé (ouverture, archivage)
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS opened_by TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS archived_by TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS archive_reason TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS shared_with TEXT DEFAULT '[]';
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS last_event_at TIMESTAMPTZ;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS last_event_type TEXT;

-- Enrichissement geo
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS postal_code TEXT;

CREATE INDEX IF NOT EXISTS site_leads_platform_idx ON site_leads (platform);
CREATE INDEX IF NOT EXISTS site_leads_pipeline_idx ON site_leads (pipeline_stage);
CREATE INDEX IF NOT EXISTS site_leads_followup_idx ON site_leads (next_followup_at);
CREATE INDEX IF NOT EXISTS site_leads_contact_idx ON site_leads (contact_id);
