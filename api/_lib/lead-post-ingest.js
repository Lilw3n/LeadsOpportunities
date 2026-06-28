const { sendMetaEvent } = require("./meta-capi");
const { normalizeClientIp } = require("./security");

function normalizeEmailAddress(addr) {
  var s = String(addr || "").trim();
  var m = s.match(/<([^>]+)>/);
  return (m && m[1] ? m[1] : s).trim().toLowerCase();
}

function getLeadNotificationRecipients() {
  var raw = process.env.LEAD_NOTIFICATION_EMAIL || "courtier972@gmail.com";
  var list = raw
    .split(/[,;]/)
    .map(function (s) {
      return s.trim();
    })
    .filter(function (s) {
      return s && s.indexOf("@") > 0;
    });

  var includeMailbox = process.env.LEAD_NOTIFY_INCLUDE_MAILBOX !== "false";
  var mailbox = (process.env.MAILBOX_ADDRESS || "contact@leadsopportunities.fr").trim();
  if (includeMailbox && mailbox && mailbox.indexOf("@") > 0) {
    var mailboxKey = normalizeEmailAddress(mailbox);
    var hasMailbox = list.some(function (e) {
      return normalizeEmailAddress(e) === mailboxKey;
    });
    if (!hasMailbox) list.push(mailbox);
  }

  var seen = new Set();
  return list.filter(function (e) {
    var key = normalizeEmailAddress(e);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendResendEmail(payload, score, leadId) {
  var key = process.env.RESEND_API_KEY;
  var toList = getLeadNotificationRecipients();
  var from = process.env.LEAD_FROM_EMAIL || "Leads Opportunities <onboarding@resend.dev>";

  if (!key) {
    console.warn("[lead] RESEND_API_KEY manquant — aucun e-mail envoye");
    return false;
  }
  if (!toList.length) {
    console.warn("[lead] aucun destinataire notification");
    return false;
  }

  var sub =
    "[Lead " +
    (payload.vertical || "?") +
    "] score " +
    score +
    " — " +
    (payload.email || payload.phone || leadId);
  var html =
    "<h2>Nouvelle demande Leads Opportunities</h2>" +
    "<p><strong>ID</strong> " +
    leadId +
    "</p>" +
    "<p><strong>Score</strong> " +
    score +
    "/100</p>" +
    "<p><strong>Source</strong> " +
    escapeHtml(String(payload.source || "")) +
    "</p>" +
    "<p><strong>Vertical</strong> " +
    escapeHtml(String(payload.vertical || "")) +
    "</p>" +
    "<pre style=\"background:#f1f5f9;padding:12px;border-radius:8px;overflow:auto\">" +
    escapeHtml(JSON.stringify(payload, null, 2).slice(0, 12000)) +
    "</pre>";

  var r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from,
      to: toList,
      subject: sub,
      html: html,
    }),
  });

  if (!r.ok) {
    var t = await r.text();
    console.warn("[lead] resend", r.status, t);
    return false;
  }
  return true;
}

async function notifySlack(payload, score, leadId) {
  var url = (process.env.SLACK_WEBHOOK_URL || "").trim();
  if (!url) return false;

  var appUrl = (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.leadsopportunities.fr"
  ).replace(/\/$/, "");
  var src = String(payload.source || "site");
  var vertical = String(payload.vertical || "devis");
  var crmPath =
    src === "meta_lead_ads" ? "/crm-meta-inbox.html" : "/crm-acquisition.html";
  var lines = [
    "*Nouveau lead* — " + vertical + " · score " + score + "/100",
    "Source: " + src,
    payload.phone ? "Tel: " + payload.phone : "",
    payload.email ? "Email: " + payload.email : "",
    payload.utm_campaign ? "Campagne: " + payload.utm_campaign : "",
    "ID: " + leadId,
    "<" + appUrl + crmPath + "|Ouvrir le CRM>",
  ].filter(Boolean);

  try {
    var r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lines.join("\n") }),
    });
    if (!r.ok) console.warn("[lead] slack", r.status, await r.text().catch(function () { return ""; }));
    return r.ok;
  } catch (e) {
    console.error("[lead] slack error", e.message);
    return false;
  }
}

async function finalizeLeadIngest(enriched, leadId, score, req) {
  var emailSent = false;
  try {
    emailSent = !!(await sendResendEmail(enriched, score, leadId));
  } catch (e) {
    console.error("[lead] email failed", e);
  }

  try {
    await notifySlack(enriched, score, leadId);
  } catch (e) {
    console.error("[lead] slack failed", e);
  }

  try {
    const { dispatchLeadToPartners } = require("./partners/dispatch");
    dispatchLeadToPartners(enriched, score, leadId).catch(function (e) {
      console.error("[partners/dispatch]", e);
    });
  } catch (e) {
    console.error("[partners]", e);
  }

  var webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      var r = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enriched),
      });
      if (!r.ok) console.warn("[lead] webhook status", r.status);
    } catch (e) {
      console.error("[lead] webhook error", e);
    }
  }

  try {
    var actionSource = enriched.source === "meta_lead_ads" ? "system_generated" : "website";
    await sendMetaEvent({
      eventName: "Lead",
      eventId: enriched.client_event_id || enriched.event_id || enriched.meta_leadgen_id || leadId,
      pageUrl:
        (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://www.leadsopportunities.fr") +
        (enriched.landing_path || enriched.page || ""),
      email: enriched.email,
      phone: enriched.phone,
      fbclid: enriched.fbclid || enriched.attr_last_fbclid || null,
      fbp: enriched.fbp || enriched.attr_fbp || null,
      clientIp: enriched.clientIp || (req ? normalizeClientIp(req) : null),
      clientUa: (req && req.headers["user-agent"]) || "",
      actionSource: actionSource,
      customData: {
        currency: "EUR",
        value: score || 1,
        content_name: enriched.vertical || "lead",
        source: enriched.source || "site",
        lead_event_source: enriched.source || "site",
      },
    });
  } catch (metaErr) {
    console.warn("[lead] meta capi", metaErr.message);
  }

  return { emailSent: emailSent };
}

module.exports = {
  finalizeLeadIngest,
  sendResendEmail,
  getLeadNotificationRecipients,
};
