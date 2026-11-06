-- Réseau partenaires immo + multi-liens + partage honoraires + mandat (durée privée)
-- Exécuté aussi via ensureImmoNetworkSchema() au runtime Neon.

CREATE TABLE IF NOT EXISTS crm_immo_network_partners (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  -- negociateur | avocat | notaire | apporteur
  company TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  professional_id TEXT,
  -- ORIAS / barreau / chambre des notaires
  city TEXT,
  postal_code TEXT,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  -- pending | active | suspended
  password_hash TEXT,
  salt TEXT,
  invite_token TEXT,
  notes TEXT,
  metadata_json TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_immo_network_partners_email
  ON crm_immo_network_partners (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_crm_immo_network_partners_role
  ON crm_immo_network_partners (role);
CREATE INDEX IF NOT EXISTS idx_crm_immo_network_partners_status
  ON crm_immo_network_partners (status);

CREATE TABLE IF NOT EXISTS crm_immo_property_links (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  url TEXT NOT NULL,
  portal TEXT,
  label TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_immo_property_links_property
  ON crm_immo_property_links (property_id);

CREATE TABLE IF NOT EXISTS crm_immo_fee_agreements (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  partner_id TEXT,
  party_id TEXT,
  participant_role TEXT NOT NULL,
  -- sortant | entrant | negociateur | notaire | avocat | apporteur | agence
  deal_side TEXT,
  -- vendeur | acquereur | both
  share_pct NUMERIC(8, 4),
  share_amount NUMERIC(14, 2),
  base TEXT DEFAULT 'honoraires_ttc',
  -- honoraires_ttc | masse_negociateurs | part_agence
  label TEXT,
  legal_basis TEXT,
  -- ex. art. L.132-1 CCI / affichage honoraires / convention écrite
  status TEXT NOT NULL DEFAULT 'draft',
  -- draft | proposed | accepted | paid | cancelled
  notes TEXT,
  metadata_json TEXT DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_crm_immo_fee_agreements_property
  ON crm_immo_fee_agreements (property_id);
CREATE INDEX IF NOT EXISTS idx_crm_immo_fee_agreements_partner
  ON crm_immo_fee_agreements (partner_id);

-- Accès mandat durée : propriétaire (owner) + admin Wendy uniquement côté API
ALTER TABLE crm_immo_properties
  ADD COLUMN IF NOT EXISTS listing_urls_json TEXT DEFAULT '[]';
ALTER TABLE crm_immo_properties
  ADD COLUMN IF NOT EXISTS mandate_started_at DATE;
ALTER TABLE crm_immo_properties
  ADD COLUMN IF NOT EXISTS mandate_ends_at DATE;
ALTER TABLE crm_immo_properties
  ADD COLUMN IF NOT EXISTS mandate_form TEXT;
ALTER TABLE crm_immo_properties
  ADD COLUMN IF NOT EXISTS mandate_ref TEXT;
ALTER TABLE crm_immo_properties
  ADD COLUMN IF NOT EXISTS seo_slug TEXT;
ALTER TABLE crm_immo_properties
  ADD COLUMN IF NOT EXISTS seo_published BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS crm_immo_partner_property_access (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'contribute',
  -- view | contribute | fee_share
  invited_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (partner_id, property_id)
);
