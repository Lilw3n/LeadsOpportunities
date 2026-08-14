/**
 * Parrainage — codes, attributions, récompenses sur leads et paiements Stripe.
 *
 * Règles de récompense par défaut : reward_pct (% du paiement) + reward_flat_eur (fixe).
 * Modifiables par partenaire dans referral_partners.
 */
const { getSql } = require("./db");

const DEFAULT_REWARD_PCT = 10;

let schemaReady = false;

function normalizeCode(raw) {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, 32);
}

async function ensureReferralSchema(sql) {
  if (!sql) return false;
  if (schemaReady) return true;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS referral_partners (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        reward_pct NUMERIC(5,2) NOT NULL DEFAULT 10,
        reward_flat_eur NUMERIC(12,2) NOT NULL DEFAULT 0,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS referral_events (
        id TEXT PRIMARY KEY,
        partner_code TEXT NOT NULL,
        event_type TEXT NOT NULL,
        visitor_id TEXT,
        lead_id TEXT,
        stripe_session_id TEXT,
        referred_email TEXT,
        amount_eur NUMERIC(12,2),
        reward_eur NUMERIC(12,2),
        reward_status TEXT NOT NULL DEFAULT 'pending',
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_referral_events_partner
        ON referral_events (partner_code, created_at DESC)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_referral_events_lead
        ON referral_events (lead_id)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_referral_events_email
        ON referral_events (LOWER(referred_email))
    `;
    schemaReady = true;
    return true;
  } catch (e) {
    console.error("[referral-store] ensureSchema", e);
    return false;
  }
}

async function sqlReady() {
  const sql = getSql();
  if (!sql) return null;
  await ensureReferralSchema(sql);
  return sql;
}

function newId(prefix) {
  return prefix + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

function computeRewardEur(amountEur, partner) {
  const amount = Number(amountEur) || 0;
  if (amount <= 0) return 0;
  const pct = Number(partner?.reward_pct != null ? partner.reward_pct : DEFAULT_REWARD_PCT);
  const flat = Number(partner?.reward_flat_eur || 0);
  const fromPct = Math.round((amount * pct) / 100 * 100) / 100;
  return Math.round((fromPct + flat) * 100) / 100;
}

async function findPartnerByCode(code) {
  const sql = await sqlReady();
  if (!sql || !code) return null;
  const c = normalizeCode(code);
  if (!c) return null;
  const rows = await sql`
    SELECT id, code, display_name, email, phone, reward_pct, reward_flat_eur, status
    FROM referral_partners
    WHERE code = ${c} AND status = 'active'
    LIMIT 1
  `;
  return rows[0] || null;
}

async function recordReferralEvent(input) {
  const sql = await sqlReady();
  if (!sql || !input?.partnerCode) return null;
  const code = normalizeCode(input.partnerCode);
  const partner = await findPartnerByCode(code);
  if (!partner) return null;

  const eventType = String(input.eventType || "visit").slice(0, 40);
  const id = input.id || newId("refevt");

  try {
    await sql`
      INSERT INTO referral_events (
        id, partner_code, event_type, visitor_id, lead_id, stripe_session_id,
        referred_email, amount_eur, reward_eur, reward_status, metadata
      ) VALUES (
        ${id},
        ${code},
        ${eventType},
        ${input.visitorId || null},
        ${input.leadId || null},
        ${input.stripeSessionId || null},
        ${input.referredEmail ? String(input.referredEmail).trim().toLowerCase().slice(0, 320) : null},
        ${input.amountEur != null ? Number(input.amountEur) : null},
        ${input.rewardEur != null ? Number(input.rewardEur) : null},
        ${input.rewardStatus || "pending"},
        ${JSON.stringify(input.metadata || {})}::jsonb
      )
    `;
    return { id, partnerCode: code, partner };
  } catch (e) {
    console.warn("[referral-store] recordEvent", e.message);
    return null;
  }
}

/** Lead converti — enregistre l'attribution parrain. */
async function attachLeadReferral(leadId, payload) {
  if (!leadId || !payload) return null;
  const code = normalizeCode(payload.referral_code || payload.referralCode || payload.parrain_code);
  if (!code) return null;

  const email = String(payload.email || "").trim().toLowerCase();
  return recordReferralEvent({
    eventType: "lead",
    partnerCode: code,
    leadId: leadId,
    visitorId: payload.visitor_id || payload.visitorId || null,
    referredEmail: email || null,
    metadata: {
      vertical: payload.vertical || null,
      source: payload.source || null,
    },
  });
}

/** Paiement Stripe — crédite la récompense au parrain si attribution trouvée. */
async function recordPaymentReferralReward(opts) {
  const sql = await sqlReady();
  if (!sql) return null;

  const email = String(opts.customerEmail || "").trim().toLowerCase();
  const amountEur = Number(opts.amountEur) || 0;
  const sessionId = opts.stripeSessionId || null;
  if (!email || amountEur <= 0) return null;

  let partnerCode = normalizeCode(opts.referralCodeFromMeta);
  if (!partnerCode) {
    const leadRows = await sql`
      SELECT id, payload FROM site_leads
      WHERE LOWER(email) = ${email}
      ORDER BY created_at DESC
      LIMIT 5
    `;
    for (var i = 0; i < leadRows.length; i++) {
      try {
        const p = JSON.parse(leadRows[i].payload || "{}");
        const c = normalizeCode(p.referral_code || p.referralCode);
        if (c) {
          partnerCode = c;
          break;
        }
      } catch (e) {}
    }
  }
  if (!partnerCode) {
    const evtRows = await sql`
      SELECT partner_code FROM referral_events
      WHERE event_type = 'lead' AND LOWER(referred_email) = ${email}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (evtRows.length) partnerCode = evtRows[0].partner_code;
  }
  if (!partnerCode) return null;

  const partner = await findPartnerByCode(partnerCode);
  if (!partner) return null;

  if (sessionId) {
    const dup = await sql`
      SELECT id FROM referral_events
      WHERE stripe_session_id = ${sessionId} AND event_type = 'payment'
      LIMIT 1
    `;
    if (dup.length) return dup[0];
  }

  const rewardEur = computeRewardEur(amountEur, partner);
  return recordReferralEvent({
    eventType: "payment",
    partnerCode: partnerCode,
    stripeSessionId: sessionId,
    referredEmail: email,
    amountEur: amountEur,
    rewardEur: rewardEur,
    rewardStatus: "pending",
    metadata: {
      payment_kind: opts.paymentKind || null,
      reference_id: opts.referenceId || null,
    },
  });
}

async function listPartners() {
  const sql = await sqlReady();
  if (!sql) return [];
  const rows = await sql`
    SELECT id, code, display_name, email, phone, reward_pct, reward_flat_eur, status, created_at
    FROM referral_partners
    ORDER BY created_at DESC
    LIMIT 200
  `;
  return rows;
}

async function upsertPartner(input) {
  const sql = await sqlReady();
  if (!sql) return { ok: false, error: "db_unavailable" };
  const code = normalizeCode(input.code);
  const name = String(input.displayName || input.display_name || "").trim().slice(0, 120);
  if (!code || !name) return { ok: false, error: "code_et_nom_requis" };

  const id = input.id || newId("refp");
  const pct = Number(input.rewardPct != null ? input.rewardPct : input.reward_pct != null ? input.reward_pct : DEFAULT_REWARD_PCT);
  const flat = Number(input.rewardFlatEur != null ? input.rewardFlatEur : input.reward_flat_eur || 0);

  await sql`
    INSERT INTO referral_partners (
      id, code, display_name, email, phone, reward_pct, reward_flat_eur, notes, status
    ) VALUES (
      ${id},
      ${code},
      ${name},
      ${input.email ? String(input.email).trim().slice(0, 320) : null},
      ${input.phone ? String(input.phone).trim().slice(0, 40) : null},
      ${pct},
      ${flat},
      ${input.notes ? String(input.notes).slice(0, 500) : null},
      ${input.status === "inactive" ? "inactive" : "active"}
    )
    ON CONFLICT (code) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      reward_pct = EXCLUDED.reward_pct,
      reward_flat_eur = EXCLUDED.reward_flat_eur,
      notes = EXCLUDED.notes,
      status = EXCLUDED.status,
      updated_at = NOW()
  `;
  const rows = await sql`
    SELECT id, code, display_name, email, phone, reward_pct, reward_flat_eur, status
    FROM referral_partners WHERE code = ${code} LIMIT 1
  `;
  return { ok: true, partner: rows[0] || { id, code } };
}

async function getPartnerStats(code) {
  const sql = await sqlReady();
  if (!sql) return null;
  const c = normalizeCode(code);
  if (!c) return null;

  const rows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE event_type = 'visit')::int AS visits,
      COUNT(*) FILTER (WHERE event_type = 'lead')::int AS leads,
      COUNT(*) FILTER (WHERE event_type = 'payment')::int AS payments,
      COALESCE(SUM(amount_eur) FILTER (WHERE event_type = 'payment'), 0)::float AS revenue_eur,
      COALESCE(SUM(reward_eur) FILTER (WHERE event_type = 'payment'), 0)::float AS rewards_eur,
      COALESCE(SUM(reward_eur) FILTER (WHERE event_type = 'payment' AND reward_status = 'pending'), 0)::float AS rewards_pending_eur
    FROM referral_events
    WHERE partner_code = ${c}
  `;
  return rows[0] || null;
}

async function getDashboardSummary() {
  const sql = await sqlReady();
  if (!sql) return { partners: [], totals: {} };

  const partners = await listPartners();
  const enriched = [];
  for (var i = 0; i < partners.length; i++) {
    const stats = await getPartnerStats(partners[i].code);
    enriched.push(Object.assign({}, partners[i], { stats: stats || {} }));
  }

  const totals = await sql`
    SELECT
      COUNT(*) FILTER (WHERE event_type = 'lead')::int AS total_leads,
      COUNT(*) FILTER (WHERE event_type = 'payment')::int AS total_payments,
      COALESCE(SUM(amount_eur) FILTER (WHERE event_type = 'payment'), 0)::float AS total_revenue_eur,
      COALESCE(SUM(reward_eur) FILTER (WHERE event_type = 'payment'), 0)::float AS total_rewards_eur
    FROM referral_events
  `;

  return {
    partners: enriched,
    totals: totals[0] || {},
  };
}

module.exports = {
  normalizeCode,
  DEFAULT_REWARD_PCT,
  ensureReferralSchema,
  findPartnerByCode,
  recordReferralEvent,
  attachLeadReferral,
  recordPaymentReferralReward,
  listPartners,
  upsertPartner,
  getPartnerStats,
  getDashboardSummary,
  computeRewardEur,
};
