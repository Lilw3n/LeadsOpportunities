const { getStripeAppUrl, getStripeClient, toStripeAmount } = require("../stripe");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");

const PAYMENT_KINDS = ["dossier_fee", "subscription", "one_time", "acompte"];
const INTERVALS = ["day", "week", "month", "year"];
const CRM_MAX_AMOUNT_EUR = 50000;

const DEFAULT_LABELS = {
  dossier_fee: "Frais de dossier",
  subscription: "Abonnement",
  one_time: "Paiement",
  acompte: "Acompte",
};

function categoryForKind(kind) {
  if (kind === "dossier_fee") return "dossier_fee";
  if (kind === "subscription") return "subscription";
  if (kind === "acompte") return "quote_deposit";
  return "general";
}

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
    return res.status(500).json({
      error: "Stripe non configure. Renseigne STRIPE_SECRET_KEY.",
    });
  }

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  const paymentKind = String(body.paymentKind || "one_time").toLowerCase();
  if (PAYMENT_KINDS.indexOf(paymentKind) === -1) {
    return res.status(400).json({ error: "Type de paiement invalide." });
  }

  const amountEur = Number(body.amountEur);
  if (!amountEur || amountEur <= 0) {
    return res.status(400).json({ error: "Montant invalide." });
  }
  if (amountEur > CRM_MAX_AMOUNT_EUR) {
    return res.status(400).json({
      error: "Montant maximum " + CRM_MAX_AMOUNT_EUR + " EUR.",
    });
  }

  const customerEmail = String(body.customerEmail || "").trim();
  if (!customerEmail || customerEmail.indexOf("@") === -1) {
    return res.status(400).json({ error: "Email client invalide." });
  }

  const label = String(body.label || DEFAULT_LABELS[paymentKind] || "Paiement").trim();
  if (!label) return res.status(400).json({ error: "Libelle requis." });

  const interval = String(body.interval || "month").toLowerCase();
  if (paymentKind === "subscription" && INTERVALS.indexOf(interval) === -1) {
    return res.status(400).json({ error: "Periodicite invalide." });
  }

  const referenceId = String(body.referenceId || "none").trim() || "none";
  const companyCode = process.env.COMPANY_CODE || "LEADSOPP";
  const appUrl = getStripeAppUrl();
  const amountCents = toStripeAmount(amountEur);
  const isSubscription = paymentKind === "subscription";

  try {
    const priceData = {
      currency: "eur",
      unit_amount: amountCents,
      product_data: {
        name: label,
        description:
          "Messagerie CRM · " +
          paymentKind +
          (isSubscription ? " · " + interval : ""),
      },
    };

    if (isSubscription) {
      priceData.recurring = { interval: interval };
    }

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: priceData,
          quantity: 1,
        },
      ],
      success_url: appUrl + "/paiement-success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: appUrl + "/paiement.html?canceled=1",
      customer_email: customerEmail,
      metadata: {
        companyCode,
        appContext: "mailbox-payment-link",
        category: categoryForKind(paymentKind),
        paymentKind,
        requestType: isSubscription ? "subscription" : "mailbox_one_time",
        referenceId,
        expectedAmountCents: String(amountCents),
        createdBy: user.id || user.email || "crm",
      },
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
      amountEur,
      paymentKind,
      interval: isSubscription ? interval : null,
      label,
    });
  } catch (error) {
    console.error("create-mailbox-payment-link error:", error);
    return res.status(500).json({
      error: "Impossible de creer le lien Stripe.",
    });
  }
};
