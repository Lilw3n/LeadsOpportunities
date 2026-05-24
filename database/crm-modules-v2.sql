-- Extensions CRM v2 (apres crm-modules.sql)

ALTER TABLE crm_events ADD COLUMN IF NOT EXISTS extra_data TEXT;

-- Societe / famille en JSON sur le contact (si metadata non utilise)
-- metadata: { "company": {...}, "family": {...} }
