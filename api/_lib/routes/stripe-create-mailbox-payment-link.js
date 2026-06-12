const { getStripeAppUrl, getStripeClient, toStripeAmount } = require("../stripe");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const { resolveDepositAmountEur, validateDepositAmountEur } = require("../quote-deposit");
const { savePaymentLink } = require("../stripe-payment-store");

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

async function fetchQuoteForMailbox(sql, quoteId, user) {
  const scope = contactScopeFilter(user);
  const rows = await sql`
    SELECT q.*, c.email AS contact_email, c.first_name, c.last_name
    FROM crm_quotes q
    INNER JOIN crm_contacts c ON c.id = q.contact_id
    WHERE q.id = ${quoteId}
      AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
    LIMIT 1
  `;
  return rows[0] || null;
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

  let amountEur = Number(body.amountEur);
  const paymentKindIsAcompte = paymentKind === "acompte";

  const referenceId = String(body.referenceId || "none").trim() || "none";
  const hasQuoteRef = referenceId !== "none" && referenceId.indexOf("qte_") === 0;
  let quote = null;

  if (hasQuoteRef) {
    const sql = getSql();
    if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
    quote = await fetchQuoteForMailbox(sql, referenceId, user);
    if (!quote) return res.status(404).json({ error: "Devis introuvable ou hors perimetre." });
    if (paymentKindIsAcompte) {
      if (quote.status === "acompte_paye") {
        return res.status(400).json({ error: "Acompte deja paye pour ce devis." });
      }
      const serverAmount = resolveDepositAmountEur(quote);
      if (!amountEur && serverAmount) amountEur = serverAmount;
      if (amountEur) {
        const check = validateDepositAmountEur(amountEur, quote);
        if (!check.ok) return res.status(400).json({ error: check.error });
        amountEur = check.amountEur;
      }
    }
  }

  if (!amountEur || amountEur <= 0) {
    return res.status(400).json({
      error: paymentKindIsAcompte && hasQuoteRef
        ? "Montant acompte non defini. Renseignez-le ou configurez-le sur le devis."
        : "Montant invalide.",
    });
  }
  if (amountEur > CRM_MAX_AMOUNT_EUR) {
    return res.status(400).json({
      error: "Montant maximum " + CRM_MAX_AMOUNT_EUR + " EUR.",
    });
  }

  const customerEmail = String(body.customerEmail || quote?.contact_email || "").trim();
  if (!customerEmail || customerEmail.indexOf("@") === -1) {
    return res.status(400).json({ error: "Email client invalide." });
  }

  let label = String(body.label || DEFAULT_LABELS[paymentKind] || "Paiement").trim();
  if (!label) return res.status(400).json({ error: "Libelle requis." });
  if (hasQuoteRef && quote?.title && paymentKindIsAcompte) {
    label = "Acompte — " + quote.title;
  }

  const interval = String(body.interval || "month").toLowerCase();
  if (paymentKind === "subscription" && INTERVALS.indexOf(interval) === -1) {
    return res.status(400).json({ error: "Periodicite invalide." });
  }

  const companyCode = process.env.COMPANY_CODE || "LEADSOPP";
  const appUrl = getStripeAppUrl();
  const amountCents = toStripeAmount(amountEur);
  const isSubscription = paymentKind === "subscription";
  const contactName = quote
    ? ((quote.first_name || "") + " " + (quote.last_name || "")).trim()
    : "";

  try {
    const priceData = {
      currency: "eur",
      unit_amount: amountCents,
      product_data: {
        name: label,
        description:
          (hasQuoteRef ? "Devis " + referenceId + (contactName ? " — " + contactName : "") + " · " : "") +
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
      cancel_url:
        hasQuoteRef && paymentKindIsAcompte
          ? appUrl + "/crm-quote-payment.html?quoteId=" + encodeURIComponent(referenceId) + "&canceled=1"
          : appUrl + "/paiement.html?canceled=1",
      customer_email: customerEmail,
      metadata: {
        companyCode,
        appContext: "mailbox-payment-link",
        category: categoryForKind(paymentKind),
        paymentKind,
        requestType: isSubscription ? "subscription" : paymentKindIsAcompte ? "quote_deposit" : "mailbox_one_time",
        referenceId: hasQuoteRef ? referenceId : "none",
        expectedAmountCents: String(amountCents),
        createdBy: user.id || user.email || "crm",
      },
    });

    if (hasQuoteRef && paymentKindIsAcompte) {
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

    const stored = await savePaymentLink({
      stripeSessionId: session.id,
      customerEmail,
      amountEur,
      paymentKind,
      label,
      referenceId: hasQuoteRef ? referenceId : "none",
      contactId: quote?.contact_id || null,
      createdBy: user.id || user.email,
      appContext: "mailbox-payment-link",
      metadata: {
        interval: isSubscription ? interval : null,
        quoteTitle: quote?.title || null,
      },
    });

    return res.status(200).json({
      paymentLinkId: stored.ok ? stored.id : null,
      sessionId: session.id,
      url: session.url,
      amountEur,
      paymentKind,
      interval: isSubscription ? interval : null,
      label,
      referenceId: hasQuoteRef ? referenceId : null,
      quoteTitle: quote?.title || null,
    });
  } catch (error) {
    console.error("create-mailbox-payment-link error:", error);
    return res.status(500).json({
      error: "Impossible de creer le lien Stripe.",
    });
  }
};
