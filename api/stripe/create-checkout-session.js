const { getStripeClient, toStripeAmount } = require("../_lib/stripe");

module.exports = async (req, res) => {
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

  try {
    const {
      amountEur,
      customerEmail,
      category,
      requestType,
      referenceId,
      label,
    } = req.body || {};

    if (!amountEur || Number(amountEur) <= 0) {
      return res.status(400).json({ error: "Montant invalide." });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3009";
    const companyCode = process.env.COMPANY_CODE || "LEADSOPP";

    const safeCategory = String(category || "general").toLowerCase();
    const safeRequestType = String(requestType || "service_request").toLowerCase();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: toStripeAmount(amountEur),
            product_data: {
              name: label || "Acompte devis",
              description: `Categorie: ${safeCategory} | Type: ${safeRequestType}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/paiement-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/paiement.html?canceled=1`,
      customer_email: customerEmail || undefined,
      metadata: {
        companyCode,
        appContext: "leads-opportunities",
        category: safeCategory,
        requestType: safeRequestType,
        referenceId: referenceId || "none",
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("create-checkout-session error:", error);
    return res.status(500).json({
      error: "Impossible de creer la session Stripe.",
    });
  }
};
