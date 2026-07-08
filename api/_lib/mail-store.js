const { randomUUID } = require("crypto");
const { getSql } = require("./db");
const {
  parsePayloadSafe,
  classifyLeadInboxKind,
  subjectForKind,
} = require("./lead-inbox-kind");

function leadFromAddr(row, payload) {
  var email = (row.email || payload.email || "").trim();
  if (email) return email;
  var phone = (row.phone || payload.phone || "").trim();
  if (phone) return phone;
  var visitor = (payload.visitor_id || payload.visitorId || row.visitor_id || "").trim();
  if (visitor) return "visiteur:" + visitor.slice(0, 40);
  return "questionnaire:" + String(row.id || "").slice(0, 12);
}

function leadThreadKey(row, payload) {
  var email = (row.email || payload.email || "").trim().toLowerCase();
  if (email) return email;
  var phone = (row.phone || payload.phone || "").trim();
  if (phone) return phone;
  return String(row.id || randomUUID());
}

function formatLeadBodyText(row, payload, kind) {
  var step = Number(row.questionnaire_step || payload.questionnaire_step || payload.step || 0);
  var total = Number(row.questionnaire_total || payload.questionnaire_total || 10) || 10;
  var typeLabel =
    kind === "express_callback"
      ? "Rappel express"
      : kind === "contact_request"
      ? payload.callbackRequested || String(payload.journey || "") === "callback"
        ? "Rappel express"
        : "Demande de contact"
      : "Questionnaire";
  var lines = [
    "=== " + typeLabel + " ===",
    "Type: " + typeLabel,
    "ID lead : " + row.id,
    "Vertical : " + (row.vertical || payload.vertical || "—"),
    "Source : " + (row.source || payload.source || "site"),
    "Email : " + (row.email || payload.email || "—"),
    "Téléphone : " + (row.phone || payload.phone || "—"),
    "Étape : " + step + " / " + total,
    "Score : " + (row.lead_score != null ? row.lead_score : payload.leadScore != null ? payload.leadScore : "—"),
    "Ville : " + (row.city || payload.city || "—"),
    "Code postal : " + (row.postal_code || payload.postal_code || payload.postalCode || "—"),
    "Message : " + (payload.message || payload.comment || "—"),
    "Créé le : " + (row.created_at ? new Date(row.created_at).toISOString() : "—"),
    "",
    "Ouvrir : /crm-lead-detail.html?id=" + row.id,
    "",
    "--- Données JSON ---",
    JSON.stringify(payload, null, 2).slice(0, 7500),
  ];
  return lines.join("\n");
}

async function upsertLeadMailboxRow(sql, row) {
  if (!sql || !row || !row.id) return false;
  const mailbox = process.env.MAILBOX_ADDRESS || "contact@leadsopportunities.fr";
  const payload = parsePayloadSafe(row.payload);
  const kind = classifyLeadInboxKind(row, payload);
  const id = "lead_" + row.id;
  const fromAddr = leadFromAddr(row, payload);
  const subject = subjectForKind(kind, row, payload);
  const bodyText = formatLeadBodyText(row, payload, kind);
  const threadKey = leadThreadKey(row, payload);
  const createdAt = row.created_at || new Date().toISOString();

  await sql`
    INSERT INTO mailbox_messages (
      id, direction, from_addr, to_addr, subject, body_text, thread_key, lead_id, category, created_at
    ) VALUES (
      ${id},
      'inbound',
      ${fromAddr},
      ${mailbox},
      ${subject},
      ${bodyText},
      ${threadKey},
      ${row.id},
      ${kind},
      ${createdAt}
    )
    ON CONFLICT (id) DO UPDATE SET
      from_addr = EXCLUDED.from_addr,
      subject = EXCLUDED.subject,
      body_text = EXCLUDED.body_text,
      thread_key = EXCLUDED.thread_key,
      lead_id = EXCLUDED.lead_id,
      category = EXCLUDED.category
  `;
  return true;
}

