const { getStripeAppUrl, getStripeClient, toStripeAmount } = require("../stripe");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { resolveDepositAmountEur, validateDepositAmountEur } = require("../quote-deposit");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireCrm(req, res);
  if (!user) return;

  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(500).json({ error: "Stripe non configure." });
  }

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const quoteId = body.quoteId || body.quote_id;
  if (!quoteId) return res.status(400).json({ error: "quoteId requis" });

  try {
    const rows = await sql`
      SELECT q.*, c.email AS contact_email, c.first_name, c.last_name
      FROM crm_quotes q
      INNER JOIN crm_contacts c ON c.id = q.contact_id
      WHERE q.id = ${quoteId}
      LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: "Devis introuvable" });

    const quote = rows[0];
    if (quote.status === "acompte_paye") {
      return res.status(400).json({ error: "Acompte deja paye pour ce devis." });
    }

    let amountEur = resolveDepositAmountEur(quote);
    if (body.depositAmount != null) {
      const custom = validateDepositAmountEur(body.depositAmount, quote);
      if (!custom.ok) return res.status(400).json({ error: custom.error });
      amountEur = custom.amountEur;
    }
    if (!amountEur) {
      return res.status(400).json({ error: "Montant acompte non defini sur ce devis." });
    }

    const check = validateDepositAmountEur(amountEur, quote);
    if (!check.ok) return res.status(400).json({ error: check.error });

    const appUrl = getStripeAppUrl();
    const companyCode = process.env.COMPANY_CODE || "LEADSOPP";
    const contactName = ((quote.first_name || "") + " " + (quote.last_name || "")).trim();
    const label = quote.title ? "Acompte — " + quote.title : "Acompte devis assurance";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: toStripeAmount(amountEur),
            product_data: {
              name: label,
              description: "Devis " + quoteId + (contactName ? " — " + contactName : ""),
            },
          },
          quantity: 1,
        },
      ],
      success_url: appUrl + "/paiement-success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: appUrl + "/crm-quote-payment.html?quoteId=" + encodeURIComponent(quoteId) + "&canceled=1",
      customer_email: quote.contact_email || undefined,
      metadata: {
        companyCode,
        appContext: "leads-opportunities",
        category: quote.product_type || "insurance",
        requestType: "quote_deposit",
        referenceId: quoteId,
        expectedAmountCents: String(toStripeAmount(amountEur)),
      },
    });

    await sql`
      UPDATE crm_quotes SET
        deposit_amount = ${amountEur},
        stripe_session_id = ${session.id},
        stripe_payment_status = 'pending',
        updated_at = NOW()
      WHERE id = ${quoteId}
    `;

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      amountEur: amountEur,
    });
  } catch (error) {
    console.error("create-checkout-for-quote error:", error);
    return res.status(500).json({ error: "Impossible de creer la session Stripe." });
  }
};
