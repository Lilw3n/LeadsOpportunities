/**
 * POST /api/webhooks/withallo — ingestion leads WithAllo (https://web.withallo.com/)
 */
const { randomUUID } = require("crypto");
const { computeLeadScore } = require("../_lib/leadScore.js");
const { computeLeadRelevance } = require("../_lib/leadRelevance.js");
const {
  applyApiGuards,
  parseJsonBody,
  rateLimit,
  getClientIp,
  safeEqual,
} = require("../_lib/security");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var secret = process.env.WITHALLO_WEBHOOK_SECRET || process.env.LEADS_ADMIN_TOKEN;
  if (secret && secret.length >= 16) {
    var auth = req.headers.authorization || "";
    var token = auth.indexOf("Bearer ") === 0 ? auth.slice(7).trim() : req.headers["x-withallo-secret"] || "";
    if (!token || !safeEqual(String(token), String(secret))) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }
  }

  const ip = getClientIp(req);
  const rl = rateLimit("withallo:" + ip, 60, 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: "Trop de requetes" });
  }

  const parsed = parseJsonBody(req, 65536);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const p = parsed.body || {};

  var leadId = p.id || p.lead_id || randomUUID();
  var body = {
    source: "withallo",
    platform: "withallo",
    vertical: p.vertical || p.product_type || "general",
    email: p.email || p.contact_email,
    phone: p.phone || p.contact_phone,
    name: p.name || p.contact_name,
    competitorMonthly: p.current_insurer_price || p.competitor_monthly,
    ourOfferMonthly: p.quoted_price || p.our_offer_monthly,
    utm_source: "withallo",
    utm_medium: p.channel || "api",
    utm_campaign: p.campaign || "",
    metadata: p.metadata || p,
  };

  var score = computeLeadScore(body);
  var rel = computeLeadRelevance(Object.assign({}, body, { leadScore: score }));

  var enriched = Object.assign({}, body, p, {
    leadId: leadId,
    leadScore: score,
    relevance: rel.relevance,
    relevanceReasons: rel.relevanceReasons,
    serverReceivedAt: new Date().toISOString(),
  });

  var stored = false;
  var dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      const { neon } = require("@neondatabase/serverless");
      const { findDuplicateLead, normalizeEmail, normalizePhone } = require("../_lib/lead-enrichment");
      const sql = neon(dbUrl);
      if (enriched.email) enriched.email = normalizeEmail(enriched.email);
      if (enriched.phone) enriched.phone = normalizePhone(enriched.phone);
      var dup = await findDuplicateLead(sql, enriched.email, enriched.phone);
      if (dup) {
        enriched.parent_lead_id = dup.id;
        leadId = randomUUID();
      }
      await sql`
        INSERT INTO site_leads (
          id, source, vertical, lead_score, email, phone,
          utm_source, utm_medium, utm_campaign, payload,
          platform, pipeline_stage, status, priority, last_activity_at,
          competitor_monthly, our_offer_monthly, relevance,
          parent_lead_id, is_duplicate
        ) VALUES (
          ${leadId},
          ${"withallo"},
          ${String(enriched.vertical || "").slice(0, 80)},
          ${score},
          ${enriched.email ? String(enriched.email).slice(0, 320) : null},
          ${enriched.phone ? String(enriched.phone).slice(0, 40) : null},
          ${"withallo"},
          ${String(enriched.utm_medium || "api").slice(0, 200)},
          ${enriched.utm_campaign ? String(enriched.utm_campaign).slice(0, 200) : null},
          ${JSON.stringify(enriched)},
          ${"withallo"},
          ${"new"},
          ${"new"},
          ${score >= 70 ? "high" : "medium"},
          NOW(),
          ${rel.competitorMonthly},
          ${rel.ourOfferMonthly},
          ${rel.relevance},
          ${dup ? dup.id : null},
          ${!!dup}
        )
      `;
      stored = true;
    } catch (e) {
      console.error("[withallo] insert extended failed", e.message);
      try {
        const { neon } = require("@neondatabase/serverless");
        const sql = neon(dbUrl);
        await sql`
          INSERT INTO site_leads (
            id, source, vertical, lead_score, email, phone,
            utm_source, utm_medium, payload, platform, status
          ) VALUES (
            ${leadId},
            ${"withallo"},
            ${String(enriched.vertical || "").slice(0, 80)},
            ${score},
            ${enriched.email ? String(enriched.email).slice(0, 320) : null},
            ${enriched.phone ? String(enriched.phone).slice(0, 40) : null},
            ${"withallo"},
            ${"api"},
            ${JSON.stringify(enriched)},
            ${"withallo"},
            ${"new"}
          )
        `;
        stored = true;
      } catch (e2) {
        console.error("[withallo] insert fallback", e2);
      }
    }
  }

  return res.status(200).json({
    ok: true,
    leadId: leadId,
    leadScore: score,
    relevance: rel.relevance,
    stored: stored,
  });
};
