-- Inventaire biens immobiliers + critères acquéreurs + parties + docs
-- Pas de scraping portails : URL manuelle (Leboncoin, SeLoger, ParuVendu…).

CREATE TABLE IF NOT EXISTS crm_immo_properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'appartement',
  status TEXT NOT NULL DEFAULT 'active',
  listing_source TEXT DEFAULT 'manual',
  listing_url TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  department TEXT,
  lat NUMERIC(10, 7),
  lng NUMERIC(10, 7),
  surface_m2 NUMERIC(10, 2),
  rooms NUMERIC(4, 1),
  bedrooms NUMERIC(4, 1),
  floor TEXT,
  has_elevator BOOLEAN DEFAULT FALSE,
  has_garage BOOLEAN DEFAULT FALSE,
  has_parking BOOLEAN DEFAULT FALSE,
  has_cave BOOLEAN DEFAULT FALSE,
  has_garden BOOLEAN DEFAULT FALSE,
  has_terrace BOOLEAN DEFAULT FALSE,
  has_balcony BOOLEAN DEFAULT FALSE,
  has_pool BOOLEAN DEFAULT FALSE,
  dependencies_json TEXT DEFAULT '{}',
  price_net NUMERIC(14, 2),
  price_fai NUMERIC(14, 2),
  honoraires NUMERIC(14, 2),
  dpe TEXT,
  ges TEXT,
  description TEXT,
  notes TEXT,
  photos_json TEXT DEFAULT '[]',
  metadata_json TEXT DEFAULT '{}',
  owner_contact_id TEXT,
  buyer_contact_id TEXT,
  lead_id TEXT,
  assigned_to TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_immo_properties_status ON crm_immo_properties(status);
CREATE INDEX IF NOT EXISTS idx_crm_immo_properties_city ON crm_immo_properties(city);
CREATE INDEX IF NOT EXISTS idx_crm_immo_properties_postal ON crm_immo_properties(postal_code);
CREATE INDEX IF NOT EXISTS idx_crm_immo_properties_owner ON crm_immo_properties(owner_contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_immo_properties_buyer ON crm_immo_properties(buyer_contact_id);

CREATE TABLE IF NOT EXISTS crm_immo_buyer_criteria (
  id TEXT PRIMARY KEY,
  contact_id TEXT,
  lead_id TEXT,
  label TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  property_types_json TEXT DEFAULT '[]',
  cities_json TEXT DEFAULT '[]',
  postal_codes_json TEXT DEFAULT '[]',
  departments_json TEXT DEFAULT '[]',
  radius_km NUMERIC(8, 2),
  center_lat NUMERIC(10, 7),
  center_lng NUMERIC(10, 7),
  surface_min NUMERIC(10, 2),
  surface_max NUMERIC(10, 2),
  rooms_min NUMERIC(4, 1),
  bedrooms_min NUMERIC(4, 1),
  budget_min NUMERIC(14, 2),
  budget_max NUMERIC(14, 2),
  price_mode TEXT DEFAULT 'fai',
  want_garage BOOLEAN DEFAULT FALSE,
  want_parking BOOLEAN DEFAULT FALSE,
  want_cave BOOLEAN DEFAULT FALSE,
  want_garden BOOLEAN DEFAULT FALSE,
  want_terrace BOOLEAN DEFAULT FALSE,
  want_balcony BOOLEAN DEFAULT FALSE,
  want_elevator BOOLEAN DEFAULT FALSE,
  want_pool BOOLEAN DEFAULT FALSE,
  must_haves_json TEXT DEFAULT '[]',
  notes TEXT,
  metadata_json TEXT DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_immo_buyer_criteria_contact ON crm_immo_buyer_criteria(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_immo_buyer_criteria_status ON crm_immo_buyer_criteria(status);

CREATE TABLE IF NOT EXISTS crm_immo_parties (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  contact_id TEXT,
  role TEXT NOT NULL DEFAULT 'prospect',
  name TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  share_pct NUMERIC(8, 4),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_immo_parties_property ON crm_immo_parties(property_id);
CREATE INDEX IF NOT EXISTS idx_crm_immo_parties_contact ON crm_immo_parties(contact_id);
-- Migration soft : ALTER TABLE crm_immo_parties ADD COLUMN IF NOT EXISTS share_pct NUMERIC(8, 4);
-- Migration soft : ALTER TABLE crm_immo_parties ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS crm_immo_documents (
  id TEXT PRIMARY KEY,
  property_id TEXT,
  contact_id TEXT,
  doc_type TEXT NOT NULL DEFAULT 'autre',
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  data_json TEXT DEFAULT '{}',
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_immo_documents_property ON crm_immo_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_crm_immo_documents_contact ON crm_immo_documents(contact_id);
