const { sendViaResend } = require("./mail-send");
const { getSql } = require("./db");
const { getStripeAppUrl } = require("./stripe");

function notifyRecipients() {
  const raw =
    process.env.PAYMENT_NOTIFY_EMAIL ||
    process.env.LEAD_NOTIFY_EMAIL ||
    process.env.MAILBOX_ADDRESS ||
    "contact@leadsopportunities.fr";
  return raw
    .split(",")
    .map(function (e) {
      return e.trim();
    })
    .filter(function (e) {
      return e.indexOf("@") > 0;
    });
}

function formatEur(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function kindLabel(kind) {
  const map = {
    dossier_fee: "Frais de dossier",
    subscription: "Abonnement",
    acompte: "Acompte",
    one_time: "Paiement unique",
    quote_deposit: "Acompte devis",
  };
  return map[kind] || kind || "Paiement";
}

function buildPaymentEmail(link) {
  const appUrl = getStripeAppUrl();
  const dashboardUrl = appUrl + "/dashboard.html?section=mailbox";
  const quoteLine =
    link.reference_id && String(link.reference_id).indexOf("qte_") === 0
      ? "\nDevis : " + link.reference_id + " (" + appUrl + "/crm-quote-detail.html?id=" + encodeURIComponent(link.reference_id) + ")"
      : "";

  const text =
    "Un paiement Stripe vient d'etre recu.\n\n" +
    "Client : " +
    (link.customer_email || "—") +
    "\nMontant : " +
    formatEur(link.amount_eur) +
    "\nLibelle : " +
    (link.label || kindLabel(link.payment_kind)) +
    "\nType : " +
    kindLabel(link.payment_kind) +
    quoteLine +
    "\nSession : " +
    (link.stripe_session_id || "—") +
    "\n\nOuvrez la messagerie pour traiter ou ignorer le dossier :\n" +
    dashboardUrl +
    "\n\n— Leads Opportunities (notification automatique)";

  const html =
    '<div style="font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.55;color:#0f172a">' +
    "<h2 style=\"color:#0d9488;margin:0 0 12px\">Paiement Stripe recu</h2>" +
    "<p>Un client vient de regler un lien de paiement. Choisissez si vous traitez le dossier depuis la messagerie.</p>" +
    "<table style=\"border-collapse:collapse;width:100%;max-width:520px;font-size:14px\">" +
    "<tr><td style=\"padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b\">Client</td><td style=\"padding:8px;border-bottom:1px solid #e2e8f0\"><strong>" +
    (link.customer_email || "—") +
    "</strong></td></tr>" +
    "<tr><td style=\"padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b\">Montant</td><td style=\"padding:8px;border-bottom:1px solid #e2e8f0\"><strong>" +
    formatEur(link.amount_eur) +
    "</strong></td></tr>" +
    "<tr><td style=\"padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b\">Libelle</td><td style=\"padding:8px;border-bottom:1px solid #e2e8f0\">" +
    (link.label || kindLabel(link.payment_kind)) +
    "</td></tr>" +
    (link.reference_id && link.reference_id !== "none"
      ? "<tr><td style=\"padding:8px;border-bottom:1px solid #e2e8f0;color:#64748b\">Reference</td><td style=\"padding:8px;border-bottom:1px solid #e2e8f0\">" +
        link.reference_id +
        "</td></tr>"
      : "") +
    "</table>" +
    '<p style="margin:20px 0"><a href="' +
    dashboardUrl +
    '" style="display:inline-block;background:#0d9488;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700">Ouvrir la messagerie</a></p>' +
    '<p style="font-size:12px;color:#94a3b8">Notification automatique — Leads Opportunities</p></div>';

  const subject =
    "[Paiement] " +
    formatEur(link.amount_eur) +
    " — " +
    (link.customer_email || "client") +
    (link.reference_id && link.reference_id !== "none" ? " (" + link.reference_id + ")" : "");

  return { subject, text, html };
}

async function markNotifySent(linkId) {
  const sql = getSql();
  if (!sql || !linkId) return;
  try {
    await sql`
      UPDATE stripe_payment_links SET
        notify_sent_at = NOW(),
        updated_at = NOW()
      WHERE id = ${linkId}
    `;
  } catch (e) {
    if (String(e.message || e).indexOf("notify_sent_at") === -1) {
      console.warn("[stripe-payment-notify] markNotifySent", e.message);
    }
  }
}

async function notifyPaymentReceived(link, opts) {
  opts = opts || {};
  if (!link || link.payment_status !== "paid") {
    return { ok: false, skipped: true, reason: "not_paid" };
  }
  if (link.notify_sent_at && !opts.force) {
    return { ok: true, skipped: true, reason: "already_sent" };
  }

  const recipients = notifyRecipients();
  if (!recipients.length) {
    return { ok: false, error: "Aucun destinataire notification" };
  }

  const mail = buildPaymentEmail(link);
  const sent = await sendViaResend({
    to: recipients,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    replyTo: link.customer_email || undefined,
  });

  if (!sent.ok) {
    console.error("[stripe-payment-notify] send failed", sent.error);
    return { ok: false, error: sent.error };
  }

  await markNotifySent(link.id);
  return { ok: true, sentTo: recipients, resendId: sent.resendId };
}

module.exports = {
  notifyPaymentReceived,
  notifyRecipients,
  buildPaymentEmail,
};
