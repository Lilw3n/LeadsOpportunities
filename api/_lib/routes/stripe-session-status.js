const { getStripeClient } = require("../stripe");
const { applyApiGuards } = require("../security");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const url = new URL(req.url, "http://localhost");
  const sessionId = url.searchParams.get("session_id");
  if (!sessionId) return res.status(400).json({ error: "session_id requis" });

  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(503).json({ error: "Stripe non configure. STRIPE_SECRET_KEY requis." });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid" || session.status === "complete";
    return res.status(200).json({
      ok: true,
      paid: paid,
      mode: session.mode || null,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email || session.customer_email,
      referenceId: session.metadata?.referenceId || null,
      planId: session.metadata?.planId || null,
    });
  } catch (error) {
    console.error("session-status error:", error);
    return res.status(400).json({ error: "Session introuvable ou invalide." });
  }
};
