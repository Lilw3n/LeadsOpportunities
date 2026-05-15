const Stripe = require("stripe");
const { getStripeClient } = require("../_lib/stripe");
const { applyApiGuards, readRawBody } = require("../_lib/security");

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async (req, res) => {
  applyApiGuards(req, res);

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

    const rawBody = await readRawBody(req);
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("Stripe checkout complete:", {
        sessionId: session.id,
        customerEmail: session.customer_details?.email || null,
        metadata: session.metadata || {},
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
