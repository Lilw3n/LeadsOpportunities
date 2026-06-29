-- Marchés physiques et créneaux de présence équipe
-- Exécuter sur Neon ou laisser l'API créer les tables au premier appel.

CREATE TABLE IF NOT EXISTS crm_markets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  postal_code TEXT,
  address TEXT,
  day_of_week INT,
  default_start_time TEXT,
  default_end_time TEXT,
  recurrence TEXT NOT NULL DEFAULT 'weekly',
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_presence_slots (
  id TEXT PRIMARY KEY,
  market_id TEXT REFERENCES crm_markets(id) ON DELETE SET NULL,
  slot_date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  assigned_name TEXT,
  assigned_user_id TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  notes TEXT,
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS crm_presence_slots_date_idx ON crm_presence_slots (slot_date);
CREATE INDEX IF NOT EXISTS crm_presence_slots_market_idx ON crm_presence_slots (market_id, slot_date);
CREATE INDEX IF NOT EXISTS crm_markets_active_idx ON crm_markets (active);
