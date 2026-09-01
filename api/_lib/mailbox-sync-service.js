const { syncImapInbox, listImapSources, imapConfig } = require("./mail-imap");
const { listMessages, ensureMailboxSchema } = require("./mail-store");
const { getSql } = require("./db");

async function recordOneMeta(sql, metaId, result) {
  const id = metaId || "contact";
  await sql`
    INSERT INTO mailbox_sync_meta (id, last_sync_at, last_imap_uid, last_error, last_host, imported_last)
    VALUES (
      ${id},
      NOW(),
      ${result.lastUid || null},
      ${result.ok ? null : result.error || "Erreur sync"},
      ${result.host || null},
      ${result.imported != null ? result.imported : 0}
    )
    ON CONFLICT (id) DO UPDATE SET
      last_sync_at = NOW(),
      last_imap_uid = COALESCE(EXCLUDED.last_imap_uid, mailbox_sync_meta.last_imap_uid),
      last_error = EXCLUDED.last_error,
      last_host = EXCLUDED.last_host,
      imported_last = EXCLUDED.imported_last
  `;
}

async function recordSyncMeta(sql, result) {
  const sources = (result && result.sources) || [];
  if (sources.length) {
    for (let i = 0; i < sources.length; i++) {
      const s = sources[i];
      await recordOneMeta(sql, s.metaId || (s.source === "workspace" ? "contact_workspace" : "contact"), s);
    }
  }
  // Meta agrégée « contact » pour le throttle dashboard (compat)
  await recordOneMeta(sql, "contact", {
    ok: result.ok,
    lastUid: result.lastUid,
    error: result.error,
    host: result.host,
    imported: result.imported,
  });
}

async function getSyncMeta(sql) {
  const rows = await sql`
    SELECT last_sync_at, last_error, last_host, imported_last, last_imap_uid
    FROM mailbox_sync_meta WHERE id = 'contact' LIMIT 1
  `;
  return rows[0] || null;
}

async function getAllSyncMeta(sql) {
  const rows = await sql`
    SELECT id, last_sync_at, last_error, last_host, imported_last, last_imap_uid
    FROM mailbox_sync_meta
    WHERE id IN ('contact', 'contact_workspace')
    ORDER BY id
  `;
  return rows || [];
}

/** Sync IMAP contact@ + enregistre meta Neon */
async function runMailboxSync() {
  const sql = getSql();
  if (!sql) return { ok: false, error: "DATABASE_URL manquant" };

  await ensureMailboxSchema(sql);
  const sync = await syncImapInbox(sql);
  await recordSyncMeta(sql, sync);
  return sync;
}

/** Sync force (bouton dashboard) — ignore le delai */
async function forceSyncNow() {
  if (!listImapSources().length) {
    return {
      skipped: true,
      reason: "imap_not_configured",
      error: "MAIL_IMAP_PASS_WORKSPACE et/ou MAIL_IMAP_PASS_O2SWITCH manquant sur Vercel",
    };
  }
  const sql = getSql();
  if (!sql) return { skipped: true, reason: "no_database" };
  await ensureMailboxSchema(sql);
  const sync = await syncImapInbox(sql);
  await recordSyncMeta(sql, sync);
  return sync;
}

/** Sync auto si derniere sync > N minutes (ouverture messagerie / cron) */
async function autoSyncIfDue() {
  if (process.env.MAILBOX_AUTO_SYNC === "false") return { skipped: true, reason: "disabled" };

  if (!listImapSources().length) {
    return { skipped: true, reason: "imap_not_configured" };
  }

  const sql = getSql();
  if (!sql) return { skipped: true, reason: "no_database" };

  await ensureMailboxSchema(sql);
  const meta = await getSyncMeta(sql);
  const minutes = Math.max(Number(process.env.MAILBOX_AUTO_SYNC_MINUTES) || 8, 3);
  if (meta && meta.last_sync_at) {
    const age = Date.now() - new Date(meta.last_sync_at).getTime();
    if (age < minutes * 60 * 1000) {
      return {
        skipped: true,
        reason: "throttle",
        lastSyncAt: meta.last_sync_at,
        lastError: meta.last_error,
      };
    }
  }

  const sync = await syncImapInbox(sql);
  await recordSyncMeta(sql, sync);
  return sync;
}

async function listWithAutoSync(limit, offset) {
  // 1) Toujours renvoyer la liste DB d'abord (évite le spinner infini si IMAP bloque)
  const data = await listMessages(limit, offset);
  const sql = getSql();
  const sources = listImapSources().map(function (s) {
    return { id: s.id, label: s.label, host: s.host };
  });
  const base = Object.assign({}, data, {
    sync: { skipped: true, reason: "pending" },
    syncMeta: sql ? await getSyncMeta(sql) : null,
    syncMetas: sql ? await getAllSyncMeta(sql) : [],
    imapSources: sources,
  });

  const timeoutMs = Math.min(
    Math.max(Number(process.env.MAILBOX_LIST_SYNC_TIMEOUT_MS) || 6000, 2000),
    12000
  );

  try {
    const syncResult = await Promise.race([
      autoSyncIfDue(),
      new Promise(function (resolve) {
        setTimeout(function () {
          resolve({
            skipped: true,
            reason: "timeout",
            error:
              "Sync IMAP trop longue (>" +
              Math.round(timeoutMs / 1000) +
              "s). Cliquez Synchroniser IMAP ou ouvrez Gmail Workspace.",
          });
        }, timeoutMs);
      }),
    ]);

    let out = base;
    if (syncResult && syncResult.ok && (syncResult.imported || 0) > 0) {
      const refreshed = await listMessages(limit, offset);
      out = Object.assign({}, refreshed, {
        syncMeta: sql ? await getSyncMeta(sql) : null,
        syncMetas: sql ? await getAllSyncMeta(sql) : [],
        imapSources: sources,
      });
    }
    out.sync = syncResult;
    if (!out.syncMeta && sql) out.syncMeta = await getSyncMeta(sql);
    return out;
  } catch (e) {
    base.sync = { ok: false, error: (e && e.message) || "Erreur sync IMAP" };
    return base;
  }
}

module.exports = {
  runMailboxSync,
  forceSyncNow,
  autoSyncIfDue,
  listWithAutoSync,
  getSyncMeta,
  getAllSyncMeta,
  imapConfig: imapConfig,
};
