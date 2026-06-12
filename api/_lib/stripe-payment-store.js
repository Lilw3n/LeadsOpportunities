const { getSql } = require("./db");

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
  const sql = getSql();
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
    if (String(e.message || e).indexOf("stripe_payment_links") !== -1) {
      return { ok: false, error: "table_missing", detail: e.message };
    }
    console.error("[stripe-payment-store] save", e);
    return { ok: false, error: "save_failed" };
  }
}

async function markPaymentLinkPaid(sessionId, opts) {
  const sql = getSql();
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
  const sql = getSql();
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
    if (String(e.message || e).indexOf("stripe_payment_links") !== -1) {
      return { ok: true, links: [], counts: { pending_payment: 0, paid_pending_review: 0, in_progress: 0 }, tableMissing: true };
    }
    console.error("[stripe-payment-store] list", e);
    return { ok: false, error: "Erreur liste paiements", links: [] };
  }
}

async function updateDossierStatus(linkId, dossierStatus) {
  const sql = getSql();
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

async function syncPendingSessions(stripe) {
  const sql = getSql();
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
        }
      } catch (err) {
        console.warn("[stripe-payment-store] sync session", row.stripe_session_id, err.message);
      }
    }

    return { ok: true, synced, newlyPaid };
  } catch (e) {
    if (String(e.message || e).indexOf("stripe_payment_links") !== -1) {
      return { ok: true, synced: 0, newlyPaid: [], tableMissing: true };
    }
    return { ok: false, error: "Erreur synchronisation", synced: 0 };
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
  savePaymentLink,
  markPaymentLinkPaid,
  listPaymentLinks,
  updateDossierStatus,
  syncPendingSessions,
  recordPaymentActivity,
};
