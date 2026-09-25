const { getSql } = require("./db");
const { normalizeConfig, readSeed, publicConfig } = require("./subscription-plans");

let schemaReady = false;

async function ensureSubscriptionPlansSchema(sql) {
  if (!sql) return false;
  if (schemaReady) return true;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS subscription_plans_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        payload TEXT NOT NULL DEFAULT '{}',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_by TEXT
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS subscription_checkouts (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL,
        interval TEXT NOT NULL,
        customer_email TEXT,
        stripe_session_id TEXT,
        stripe_subscription_id TEXT,
        amount_eur NUMERIC(12,2),
        currency TEXT DEFAULT 'eur',
        status TEXT NOT NULL DEFAULT 'pending',
        metadata TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscription_checkouts_session ON subscription_checkouts (stripe_session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscription_checkouts_plan ON subscription_checkouts (plan_id)`;
    schemaReady = true;
    return true;
  } catch (e) {
    console.warn("[subscription-plans] schema", e.message);
    return false;
  }
}

async function loadConfigFromDb(sql) {
  if (!sql) return null;
  try {
    await ensureSubscriptionPlansSchema(sql);
    const rows = await sql`
      SELECT payload FROM subscription_plans_settings WHERE id = 'default' LIMIT 1
    `;
    if (!rows.length) return null;
    let payload = rows[0].payload;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        return null;
      }
    }
    return payload;
  } catch (e) {
    console.warn("[subscription-plans] load", e.message);
    return null;
  }
}

async function saveConfigToDb(sql, config, userId) {
  if (!sql) throw new Error("Base de donnees non configuree");
  await ensureSubscriptionPlansSchema(sql);
  const normalized = normalizeConfig(config);
  const payload = JSON.stringify(normalized);
  await sql`
    INSERT INTO subscription_plans_settings (id, payload, updated_at, updated_by)
    VALUES ('default', ${payload}, NOW(), ${userId || null})
    ON CONFLICT (id) DO UPDATE SET
      payload = EXCLUDED.payload,
      updated_at = NOW(),
      updated_by = EXCLUDED.updated_by
  `;
  return normalized;
}

async function getSubscriptionPlansConfig(opts) {
  const options = opts || {};
  const sql = options.sql || getSql();
  const fromDb = await loadConfigFromDb(sql);
  return normalizeConfig(fromDb || readSeed());
}

async function getPublicSubscriptionPlans() {
  const config = await getSubscriptionPlansConfig();
  return publicConfig(config);
}

async function recordSubscriptionCheckout(row) {
  const sql = getSql();
  if (!sql) return { ok: false, reason: "no_db" };
  await ensureSubscriptionPlansSchema(sql);
  const id = row.id || "subchk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  const metadata = row.metadata ? JSON.stringify(row.metadata) : null;
  try {
    await sql`
      INSERT INTO subscription_checkouts (
        id, plan_id, interval, customer_email, stripe_session_id, stripe_subscription_id,
        amount_eur, currency, status, metadata, created_at, updated_at
      ) VALUES (
        ${id},
        ${row.planId},
        ${row.interval},
        ${row.customerEmail || null},
        ${row.stripeSessionId || null},
        ${row.stripeSubscriptionId || null},
        ${row.amountEur != null ? row.amountEur : null},
        ${row.currency || "eur"},
        ${row.status || "pending"},
        ${metadata},
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        stripe_session_id = COALESCE(EXCLUDED.stripe_session_id, subscription_checkouts.stripe_session_id),
        stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, subscription_checkouts.stripe_subscription_id),
        status = EXCLUDED.status,
        updated_at = NOW()
    `;
    return { ok: true, id: id };
  } catch (e) {
    console.warn("[subscription-plans] record checkout", e.message);
    return { ok: false, reason: e.message };
  }
}

async function markSubscriptionCheckoutPaid(sessionId, extra) {
  const sql = getSql();
  if (!sql || !sessionId) return null;
  await ensureSubscriptionPlansSchema(sql);
  const info = extra || {};
  try {
    const rows = await sql`
      UPDATE subscription_checkouts SET
        status = 'active',
        stripe_subscription_id = COALESCE(${info.subscriptionId || null}, stripe_subscription_id),
        customer_email = COALESCE(${info.customerEmail || null}, customer_email),
        updated_at = NOW()
      WHERE stripe_session_id = ${sessionId}
      RETURNING id, plan_id, interval, customer_email, amount_eur
    `;
    return rows[0] || null;
  } catch (e) {
    console.warn("[subscription-plans] mark paid", e.message);
    return null;
  }
}

module.exports = {
  ensureSubscriptionPlansSchema,
  getSubscriptionPlansConfig,
  getPublicSubscriptionPlans,
  saveConfigToDb,
  recordSubscriptionCheckout,
  markSubscriptionCheckoutPaid,
};
