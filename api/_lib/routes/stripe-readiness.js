/**
 * GET /api/stripe/readiness — verifie la configuration Stripe cote CRM.
 */
const { getStripeAppUrl, getStripeClient, getStripeSecretKey, getStripeWebhookSecret } = require("../stripe");
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");

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
  const secretKey = getStripeSecretKey();
  const webhookSecret = getStripeWebhookSecret();
  const hasSecret = !!secretKey;
  const hasWebhookSecret = !!webhookSecret;
  const appUrl = getStripeAppUrl();

  if (!stripe) {
    return res.status(200).json({
      ok: false,
      hasSecret,
      hasWebhookSecret,
      appUrl,
      error: "STRIPE_SECRET_KEY manquant",
      expectedSecretPrefix: "sk_test_ ou sk_live_",
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
      mode: secretKey.indexOf("sk_live_") === 0 ? "live" : "test",
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      webhookUrl: (appUrl || "https://www.leadsopportunities.fr") + "/api/stripe/webhook",
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
