-- Horaires marché (lieu) ≠ horaires travail équipe (préparation, pauses)

ALTER TABLE crm_markets ADD COLUMN IF NOT EXISTS market_start_time TEXT;
ALTER TABLE crm_markets ADD COLUMN IF NOT EXISTS market_end_time TEXT;
ALTER TABLE crm_markets ADD COLUMN IF NOT EXISTS work_prep_start TEXT;
ALTER TABLE crm_markets ADD COLUMN IF NOT EXISTS work_start TEXT;
ALTER TABLE crm_markets ADD COLUMN IF NOT EXISTS work_end TEXT;
ALTER TABLE crm_markets ADD COLUMN IF NOT EXISTS breaks_json JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE crm_presence_slots ADD COLUMN IF NOT EXISTS market_start_time TEXT;
ALTER TABLE crm_presence_slots ADD COLUMN IF NOT EXISTS market_end_time TEXT;
ALTER TABLE crm_presence_slots ADD COLUMN IF NOT EXISTS work_prep_start TEXT;
ALTER TABLE crm_presence_slots ADD COLUMN IF NOT EXISTS work_start TEXT;
ALTER TABLE crm_presence_slots ADD COLUMN IF NOT EXISTS work_end TEXT;
ALTER TABLE crm_presence_slots ADD COLUMN IF NOT EXISTS breaks_json JSONB NOT NULL DEFAULT '[]'::jsonb;

UPDATE crm_markets SET market_start_time = default_start_time WHERE market_start_time IS NULL AND default_start_time IS NOT NULL;
UPDATE crm_markets SET market_end_time = default_end_time WHERE market_end_time IS NULL AND default_end_time IS NOT NULL;
