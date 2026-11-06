/**
 * Signature électronique — schéma Neon
 */
async function ensureESignatureSchema(sql) {
  if (!sql) return false;
  await sql`
    CREATE TABLE IF NOT EXISTS e_signature_requests (
      id TEXT PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      body_text TEXT NOT NULL DEFAULT '',
      signer_name TEXT,
      signer_email TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      signature_data_url TEXT,
      signed_at TIMESTAMPTZ,
      signer_ip TEXT,
      signer_ua TEXT,
      consent BOOLEAN DEFAULT FALSE,
      created_by TEXT,
      lead_id TEXT,
      contact_id TEXT,
      meta JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_esig_token ON e_signature_requests (token)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_esig_status ON e_signature_requests (status, created_at DESC)`;
  return true;
}

module.exports = { ensureESignatureSchema };
