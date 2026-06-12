-- Pieces jointes dossier (landings VTC, etc.) — a executer sur Neon
CREATE TABLE IF NOT EXISTS lead_documents (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  contact_id TEXT,
  email TEXT,
  vertical TEXT NOT NULL DEFAULT 'vtc',
  doc_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  file_size INT,
  content_base64 TEXT,
  drive_file_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  reject_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lead_documents_lead_idx ON lead_documents (lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lead_documents_status_idx ON lead_documents (status, created_at DESC);
CREATE INDEX IF NOT EXISTS lead_documents_email_idx ON lead_documents (LOWER(email));

-- Dossier Google Drive par lead (cree au premier upload)
ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS drive_folder_id TEXT;
