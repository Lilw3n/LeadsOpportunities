const { getStripeClient, toStripeAmount } = require("../stripe");
const { applyApiGuards, parseJsonBody } = require("../security");
const { getSql } = require("../db");
const { resolveDepositAmountEur, validateDepositAmountEur } = require("../quote-deposit");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
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
    const customerEmail = body.customerEmail;
    const category = String(body.category || "general").toLowerCase();
    const requestType = String(body.requestType || "service_request").toLowerCase();
    const label = body.label || "Acompte devis";

    if (referenceId && referenceId !== "none" && String(referenceId).indexOf("qte_") === 0) {
      const sql = getSql();
      if (sql) {
        const rows = await sql`
          SELECT * FROM crm_quotes WHERE id = ${referenceId} LIMIT 1
        `;
        if (rows.length) {
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
      }
    }

    if (!amountEur || amountEur <= 0) {
      return res.status(400).json({ error: "Montant invalide." });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3009";
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
      customer_email: customerEmail || undefined,
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
