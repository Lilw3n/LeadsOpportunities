-- Integrations : Google Calendar, Drive par contact, Stripe devis
-- Executer sur Neon apres google-auth.sql, crm.sql, crm-modules.sql, crm-quotes.sql

-- Google Calendar (OAuth utilisateur courtier972@gmail.com)
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_calendar_id TEXT DEFAULT 'primary';
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_calendar_connected_at TIMESTAMPTZ;

-- Sync evenements CRM <-> Google Calendar
ALTER TABLE crm_events ADD COLUMN IF NOT EXISTS google_event_id TEXT;
ALTER TABLE crm_events ADD COLUMN IF NOT EXISTS google_sync_status TEXT;
ALTER TABLE crm_events ADD COLUMN IF NOT EXISTS google_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_crm_events_google ON crm_events(google_event_id) WHERE google_event_id IS NOT NULL;

-- Google Drive : dossier par contact
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;

CREATE INDEX IF NOT EXISTS idx_crm_contacts_drive ON crm_contacts(drive_folder_id) WHERE drive_folder_id IS NOT NULL;

-- Stripe : acompte lie au devis
ALTER TABLE crm_quotes ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(12,2);
ALTER TABLE crm_quotes ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE crm_quotes ADD COLUMN IF NOT EXISTS stripe_payment_status TEXT;

CREATE INDEX IF NOT EXISTS idx_crm_quotes_stripe_session ON crm_quotes(stripe_session_id) WHERE stripe_session_id IS NOT NULL;
