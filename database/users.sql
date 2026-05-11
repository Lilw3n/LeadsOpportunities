-- Table users pour l'authentification
-- A executer dans Neon (ou tout Postgres)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  reset_code TEXT,
  reset_code_expires TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Ajouter colonne status aux leads existants
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS assigned_to TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
