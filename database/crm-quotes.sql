-- Devis CRM (inspire IntelligentQuoteWizard / crm quotes multisite)

CREATE TABLE IF NOT EXISTS crm_quotes (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'vtc-taxi',
  status TEXT NOT NULL DEFAULT 'brouillon',
  title TEXT,
  data TEXT,
  premium_estimate NUMERIC(12,2),
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_quotes_contact ON crm_quotes(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_quotes_status ON crm_quotes(status);
