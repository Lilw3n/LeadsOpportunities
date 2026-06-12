const { getStripeAppUrl, getStripeClient, toStripeAmount } = require("../stripe");
const { applyApiGuards, parseJsonBody, getClientIp, rateLimit } = require("../security");
const { optionalCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { resolveDepositAmountEur, validateDepositAmountEur } = require("../quote-deposit");
const { savePaymentLink } = require("../stripe-payment-store");

const PUBLIC_MAX_AMOUNT_EUR = 5000;

async function fetchQuoteForCheckout(sql, quoteId, user) {
  if (user) {
    const scope = contactScopeFilter(user);
    return sql`
      SELECT q.* FROM crm_quotes q
      INNER JOIN crm_contacts c ON c.id = q.contact_id
      WHERE q.id = ${quoteId}
        AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      LIMIT 1
    `;
  }
  return sql`
    SELECT q.* FROM crm_quotes q
    WHERE q.id = ${quoteId}
    LIMIT 1
  `;
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await optionalCrm(req);
  if (!user) {
    const ip = getClientIp(req);
    const rl = rateLimit("stripe-checkout-public:" + ip, 30, 60 * 60 * 1000);
    if (!rl.allowed) {
      return res.status(429).json({
        error: "Trop de tentatives. Reessayez dans quelques minutes.",
      });
    }
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(500).json({
      error: "Stripe non configure. Renseigne STRIPE_SECRET_KEY.",
    });
  }

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  try {
    let amountEur = Number(body.amountEur);
    let referenceId = body.referenceId || "none";
    const category = String(body.category || "general").toLowerCase();
    const requestType = String(body.requestType || "service_request").toLowerCase();
    const label = body.label || "Acompte devis";

    if (referenceId && referenceId !== "none" && String(referenceId).indexOf("qte_") === 0) {
      const sql = getSql();
      if (sql) {
        const rows = await fetchQuoteForCheckout(sql, referenceId, user);
        if (!rows.length) {
          return res.status(404).json({
            error: user
              ? "Devis introuvable ou hors perimetre."
              : "Devis introuvable. Verifiez la reference ou contactez-nous.",
          });
        }
        const quote = rows[0];
        if (quote.status === "acompte_paye") {
          return res.status(400).json({ error: "Acompte deja paye pour ce devis." });
        }
        const serverAmount = resolveDepositAmountEur(quote);
        if (serverAmount) {
          amountEur = serverAmount;
        }
        const check = validateDepositAmountEur(amountEur, quote);
        if (!check.ok) return res.status(400).json({ error: check.error });
      }
    } else if (!user && amountEur > PUBLIC_MAX_AMOUNT_EUR) {
      return res.status(400).json({
        error:
          "Montant maximum " +
          PUBLIC_MAX_AMOUNT_EUR +
          " EUR en paiement en ligne sans devis. Contactez-nous pour un reglement superieur.",
      });
    }

    if (!amountEur || amountEur <= 0) {
      return res.status(400).json({ error: "Montant invalide." });
    }

    const customerEmail = String(body.customerEmail || "").trim();
    if (!customerEmail || customerEmail.indexOf("@") === -1) {
      return res.status(400).json({ error: "Email client invalide." });
    }

    const appUrl = getStripeAppUrl();
    const companyCode = process.env.COMPANY_CODE || "LEADSOPP";
    const amountCents = toStripeAmount(amountEur);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: label,
              description: "Categorie: " + category + " | Type: " + requestType,
            },
          },
          quantity: 1,
        },
      ],
      success_url: appUrl + "/paiement-success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: appUrl + "/paiement.html?canceled=1",
      customer_email: customerEmail,
      metadata: {
        companyCode,
        appContext: "leads-opportunities",
        category: category,
        requestType: requestType,
        referenceId: referenceId,
        expectedAmountCents: String(amountCents),
      },
    });

    if (referenceId && referenceId !== "none" && String(referenceId).indexOf("qte_") === 0) {
      const sql = getSql();
      if (sql) {
        if (user) {
          const scope = contactScopeFilter(user);
          await sql`
            UPDATE crm_quotes q SET
              deposit_amount = ${amountEur},
              stripe_session_id = ${session.id},
              stripe_payment_status = 'pending',
              updated_at = NOW()
            FROM crm_contacts c
            WHERE q.id = ${referenceId}
              AND c.id = q.contact_id
              AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
          `;
        } else {
          await sql`
            UPDATE crm_quotes SET
              deposit_amount = ${amountEur},
              stripe_session_id = ${session.id},
              stripe_payment_status = 'pending',
              updated_at = NOW()
            WHERE id = ${referenceId}
          `;
        }
      }
    }

    await savePaymentLink({
      stripeSessionId: session.id,
      customerEmail,
      amountEur,
      paymentKind: category,
      label,
      referenceId: referenceId || "none",
      createdBy: user?.id || user?.email || "public",
      appContext: "checkout-session",
      metadata: { requestType, category },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      amountEur: amountEur,
    });
  } catch (error) {
    console.error("create-checkout-session error:", error);
    return res.status(500).json({
      error: "Impossible de creer la session Stripe.",
    });
  }
};
