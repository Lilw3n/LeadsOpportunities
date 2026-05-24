/**
 * POST /api/lead — Reception demandes, scoring, stockage (Neon), email (Resend), webhook.
 */
const { randomUUID } = require("crypto");
const { computeLeadScore } = require("./_lib/leadScore.js");
const { computeLeadRelevance } = require("./_lib/leadRelevance.js");
const {
  applyApiGuards,
  parseJsonBody,
  isHoneypotFilled,
  rateLimit,
  getClientIp,
} = require("./_lib/security");

async function sendResendEmail(payload, score, leadId) {
  var key = process.env.RESEND_API_KEY;
  var to = process.env.LEAD_NOTIFICATION_EMAIL || "courtier972@gmail.com";
  var from = process.env.LEAD_FROM_EMAIL || "Leads Opportunities <onboarding@resend.dev>";

  if (!key) {
    console.warn("[lead] RESEND_API_KEY manquant — aucun e-mail envoye");
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
      to: [to],
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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rl = rateLimit("lead:" + ip, 15, 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(Math.ceil(rl.retryAfterMs / 1000)));
    return res.status(429).json({ error: "Trop de requêtes, réessayez plus tard" });
  }

  const parsed = parseJsonBody(req, 49152);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body;

  if (isHoneypotFilled(body)) {
    return res.status(200).json({ ok: true, leadId: randomUUID(), leadScore: 0 });
  }

  var leadId = body.leadId || randomUUID();
  var score = computeLeadScore(body);
  var rel = computeLeadRelevance(Object.assign({}, body, { leadScore: score }));

  var enriched = Object.assign({}, body, {
    leadId: leadId,
    leadScore: score,
    relevance: rel.relevance,
    relevanceReasons: rel.relevanceReasons,
    competitorMonthly: rel.competitorMonthly,
    ourOfferMonthly: rel.ourOfferMonthly,
    openedAt: null,
    serverReceivedAt: new Date().toISOString(),
  });
  delete enriched._hp;
  delete enriched.website;
  delete enriched.company_url;

  var utmSource =
    enriched.attr_last_utm_source || enriched.utm_source || enriched.attr_first_utm_source || null;
  var utmMedium =
    enriched.attr_last_utm_medium || enriched.utm_medium || enriched.attr_first_utm_medium || null;
  var utmCampaign = enriched.utm_campaign || enriched.attr_first_utm_campaign || null;
  var gclidVal = enriched.attr_last_gclid || enriched.gclid || enriched.attr_first_gclid || null;
  var fbclid = enriched.fbclid || enriched.attr_fbclid || null;
  var ttclid = enriched.ttclid || null;
  var msclkid = enriched.msclkid || null;

  function detectPlatform() {
    if (enriched.platform) return String(enriched.platform).slice(0, 40);
    var utm = String(utmSource || "").toLowerCase();
    var src = String(enriched.source || "").toLowerCase();
    if (fbclid || /facebook|meta|fbads/.test(utm + src)) return /instagram|ig\b/.test(utm) ? "instagram" : "facebook";
    if (ttclid || /tiktok/.test(utm + src)) return "tiktok";
    if (gclidVal || msclkid || /google|gclid/.test(utm + src)) return "google";
    if (/linkedin/.test(utm)) return "linkedin";
    if (/youtube/.test(utm)) return "youtube";
    if (/snapchat/.test(utm)) return "snapchat";
    if (/bing|microsoft/.test(utm)) return "bing";
    if (/withallo|allo/.test(utm + src)) return "withallo";
    if (/landing|site|web/.test(src)) return "site_web";
    return "autre";
  }

  var platform = detectPlatform();
  var qStep = Number(enriched.questionnaire_step || enriched.formStep || enriched.step || 0);
  var qTotal = Number(enriched.questionnaire_total || enriched.formTotalSteps || enriched.totalSteps || 10) || 10;
  var pipelineStage = "new";
  if (qStep > 0 && qStep < qTotal) pipelineStage = "questionnaire";
  if (qStep >= qTotal && qTotal > 0) pipelineStage = "quote_sent";

  console.log("[lead]", leadId, score, enriched.vertical, platform, enriched.email || enriched.phone || "");

  var stored = false;
  var dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      const { neon } = require("@neondatabase/serverless");
      const sql = neon(dbUrl);
      await sql`
        INSERT INTO site_leads (
          id, source, vertical, lead_score, email, phone,
          utm_source, utm_medium, utm_campaign, gclid, visitor_id, payload,
          platform, pipeline_stage, status, questionnaire_step, questionnaire_total,
          form_id, fbclid, ttclid, msclkid, priority, last_activity_at,
          competitor_monthly, our_offer_monthly, relevance
        ) VALUES (
          ${leadId},
          ${String(enriched.source || "unknown").slice(0, 120)},
          ${String(enriched.vertical || "").slice(0, 80)},
          ${score},
          ${enriched.email ? String(enriched.email).slice(0, 320) : null},
          ${enriched.phone ? String(enriched.phone).slice(0, 40) : null},
          ${utmSource ? String(utmSource).slice(0, 200) : null},
          ${utmMedium ? String(utmMedium).slice(0, 200) : null},
          ${utmCampaign ? String(utmCampaign).slice(0, 200) : null},
          ${gclidVal ? String(gclidVal).slice(0, 200) : null},
          ${enriched.visitor_id ? String(enriched.visitor_id).slice(0, 120) : null},
          ${JSON.stringify(enriched)},
          ${platform},
          ${pipelineStage},
          ${pipelineStage},
          ${qStep},
          ${qTotal},
          ${enriched.form_id || enriched.formId ? String(enriched.form_id || enriched.formId).slice(0, 120) : null},
          ${fbclid ? String(fbclid).slice(0, 200) : null},
          ${ttclid ? String(ttclid).slice(0, 200) : null},
          ${msclkid ? String(msclkid).slice(0, 200) : null},
          ${score >= 70 ? "high" : score >= 50 ? "medium" : "low"},
          NOW(),
          ${rel.competitorMonthly},
          ${rel.ourOfferMonthly},
          ${rel.relevance}
        )
      `;
      stored = true;
      if (enriched.email) {
        try {
          const { ingestLeadToCrm } = require("./_lib/crm-ingest-from-lead");
          await ingestLeadToCrm(sql, enriched, leadId);
        } catch (crmErr) {
          console.error("[lead] crm ingest", crmErr);
        }
      }
    } catch (e) {
      console.error("[lead] db insert extended failed, fallback", e.message);
      try {
        const { neon } = require("@neondatabase/serverless");
        const sql = neon(dbUrl);
        await sql`
          INSERT INTO site_leads (
            id, source, vertical, lead_score, email, phone,
            utm_source, utm_medium, utm_campaign, gclid, visitor_id, payload
          ) VALUES (
            ${leadId},
            ${String(enriched.source || "unknown").slice(0, 120)},
            ${String(enriched.vertical || "").slice(0, 80)},
            ${score},
            ${enriched.email ? String(enriched.email).slice(0, 320) : null},
            ${enriched.phone ? String(enriched.phone).slice(0, 40) : null},
            ${utmSource ? String(utmSource).slice(0, 200) : null},
            ${utmMedium ? String(utmMedium).slice(0, 200) : null},
            ${utmCampaign ? String(utmCampaign).slice(0, 200) : null},
            ${gclidVal ? String(gclidVal).slice(0, 200) : null},
            ${enriched.visitor_id ? String(enriched.visitor_id).slice(0, 120) : null},
            ${JSON.stringify(enriched)}
          )
        `;
        stored = true;
      } catch (e2) {
        console.error("[lead] db insert fallback failed", e2);
      }
    }
  } else {
    console.warn("[lead] DATABASE_URL manquant — lead non enregistre en base");
  }

  var emailSent = false;
  try {
    emailSent = !!(await sendResendEmail(enriched, score, leadId));
  } catch (e) {
    console.error("[lead] email failed", e);
  }

  try {
    const { dispatchLeadToPartners } = require("./_lib/partners/dispatch");
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

  return res.status(200).json({
    ok: true,
    leadId: leadId,
    leadScore: score,
    stored: stored,
    emailSent: emailSent,
  });
};
