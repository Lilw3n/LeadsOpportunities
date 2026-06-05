-- Adresse IP visiteur (RGPD : usage anti-fraude / deduplication courtier)
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS client_ip TEXT;
CREATE INDEX IF NOT EXISTS site_leads_client_ip_idx ON site_leads (client_ip) WHERE client_ip IS NOT NULL;
