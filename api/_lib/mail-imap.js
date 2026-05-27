const { getSql } = require("./db");

function imapHosts(host) {
  const base = String(host || "leadsopportunities.fr")
    .replace(/^mail\./, "")
    .replace(/^imap\./, "");
  const list = [host, base, "mail." + base, "imap." + base].filter(Boolean);
  const seen = new Set();
  return list.filter(function (h) {
    const k = h.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function tlsOptions(host) {
  if (process.env.MAIL_IMAP_TLS_STRICT === "true") {
    return { rejectUnauthorized: true };
  }
  if (process.env.MAIL_IMAP_TLS_INSECURE === "true") {
    return { rejectUnauthorized: false };
  }
  if (/leadsopportunities|o2switch/i.test(host)) {
    return { rejectUnauthorized: false };
  }
  return { rejectUnauthorized: true };
}

function imapConfig() {
  const host = process.env.MAIL_IMAP_HOST || "leadsopportunities.fr";
  const user = (
    process.env.MAIL_IMAP_USER ||
    process.env.MAILBOX_ADDRESS ||
    "contact@leadsopportunities.fr"
  ).trim();
  const pass = process.env.MAIL_IMAP_PASS;
  if (!user || !pass) {
    return null;
  }
  return {
    host,
    port: Number(process.env.MAIL_IMAP_PORT || 993),
    secure: process.env.MAIL_IMAP_SECURE !== "false",
    auth: { user, pass },
    tls: tlsOptions(host),
  };
}

async function getLastImapUid(sql) {
  const rows = await sql`
    SELECT last_imap_uid FROM mailbox_sync_meta WHERE id = 'contact' LIMIT 1
  `;
  return Number(rows[0]?.last_imap_uid) || 0;
}

async function importOneMessage(sql, simpleParser, msg, mailboxAddress) {
  const uid = "imap:INBOX:" + msg.uid;
  const parsed = msg.source ? await simpleParser(msg.source) : null;
  const fromAddr =
    (parsed && parsed.from && parsed.from.text) ||
    (msg.envelope && msg.envelope.from && msg.envelope.from[0]
      ? (msg.envelope.from[0].name || "") + " <" + (msg.envelope.from[0].address || "") + ">"
      : "inconnu");
  const toAddr =
    (parsed && parsed.to && parsed.to.text) ||
    (msg.envelope && msg.envelope.to && msg.envelope.to[0]
      ? msg.envelope.to[0].address
      : mailboxAddress);
  const subject =
    (parsed && parsed.subject) || (msg.envelope && msg.envelope.subject) || "(sans objet)";
  const bodyText = String((parsed && (parsed.text || parsed.textAsHtml)) || "").slice(0, 12000);
  const bodyHtml = parsed && parsed.html ? String(parsed.html).slice(0, 20000) : null;
  const messageId = parsed && parsed.messageId ? String(parsed.messageId) : null;
  const inReplyTo = parsed && parsed.inReplyTo ? String(parsed.inReplyTo) : null;
  const date = (parsed && parsed.date) || (msg.envelope && msg.envelope.date) || new Date();
  const threadKey =
    (fromAddr.match(/<([^>]+)>/) || [])[1] || fromAddr.toLowerCase().trim() || uid;

  await sql`
    INSERT INTO mailbox_messages (
      id, direction, from_addr, to_addr, subject, body_text, body_html,
      thread_key, external_uid, message_id, in_reply_to, created_at
    ) VALUES (
      ${"in_" + msg.uid},
      'inbound',
      ${fromAddr},
      ${toAddr},
      ${subject},
      ${bodyText},
      ${bodyHtml},
      ${threadKey},
      ${uid},
      ${messageId},
      ${inReplyTo},
      ${date.toISOString()}
    )
    ON CONFLICT (external_uid) DO UPDATE SET
      subject = EXCLUDED.subject,
      body_text = EXCLUDED.body_text,
      body_html = EXCLUDED.body_html,
      from_addr = EXCLUDED.from_addr,
      to_addr = EXCLUDED.to_addr
  `;
  return msg.uid;
}

async function syncImapInbox(existingSql) {
  const cfg = imapConfig();
  if (!cfg) {
    return {
      ok: false,
      skipped: true,
      error:
        "IMAP non configure. Ajoutez MAIL_IMAP_USER=contact@leadsopportunities.fr et MAIL_IMAP_PASS sur Vercel.",
    };
  }

  let ImapFlow;
  let simpleParser;
  try {
    ImapFlow = require("imapflow").ImapFlow;
    simpleParser = require("mailparser").simpleParser;
  } catch (e) {
    return { ok: false, error: "Modules mail non installes (imapflow, mailparser)." };
  }

  const sql = existingSql || getSql();
  if (!sql) return { ok: false, error: "DATABASE_URL manquant" };

  const { ensureMailboxSchema } = require("./mail-store");
  await ensureMailboxSchema(sql);

  const mailboxAddress = process.env.MAILBOX_ADDRESS || "contact@leadsopportunities.fr";
  const lastUid = await getLastImapUid(sql);
  const hostsToTry = imapHosts(cfg.host);
  const take = Math.min(Math.max(Number(process.env.MAIL_IMAP_FETCH_LIMIT) || 60, 10), 150);

  let imported = 0;
  let maxUid = lastUid;
  let lastErr = null;

  for (let h = 0; h < hostsToTry.length; h++) {
    const tryHost = hostsToTry[h];
    const client = new ImapFlow(
      Object.assign({}, cfg, { host: tryHost, tls: tlsOptions(tryHost) })
    );
    imported = 0;
    maxUid = lastUid;
    let inboxTotal = 0;
    try {
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");
      try {
        inboxTotal = client.mailbox.exists || 0;
        const total = inboxTotal;
        let range;
        if (lastUid > 0 && lastUid < total) {
          range = (lastUid + 1) + ":*";
        } else if (total > 0) {
          const start = Math.max(1, total - take + 1);
          range = start + ":*";
        } else {
          range = "1:*";
        }

        for await (const msg of client.fetch(range, {
          uid: true,
          envelope: true,
          source: true,
        })) {
          const uid = await importOneMessage(sql, simpleParser, msg, mailboxAddress);
          if (uid > maxUid) maxUid = uid;
          imported++;
        }
      } finally {
        lock.release();
      }
      await client.logout();
      return {
        ok: true,
        imported,
        mailbox: cfg.auth.user,
        host: tryHost,
        lastUid: maxUid,
        inboxTotal: inboxTotal,
      };
    } catch (e) {
      lastErr = e;
      try {
        await client.logout();
      } catch (err) {
        /* ignore */
      }
    }
  }

  return {
    ok: false,
    error:
      (lastErr && (lastErr.message || String(lastErr))) ||
      "Connexion IMAP impossible (" +
        hostsToTry.join(", ") +
        "). Verifiez MAIL_IMAP_PASS sur Vercel.",
  };
}

module.exports = { syncImapInbox, imapConfig, imapHosts };
