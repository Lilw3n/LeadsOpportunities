/**
 * GET /api/stripe/readiness — verifie la configuration Stripe cote CRM.
 */
const { getStripeClient } = require("../_lib/stripe");
const { applyApiGuards } = require("../_lib/security");
const { requireCrm } = require("../_lib/rbac");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;
  if (user.role !== "admin" && user.crmRole !== "admin") {
    return res.status(403).json({ error: "Admin requis" });
  }

  const stripe = getStripeClient();
  const hasSecret = !!(process.env.STRIPE_SECRET_KEY || "").trim();
  const hasWebhookSecret = !!(process.env.STRIPE_WEBHOOK_SECRET || "").trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "";

  if (!stripe) {
    return res.status(200).json({
      ok: false,
      hasSecret,
      hasWebhookSecret,
      appUrl,
      error: "STRIPE_SECRET_KEY manquant",
    });
  }

  try {
    const account = await stripe.accounts.retrieve();
    return res.status(200).json({
      ok: true,
      hasSecret,
      hasWebhookSecret,
      appUrl,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      webhookUrl: (appUrl || "https://leads-opportunities.vercel.app") + "/api/stripe/webhook",
      requiredEvent: "checkout.session.completed",
    });
  } catch (e) {
    return res.status(200).json({
      ok: false,
      hasSecret,
      hasWebhookSecret,
      appUrl,
      error: e.message,
    });
  }
};
