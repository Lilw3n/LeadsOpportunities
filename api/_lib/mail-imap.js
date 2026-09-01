const { getSql } = require("./db");

function o2switchServerHosts() {
  const fromEnv = process.env.MAIL_IMAP_HOST_O2SWITCH;
  if (fromEnv) {
    return fromEnv
      .split(/[,;]/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }
  return ["mail.sodium.o2switch.net", "sodium.o2switch.net"];
}

function imapHosts(host, sourceId) {
  if (sourceId === "workspace") {
    return ["imap.gmail.com"];
  }
  const base = String(host || "leadsopportunities.fr")
    .replace(/^mail\./, "")
    .replace(/^imap\./, "");
  const list = o2switchServerHosts().concat([host, base, "mail." + base, "imap." + base]).filter(Boolean);
  const seen = new Set();
  return list.filter(function (h) {
    const k = h.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Certificat o2switch = *.sodium.o2switch.net, pas mail.leadsopportunities.fr */
function tlsOptions(connectHost, sourceId) {
  if (sourceId === "workspace") {
    return {
      rejectUnauthorized: process.env.MAIL_IMAP_TLS_STRICT !== "false",
      servername: "imap.gmail.com",
      minVersion: "TLSv1.2",
    };
  }
  if (process.env.MAIL_IMAP_TLS_STRICT === "true") {
    return { rejectUnauthorized: true, servername: connectHost };
  }

  const servername = process.env.MAIL_IMAP_TLS_SERVERNAME || "mail.sodium.o2switch.net";

  return {
    rejectUnauthorized: false,
    servername: servername,
    minVersion: "TLSv1.2",
    checkServerIdentity: function () {
      return undefined;
    },
  };
}

function mailboxUser() {
  return (
    process.env.MAIL_IMAP_USER ||
    process.env.MAILBOX_ADDRESS ||
    "contact@leadsopportunities.fr"
  ).trim();
}

/**
 * Sources IMAP : Workspace (Gmail) et/ou o2switch (secours si abonnement Google stoppé).
 * MAIL_IMAP_PROVIDER = auto | workspace | gmail | o2switch | both
 */
function listImapSources() {
  var provider = String(process.env.MAIL_IMAP_PROVIDER || "auto").toLowerCase().trim();
  var user = mailboxUser();
  var passWs = String(process.env.MAIL_IMAP_PASS_WORKSPACE || "").trim();
  var passO2 = String(process.env.MAIL_IMAP_PASS_O2SWITCH || "").trim();
  var passLegacy = String(process.env.MAIL_IMAP_PASS || "").trim();
  var hostLegacy = String(process.env.MAIL_IMAP_HOST || "").toLowerCase();

  var wantWs = false;
  var wantO2 = false;

  if (provider === "both") {
    wantWs = true;
    wantO2 = true;
  } else if (provider === "workspace" || provider === "gmail") {
    wantWs = true;
  } else if (provider === "o2switch") {
    wantO2 = true;
  } else {
    // auto
    if (passWs && passO2) {
      wantWs = true;
      wantO2 = true;
    } else if (passWs) {
      wantWs = true;
    } else if (passO2) {
      wantO2 = true;
    } else if (passLegacy) {
      if (hostLegacy.indexOf("gmail") >= 0) wantWs = true;
      else wantO2 = true;
    }
  }

  var sources = [];

  if (wantWs) {
    var pWs = passWs;
    if (
      !pWs &&
      (hostLegacy.indexOf("gmail") >= 0 ||
        provider === "workspace" ||
        provider === "gmail")
    ) {
      pWs = passLegacy;
    }
    if (pWs) {
      sources.push({
        id: "workspace",
        label: "Google Workspace",
        metaId: "contact_workspace",
        uidPrefix: "imap:ws:INBOX:",
        host: "imap.gmail.com",
        port: Number(process.env.MAIL_IMAP_PORT_WORKSPACE || 993),
        secure: true,
        auth: { user: user, pass: pWs },
      });
    }
  }

  if (wantO2) {
    var pO2 = passO2;
    if (!pO2 && provider === "o2switch") pO2 = passLegacy;
    if (!pO2 && provider === "auto" && !passWs && hostLegacy.indexOf("gmail") < 0) {
      pO2 = passLegacy;
    }
    if (pO2) {
      sources.push({
        id: "o2switch",
        label: "o2switch (secours)",
        metaId: "contact",
        uidPrefix: "imap:INBOX:",
        host: process.env.MAIL_IMAP_HOST || "mail.sodium.o2switch.net",
        port: Number(process.env.MAIL_IMAP_PORT || 993),
        secure: process.env.MAIL_IMAP_SECURE !== "false",
        auth: { user: user, pass: pO2 },
      });
    }
  }

  return sources;
}

/** Compat : première source ou legacy unique. */
function imapConfig() {
  var sources = listImapSources();
  if (!sources.length) return null;
  var s = sources[0];
  return {
    host: s.host,
    port: s.port,
    secure: s.secure,
    auth: s.auth,
    tls: tlsOptions(s.host, s.id),
    sourceId: s.id,
    metaId: s.metaId,
    uidPrefix: s.uidPrefix,
    label: s.label,
  };
}

async function getLastImapUid(sql, metaId) {
  const id = metaId || "contact";
  const rows = await sql`
    SELECT last_imap_uid FROM mailbox_sync_meta WHERE id = ${id} LIMIT 1
  `;
  return Number(rows[0]?.last_imap_uid) || 0;
}

async function importOneMessage(sql, simpleParser, msg, mailboxAddress, uidPrefix) {
  const prefix = uidPrefix || "imap:INBOX:";
  const uid = prefix + msg.uid;
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
      ${"in_" + prefix.replace(/[^a-z0-9]/gi, "") + msg.uid},
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

async function syncOneSource(sql, simpleParser, ImapFlow, source, mailboxAddress) {
  const lastUid = await getLastImapUid(sql, source.metaId);
  const hostsToTry = imapHosts(source.host, source.id);
  const take = Math.min(Math.max(Number(process.env.MAIL_IMAP_FETCH_LIMIT) || 60, 10), 150);
  const cfgBase = {
    port: source.port,
    secure: source.secure,
    auth: source.auth,
  };

  let imported = 0;
  let maxUid = lastUid;
  let lastErr = null;

  for (let h = 0; h < hostsToTry.length; h++) {
    const tryHost = hostsToTry[h];
    const client = new ImapFlow(
      Object.assign({}, cfgBase, {
        host: tryHost,
        tls: tlsOptions(tryHost, source.id),
      })
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
          range = lastUid + 1 + ":*";
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
          const uid = await importOneMessage(
            sql,
            simpleParser,
            msg,
            mailboxAddress,
            source.uidPrefix
          );
          if (uid > maxUid) maxUid = uid;
          imported++;
        }
      } finally {
        lock.release();
      }
      await client.logout();
      return {
        ok: true,
        source: source.id,
        label: source.label,
        metaId: source.metaId,
        imported,
        mailbox: source.auth.user,
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
    source: source.id,
    label: source.label,
    metaId: source.metaId,
    error:
      (lastErr && lastErr.message) ||
      "Connexion IMAP impossible (" + source.label + ")",
  };
}

async function syncImapInbox(existingSql) {
  const sources = listImapSources();
  if (!sources.length) {
    return {
      ok: false,
      skipped: true,
      error:
        "IMAP non configuré. Ajoutez MAIL_IMAP_PASS_WORKSPACE (mot de passe d'application Google) et/ou MAIL_IMAP_PASS_O2SWITCH sur Vercel. MAIL_IMAP_PROVIDER=both pour les deux.",
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
  const results = [];
  let importedTotal = 0;
  let anyOk = false;

  for (let i = 0; i < sources.length; i++) {
    const r = await syncOneSource(sql, simpleParser, ImapFlow, sources[i], mailboxAddress);
    results.push(r);
    if (r.ok) {
      anyOk = true;
      importedTotal += r.imported || 0;
    }
  }

  const primary = results.find(function (r) {
    return r.ok && r.source === "workspace";
  }) || results.find(function (r) {
    return r.ok;
  }) || results[0];

  return {
    ok: anyOk,
    imported: importedTotal,
    mailbox: mailboxUser(),
    host: primary && primary.host,
    lastUid: primary && primary.lastUid,
    inboxTotal: primary && primary.inboxTotal,
    sources: results,
    error: anyOk
      ? null
      : (primary && primary.error) ||
        results
          .map(function (r) {
            return r.error;
          })
          .filter(Boolean)
          .join(" · "),
  };
}

module.exports = {
  imapConfig,
  listImapSources,
  syncImapInbox,
  mailboxUser,
};
