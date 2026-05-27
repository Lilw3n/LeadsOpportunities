const { randomUUID } = require("crypto");
const { getSql } = require("./db");

async function ensureMailboxSchema(sql) {
  if (!sql) return false;
  await sql`
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
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_mailbox_created ON mailbox_messages (created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_mailbox_thread ON mailbox_messages (thread_key)
  `;
  return true;
}

async function importLeadMessages(sql) {
  const mailbox = process.env.MAILBOX_ADDRESS || "contact@leadsopportunities.fr";
  await sql`
    INSERT INTO mailbox_messages (
      id, direction, from_addr, to_addr, subject, body_text, thread_key, created_at
    )
    SELECT
      'lead_' || id,
      'inbound',
      COALESCE(email, phone, 'visiteur'),
      ${mailbox},
      'Demande site — ' || COALESCE(vertical, 'lead'),
      LEFT(COALESCE(payload, ''), 8000),
      COALESCE(NULLIF(LOWER(TRIM(email)), ''), id),
      created_at
    FROM site_leads
    WHERE (email IS NOT NULL AND TRIM(email) != '')
       OR (phone IS NOT NULL AND TRIM(phone) != '')
    ON CONFLICT (id) DO UPDATE SET
      from_addr = EXCLUDED.from_addr,
      subject = EXCLUDED.subject,
      body_text = EXCLUDED.body_text,
      thread_key = EXCLUDED.thread_key
  `;
}

async function listMessages(limit, offset) {
  const sql = getSql();
  if (!sql) return { messages: [], total: 0 };

  await ensureMailboxSchema(sql);
  await importLeadMessages(sql);

  const lim = Math.min(Math.max(Number(limit) || 40, 1), 100);
  const off = Math.max(Number(offset) || 0, 0);

  const rows = await sql`
    SELECT id, direction, from_addr, to_addr, subject, body_text, body_html,
           thread_key, message_id, in_reply_to, lead_id, external_uid, created_at
    FROM mailbox_messages
    ORDER BY created_at DESC
    LIMIT ${lim} OFFSET ${off}
  `;
  const statsRows = await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE direction = 'inbound')::int AS inbound,
      COUNT(*) FILTER (WHERE direction = 'outbound')::int AS outbound,
      COUNT(*) FILTER (WHERE id LIKE 'lead_%')::int AS site_leads,
      COUNT(*) FILTER (WHERE external_uid IS NOT NULL)::int AS imap_messages,
      COUNT(*) FILTER (
        WHERE id LIKE 'lead_%' AND created_at > NOW() - INTERVAL '7 days'
      )::int AS site_last_7d
    FROM mailbox_messages
  `;
  const s = statsRows[0] || {};
  return {
    messages: rows,
    total: s.total || 0,
    stats: {
      total: s.total || 0,
      inbound: s.inbound || 0,
      outbound: s.outbound || 0,
      siteLeads: s.site_leads || 0,
      imapMessages: s.imap_messages || 0,
      siteLast7d: s.site_last_7d || 0,
    },
  };
}

async function saveOutbound({ to, subject, bodyText, inReplyTo, threadKey }) {
  const sql = getSql();
  if (!sql) throw new Error("Base de donnees non configuree");

  await ensureMailboxSchema(sql);

  const from =
    process.env.MAILBOX_FROM ||
    process.env.LEAD_FROM_EMAIL ||
    "Leads Opportunities <contact@leadsopportunities.fr>";
  const id = "out_" + randomUUID();

  await sql`
    INSERT INTO mailbox_messages (
      id, direction, from_addr, to_addr, subject, body_text, thread_key, in_reply_to, created_at
    ) VALUES (
      ${id}, 'outbound', ${from}, ${to}, ${subject}, ${bodyText}, ${threadKey || to},
      ${inReplyTo || null}, NOW()
    )
  `;
  return { id, from };
}

async function getMessageById(id) {
  const sql = getSql();
  if (!sql || !id) return null;
  const rows = await sql`
    SELECT id, direction, from_addr, to_addr, subject, body_text, message_id, thread_key
    FROM mailbox_messages WHERE id = ${id} LIMIT 1
  `;
  return rows[0] || null;
}

module.exports = {
  ensureMailboxSchema,
  importLeadMessages,
  listMessages,
  saveOutbound,
  getMessageById,
};
