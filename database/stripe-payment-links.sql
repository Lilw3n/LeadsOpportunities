-- Suivi des liens de paiement Stripe (messagerie, devis, acomptes)
-- Executer sur Neon apres integrations-calendar-drive-stripe.sql

CREATE TABLE IF NOT EXISTS stripe_payment_links (
  id TEXT PRIMARY KEY,
  stripe_session_id TEXT NOT NULL UNIQUE,
  customer_email TEXT,
  amount_eur NUMERIC(12,2),
  payment_kind TEXT,
  label TEXT,
  reference_id TEXT,
  contact_id TEXT,
  created_by TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  dossier_status TEXT NOT NULL DEFAULT 'awaiting_payment',
  paid_at TIMESTAMPTZ,
  notify_sent_at TIMESTAMPTZ,
  app_context TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_payment_links_status
  ON stripe_payment_links(payment_status, dossier_status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_stripe_payment_links_email
  ON stripe_payment_links(customer_email);
