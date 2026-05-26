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
const { recordLeadEvent } = require("../_lib/lead-workflow");

function normalizeAlloEventType(p) {
  const raw = String(p.event_type || p.eventType || p.event || p.type || "").toLowerCase();
  if (/summary/.test(raw)) return "summary_ready";
  if (/transcript/.test(raw)) return "transcript_ready";
  if (/callback|to_call_back|rappel/.test(raw)) return "callback_scheduled";
  if (/not.?interested/.test(raw)) return "lead_not_interested";
  if (/meeting|booked|rdv/.test(raw)) return "meeting_booked";
  if (/interested/.test(raw)) return "lead_interested";
  if (/missed|no_answer/.test(raw)) return "call_missed";
  if (/voicemail/.test(raw)) return "voicemail_sent";
  if (/tag/.test(raw)) return "tag_added";
  if (/call|appel/.test(raw)) return "call_completed";
  return raw || "";
}

function pickSummary(p) {
  return p.summary || p.resume || p.call_summary || p.transcription_summary || p.notes || "";
}

async function findExistingLead(sql, p, normalizedEmail, normalizedPhone) {
  if (p.leadId || p.lead_id || p.id) {
    const rows = await sql`
      SELECT id, contact_id FROM site_leads
      WHERE id = ${p.leadId || p.lead_id || p.id}
      LIMIT 1
    `;
    if (rows.length) return rows[0];
  }
  if (normalizedPhone || normalizedEmail) {
    const rows = await sql`
      SELECT id, contact_id FROM site_leads
      WHERE (${normalizedEmail}::text IS NOT NULL AND LOWER(email) = ${normalizedEmail})
         OR (${normalizedPhone}::text IS NOT NULL AND phone = ${normalizedPhone})
      ORDER BY created_at DESC
      LIMIT 1
    `;
    if (rows.length) return rows[0];
  }
  return null;
}

async function createCrmEventFromAllo(sql, lead, eventType, p) {
  if (!lead || !lead.contact_id) return;
  try {
    const crypto = require("crypto");
    await sql`
      INSERT INTO crm_events (
        id, contact_id, event_type, title, description, event_date, event_time,
        status, priority, extra_data
      ) VALUES (
        ${"evt_" + crypto.randomUUID()},
        ${lead.contact_id},
        ${eventType.indexOf("callback") >= 0 ? "appel" : "note"},
        ${p.title || "Evenement Allo - " + eventType},
        ${pickSummary(p) || JSON.stringify(p).slice(0, 2000)},
        ${new Date().toISOString().slice(0, 10)},
        ${p.callback_time || p.event_time || null},
        ${eventType === "callback_scheduled" ? "pending" : "done"},
        ${eventType === "lead_interested" ? "high" : "medium"},
        ${JSON.stringify({ source: "withallo", eventType: eventType, payload: p }).slice(0, 4000)}
      )
    `;
  } catch (e) {
    console.warn("[withallo] crm event skipped", e.message);
  }
}

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
      const eventType = normalizeAlloEventType(p);
      if (eventType) {
        const existingLead = await findExistingLead(sql, p, enriched.email, enriched.phone);
        if (existingLead) {
          await recordLeadEvent(sql, {
            leadId: existingLead.id,
            contactId: existingLead.contact_id,
            eventType,
            source: "withallo",
            title: p.title || "Evenement Allo",
            body: pickSummary(p),
            payload: enriched,
          });
          await createCrmEventFromAllo(sql, existingLead, eventType, p);
          return res.status(200).json({
            ok: true,
            leadId: existingLead.id,
            eventType,
            stored: true,
            mode: "event",
          });
        }
      }
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
      await recordLeadEvent(sql, {
        leadId,
        eventType: eventType || "withallo_lead",
        source: "withallo",
        title: p.title || "Lead Allo entrant",
        body: pickSummary(p),
        payload: enriched,
      });
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
