-- Relations entre personnes (famille, SCI, héritiers, parrainage).
-- Aucun montant : on ne promet jamais de rémunération aux apporteurs.

CREATE TABLE IF NOT EXISTS crm_contact_relationships (
  id TEXT PRIMARY KEY,
  from_contact_id TEXT NOT NULL,
  to_contact_id TEXT NOT NULL,
  rel_type TEXT NOT NULL,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (from_contact_id, to_contact_id, rel_type)
);
CREATE INDEX IF NOT EXISTS idx_crm_rel_from ON crm_contact_relationships(from_contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_rel_to ON crm_contact_relationships(to_contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_rel_type ON crm_contact_relationships(rel_type);

-- Quote-parts / forme juridique / capacité sur les parties d'un bien
ALTER TABLE crm_immo_parties ADD COLUMN IF NOT EXISTS share_pct NUMERIC;
ALTER TABLE crm_immo_parties ADD COLUMN IF NOT EXISTS legal_form TEXT;
ALTER TABLE crm_immo_parties ADD COLUMN IF NOT EXISTS capacity TEXT;
ALTER TABLE crm_immo_parties ADD COLUMN IF NOT EXISTS entity_name TEXT;
