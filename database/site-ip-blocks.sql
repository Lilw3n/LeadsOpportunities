-- IPs bloquées (spam / robots) — les formulaires de ces IP sont ignorés
CREATE TABLE IF NOT EXISTS site_ip_blocks (
  ip TEXT PRIMARY KEY,
  blocked BOOLEAN NOT NULL DEFAULT true,
  reason TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_ip_blocks_blocked_idx ON site_ip_blocks (blocked) WHERE blocked = true;
