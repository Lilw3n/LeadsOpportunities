/**
 * POST /api/lead — Reception demandes, scoring, stockage optionnel (Neon), email (Resend), webhook.
 */
const { randomUUID } = require("crypto");
const { computeLeadScore } = require("./_lib/leadScore.js");

async function sendResendEmail(payload, score, leadId) {
  var key = process.env.RESEND_API_KEY;
  var to = process.env.LEAD_NOTIFICATION_EMAIL || "courtier972@gmail.com";
  var from = process.env.LEAD_FROM_EMAIL || "Leads Opportunities <onboarding@resend.dev>";

  if (!key) return;

  var sub = "[Lead " + (payload.vertical || "?") + "] score " + score + " — " + (payload.email || payload.phone || leadId);
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
      to: [to],
      subject: sub,
      html: html,
    }),
  });

  if (!r.ok) {
    var t = await r.text();
    console.warn("[lead] resend", r.status, t);
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
  }
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  var leadId = body.leadId || randomUUID();
  var score = computeLeadScore(body);

  var enriched = Object.assign({}, body, {
    leadId: leadId,
    leadScore: score,
    serverReceivedAt: new Date().toISOString(),
  });

  var utmSource = enriched.attr_last_utm_source || enriched.utm_source || enriched.attr_first_utm_source || null;
  var utmMedium = enriched.attr_last_utm_medium || enriched.utm_medium || enriched.attr_first_utm_medium || null;
  var utmCampaign = enriched.utm_campaign || enriched.attr_first_utm_campaign || null;
  var gclidVal = enriched.attr_last_gclid || enriched.gclid || enriched.attr_first_gclid || null;

  console.log("[lead]", leadId, score, enriched.vertical, enriched.email || enriched.phone || "");

  var dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      const { neon } = require("@neondatabase/serverless");
      const sql = neon(dbUrl);
      await sql`
        INSERT INTO site_leads (
          id, source, vertical, lead_score, email, phone,
          utm_source, utm_medium, utm_campaign, gclid, visitor_id, payload
        ) VALUES (
          ${leadId},
          ${String(enriched.source || "unknown")},
          ${String(enriched.vertical || "")},
          ${score},
          ${enriched.email ? String(enriched.email).slice(0, 320) : null},
          ${enriched.phone ? String(enriched.phone).slice(0, 40) : null},
          ${utmSource},
          ${utmMedium},
          ${utmCampaign},
          ${gclidVal},
          ${enriched.visitor_id ? String(enriched.visitor_id) : null},
          ${JSON.stringify(enriched)}
        )
      `;
    } catch (e) {
      console.error("[lead] db insert failed", e);
    }
  }

  try {
    await sendResendEmail(enriched, score, leadId);
  } catch (e) {
    console.error("[lead] email failed", e);
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

  return res.status(200).json({ ok: true, leadId: leadId, leadScore: score });
};
