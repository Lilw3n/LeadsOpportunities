-- Modules CRM (evenements, sinistres, vehicules, etc.) — apres crm.sql

CREATE TABLE IF NOT EXISTS crm_events (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'note',
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_events_contact ON crm_events(contact_id, event_date DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS crm_claims (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  vehicle_id TEXT,
  driver_id TEXT,
  claim_type TEXT,
  claim_date DATE,
  amount NUMERIC(12,2),
  description TEXT,
  insurer TEXT,
  status TEXT NOT NULL DEFAULT 'En attente',
  responsible BOOLEAN DEFAULT FALSE,
  percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_claims_contact ON crm_claims(contact_id);

CREATE TABLE IF NOT EXISTS crm_vehicles (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  registration TEXT,
  brand TEXT,
  model TEXT,
  year INTEGER,
  vehicle_type TEXT DEFAULT 'Voiture particuliere',
  status TEXT NOT NULL DEFAULT 'En attente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_vehicles_contact ON crm_vehicles(contact_id);

CREATE TABLE IF NOT EXISTS crm_drivers (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  license_number TEXT,
  license_type TEXT,
  status TEXT NOT NULL DEFAULT 'Actif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_drivers_contact ON crm_drivers(contact_id);

CREATE TABLE IF NOT EXISTS crm_contracts (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  contract_type TEXT DEFAULT 'assurance',
  status TEXT NOT NULL DEFAULT 'En attente',
  start_date DATE,
  end_date DATE,
  premium NUMERIC(12,2),
  insurer TEXT,
  policy_number TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_contracts_contact ON crm_contracts(contact_id);

CREATE TABLE IF NOT EXISTS crm_insurance_requests (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  request_type TEXT DEFAULT 'devis',
  status TEXT NOT NULL DEFAULT 'En attente',
  vehicle_id TEXT,
  driver_id TEXT,
  requested_date DATE,
  processed_date DATE,
  amount NUMERIC(12,2),
  description TEXT,
  priority TEXT DEFAULT 'Moyenne',
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_insurance_requests_contact ON crm_insurance_requests(contact_id);
