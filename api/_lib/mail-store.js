const { randomUUID } = require("crypto");
const { getSql } = require("./db");

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
    ON CONFLICT (id) DO NOTHING
  `;
}

async function listMessages(limit, offset) {
  const sql = getSql();
  if (!sql) return { messages: [], total: 0 };

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
      COUNT(*) FILTER (WHERE external_uid IS NOT NULL)::int AS imap_messages
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
    },
  };
}

async function saveOutbound({ to, subject, bodyText, inReplyTo, threadKey }) {
  const sql = getSql();
  if (!sql) throw new Error("Base de donnees non configuree");

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
  importLeadMessages,
  listMessages,
  saveOutbound,
  getMessageById,
};
