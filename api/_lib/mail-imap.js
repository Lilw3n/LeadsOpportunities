const { getSql } = require("./db");

function imapConfig() {
  const host = process.env.MAIL_IMAP_HOST || "leadsopportunities.fr";
  const user = process.env.MAIL_IMAP_USER || process.env.MAILBOX_ADDRESS;
  const pass = process.env.MAIL_IMAP_PASS;
  if (!user || !pass) {
    return null;
  }
  return {
    host,
    port: Number(process.env.MAIL_IMAP_PORT || 993),
    secure: process.env.MAIL_IMAP_SECURE !== "false",
    auth: { user, pass },
    tls: {
      rejectUnauthorized: process.env.MAIL_IMAP_TLS_INSECURE !== "true",
    },
  };
}

async function syncImapInbox() {
  const cfg = imapConfig();
  if (!cfg) {
    return {
      ok: false,
      skipped: true,
      error:
        "IMAP non configure. Ajoutez MAIL_IMAP_USER et MAIL_IMAP_PASS sur Vercel (boite contact@).",
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

  const sql = getSql();
  if (!sql) return { ok: false, error: "DATABASE_URL manquant" };

  const { ensureMailboxSchema } = require("./mail-store");
  await ensureMailboxSchema(sql);

  const hostsToTry = [cfg.host];
  if (cfg.host.indexOf("mail.") !== 0) {
    hostsToTry.push("mail." + cfg.host.replace(/^mail\./, ""));
  }

  let imported = 0;
  let lastErr = null;

  for (let h = 0; h < hostsToTry.length; h++) {
    const tryHost = hostsToTry[h];
    const client = new ImapFlow(Object.assign({}, cfg, { host: tryHost }));
    imported = 0;
    try {
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");
      try {
        const total = client.mailbox.exists || 0;
        const take = Math.min(Math.max(Number(process.env.MAIL_IMAP_FETCH_LIMIT) || 40, 5), 80);
        const start = Math.max(1, total - take + 1);

        for await (const msg of client.fetch(`${start}:*`, {
          uid: true,
          envelope: true,
          source: true,
        })) {
          const uid = "imap:INBOX:" + msg.uid;
          const parsed = msg.source ? await simpleParser(msg.source) : null;
          const fromAddr =
            (parsed && parsed.from && parsed.from.text) ||
            (msg.envelope && msg.envelope.from && msg.envelope.from[0]
              ? (msg.envelope.from[0].name || "") +
                " <" +
                (msg.envelope.from[0].address || "") +
                ">"
              : "inconnu");
          const toAddr =
            (parsed && parsed.to && parsed.to.text) ||
            (msg.envelope && msg.envelope.to && msg.envelope.to[0]
              ? msg.envelope.to[0].address
              : process.env.MAILBOX_ADDRESS || "");
          const subject =
            (parsed && parsed.subject) || (msg.envelope && msg.envelope.subject) || "(sans objet)";
          const bodyText = String((parsed && (parsed.text || parsed.textAsHtml)) || "").slice(
            0,
            12000
          );
          const bodyHtml = parsed && parsed.html ? String(parsed.html).slice(0, 20000) : null;
          const messageId = parsed && parsed.messageId ? String(parsed.messageId) : null;
          const inReplyTo = parsed && parsed.inReplyTo ? String(parsed.inReplyTo) : null;
          const date = (parsed && parsed.date) || (msg.envelope && msg.envelope.date) || new Date();
          const threadKey =
            (fromAddr.match(/<([^>]+)>/) || [])[1] ||
            fromAddr.toLowerCase().trim() ||
            uid;

          const id = "in_" + msg.uid;
          await sql`
            INSERT INTO mailbox_messages (
              id, direction, from_addr, to_addr, subject, body_text, body_html,
              thread_key, external_uid, message_id, in_reply_to, created_at
            ) VALUES (
              ${id}, 'inbound', ${fromAddr}, ${toAddr}, ${subject}, ${bodyText}, ${bodyHtml},
              ${threadKey}, ${uid}, ${messageId}, ${inReplyTo}, ${date.toISOString()}
            )
            ON CONFLICT (external_uid) DO UPDATE SET
              subject = EXCLUDED.subject,
              body_text = EXCLUDED.body_text,
              body_html = EXCLUDED.body_html
          `;
          imported++;
        }
      } finally {
        lock.release();
      }
      await client.logout();
      return { ok: true, imported, mailbox: cfg.auth.user, host: tryHost };
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
      "Connexion IMAP impossible sur " +
        hostsToTry.join(" et ") +
        ". Verifiez MAIL_IMAP_PASS et MAIL_IMAP_TLS_INSECURE=true.",
  };
}

module.exports = { syncImapInbox, imapConfig };
