/**
 * GET/POST /api/webhooks/meta-lead
 * Webhook Meta Lead Ads (formulaires instantanes Facebook/Instagram).
 */
const { randomUUID } = require("crypto");
const { computeLeadScore } = require("../_lib/leadScore.js");
const { computeLeadRelevance } = require("../_lib/leadRelevance.js");
const {
  applyApiGuards,
  rateLimit,
  getClientIp,
  safeEqual,
  readRawBody,
} = require("../_lib/security");
const { recordLeadEvent } = require("../_lib/lead-workflow");
const { findDuplicateLead, normalizeEmail, normalizePhone } = require("../_lib/lead-enrichment");
const { ingestLeadToCrm } = require("../_lib/crm-ingest-from-lead");
const { finalizeLeadIngest } = require("../_lib/lead-post-ingest");
const {
  verifyWebhookSignature,
  fetchLeadFromGraph,
  mapLeadFields,
  extractLeadgenEvents,
  loadFormConfig,
} = require("../_lib/meta-lead-ads");
const { flattenMetaLead, enrichForLeadScore } = require("../_lib/meta-lead-normalize");

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

async function findExistingMetaLead(sql, leadgenId) {
  if (!leadgenId) return null;
  var needle = '"meta_leadgen_id":"' + String(leadgenId) + '"';
  var rows = await sql`
    SELECT id, contact_id FROM site_leads
    WHERE payload LIKE ${"%" + needle + "%"}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return rows.length ? rows[0] : null;
}

async function ingestMetaLeadEvent(webhookValue) {
  var leadgenId = String(webhookValue.leadgen_id || "");
  if (!leadgenId) return { ok: false, error: "missing_leadgen_id" };

  var graphLead = await fetchLeadFromGraph(leadgenId);
  var mapped = mapLeadFields(graphLead, webhookValue);
  mapped = flattenMetaLead(mapped);
  if (!mapped.email && !mapped.phone) {
    return { ok: false, error: "missing_contact_fields", leadgenId: leadgenId };
  }

  var dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return { ok: false, error: "database_unavailable", leadgenId: leadgenId };
  }

  const { neon } = require("@neondatabase/serverless");
  const sql = neon(dbUrl);

  var existing = await findExistingMetaLead(sql, mapped.meta_leadgen_id);
  if (existing) {
    return {
      ok: true,
      leadId: existing.id,
      duplicate: true,
      mode: "existing_meta_lead",
    };
  }

  var leadId = randomUUID();
  var scoreBody = enrichForLeadScore(mapped);
  var score = computeLeadScore(scoreBody);
  var rel = computeLeadRelevance(Object.assign({}, scoreBody, { leadScore: score }));
  var qStep = Number(mapped.questionnaire_step || 0);
  var qTotal = Number(mapped.questionnaire_total || 10) || 10;
  var pipelineStage = qStep >= qTotal * 0.6 ? "quote_sent" : qStep > 0 ? "questionnaire" : "new";
  var enriched = Object.assign({}, mapped, {
    leadId: leadId,
    leadScore: score,
    relevance: rel.relevance,
    relevanceReasons: rel.relevanceReasons,
    competitorMonthly: rel.competitorMonthly,
    ourOfferMonthly: rel.ourOfferMonthly,
    serverReceivedAt: new Date().toISOString(),
    pipeline_stage: pipelineStage,
    status: pipelineStage,
    parcours_id: "meta_lead_rapide",
    parcours_label: "Meta Lead Rapide",
  });

  if (enriched.email) enriched.email = normalizeEmail(enriched.email);
  if (enriched.phone) enriched.phone = normalizePhone(enriched.phone);

  var dup = await findDuplicateLead(sql, enriched.email, enriched.phone);
  if (dup) {
    enriched.parent_lead_id = dup.id;
    enriched.duplicate_of = dup.id;
    leadId = randomUUID();
    enriched.leadId = leadId;
  }

  await sql`
    INSERT INTO site_leads (
      id, source, vertical, lead_score, email, phone,
      utm_source, utm_medium, utm_campaign, visitor_id, payload,
      platform, pipeline_stage, status, form_id, priority, last_activity_at,
      competitor_monthly, our_offer_monthly, relevance,
      landing_slug, parent_lead_id, is_duplicate,
      questionnaire_step, questionnaire_total, city, postal_code, fbclid
    ) VALUES (
      ${leadId},
      ${"meta_lead_ads"},
      ${String(enriched.vertical || "").slice(0, 80)},
      ${score},
      ${enriched.email ? String(enriched.email).slice(0, 320) : null},
      ${enriched.phone ? String(enriched.phone).slice(0, 40) : null},
      ${"meta"},
      ${"paid_social"},
      ${enriched.utm_campaign ? String(enriched.utm_campaign).slice(0, 200) : null},
      ${"meta_" + mapped.meta_leadgen_id},
      ${JSON.stringify(enriched)},
      ${enriched.platform || "facebook"},
      ${pipelineStage},
      ${pipelineStage},
      ${enriched.form_id ? String(enriched.form_id).slice(0, 120) : null},
      ${score >= 70 ? "high" : score >= 50 ? "medium" : "low"},
      NOW(),
      ${rel.competitorMonthly},
      ${rel.ourOfferMonthly},
      ${rel.relevance},
      ${enriched.landing_path ? String(enriched.landing_path).slice(0, 500) : null},
      ${dup ? dup.id : null},
      ${!!dup},
      ${qStep},
      ${qTotal},
      ${enriched.city ? String(enriched.city).slice(0, 120) : null},
      ${(enriched.postal_code || enriched.postalCode) ? String(enriched.postal_code || enriched.postalCode).slice(0, 12) : null},
      ${webhookValue.ad_id ? String(webhookValue.ad_id).slice(0, 200) : null}
    )
  `;

  await recordLeadEvent(sql, {
    leadId: leadId,
    eventType: "meta_lead_received",
    source: "meta_lead_ads",
    title: "Lead Meta Lead Ads",
    body: enriched.name || enriched.email || enriched.phone || "",
    payload: enriched,
  });

  var crmContactId = null;
  if (enriched.email) {
    try {
      crmContactId = await ingestLeadToCrm(sql, enriched, leadId);
    } catch (crmErr) {
      console.error("[meta-lead] crm ingest", crmErr);
    }
  }
  enriched._crmContactId = crmContactId;

  await finalizeLeadIngest(enriched, leadId, score, null);

  return {
    ok: true,
    leadId: leadId,
    leadScore: score,
    contactId: crmContactId,
    duplicate: !!dup,
    vertical: enriched.vertical,
  };
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);

  if (req.method === "GET") {
    var mode = req.query["hub.mode"];
    var token = req.query["hub.verify_token"];
    var challenge = req.query["hub.challenge"];
    var verifyToken = process.env.META_VERIFY_TOKEN || "";

    if (mode === "subscribe" && verifyToken && token && safeEqual(String(token), String(verifyToken))) {
      res.status(200).send(String(challenge || ""));
      return;
    }
    return res.status(403).json({ ok: false, error: "Verification failed" });
  }

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var ip = getClientIp(req);
  var rl = rateLimit("meta-lead:" + ip, 120, 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: "Trop de requetes" });
  }

  var rawBody;
  try {
    rawBody = await readRawBody(req, 256 * 1024);
  } catch (e) {
    return res.status(413).json({ error: "Payload trop volumineux" });
  }

  var appSecret = process.env.META_APP_SECRET || "";
  if (appSecret) {
    var sig = req.headers["x-hub-signature-256"] || "";
    var verified = verifyWebhookSignature(appSecret, rawBody, sig);
    if (!verified.ok) {
      console.warn("[meta-lead] signature", verified.reason);
      return res.status(401).json({ ok: false, error: "Invalid signature" });
    }
  }

  var body;
  try {
    body = JSON.parse(rawBody.toString("utf8"));
  } catch (e) {
    return res.status(400).json({ error: "JSON invalide" });
  }

  var cfg = loadFormConfig();
  var expectedPageId = process.env.META_PAGE_ID || cfg.page_id || "";
  var events = extractLeadgenEvents(body);
  if (!events.length) {
    return res.status(200).json({ ok: true, processed: 0, message: "no_leadgen_events" });
  }

  var results = [];
  for (var i = 0; i < events.length; i++) {
    var eventValue = events[i];
    if (expectedPageId && eventValue.page_id && String(eventValue.page_id) !== String(expectedPageId)) {
      results.push({
        ok: false,
        error: "unexpected_page_id",
        page_id: eventValue.page_id,
      });
      continue;
    }
    try {
      results.push(await ingestMetaLeadEvent(eventValue));
    } catch (err) {
      console.error("[meta-lead] ingest", err.message);
      results.push({
        ok: false,
        error: err.message,
        leadgen_id: eventValue.leadgen_id,
      });
    }
  }

  return res.status(200).json({
    ok: true,
    processed: results.length,
    results: results,
  });
};
