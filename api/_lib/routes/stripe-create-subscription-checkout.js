const { getStripeAppUrl, getStripeClient, toStripeAmount } = require("../stripe");
const { applyApiGuards, parseJsonBody, getClientIp, rateLimit } = require("../security");
const {
  getSubscriptionPlansConfig,
  recordSubscriptionCheckout,
} = require("../subscription-plans-store");
const {
  findPlan,
  priceForInterval,
  stripePriceIdForInterval,
  INTERVALS,
} = require("../subscription-plans");
const { savePaymentLink } = require("../stripe-payment-store");

module.exports = async function createSubscriptionCheckout(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rl = rateLimit("stripe-subscription-checkout:" + ip, 20, 60 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: "Trop de tentatives. Reessayez plus tard." });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return res.status(503).json({
      error: "Stripe non configure. STRIPE_SECRET_KEY requis.",
    });
  }

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  const planId = String(body.planId || "").trim();
  const interval = String(body.interval || "month").toLowerCase();
  if (!planId) return res.status(400).json({ error: "planId requis." });
  if (INTERVALS.indexOf(interval) === -1) {
    return res.status(400).json({ error: "Intervalle invalide (month|year)." });
  }

  const customerEmail = String(body.customerEmail || body.email || "").trim();
  if (customerEmail && customerEmail.indexOf("@") === -1) {
    return res.status(400).json({ error: "Email invalide." });
  }

  try {
    const config = await getSubscriptionPlansConfig();
    const plan = findPlan(config, planId);
    if (!plan || !plan.enabled) {
      return res.status(404).json({ error: "Formule introuvable ou desactivee." });
    }
    if (plan.ctaMode !== "checkout") {
      return res.status(400).json({
        error: "Cette formule ne passe pas par Stripe Checkout (mode " + plan.ctaMode + ").",
      });
    }

    const amountEur = priceForInterval(plan, interval);
    if (!(amountEur > 0)) {
      return res.status(400).json({
        error: "Montant nul : utilisez le CTA gratuit / lien, pas le checkout Stripe.",
      });
    }

    const appUrl = getStripeAppUrl();
    const successPath = config.successPath || "/paiement-success.html";
    const cancelPath = config.cancelPath || "/abonnements/?canceled=1";
    const successUrl =
      appUrl +
      (successPath.indexOf("/") === 0 ? successPath : "/" + successPath) +
      (successPath.indexOf("?") >= 0 ? "&" : "?") +
      "session_id={CHECKOUT_SESSION_ID}&kind=subscription";
    const cancelUrl =
      appUrl + (cancelPath.indexOf("/") === 0 ? cancelPath : "/" + cancelPath);

    const amountCents = toStripeAmount(amountEur);
    const priceId = stripePriceIdForInterval(plan, interval);
    const companyCode = process.env.COMPANY_CODE || "LEADSOPP";

    const lineItem = priceId
      ? { price: priceId, quantity: 1 }
      : {
          price_data: {
            currency: config.currency || "eur",
            unit_amount: amountCents,
            recurring: { interval: interval },
            product_data: {
              name: plan.name,
              description: plan.tagline || "Abonnement " + plan.name + " · " + interval,
            },
          },
          quantity: 1,
        };

    const sessionPayload = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [lineItem],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      metadata: {
        companyCode: companyCode,
        appContext: "subscription-plans",
        paymentKind: "subscription",
        requestType: "subscription_plan",
        planId: plan.id,
        planName: plan.name,
        interval: interval,
        expectedAmountCents: String(amountCents),
        referenceId: "plan:" + plan.id,
      },
      subscription_data: {
        metadata: {
          planId: plan.id,
          planName: plan.name,
          interval: interval,
          appContext: "subscription-plans",
        },
      },
    };

    if (plan.trialDays > 0) {
      sessionPayload.subscription_data.trial_period_days = plan.trialDays;
    }
    if (customerEmail) {
      sessionPayload.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);

    await recordSubscriptionCheckout({
      planId: plan.id,
      interval: interval,
      customerEmail: customerEmail || null,
      stripeSessionId: session.id,
      amountEur: amountEur,
      currency: config.currency || "eur",
      status: "pending",
      metadata: {
        planName: plan.name,
        trialDays: plan.trialDays,
        priceId: priceId || null,
      },
    });

    try {
      await savePaymentLink({
        stripeSessionId: session.id,
        customerEmail: customerEmail || "",
        amountEur: amountEur,
        paymentKind: "subscription",
        label: plan.name + " (" + interval + ")",
        referenceId: "plan:" + plan.id,
        appContext: "subscription-plans",
        metadata: {
          planId: plan.id,
          interval: interval,
          trialDays: plan.trialDays,
        },
      });
    } catch (storeErr) {
      console.warn("[subscription-checkout] payment link store", storeErr.message);
    }

    return res.status(200).json({
      ok: true,
      sessionId: session.id,
      url: session.url,
      planId: plan.id,
      interval: interval,
      amountEur: amountEur,
      trialDays: plan.trialDays,
    });
  } catch (error) {
    console.error("create-subscription-checkout error:", error);
    return res.status(500).json({
      error: error && error.message ? error.message : "Erreur Stripe checkout abonnement.",
    });
  }
};
