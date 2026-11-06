const { getSql } = require("./db");
const {
  computeAgentSplit,
  prefsFromMetadata,
  DEFAULT_PREFS,
} = require("./agent-fee-split");

let schemaReady = false;
let splitSchemaReady = false;

async function ensureStripePaymentLinksSchema(sql) {
  if (!sql) return false;
  if (schemaReady) return true;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS stripe_payment_links (
        id TEXT PRIMARY KEY,
        stripe_session_id TEXT NOT NULL UNIQUE,
        customer_email TEXT,
        amount_eur NUMERIC(12,2),
        payment_kind TEXT,
        label TEXT,
        reference_id TEXT,
        contact_id TEXT,
        created_by TEXT,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        dossier_status TEXT NOT NULL DEFAULT 'awaiting_payment',
        paid_at TIMESTAMPTZ,
        notify_sent_at TIMESTAMPTZ,
        app_context TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_stripe_payment_links_status
        ON stripe_payment_links(payment_status, dossier_status, updated_at DESC)
    `;
    await sql`
      CREATE INDEX IF NOT EXISTS idx_stripe_payment_links_email
        ON stripe_payment_links(customer_email)
    `;
    try {
      await sql`
        ALTER TABLE stripe_payment_links ADD COLUMN IF NOT EXISTS notify_sent_at TIMESTAMPTZ
      `;
    } catch (alterErr) {
      /* colonne deja presente ou CREATE TABLE deja a jour */
    }
    schemaReady = true;
    return true;
  } catch (e) {
    console.error("[stripe-payment-store] ensureSchema", e);
    return false;
  }
}

async function sqlWithSchema() {
  const sql = getSql();
  if (!sql) return null;
  await ensureStripePaymentLinksSchema(sql);
  return sql;
}

function newLinkId() {
  return "pay_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
}

async function findContactIdByEmail(sql, email) {
  if (!email || email.indexOf("@") === -1) return null;
  try {
    const rows = await sql`
      SELECT id FROM crm_contacts
      WHERE LOWER(email) = LOWER(${email})
      ORDER BY updated_at DESC NULLS LAST
      LIMIT 1
    `;
    return rows[0]?.id || null;
  } catch (e) {
    return null;
  }
}

async function savePaymentLink(input) {
  const sql = await sqlWithSchema();
  if (!sql || !input?.stripeSessionId) return { ok: false, error: "db_unavailable" };

  const contactId =
    input.contactId ||
    (input.customerEmail ? await findContactIdByEmail(sql, input.customerEmail) : null);

  const id = input.id || newLinkId();
  const metadataJson =
    input.metadata && typeof input.metadata === "object"
      ? JSON.stringify(input.metadata)
      : "{}";

  try {
    await sql`
      INSERT INTO stripe_payment_links (
        id, stripe_session_id, customer_email, amount_eur, payment_kind, label,
        reference_id, contact_id, created_by, payment_status, dossier_status,
        app_context, metadata
      ) VALUES (
        ${id},
        ${input.stripeSessionId},
        ${input.customerEmail || null},
        ${input.amountEur != null ? Number(input.amountEur) : null},
        ${input.paymentKind || null},
        ${input.label || null},
        ${input.referenceId || null},
        ${contactId},
        ${input.createdBy || null},
        'pending',
        'awaiting_payment',
        ${input.appContext || null},
        ${metadataJson}::jsonb
      )
      ON CONFLICT (stripe_session_id) DO UPDATE SET
        customer_email = COALESCE(EXCLUDED.customer_email, stripe_payment_links.customer_email),
        amount_eur = COALESCE(EXCLUDED.amount_eur, stripe_payment_links.amount_eur),
        label = COALESCE(EXCLUDED.label, stripe_payment_links.label),
        reference_id = COALESCE(EXCLUDED.reference_id, stripe_payment_links.reference_id),
        contact_id = COALESCE(EXCLUDED.contact_id, stripe_payment_links.contact_id),
        updated_at = NOW()
    `;
    return { ok: true, id, contactId };
  } catch (e) {
    console.error("[stripe-payment-store] save", e);
    return { ok: false, error: "save_failed", detail: e.message };
  }
}

async function markPaymentLinkPaid(sessionId, opts) {
  const sql = await sqlWithSchema();
  if (!sql || !sessionId) return null;
  opts = opts || {};

  try {
    const rows = await sql`
      UPDATE stripe_payment_links SET
        payment_status = 'paid',
        dossier_status = CASE
          WHEN dossier_status IN ('dismissed', 'in_progress') THEN dossier_status
          ELSE 'paid_pending_review'
        END,
        paid_at = COALESCE(paid_at, ${opts.paidAt || new Date().toISOString()}::timestamptz),
        amount_eur = COALESCE(${opts.amountEur != null ? Number(opts.amountEur) : null}, amount_eur),
        updated_at = NOW()
      WHERE stripe_session_id = ${sessionId}
      RETURNING *
    `;
    return rows[0] || null;
  } catch (e) {
    console.error("[stripe-payment-store] markPaid", e);
    return null;
  }
}

async function listPaymentLinks(opts) {
  const sql = await sqlWithSchema();
  if (!sql) return { ok: false, error: "Base de donnees non configuree", links: [] };

  opts = opts || {};
  const limit = Math.min(Number(opts.limit) || 50, 100);
  const dossierStatus = opts.dossierStatus || null;
  const paymentStatus = opts.paymentStatus || null;
  const since = opts.since || null;

  try {
    const rows = await sql`
      SELECT * FROM stripe_payment_links
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `;

    const filtered = rows.filter(function (row) {
      if (dossierStatus && row.dossier_status !== dossierStatus) return false;
      if (paymentStatus && row.payment_status !== paymentStatus) return false;
      if (since && new Date(row.updated_at) <= new Date(since)) return false;
      return true;
    });

    const counts = await sql`
      SELECT
        COUNT(*) FILTER (WHERE payment_status = 'pending')::int AS pending_payment,
        COUNT(*) FILTER (WHERE payment_status = 'paid' AND dossier_status = 'paid_pending_review')::int AS paid_pending_review,
        COUNT(*) FILTER (WHERE dossier_status = 'in_progress')::int AS in_progress
      FROM stripe_payment_links
    `;

    return {
      ok: true,
      links: filtered,
      counts: counts[0] || { pending_payment: 0, paid_pending_review: 0, in_progress: 0 },
    };
  } catch (e) {
    console.error("[stripe-payment-store] list", e);
    return { ok: false, error: "Erreur liste paiements", links: [] };
  }
}

async function updateDossierStatus(linkId, dossierStatus) {
  const sql = await sqlWithSchema();
  if (!sql) return { ok: false, error: "Base de donnees non configuree" };
  const allowed = ["awaiting_payment", "paid_pending_review", "in_progress", "dismissed"];
  if (allowed.indexOf(dossierStatus) === -1) {
    return { ok: false, error: "Statut dossier invalide" };
  }

  try {
    const rows = await sql`
      UPDATE stripe_payment_links SET
        dossier_status = ${dossierStatus},
        updated_at = NOW()
      WHERE id = ${linkId}
      RETURNING *
    `;
    if (!rows.length) return { ok: false, error: "Lien introuvable" };
    return { ok: true, link: rows[0] };
  } catch (e) {
    console.error("[stripe-payment-store] updateDossier", e);
    return { ok: false, error: "Erreur mise a jour" };
  }
}

async function ensureAgentSplitSchema(sql) {
  if (!sql) return false;
  if (splitSchemaReady) return true;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS agent_tax_prefs (
        user_id TEXT PRIMARY KEY,
        charges_pct NUMERIC(6,2) NOT NULL DEFAULT 22,
        cfe_pct NUMERIC(6,2) NOT NULL DEFAULT 0.5,
        accounting_pct NUMERIC(6,2) NOT NULL DEFAULT 1,
        agent_share_pct NUMERIC(6,2) NOT NULL DEFAULT 100,
        split_mode TEXT NOT NULL DEFAULT 'agent_gross',
        preset_id TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS agent_payment_splits (
        id TEXT PRIMARY KEY,
        stripe_session_id TEXT UNIQUE,
        payment_link_id TEXT,
        amount_eur NUMERIC(12,2) NOT NULL,
        split_mode TEXT NOT NULL DEFAULT 'agent_gross',
        agent_share_pct NUMERIC(6,2),
        agent_gross_eur NUMERIC(12,2) NOT NULL,
        agency_keep_eur NUMERIC(12,2) DEFAULT 0,
        charges_pct NUMERIC(6,2),
        cfe_pct NUMERIC(6,2),
        accounting_pct NUMERIC(6,2),
        urssaf_reserve_eur NUMERIC(12,2) NOT NULL DEFAULT 0,
        cfe_reserve_eur NUMERIC(12,2) NOT NULL DEFAULT 0,
        accounting_reserve_eur NUMERIC(12,2) NOT NULL DEFAULT 0,
        total_reserves_eur NUMERIC(12,2) NOT NULL DEFAULT 0,
        agent_net_eur NUMERIC(12,2) NOT NULL,
        preset_id TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    splitSchemaReady = true;
    return true;
  } catch (e) {
    console.error("[stripe-payment-store] ensureSplitSchema", e);
    return false;
  }
}

async function loadDefaultTaxPrefs(sql, userId) {
  try {
    await ensureAgentSplitSchema(sql);
    if (userId) {
      const rows = await sql`SELECT * FROM agent_tax_prefs WHERE user_id = ${userId} LIMIT 1`;
      if (rows[0]) {
        return {
          chargesPct: Number(rows[0].charges_pct),
          cfePct: Number(rows[0].cfe_pct),
          accountingPct: Number(rows[0].accounting_pct),
          agentSharePct: Number(rows[0].agent_share_pct),
          splitMode: rows[0].split_mode || "agent_gross",
          presetId: rows[0].preset_id || "custom_22",
        };
      }
    }
    const any = await sql`SELECT * FROM agent_tax_prefs ORDER BY updated_at DESC LIMIT 1`;
    if (any[0]) {
      return {
        chargesPct: Number(any[0].charges_pct),
        cfePct: Number(any[0].cfe_pct),
        accountingPct: Number(any[0].accounting_pct),
        agentSharePct: Number(any[0].agent_share_pct),
        splitMode: any[0].split_mode || "agent_gross",
        presetId: any[0].preset_id || "custom_22",
      };
    }
  } catch (e) {
    console.warn("[stripe-payment-store] loadDefaultTaxPrefs", e.message);
  }
  return Object.assign({}, DEFAULT_PREFS);
}

/**
 * Enregistre la répartition poche / réserves pour un paiement Stripe.
 */
async function saveAgentPaymentSplit(opts) {
  const sql = getSql();
  if (!sql) return { ok: false, error: "db_unavailable" };
  opts = opts || {};
  const amountEur = Number(opts.amountEur);
  if (!Number.isFinite(amountEur) || amountEur <= 0) {
    return { ok: false, error: "amount_invalid" };
  }

  await ensureAgentSplitSchema(sql);

  var meta = opts.metadata || {};
  if (typeof meta === "string") {
    try {
      meta = JSON.parse(meta);
    } catch (e) {
      meta = {};
    }
  }

  var prefs = Object.assign(
    {},
    await loadDefaultTaxPrefs(sql, opts.userId || meta.createdBy),
    prefsFromMetadata(meta),
    opts.prefs || {}
  );

  var split = computeAgentSplit(amountEur, prefs);
  var id = "spl_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

  try {
    await sql`
      INSERT INTO agent_payment_splits (
        id, stripe_session_id, payment_link_id, amount_eur, split_mode, agent_share_pct,
        agent_gross_eur, agency_keep_eur, charges_pct, cfe_pct, accounting_pct,
        urssaf_reserve_eur, cfe_reserve_eur, accounting_reserve_eur, total_reserves_eur,
        agent_net_eur, preset_id, metadata
      ) VALUES (
        ${id},
        ${opts.stripeSessionId || null},
        ${opts.paymentLinkId || null},
        ${split.amountEur},
        ${split.splitMode},
        ${split.agentSharePct},
        ${split.agentGross},
        ${split.agencyKeep},
        ${split.chargesPct},
        ${split.cfePct},
        ${split.accountingPct},
        ${split.urssafReserve},
        ${split.cfeReserve},
        ${split.accountingReserve},
        ${split.totalReserves},
        ${split.agentNet},
        ${split.presetId},
        ${JSON.stringify(Object.assign({}, meta, { split: split }))}::jsonb
      )
      ON CONFLICT (stripe_session_id) DO UPDATE SET
        amount_eur = EXCLUDED.amount_eur,
        agent_gross_eur = EXCLUDED.agent_gross_eur,
        urssaf_reserve_eur = EXCLUDED.urssaf_reserve_eur,
        cfe_reserve_eur = EXCLUDED.cfe_reserve_eur,
        accounting_reserve_eur = EXCLUDED.accounting_reserve_eur,
        total_reserves_eur = EXCLUDED.total_reserves_eur,
        agent_net_eur = EXCLUDED.agent_net_eur,
        metadata = EXCLUDED.metadata
      RETURNING *
    `;
    return { ok: true, id: id, split: split };
  } catch (e) {
    console.error("[stripe-payment-store] saveAgentPaymentSplit", e);
    return { ok: false, error: e.message };
  }
}

async function listAgentPaymentSplits(limit) {
  const sql = getSql();
  if (!sql) return { ok: false, splits: [] };
  await ensureAgentSplitSchema(sql);
  try {
    const rows = await sql`
      SELECT * FROM agent_payment_splits
      ORDER BY created_at DESC
      LIMIT ${Math.min(Number(limit) || 30, 100)}
    `;
    return { ok: true, splits: rows };
  } catch (e) {
    return { ok: false, splits: [], error: e.message };
  }
}

async function syncPendingSessions(stripe) {
  const sql = await sqlWithSchema();
  if (!sql || !stripe) return { ok: false, error: "Stripe ou DB indisponible", synced: 0 };

  try {
    const pending = await sql`
      SELECT id, stripe_session_id FROM stripe_payment_links
      WHERE payment_status = 'pending'
      ORDER BY created_at DESC
      LIMIT 40
    `;
    let synced = 0;
    let newlyPaid = [];

    for (const row of pending) {
      try {
        const session = await stripe.checkout.sessions.retrieve(row.stripe_session_id);
        const paid = session.payment_status === "paid" || session.status === "complete";
        if (!paid) continue;
        const amountEur = session.amount_total != null ? session.amount_total / 100 : null;
        const updated = await markPaymentLinkPaid(row.stripe_session_id, {
          paidAt: new Date().toISOString(),
          amountEur,
        });
        if (updated) {
          synced += 1;
          newlyPaid.push(updated);
          try {
            await saveAgentPaymentSplit({
              stripeSessionId: row.stripe_session_id,
              paymentLinkId: updated.id,
              amountEur: amountEur,
              metadata: updated.metadata,
            });
          } catch (splitErr) {
            console.warn("[stripe-payment-store] sync split", splitErr.message);
          }
        }
      } catch (err) {
        console.warn("[stripe-payment-store] sync session", row.stripe_session_id, err.message);
      }
    }

    return { ok: true, synced, newlyPaid };
  } catch (e) {
    console.error("[stripe-payment-store] sync", e);
    return { ok: false, error: "Erreur synchronisation", synced: 0 };
  }
}

async function handlePaymentLinkPaid(link) {
  if (!link) return { activity: false, email: null };
  await recordPaymentActivity(link);
  try {
    await saveAgentPaymentSplit({
      stripeSessionId: link.stripe_session_id,
      paymentLinkId: link.id,
      amountEur: link.amount_eur,
      metadata: link.metadata,
      userId: link.created_by,
    });
  } catch (splitErr) {
    console.warn("[stripe-payment-store] split on paid", splitErr.message);
  }
  try {
    const { notifyPaymentReceived } = require("./stripe-payment-notify");
    const emailResult = await notifyPaymentReceived(link);
    return { activity: true, email: emailResult };
  } catch (e) {
    console.warn("[stripe-payment-store] handlePaymentLinkPaid", e.message);
    return { activity: true, email: { ok: false, error: e.message } };
  }
}

async function recordPaymentActivity(link) {
  const sql = getSql();
  if (!sql || !link?.contact_id) return;
  try {
    await sql`
      INSERT INTO crm_activities (id, contact_id, activity_type, title, body)
      VALUES (
        ${"act_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6)},
        ${link.contact_id},
        'payment',
        ${"Paiement Stripe recu — " + (link.label || link.payment_kind || "lien")},
        ${(link.customer_email || "") + " · " + (link.amount_eur != null ? link.amount_eur + " EUR" : "")}
      )
    `;
  } catch (e) {
    console.warn("[stripe-payment-store] activity", e.message);
  }
}

module.exports = {
  ensureStripePaymentLinksSchema,
  ensureAgentSplitSchema,
  savePaymentLink,
  markPaymentLinkPaid,
  listPaymentLinks,
  updateDossierStatus,
  syncPendingSessions,
  recordPaymentActivity,
  handlePaymentLinkPaid,
  saveAgentPaymentSplit,
  listAgentPaymentSplits,
  loadDefaultTaxPrefs,
};
