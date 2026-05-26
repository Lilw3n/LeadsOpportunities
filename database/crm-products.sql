-- Catalogue produits CRM fiable et modifiable
-- A executer apres users.sql / crm.sql

CREATE TABLE IF NOT EXISTS crm_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  product_type TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  description TEXT,
  indicative_price_eur NUMERIC(12, 2),
  commission_rate NUMERIC(6, 2),
  audience TEXT DEFAULT '[]',
  internal_notes TEXT,
  validated_at TIMESTAMPTZ,
  created_by TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS crm_products_status_idx ON crm_products (status);
CREATE INDEX IF NOT EXISTS crm_products_category_idx ON crm_products (category);
