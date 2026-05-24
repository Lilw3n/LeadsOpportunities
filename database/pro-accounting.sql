-- Comptabilite pro interne

CREATE TABLE IF NOT EXISTS pro_expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  amount_eur NUMERIC(12,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor TEXT,
  notes TEXT,
  proof_drive_file_id TEXT,
  tax_deductible BOOLEAN DEFAULT TRUE,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pro_expenses_date ON pro_expenses (expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_pro_expenses_category ON pro_expenses (category);

CREATE TABLE IF NOT EXISTS pro_revenue (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'stripe',
  amount_eur NUMERIC(12,2) NOT NULL,
  revenue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  stripe_session_id TEXT,
  quote_id TEXT,
  contact_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pro_revenue_date ON pro_revenue (revenue_date DESC);
