-- Ledger répartition encaissements Stripe (poche vs réserves charges FR)

CREATE TABLE IF NOT EXISTS agent_tax_prefs (
  user_id TEXT PRIMARY KEY,
  charges_pct NUMERIC(6,2) NOT NULL DEFAULT 22,
  cfe_pct NUMERIC(6,2) NOT NULL DEFAULT 0.5,
  accounting_pct NUMERIC(6,2) NOT NULL DEFAULT 1,
  agent_share_pct NUMERIC(6,2) NOT NULL DEFAULT 100,
  split_mode TEXT NOT NULL DEFAULT 'agent_gross',
  preset_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_payment_splits (
  id TEXT PRIMARY KEY,
  stripe_session_id TEXT UNIQUE,
  payment_link_id TEXT,
  amount_eur NUMERIC(12,2) NOT NULL,
  split_mode TEXT NOT NULL DEFAULT 'agent_gross',
  agent_share_pct NUMERIC(6,2),
  agent_gross_eur NUMERIC(12,2) NOT NULL,
  agency_keep_eur NUMERIC(12,2) DEFAULT 0,
  charges_pct NUMERIC(6,2),
  cfe_pct NUMERIC(6,2),
  accounting_pct NUMERIC(6,2),
  urssaf_reserve_eur NUMERIC(12,2) NOT NULL DEFAULT 0,
  cfe_reserve_eur NUMERIC(12,2) NOT NULL DEFAULT 0,
  accounting_reserve_eur NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_reserves_eur NUMERIC(12,2) NOT NULL DEFAULT 0,
  agent_net_eur NUMERIC(12,2) NOT NULL,
  preset_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_payment_splits_created
  ON agent_payment_splits (created_at DESC);
