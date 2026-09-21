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

function uidFromExternal(externalUid, uidPrefix) {
  const prefix = uidPrefix || "imap:INBOX:";
  const s = String(externalUid || "");
  if (s.indexOf(prefix) !== 0) return null;
  const n = Number(s.slice(prefix.length));
  return Number.isFinite(n) && n > 0 ? n : null;
}

async function getImportedUidBounds(sql, uidPrefix) {
  const like = uidPrefix + "%";
  const rows = await sql`
    SELECT external_uid FROM mailbox_messages WHERE external_uid LIKE ${like}
  `;
  let min = null;
  let max = null;
  for (let i = 0; i < rows.length; i++) {
    const u = uidFromExternal(rows[i].external_uid, uidPrefix);
    if (u == null) continue;
    if (min == null || u < min) min = u;
    if (max == null || u > max) max = u;
  }
  return { min: min, max: max };
}

async function getBackfillNextUid(sql, metaId) {
  const rows = await sql`
    SELECT backfill_next_uid FROM mailbox_sync_meta WHERE id = ${metaId} LIMIT 1
  `;
  const v = rows[0] && rows[0].backfill_next_uid;
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function setBackfillNextUid(sql, metaId, uid) {
  await sql`
    INSERT INTO mailbox_sync_meta (id, backfill_next_uid)
    VALUES (${metaId}, ${uid != null ? uid : null})
    ON CONFLICT (id) DO UPDATE SET backfill_next_uid = EXCLUDED.backfill_next_uid
  `;
}

/**
 * Importe les anciens e-mails (UIDs plus bas que ceux déjà synchronisés).
 * Utile pour l'historique o2switch avant Google Workspace.
 */
async function backfillOneSource(sql, simpleParser, ImapFlow, source, mailboxAddress) {
  const batch = Math.min(Math.max(Number(process.env.MAIL_IMAP_BACKFILL_BATCH) || 40, 5), 100);
  const hostsToTry = imapHosts(source.host, source.id);
  const cfgBase = {
    port: source.port,
    secure: source.secure,
    auth: source.auth,
  };
  let lastErr = null;

  for (let h = 0; h < hostsToTry.length; h++) {
    const tryHost = hostsToTry[h];
    const client = new ImapFlow(
      Object.assign({}, cfgBase, {
        host: tryHost,
        tls: tlsOptions(tryHost, source.id),
        connectionTimeout: Number(process.env.MAIL_IMAP_CONNECT_TIMEOUT_MS) || 8000,
        greetingTimeout: Number(process.env.MAIL_IMAP_GREETING_TIMEOUT_MS) || 8000,
        socketTimeout: Number(process.env.MAIL_IMAP_SOCKET_TIMEOUT_MS) || 45000,
        logger: false,
      })
    );
    try {
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");
      let imported = 0;
      let maxUid = 0;
      let inboxMaxUid = 0;
      let highUid = 0;
      let lowUid = 0;
      try {
        const uidNext = Number(client.mailbox && client.mailbox.uidNext) || 1;
        inboxMaxUid = Math.max(0, uidNext - 1);
        if (inboxMaxUid < 1) {
          await setBackfillNextUid(sql, source.metaId, 0);
          return {
            ok: true,
            source: source.id,
            label: source.label,
            metaId: source.metaId,
            imported: 0,
            backfillComplete: true,
            inboxMaxUid: 0,
            host: tryHost,
          };
        }

        const bounds = await getImportedUidBounds(sql, source.uidPrefix);
        let nextStored = await getBackfillNextUid(sql, source.metaId);
        if (nextStored === 0) {
          return {
            ok: true,
            source: source.id,
            label: source.label,
            metaId: source.metaId,
            imported: 0,
            backfillComplete: true,
            inboxMaxUid: inboxMaxUid,
            host: tryHost,
          };
        }

        if (nextStored != null && nextStored > 0) {
          highUid = nextStored;
        } else if (bounds.min != null && bounds.min > 1) {
          highUid = bounds.min - 1;
        } else if (bounds.min === 1) {
          await setBackfillNextUid(sql, source.metaId, 0);
          return {
            ok: true,
            source: source.id,
            label: source.label,
            metaId: source.metaId,
            imported: 0,
            backfillComplete: true,
            inboxMaxUid: inboxMaxUid,
            host: tryHost,
          };
        } else {
          highUid = inboxMaxUid;
        }

        highUid = Math.min(highUid, inboxMaxUid);
        if (highUid < 1) {
          await setBackfillNextUid(sql, source.metaId, 0);
          return {
            ok: true,
            source: source.id,
            label: source.label,
            metaId: source.metaId,
            imported: 0,
            backfillComplete: true,
            inboxMaxUid: inboxMaxUid,
            host: tryHost,
          };
        }

        lowUid = Math.max(1, highUid - batch + 1);
        const range = lowUid + ":" + highUid;

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

      const nextUid = lowUid > 1 ? lowUid - 1 : 0;
      await setBackfillNextUid(sql, source.metaId, nextUid);
      const lastForward = await getLastImapUid(sql, source.metaId);
      if (maxUid > lastForward) {
        await sql`
          INSERT INTO mailbox_sync_meta (id, last_imap_uid)
          VALUES (${source.metaId}, ${maxUid})
          ON CONFLICT (id) DO UPDATE SET last_imap_uid = GREATEST(mailbox_sync_meta.last_imap_uid, EXCLUDED.last_imap_uid)
        `;
      }

      return {
        ok: true,
        source: source.id,
        label: source.label,
        metaId: source.metaId,
        imported: imported,
        backfillComplete: nextUid < 1,
        backfillNextUid: nextUid,
        backfillRange: { from: lowUid, to: highUid },
        inboxMaxUid: inboxMaxUid,
        host: tryHost,
        lastUid: Math.max(maxUid, lastForward),
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

async function backfillImapInbox(existingSql, options) {
  options = options || {};
  const wantSource = String(options.source || "o2switch").toLowerCase().trim();
  const sources = listImapSources().filter(function (s) {
    return s.id === wantSource;
  });
  if (!sources.length) {
    return {
      ok: false,
      skipped: true,
      error:
        "Source IMAP « " +
        wantSource +
        " » indisponible. Vérifiez MAIL_IMAP_PROVIDER=both et MAIL_IMAP_PASS_O2SWITCH sur Vercel.",
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
  const r = await backfillOneSource(sql, simpleParser, ImapFlow, sources[0], mailboxAddress);
  return Object.assign({ mode: "backfill", mailbox: mailboxUser() }, r);
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
        connectionTimeout: Number(process.env.MAIL_IMAP_CONNECT_TIMEOUT_MS) || 8000,
        greetingTimeout: Number(process.env.MAIL_IMAP_GREETING_TIMEOUT_MS) || 8000,
        socketTimeout: Number(process.env.MAIL_IMAP_SOCKET_TIMEOUT_MS) || 20000,
        logger: false,
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

async function testOneSource(ImapFlow, source) {
  const hostsToTry = imapHosts(source.host, source.id);
  const cfgBase = {
    port: source.port,
    secure: source.secure,
    auth: source.auth,
  };
  let lastErr = null;

  for (let h = 0; h < hostsToTry.length; h++) {
    const tryHost = hostsToTry[h];
    const client = new ImapFlow(
      Object.assign({}, cfgBase, {
        host: tryHost,
        auth: source.auth,
        tls: tlsOptions(tryHost, source.id),
        connectionTimeout: Number(process.env.MAIL_IMAP_CONNECT_TIMEOUT_MS) || 10000,
        greetingTimeout: Number(process.env.MAIL_IMAP_GREETING_TIMEOUT_MS) || 10000,
        socketTimeout: Number(process.env.MAIL_IMAP_SOCKET_TIMEOUT_MS) || 15000,
        logger: false,
      })
    );
    try {
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");
      const inboxTotal = client.mailbox.exists || 0;
      const uidNext = Number(client.mailbox.uidNext) || 1;
      lock.release();
      await client.logout();
      return {
        ok: true,
        source: source.id,
        label: source.label,
        host: tryHost,
        user: source.auth.user,
        inboxTotal: inboxTotal,
        maxUid: Math.max(0, uidNext - 1),
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
    user: source.auth.user,
    error: (lastErr && lastErr.message) || "Connexion IMAP impossible",
  };
}

/** Test connexion IMAP (sans importer) — diagnostic mots de passe Vercel */
async function testImapSources() {
  const sources = listImapSources();
  if (!sources.length) {
    return {
      ok: false,
      configured: false,
      provider: process.env.MAIL_IMAP_PROVIDER || "auto",
      mailbox: mailboxUser(),
      error:
        "IMAP non configuré. Vercel : MAIL_IMAP_PROVIDER=both, MAIL_IMAP_PASS_WORKSPACE, MAIL_IMAP_PASS_O2SWITCH puis Redeploy.",
      sources: [],
    };
  }

  let ImapFlow;
  try {
    ImapFlow = require("imapflow").ImapFlow;
  } catch (e) {
    return { ok: false, error: "Module imapflow manquant", sources: [] };
  }

  const results = [];
  for (let i = 0; i < sources.length; i++) {
    results.push(await testOneSource(ImapFlow, sources[i]));
  }

  const anyOk = results.some(function (r) {
    return r.ok;
  });

  return {
    ok: anyOk,
    configured: true,
    provider: process.env.MAIL_IMAP_PROVIDER || "auto",
    mailbox: mailboxUser(),
    sources: results,
    error: anyOk
      ? null
      : results
          .map(function (r) {
            return r.label + ": " + (r.error || "échec");
          })
          .join(" · "),
  };
}

module.exports = {
  imapConfig,
  listImapSources,
  syncImapInbox,
  backfillImapInbox,
  testImapSources,
  mailboxUser,
};
