-- Hierarchie modules (parent_id) — apres crm-modules-v2.sql

ALTER TABLE crm_claims ADD COLUMN IF NOT EXISTS parent_id TEXT;
ALTER TABLE crm_vehicles ADD COLUMN IF NOT EXISTS parent_id TEXT;
ALTER TABLE crm_drivers ADD COLUMN IF NOT EXISTS parent_id TEXT;
ALTER TABLE crm_contracts ADD COLUMN IF NOT EXISTS parent_id TEXT;
ALTER TABLE crm_insurance_requests ADD COLUMN IF NOT EXISTS parent_id TEXT;

CREATE INDEX IF NOT EXISTS idx_crm_claims_parent ON crm_claims(parent_id);
CREATE INDEX IF NOT EXISTS idx_crm_vehicles_parent ON crm_vehicles(parent_id);
