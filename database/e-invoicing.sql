-- Facturation électronique B2B (réforme 1er septembre 2026 / 2027)

CREATE TABLE IF NOT EXISTS e_invoicing_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  payload TEXT NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS e_invoices_received (
  id TEXT PRIMARY KEY,
  supplier_name TEXT,
  supplier_siren TEXT,
  invoice_number TEXT,
  invoice_date DATE,
  due_date DATE,
  currency TEXT NOT NULL DEFAULT 'EUR',
  amount_ht NUMERIC(14,2),
  amount_tva NUMERIC(14,2),
  amount_ttc NUMERIC(14,2),
  format TEXT DEFAULT 'unknown',
  pdp_status TEXT DEFAULT 'manual',
  channel TEXT DEFAULT 'email_pdf',
  notes TEXT,
  payload TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_e_inv_recv_date ON e_invoices_received (invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_e_inv_recv_siren ON e_invoices_received (supplier_siren);

CREATE TABLE IF NOT EXISTS e_invoices_issued (
  id TEXT PRIMARY KEY,
  buyer_name TEXT,
  buyer_siren TEXT,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  currency TEXT NOT NULL DEFAULT 'EUR',
  operation_type TEXT NOT NULL DEFAULT 'services',
  amount_ht NUMERIC(14,2) NOT NULL,
  vat_rate NUMERIC(5,2) NOT NULL DEFAULT 20,
  amount_tva NUMERIC(14,2),
  amount_ttc NUMERIC(14,2),
  delivery_address TEXT,
  vat_on_debits BOOLEAN DEFAULT FALSE,
  line_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  xml_cii TEXT,
  contact_id TEXT,
  quote_id TEXT,
  notes TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_e_inv_issued_number ON e_invoices_issued (invoice_number);
CREATE INDEX IF NOT EXISTS idx_e_inv_issued_date ON e_invoices_issued (invoice_date DESC);

CREATE TABLE IF NOT EXISTS e_invoice_make_sync (
  id TEXT PRIMARY KEY,
  direction TEXT,
  event TEXT,
  external_id TEXT,
  invoice_number TEXT,
  payload TEXT,
  status TEXT DEFAULT 'received',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_e_inv_make_sync_created ON e_invoice_make_sync (created_at DESC);