/** Sync immédiat d'un lead vers la messagerie dashboard */
async function syncLeadToMailbox(sql, leadId) {
  if (!sql || !leadId) return false;
  await ensureMailboxSchema(sql);
  var rows = null;
  var tiers = [
    function () {
      return sql`
        SELECT id, email, phone, vertical, lead_score, source, payload, created_at,
               questionnaire_step, questionnaire_total, city, postal_code, visitor_id
        FROM site_leads WHERE id = ${leadId} LIMIT 1
      `;
    },
    function () {
      return sql`
        SELECT id, email, phone, vertical, lead_score, source, payload, created_at
        FROM site_leads WHERE id = ${leadId} LIMIT 1
      `;
    },
  ];
  for (var i = 0; i < tiers.length; i++) {
    try {
      rows = await tiers[i]();
      break;
    } catch (e) {
      if (i === tiers.length - 1) throw e;
    }
  }
  if (!rows || !rows.length) return false;
  return upsertLeadMailboxRow(sql, rows[0]);
}

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
      category TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE mailbox_messages ADD COLUMN IF NOT EXISTS category TEXT`;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_mailbox_created ON mailbox_messages (created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_mailbox_thread ON mailbox_messages (thread_key)
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS mailbox_sync_meta (
      id TEXT PRIMARY KEY,
      last_sync_at TIMESTAMPTZ,
      last_imap_uid BIGINT DEFAULT 0,
      last_error TEXT,
      last_host TEXT,
      imported_last INT DEFAULT 0
    )
  `;
  return true;
}

async function importLeadMessages(sql) {
  const mailbox = process.env.MAILBOX_ADDRESS || "contact@leadsopportunities.fr";
  var imported = 0;

  async function runImport(queryFn) {
    const rows = await queryFn();
    for (var i = 0; i < rows.length; i++) {
      try {
        await upsertLeadMailboxRow(sql, rows[i]);
        imported++;
      } catch (e) {
        console.warn("[mail-store] lead import row", rows[i] && rows[i].id, e.message);
      }
    }
    return imported;
  }

  try {
    return await runImport(function () {
      return sql`
        SELECT id, email, phone, vertical, lead_score, source, payload, created_at,
               questionnaire_step, questionnaire_total, city, postal_code, visitor_id
        FROM site_leads
        WHERE created_at >= NOW() - INTERVAL '365 days'
        ORDER BY created_at DESC
        LIMIT 500
      `;
    });
  } catch (e) {
    console.warn("[mail-store] import tier 1:", e.message);
  }

  try {
    return await runImport(function () {
      return sql`
        SELECT id, email, phone, vertical, lead_score, source, payload, created_at
        FROM site_leads
        WHERE created_at >= NOW() - INTERVAL '365 days'
        ORDER BY created_at DESC
        LIMIT 500
      `;
    });
  } catch (e2) {
    console.warn("[mail-store] import tier 2:", e2.message);
    return 0;
  }
}

async function listMessages(limit, offset) {
  const sql = getSql();
  if (!sql) return { messages: [], total: 0 };

  await ensureMailboxSchema(sql);
  try {
    await importLeadMessages(sql);
  } catch (e) {
    console.warn("[mail-store] importLeadMessages:", e.message);
  }

  const lim = Math.min(Math.max(Number(limit) || 40, 1), 100);
  const off = Math.max(Number(offset) || 0, 0);

  const rows = await sql`
    SELECT id, direction, from_addr, to_addr, subject, body_text, body_html,
           thread_key, message_id, in_reply_to, lead_id, category, external_uid, created_at
    FROM mailbox_messages
    ORDER BY created_at DESC
    LIMIT ${lim} OFFSET ${off}
  `;
  const statsRows = await sql`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE direction = 'inbound')::int AS inbound,
      COUNT(*) FILTER (WHERE direction = 'outbound')::int AS outbound,
      COUNT(*) FILTER (WHERE id LIKE 'lead_%' OR lead_id IS NOT NULL)::int AS site_leads,
      COUNT(*) FILTER (
        WHERE category = 'questionnaire' OR (category IS NULL AND (id LIKE 'lead_%' OR lead_id IS NOT NULL) AND subject ILIKE '%questionnaire%')
      )::int AS questionnaires,
      COUNT(*) FILTER (
        WHERE category = 'express_callback'
          OR subject ILIKE '%rappel express%'
          OR body_text ILIKE '%Demande de rappel express%'
          OR body_text ILIKE '%Type: Rappel express%'
      )::int AS express_callbacks,
      COUNT(*) FILTER (
        WHERE category = 'contact_request'
          OR (category IS NULL AND subject ILIKE '%demande de contact%')
      )::int AS contact_requests,
      COUNT(*) FILTER (WHERE external_uid IS NOT NULL)::int AS imap_messages,
      COUNT(*) FILTER (
        WHERE (id LIKE 'lead_%' OR lead_id IS NOT NULL) AND created_at > NOW() - INTERVAL '7 days'
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
      questionnaires: s.questionnaires || 0,
      expressCallbacks: s.express_callbacks || 0,
      contactRequests: s.contact_requests || 0,
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
  syncLeadToMailbox,
  upsertLeadMailboxRow,
  listMessages,
  saveOutbound,
  getMessageById,
};
