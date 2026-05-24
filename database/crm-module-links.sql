-- Liens module → autre contact (inspire interlocutorLinkingService multisite)

CREATE TABLE IF NOT EXISTS crm_module_links (
  id TEXT PRIMARY KEY,
  source_contact_id TEXT NOT NULL,
  module_type TEXT NOT NULL,
  module_id TEXT NOT NULL,
  target_contact_id TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_module_links_source ON crm_module_links(source_contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_module_links_module ON crm_module_links(module_type, module_id);
