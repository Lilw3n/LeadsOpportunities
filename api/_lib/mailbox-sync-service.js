const { syncImapInbox } = require("./mail-imap");
const { listMessages, ensureMailboxSchema } = require("./mail-store");
const { getSql } = require("./db");

async function recordSyncMeta(sql, result) {
  await sql`
    INSERT INTO mailbox_sync_meta (id, last_sync_at, last_imap_uid, last_error, last_host, imported_last)
    VALUES (
      'contact',
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

async function getSyncMeta(sql) {
  const rows = await sql`
    SELECT last_sync_at, last_error, last_host, imported_last, last_imap_uid
    FROM mailbox_sync_meta WHERE id = 'contact' LIMIT 1
  `;
  return rows[0] || null;
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
  const { imapConfig } = require("./mail-imap");
  if (!imapConfig()) {
    return { skipped: true, reason: "imap_not_configured", error: "MAIL_IMAP_PASS manquant sur Vercel" };
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

  const { imapConfig } = require("./mail-imap");
  if (!imapConfig()) {
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
  const syncResult = await autoSyncIfDue();
  const data = await listMessages(limit, offset);
  const sql = getSql();
  const meta = sql ? await getSyncMeta(sql) : null;
  return Object.assign({}, data, {
    sync: syncResult,
    syncMeta: meta,
  });
}

module.exports = {
  runMailboxSync,
  forceSyncNow,
  autoSyncIfDue,
  listWithAutoSync,
  getSyncMeta,
};
