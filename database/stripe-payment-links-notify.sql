-- Notification e-mail apres paiement Stripe
-- Executer apres stripe-payment-links.sql

ALTER TABLE stripe_payment_links ADD COLUMN IF NOT EXISTS notify_sent_at TIMESTAMPTZ;
