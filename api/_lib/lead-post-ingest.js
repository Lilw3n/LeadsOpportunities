const { sendMetaEvent } = require("./meta-capi");
const { normalizeClientIp } = require("./security");
const { classifyLeadInboxKind } = require("./lead-inbox-kind");
const VerticalLabels = require("../../js/vertical-labels.js");
const CrmLeadPayloadView = require("../../js/crm-lead-payload-view.js");
const LeadValue = require("../../js/lead-value.js");
const { detectFamilyLead } = require("../../js/lead-vip.js");

function leadValueInfo(payload, score) {
  if (payload && payload.estimated_value != null && isFinite(Number(payload.estimated_value))) {
    return {
      value: Number(payload.estimated_value),
      band: payload.estimated_value_band || null,
      reasons: payload.estimated_value_reasons || [],
    };
  }
  try {
    return LeadValue.computeLeadValue(
      Object.assign({}, payload, { leadScore: payload.leadScore != null ? payload.leadScore : score })
    );
  } catch (e) {
    return null;
  }
}

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

  var kind = classifyLeadInboxKind({ source: payload.source }, payload);
  var typeLabel =
    kind === "express_callback"
      ? "Rappel express"
      : kind === "contact_request"
        ? "Demande de contact"
        : "Questionnaire";
  var productLabel = VerticalLabels.label(payload.vertical || payload.need);
  var name = [payload.firstName || payload.first_name, payload.lastName || payload.last_name]
    .filter(Boolean)
    .join(" ")
    .trim() || String(payload.fullName || payload.name || "").trim();
  var who = name || payload.email || payload.phone || leadId;

  var lv = leadValueInfo(payload, score);
  var valueTxt = lv && lv.value > 0 ? "~" + LeadValue.formatEuros(lv.value) : "";
  var bandTxt =
    lv && lv.band === "high" ? " (fort potentiel)" : lv && lv.band === "medium" ? "" : "";

  var family = null;
  try {
    family = detectFamilyLead(payload);
  } catch (e) {}

  var sub =
    (family ? "[Famille BUCHET] " : "") +
    "[" +
    typeLabel +
    " · " +
    productLabel +
    "] " +
    who +
    " — score " +
    score +
    (valueTxt ? " · " + valueTxt : "");

  var appUrl = (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.leadsopportunities.fr"
  ).replace(/\/$/, "");

  function row(label, value) {
    if (value == null || String(value).trim() === "") return "";
    return (
      '<tr><th style="text-align:left;padding:4px 10px 4px 0;color:#475569;white-space:nowrap;vertical-align:top">' +
      escapeHtml(label) +
      '</th><td style="padding:4px 0">' +
      escapeHtml(String(value)) +
      "</td></tr>"
    );
  }

  var step = payload.questionnaire_step || payload.step;
  var total = payload.questionnaire_total || payload.step_total;

  var answersHtml = "";
  try {
    var answers = CrmLeadPayloadView.getAllAnswerRows(payload);
    if (answers.length) {
      answersHtml =
        '<h3 style="margin:20px 0 6px;font-size:15px">Réponses du questionnaire</h3>' +
        '<table style="border-collapse:collapse;font-size:14px">' +
        answers
          .map(function (r) {
            return row(r.label, r.value);
          })
          .join("") +
        "</table>";
    }
  } catch (e) {
    console.warn("[lead] email answers render", e.message);
  }

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;color:#0f172a">' +
    (family
      ? '<p style="margin:0 0 12px;padding:10px 14px;background:#ede9fe;border:1px solid #c4b5fd;border-radius:8px;color:#5b21b6;font-weight:bold">' +
        escapeHtml(family.greeting) +
        "</p>"
      : "") +
    '<h2 style="margin:0 0 4px">' +
    escapeHtml(typeLabel) +
    " — " +
    escapeHtml(productLabel) +
    "</h2>" +
    '<p style="margin:0 0 16px;color:#475569">' +
    escapeHtml(who) +
    " · score " +
    score +
    "/100" +
    (valueTxt
      ? ' · <strong style="color:#15803d">' + escapeHtml(valueTxt + bandTxt) + "</strong>"
      : "") +
    "</p>" +
    '<table style="border-collapse:collapse;font-size:14px">' +
    row("Rémunération potentielle", valueTxt ? valueTxt + bandTxt : "") +
    row(
      "Détail du calcul",
      lv && lv.reasons && lv.reasons.length ? lv.reasons.join(" · ") : ""
    ) +
    row("Nom", name) +
    row("E-mail", payload.email) +
    row("Téléphone", payload.phone) +
    row("Ville", payload.city) +
    row("Code postal", payload.postal_code || payload.postalCode) +
    row("Étape questionnaire", step && total ? step + " / " + total : step || "") +
    row("Source", payload.source) +
    row("Campagne", payload.utm_campaign) +
    row("ID lead", leadId) +
    "</table>" +
    answersHtml +
    '<p style="margin:20px 0 6px">' +
    '<a href="' +
    appUrl +
    '/dashboard.html?section=mailbox" style="color:#0f766e;font-weight:bold">Ouvrir la messagerie CRM</a>' +
    " · " +
    '<a href="' +
    appUrl +
    "/crm-lead-detail.html?id=" +
    encodeURIComponent(leadId) +
    '" style="color:#0f766e">Fiche lead</a></p>' +
    '<details><summary style="color:#94a3b8;font-size:12px;cursor:pointer">Données brutes (debug)</summary>' +
    '<pre style="background:#f1f5f9;padding:12px;border-radius:8px;overflow:auto;font-size:11px">' +
    escapeHtml(JSON.stringify(payload, null, 2).slice(0, 12000)) +
    "</pre></details>" +
    "</div>";

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
  var lvSlack = leadValueInfo(payload, score);
  var lines = [
    "*Nouveau lead* — " +
      vertical +
      " · score " +
      score +
      "/100" +
      (lvSlack && lvSlack.value > 0
        ? " · ~" +
          LeadValue.formatEuros(lvSlack.value) +
          (lvSlack.band === "high" ? " (fort potentiel)" : "")
        : ""),
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

async function sendSlackTestMessage() {
  const { sendSlackText } = require("./slack-notify");
  var appUrl = (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.leadsopportunities.fr"
  ).replace(/\/$/, "");
  var text = [
    "*Test Slack — Leads Opportunities*",
    "Webhook OK · alertes leads actives",
    "Source: test CRM",
    "<" + appUrl + "/crm-pubs.html|Gestion pubs>",
    "<" + appUrl + "/crm-acquisition.html|Pipeline CRM>",
  ].join("\n");
  return sendSlackText(text);
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
  sendSlackTestMessage,
};
