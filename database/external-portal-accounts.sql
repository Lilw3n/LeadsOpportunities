-- Comptes portail acquéreur / vendeur / visiteur + retours de visite
-- À exécuter après users.sql, crm.sql et crm-modules.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS portal_role TEXT DEFAULT 'visitor';
ALTER TABLE users ADD COLUMN IF NOT EXISTS portal_status TEXT DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_users_portal_role ON users(portal_role);
CREATE INDEX IF NOT EXISTS idx_users_linked_contact_id ON users(linked_contact_id);

CREATE TABLE IF NOT EXISTS crm_visit_feedback (
  id TEXT PRIMARY KEY,
  event_id TEXT,
  contact_id TEXT NOT NULL,
  created_by_user_id TEXT,
  property_ref TEXT,
  visit_type TEXT NOT NULL DEFAULT 'onsite',
  rating SMALLINT NOT NULL DEFAULT 3,
  interested BOOLEAN DEFAULT TRUE,
  would_offer BOOLEAN DEFAULT FALSE,
  budget_note TEXT,
  comments TEXT,
  visitor_contacts_json TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_visit_feedback_contact ON crm_visit_feedback(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_visit_feedback_event ON crm_visit_feedback(event_id);

-- Exemple metadata portail sur crm_contacts.metadata :
-- {
--   "portal": {
--     "portalRole": "buyer",
--     "acquisitionStage": "recherche-active",
--     "preferredCity": "Nancy",
--     "budget": "220000-280000",
--     "notes": "Recherche maison 3 chambres"
--   }
-- }
