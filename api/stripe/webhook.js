const Stripe = require("stripe");
const { getStripeClient } = require("../_lib/stripe");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stripe = getStripeClient();
  const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || "").trim();

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

    // Sur Vercel Node serverless, req.body est deja parse.
    // On reconstruit un event a partir du JSON parse si constructEvent raw n'est pas possible.
    // Pour une verif stricte, basculer vers un framework qui expose le raw body.
    const event = req.body && req.body.type ? req.body : null;
    if (!event) {
      return res.status(400).json({ error: "Payload webhook invalide." });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Stripe checkout complete:", {
        sessionId: session.id,
        customerEmail: session.customer_details?.email || null,
        metadata: session.metadata || {},
      });
      // TODO: brancher ici ton stockage (CRM/DB) pour marquer la demande comme payee.
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
