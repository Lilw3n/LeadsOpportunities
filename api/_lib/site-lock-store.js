/**
 * Persistance verrou / validation conformité (Neon).
 */
var { getSql } = require("./db");

var cached = { at: 0, unlocked: false, validatedBy: null, validatedAt: null };
var CACHE_MS = 15 * 1000;

async function ensureSiteLockSchema(sql) {
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_by TEXT
    )
  `;
}

async function getSiteLockState() {
  if (Date.now() - cached.at < CACHE_MS) {
    return {
      unlocked: cached.unlocked,
      validatedBy: cached.validatedBy,
      validatedAt: cached.validatedAt,
      fromCache: true,
    };
  }
  var sql = getSql();
  if (!sql) {
    return { unlocked: false, validatedBy: null, validatedAt: null, fromCache: false, noDb: true };
  }
  try {
    await ensureSiteLockSchema(sql);
    var rows = await sql`SELECT value, updated_at, updated_by FROM site_settings WHERE key = 'site_lock_unlocked' LIMIT 1`;
    var unlocked = false;
    var validatedBy = null;
    var validatedAt = null;
    if (rows.length) {
      var v = String(rows[0].value || "").trim().toLowerCase();
      unlocked = v === "1" || v === "true" || v === "yes";
      validatedBy = rows[0].updated_by || null;
      validatedAt = rows[0].updated_at || null;
    }
    cached = { at: Date.now(), unlocked: unlocked, validatedBy: validatedBy, validatedAt: validatedAt };
    return { unlocked: unlocked, validatedBy: validatedBy, validatedAt: validatedAt, fromCache: false };
  } catch (e) {
    console.error("[site-lock-store]", e.message);
    return { unlocked: false, validatedBy: null, validatedAt: null, error: e.message };
  }
}

async function setSiteUnlocked(unlocked, email) {
  var sql = getSql();
  if (!sql) throw new Error("DATABASE_URL absente");
  await ensureSiteLockSchema(sql);
  var val = unlocked ? "1" : "0";
  var by = String(email || "").trim().toLowerCase() || null;
  await sql`
    INSERT INTO site_settings (key, value, updated_at, updated_by)
    VALUES ('site_lock_unlocked', ${val}, NOW(), ${by})
    ON CONFLICT (key) DO UPDATE SET
      value = EXCLUDED.value,
      updated_at = NOW(),
      updated_by = EXCLUDED.updated_by
  `;
  cached = {
    at: Date.now(),
    unlocked: !!unlocked,
    validatedBy: by,
    validatedAt: new Date().toISOString(),
  };
  return getSiteLockState();
}

function clearSiteLockCache() {
  cached.at = 0;
}

module.exports = {
  ensureSiteLockSchema,
  getSiteLockState,
  setSiteUnlocked,
  clearSiteLockCache,
};
