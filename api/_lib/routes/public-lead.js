/**
 * POST /api/lead — Reception demandes, scoring, stockage (Neon), email (Resend), webhook.
 */
const { randomUUID } = require("crypto");
const { computeLeadScore } = require("../leadScore.js");
const { computeLeadRelevance } = require("../leadRelevance.js");
const {
  applyApiGuards,
  parseJsonBody,
  isHoneypotFilled,
  rateLimit,
  getClientIp,
  normalizeClientIp,
} = require("../security");
const {
  getVisitorCountry,
  isFranceAudience,
  looksLikeFrenchPhone,
  looksLikeFrenchPostalCode,
} = require("../geo-france");

const { finalizeLeadIngest } = require("../lead-post-ingest");

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

  var visitorCountry = getVisitorCountry(req);
  if (visitorCountry && !isFranceAudience(visitorCountry)) {
    return res.status(200).json({
      ok: false,
      error: "geo_out_of_scope",
      message:
        "Nos services (assurance et crédit immobilier ORIAS) sont disponibles en France métropolitaine et DOM-TOM uniquement.",
      visitorCountry: visitorCountry,
    });
  }

  var leadId = body.leadId || randomUUID();
  var score = computeLeadScore(body);

  var tariffAnalysis = { ok: false };
  try {
    const { computeTariffQuote } = require("../tariff-engine");
    tariffAnalysis = computeTariffQuote(body);
  } catch (tariffErr) {
    console.warn("[lead] tariff analysis", tariffErr.message);
  }

  var crossSellAnalysis = null;
  try {
    const { computeCrossSell } = require("../cross-sell-engine");
    crossSellAnalysis = computeCrossSell(body);
  } catch (crossErr) {
    console.warn("[lead] cross-sell", crossErr.message);
  }

  var rel = computeLeadRelevance(
    Object.assign({}, body, {
      leadScore: score,
      ourOfferMonthly:
        tariffAnalysis.quote && tariffAnalysis.quote.totalMonthly
          ? tariffAnalysis.quote.totalMonthly
          : undefined,
    })
  );

  var enriched = Object.assign({}, body, {
    leadId: leadId,
    leadScore: score,
    relevance: rel.relevance,
    relevanceReasons: rel.relevanceReasons,
    competitorMonthly: rel.competitorMonthly,
    ourOfferMonthly: rel.ourOfferMonthly || (tariffAnalysis.quote && tariffAnalysis.quote.totalMonthly) || rel.ourOfferMonthly,
    eligibility: tariffAnalysis.eligibility || null,
    tariffQuote: tariffAnalysis.quote || null,
    crossSell: crossSellAnalysis,
    portfolio: crossSellAnalysis ? crossSellAnalysis.portfolio : null,
    journey: body.journey || body.formJourney || "full",
    openedAt: null,
    serverReceivedAt: new Date().toISOString(),
  });
  delete enriched._hp;
  delete enriched.website;
  delete enriched.company_url;

  enriched.clientIp = normalizeClientIp(req);
  enriched.visitor_country = visitorCountry || body.visitor_country || null;

  if (
    visitorCountry &&
    isFranceAudience(visitorCountry) &&
    body.phone &&
    !looksLikeFrenchPhone(body.phone)
  ) {
    enriched.phone_format_warning = "non_french_format";
  }
  if (
    body.postal_code &&
    !looksLikeFrenchPostalCode(body.postal_code)
  ) {
    enriched.postal_format_warning = "non_french_format";
  }

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

  const {
    parseSeoFromPath,
    extractAddressFields,
    geocodeBan,
    findDuplicateLead,
    normalizeEmail,
    normalizePhone,
  } = require("../lead-enrichment");

  var landingPath =
    enriched.landing_path || enriched.landing_slug || enriched.page_path || enriched.attr_landing_path || "";
  var seoMeta = parseSeoFromPath(landingPath);
  enriched.landing_slug = enriched.landing_slug || seoMeta.landing_slug;
  enriched.seo_city = enriched.seo_city || seoMeta.seo_city || enriched.city || null;
  enriched.seo_department = enriched.seo_department || seoMeta.seo_department || null;
  enriched.seo_product = enriched.seo_product || seoMeta.seo_product || enriched.vertical || null;

  var addr = extractAddressFields(enriched);
  enriched.address_line = addr.address_line;
  enriched.postal_code = addr.postal_code || enriched.postal_code;
  enriched.city = addr.city || enriched.city;

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

      var normEmail = normalizeEmail(enriched.email);
      var normPhone = normalizePhone(enriched.phone);
      if (normEmail) enriched.email = normEmail;
      if (normPhone) enriched.phone = normPhone;

      var dup = await findDuplicateLead(sql, enriched.email, enriched.phone);
      var parentLeadId = dup ? dup.id : null;
      var isDuplicate = !!dup;
      if (dup) {
        enriched.parent_lead_id = dup.id;
        enriched.duplicate_of = dup.id;
        leadId = randomUUID();
      }

      var geo = await geocodeBan(enriched.postal_code, enriched.city, enriched.address_line);
      if (geo) {
        enriched.geo_lat = geo.lat;
        enriched.geo_lng = geo.lng;
        enriched.geo_confidence = geo.confidence;
      }

      await sql`
        INSERT INTO site_leads (
          id, source, vertical, lead_score, email, phone,
          utm_source, utm_medium, utm_campaign, gclid, visitor_id, payload,
          platform, pipeline_stage, status, questionnaire_step, questionnaire_total,
          form_id, fbclid, ttclid, msclkid, priority, last_activity_at,
          competitor_monthly, our_offer_monthly, relevance,
          landing_slug, seo_city, seo_department, seo_product,
          address_line, postal_code, city, geo_lat, geo_lng, geo_confidence,
          parent_lead_id, is_duplicate, client_ip
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
          ${rel.relevance},
          ${enriched.landing_slug ? String(enriched.landing_slug).slice(0, 500) : null},
          ${enriched.seo_city ? String(enriched.seo_city).slice(0, 120) : null},
          ${enriched.seo_department ? String(enriched.seo_department).slice(0, 20) : null},
          ${enriched.seo_product ? String(enriched.seo_product).slice(0, 80) : null},
          ${enriched.address_line ? String(enriched.address_line).slice(0, 300) : null},
          ${enriched.postal_code ? String(enriched.postal_code).slice(0, 12) : null},
          ${enriched.city ? String(enriched.city).slice(0, 120) : null},
          ${enriched.geo_lat != null ? enriched.geo_lat : null},
          ${enriched.geo_lng != null ? enriched.geo_lng : null},
          ${enriched.geo_confidence ? String(enriched.geo_confidence).slice(0, 20) : null},
          ${parentLeadId},
          ${isDuplicate},
          ${enriched.clientIp}
        )
      `;
      stored = true;

      try {
        const { recordTouchpoint } = require("../lead-enrichment");
        const { recordLeadEvent } = require("../lead-workflow");
        await recordTouchpoint(sql, {
          visitor_id: enriched.visitor_id,
          lead_id: leadId,
          event_type: "lead_converted",
          page_path: landingPath,
          seo_city: enriched.seo_city,
          seo_product: enriched.seo_product,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
        });
        await recordLeadEvent(sql, {
          leadId,
          eventType: "lead_converted",
          source: "site",
          title: "Nouveau lead entrant",
          payload: enriched,
        });
      } catch (tpErr) {
        console.warn("[lead] touchpoint", tpErr.message);
      }
      var crmContactId = null;
      if (enriched.email) {
        try {
          const { ingestLeadToCrm } = require("../crm-ingest-from-lead");
          crmContactId = await ingestLeadToCrm(sql, enriched, leadId);
        } catch (crmErr) {
          console.error("[lead] crm ingest", crmErr);
        }
      }
      enriched._crmContactId = crmContactId;
      try {
        const { syncLeadToMailbox } = require("../mail-store");
        await syncLeadToMailbox(sql, leadId);
      } catch (mbErr) {
        console.warn("[lead] mailbox sync", mbErr.message);
      }
      try {
        const { attachLeadReferral } = require("../referral-store");
        await attachLeadReferral(leadId, enriched);
      } catch (refErr) {
        console.warn("[lead] referral attach", refErr.message);
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
        try {
          const { syncLeadToMailbox } = require("../mail-store");
          await syncLeadToMailbox(sql, leadId);
        } catch (mbErr) {
          console.warn("[lead] mailbox sync fallback", mbErr.message);
        }
        try {
          const { attachLeadReferral } = require("../referral-store");
          await attachLeadReferral(leadId, enriched);
        } catch (refErr) {
          console.warn("[lead] referral attach fallback", refErr.message);
        }
      } catch (e2) {
        console.error("[lead] db insert fallback failed", e2);
      }
    }
  } else {
    console.warn("[lead] DATABASE_URL manquant — lead non enregistre en base");
  }

  var postIngest = { emailSent: false };
  try {
    postIngest = await finalizeLeadIngest(enriched, leadId, score, req);
  } catch (e) {
    console.error("[lead] post ingest failed", e);
  }
  var emailSent = !!postIngest.emailSent;

  var contactIdOut = enriched._crmContactId || null;
  if (!contactIdOut && stored && enriched.email && dbUrl) {
    try {
      const { neon } = require("@neondatabase/serverless");
      const sqlLookup = neon(dbUrl);
      const linked = await sqlLookup`
        SELECT contact_id FROM site_leads WHERE id = ${leadId} LIMIT 1
      `;
      if (linked.length && linked[0].contact_id) contactIdOut = linked[0].contact_id;
    } catch (lookupErr) {
      console.warn("[lead] contact lookup", lookupErr.message);
    }
  }

  return res.status(200).json({
    ok: true,
    leadId: leadId,
    contactId: contactIdOut,
    leadScore: score,
    stored: stored,
    emailSent: emailSent,
    duplicate: !!enriched.parent_lead_id,
    parentLeadId: enriched.parent_lead_id || null,
    seoCity: enriched.seo_city || null,
  });
};
