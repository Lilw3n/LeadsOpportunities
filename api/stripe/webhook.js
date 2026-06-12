const Stripe = require("stripe");

const { getStripeClient, getStripeWebhookSecret } = require("../_lib/stripe");

const { applyApiGuards, readRawBody } = require("../_lib/security");

const { getSql } = require("../_lib/db");
const {
  markPaymentLinkPaid,
  savePaymentLink,
  handlePaymentLinkPaid,
} = require("../_lib/stripe-payment-store");

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

async function markQuotePaid(referenceId, email, amountTotal, sessionId) {
  if (!referenceId || referenceId === "none") return null;

  const sql = getSql();
  if (!sql) return null;

  try {
    const existing = await sql`
      SELECT id, contact_id, deposit_amount, stripe_session_id, stripe_payment_status
      FROM crm_quotes WHERE id = ${referenceId} LIMIT 1
    `;
    if (!existing.length) return null;

    const quote = existing[0];
    if (quote.stripe_payment_status === "paid" && quote.stripe_session_id === sessionId) {
      return quote;
    }

    if (quote.deposit_amount != null && amountTotal != null) {
      const expectedCents = Math.round(Number(quote.deposit_amount) * 100);
      if (Math.abs(expectedCents - Number(amountTotal)) > 1) {
        console.error("[stripe/webhook] amount mismatch", {
          referenceId,
          expectedCents,
          amountTotal,
        });
        return null;
      }
    }

    const rows = await sql`
      UPDATE crm_quotes
      SET status = 'acompte_paye',
          premium_estimate = COALESCE(premium_estimate, ${amountTotal ? Math.round(amountTotal / 100) : null}),
          stripe_session_id = COALESCE(${sessionId || null}, stripe_session_id),
          stripe_payment_status = 'paid',
          updated_at = NOW()
      WHERE id = ${referenceId}
      RETURNING id, contact_id
    `;

    if (rows.length) {
      await sql`
        INSERT INTO crm_activities (id, contact_id, activity_type, title, body)
        VALUES (
          ${"act_" + Date.now()},
          ${rows[0].contact_id},
          'payment',
          'Acompte Stripe reçu',
          ${"Paiement devis " + referenceId + (email ? " — " + email : "")}
        )
      `;
      try {
        await sql`
          INSERT INTO pro_revenue (
            id, source, amount_eur, revenue_date, stripe_session_id, quote_id, contact_id, notes
          ) VALUES (
            ${"rev_" + Date.now()},
            'stripe',
            ${amountTotal ? amountTotal / 100 : null},
            CURRENT_DATE,
            ${sessionId || null},
            ${referenceId},
            ${rows[0].contact_id},
            ${"Webhook checkout.session.completed"}
          )
        `;
      } catch (revErr) {
        console.warn("[stripe/webhook] pro_revenue", revErr.message);
      }
      return rows[0];
    }
  } catch (e) {
    console.error("[stripe/webhook] quote update:", e);
  }
  return null;
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();

  if (!stripe || !webhookSecret) {
    return res.status(500).json({
      error: "Webhook Stripe non configure.",
    });
  }

  try {
    const signature = req.headers["stripe-signature"];
    if (!signature) {
      return res.status(400).json({ error: "Signature Stripe manquante." });
    }

    const rawBody = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const meta = session.metadata || {};
      const referenceId = meta.referenceId;
      const email = session.customer_details?.email || session.customer_email;

      if (meta.expectedAmountCents && session.amount_total != null) {
        if (String(session.amount_total) !== String(meta.expectedAmountCents)) {
          console.error("[stripe/webhook] metadata amount mismatch", session.id);
          return res.status(200).json({ received: true, warning: "amount_mismatch" });
        }
      }

      const updated = await markQuotePaid(referenceId, email, session.amount_total, session.id);

      const amountEur = session.amount_total != null ? session.amount_total / 100 : null;
      let paymentLink = await markPaymentLinkPaid(session.id, {
        paidAt: new Date().toISOString(),
        amountEur,
      });

      if (!paymentLink) {
        await savePaymentLink({
          stripeSessionId: session.id,
          customerEmail: email,
          amountEur,
          paymentKind: meta.paymentKind || meta.requestType,
          label: meta.label,
          referenceId: referenceId,
          appContext: meta.appContext,
          metadata: meta,
        });
        paymentLink = await markPaymentLinkPaid(session.id, { paidAt: new Date().toISOString(), amountEur });
      }

      if (paymentLink) {
        await handlePaymentLinkPaid(paymentLink);
      }

      console.log("Stripe checkout complete:", {
        sessionId: session.id,
        customerEmail: email,
        referenceId: referenceId,
        quoteUpdated: !!updated,
        paymentLinkUpdated: !!paymentLink,
      });
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    const isStripeErr = error instanceof Stripe.errors.StripeError;
    console.error("Stripe webhook error:", error);
    return res.status(400).json({
      error: isStripeErr ? error.message : "Erreur webhook.",
    });
  }
};
