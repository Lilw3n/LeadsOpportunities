-- CRM Leads Opportunities — a executer sur Neon apres users.sql / site_leads.sql

-- Roles metier : admin | staff | commercial | apporteur | client
ALTER TABLE users ADD COLUMN IF NOT EXISTS crm_role TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS linked_contact_id TEXT;

CREATE INDEX IF NOT EXISTS idx_users_crm_role ON users(crm_role);

-- Contacts CRM (prospects, clients, apporteurs d'affaires)
CREATE TABLE IF NOT EXISTS crm_contacts (
  id TEXT PRIMARY KEY,
  contact_type TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT,
  assigned_to TEXT,
  notes TEXT,
  metadata TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_type ON crm_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_assigned ON crm_contacts(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_created ON crm_contacts(created_at DESC);

-- Historique / activites
CREATE TABLE IF NOT EXISTS crm_activities (
  id TEXT PRIMARY KEY,
  contact_id TEXT,
  lead_id TEXT,
  user_id TEXT,
  activity_type TEXT NOT NULL DEFAULT 'note',
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_contact ON crm_activities(contact_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_activities_lead ON crm_activities(lead_id);

-- Lien lead web -> contact CRM
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS contact_id TEXT;
CREATE INDEX IF NOT EXISTS idx_site_leads_contact ON site_leads(contact_id);

-- Mettre a jour les admins existants
UPDATE users SET crm_role = 'admin' WHERE role = 'admin' AND (crm_role IS NULL OR crm_role = '');
