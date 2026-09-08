-- Consultations des visites virtuelles acquéreur (lien Leboncoin / Meta).
CREATE TABLE IF NOT EXISTS crm_immo_tour_views (
  id TEXT PRIMARY KEY,
  tour_token TEXT NOT NULL,
  property_id TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  first_name TEXT,
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  view_count INT NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_immo_tour_unique ON crm_immo_tour_views (tour_token, email);
