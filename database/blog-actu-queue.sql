-- File d'attente actu (Cafeyn bookmarklet, inbox web) — lu par fetch + GHA
CREATE TABLE IF NOT EXISTS blog_actu_queue (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT DEFAULT '',
  source TEXT DEFAULT 'cafeyn',
  note TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blog_actu_queue_status_idx ON blog_actu_queue (status, added_at DESC);
