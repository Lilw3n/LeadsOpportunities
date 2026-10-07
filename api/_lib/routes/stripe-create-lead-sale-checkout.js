/**
 * POST /api/stripe/create-lead-sale-checkout
 * Lien Stripe au prix de vente (ajustable). Le dû partenaire reste interne.
 */
const { getStripeAppUrl, getStripeClient, toStripeAmount } = require("../stripe");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { savePaymentLink } = require("../stripe-payment-store");
const { getLeadSale, updateLeadSale } = require("../lead-sales-store");
const LeadSaleSplit = require("../../../js/lead-sale-split-lib.js");

const CRM_MAX_AMOUNT_EUR = 50000;

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
    return res.status(500).json({ error: "Stripe non configure. Renseigne STRIPE_SECRET_KEY." });
  }

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const saleId = String(body.saleId || body.id || "").trim();
  if (!saleId) return res.status(400).json({ error: "saleId requis" });

  const sale = await getLeadSale(saleId);
  if (!sale) return res.status(404).json({ error: "Vente introuvable" });
  if (sale.status === "cancelled") {
    return res.status(400).json({ error: "Vente annulée." });
  }

  let amountEur = body.salePriceEur != null ? Number(body.salePriceEur) : sale.salePriceEur;
  if (body.salePriceEur != null || body.supplierPriceEur != null || body.partnerSharePct != null) {
    const split = LeadSaleSplit.compute({
      supplierPriceEur:
        body.supplierPriceEur != null ? body.supplierPriceEur : sale.supplierPriceEur,
      partnerSharePct:
        body.partnerSharePct != null ? body.partnerSharePct : sale.partnerSharePct,
      salePriceEur: amountEur,
    });
    amountEur = split.salePriceEur;
    const patched = await updateLeadSale(saleId, {
      supplierPriceEur: split.supplierPriceEur,
      partnerSharePct: split.partnerSharePct,
      salePriceEur: split.salePriceEur,
    });
    if (patched.ok) Object.assign(sale, patched.sale);
  }

  if (!amountEur || amountEur <= 0) {
    return res.status(400).json({ error: "Prix de vente invalide." });
  }
  if (amountEur > CRM_MAX_AMOUNT_EUR) {
    return res.status(400).json({ error: "Montant maximum " + CRM_MAX_AMOUNT_EUR + " EUR." });
  }

  const label =
    String(body.label || sale.label || "Lead professionnel").trim() || "Lead professionnel";
  const customerEmail = String(body.buyerEmail || sale.buyerEmail || "").trim();
  if (customerEmail && customerEmail.indexOf("@") === -1) {
    return res.status(400).json({ error: "Email acheteur invalide." });
  }

  const companyCode = process.env.COMPANY_CODE || "LEADSOPP";
  const appUrl = getStripeAppUrl();
  const amountCents = toStripeAmount(amountEur);
  const split = LeadSaleSplit.compute({
    supplierPriceEur: sale.supplierPriceEur,
    partnerSharePct: sale.partnerSharePct,
    salePriceEur: amountEur,
  });

  try {
    const sessionPayload = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: label,
              description: "Achat lead professionnel · Leads Opportunities",
            },
          },
          quantity: 1,
        },
      ],
      success_url: appUrl + "/paiement-success.html?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: appUrl + "/crm-lead-sales.html?canceled=1",
      metadata: {
        companyCode,
        appContext: "lead-sale",
        paymentKind: "lead_sale",
        requestType: "lead_sale",
        category: "lead_sale",
        referenceId: saleId,
        leadSaleId: saleId,
        expectedAmountCents: String(amountCents),
        // Interne — pas affiché à l'acheteur ; utile webhook / compta
        partnerDueEur: String(split.partnerDueEur),
        supplierPriceEur: String(split.supplierPriceEur),
        partnerSharePct: String(split.partnerSharePct),
        createdBy: user.id || user.email || "crm",
        label: label.slice(0, 80),
      },
    };
    if (customerEmail) sessionPayload.customer_email = customerEmail;

    const session = await stripe.checkout.sessions.create(sessionPayload);

    await updateLeadSale(saleId, {
      status: "link_sent",
      stripeSessionId: session.id,
      paymentUrl: session.url,
      salePriceEur: amountEur,
      buyerEmail: customerEmail || sale.buyerEmail,
    });

    await savePaymentLink({
      stripeSessionId: session.id,
      customerEmail: customerEmail || null,
      amountEur: amountEur,
      paymentKind: "lead_sale",
      label: label,
      referenceId: saleId,
      createdBy: user.id || user.email,
      appContext: "lead-sale",
      metadata: {
        leadSaleId: saleId,
        partnerDueEur: split.partnerDueEur,
        supplierPriceEur: split.supplierPriceEur,
        youKeepEur: split.youKeepEur,
      },
    });

    return res.status(200).json({
      ok: true,
      sessionId: session.id,
      url: session.url,
      amountEur: amountEur,
      saleId: saleId,
      split: split,
      partnerView: LeadSaleSplit.partnerView(split),
    });
  } catch (error) {
    console.error("create-lead-sale-checkout error:", error);
    return res.status(500).json({
      error: "Impossible de créer le lien Stripe.",
      detail: error.message,
    });
  }
};
