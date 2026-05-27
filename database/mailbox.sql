-- Boite mail dashboard (Neon) — optionnel si API deployee (auto-create au 1er chargement messagerie)
-- Safe a relancer : CREATE TABLE IF NOT EXISTS + index IF NOT EXISTS
CREATE TABLE IF NOT EXISTS mailbox_messages (
  id TEXT PRIMARY KEY,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  from_addr TEXT,
  to_addr TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  thread_key TEXT,
  external_uid TEXT UNIQUE,
  message_id TEXT,
  in_reply_to TEXT,
  lead_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mailbox_created ON mailbox_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mailbox_thread ON mailbox_messages (thread_key);
