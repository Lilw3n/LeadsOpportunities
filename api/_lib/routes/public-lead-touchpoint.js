/**
 * POST /api/lead-touchpoint — enregistre une visite / interaction avant conversion
 */
const { randomUUID } = require("crypto");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp, isHoneypotFilled } = require("../security");
const { getSql } = require("../db");
const { parseSeoFromPath, recordTouchpoint } = require("../lead-enrichment");
const { recordLeadEvent } = require("../lead-workflow");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rl = rateLimit("tp:" + ip, 120, 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const parsed = parseJsonBody(req, 16384);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  if (isHoneypotFilled(body)) return res.status(200).json({ ok: true });

  const sql = getSql();
  if (!sql) return res.status(200).json({ ok: true, stored: false });

  const path = body.page_path || body.path || body.landing_path || "";
  const seo = parseSeoFromPath(path);

  try {
    await recordTouchpoint(sql, {
      visitor_id: body.visitor_id,
      lead_id: body.lead_id,
      event_type: body.event_type || "page_view",
      page_path: path,
      page_title: body.page_title || documentTitle(body),
      seo_city: body.seo_city || seo.seo_city,
      seo_product: body.seo_product || seo.seo_product,
      utm_source: body.utm_source || body.attr_last_utm_source,
      utm_medium: body.utm_medium || body.attr_last_utm_medium,
      utm_campaign: body.utm_campaign,
      referrer: body.referrer,
      extra: body,
    });
    if (body.visitor_id || body.lead_id) {
      try {
        const rows = body.lead_id
          ? await sql`SELECT id FROM site_leads WHERE id = ${body.lead_id} LIMIT 1`
          : await sql`
              SELECT id FROM site_leads
              WHERE visitor_id = ${body.visitor_id}
              ORDER BY created_at DESC
              LIMIT 1
            `;
        if (rows.length) {
          await recordLeadEvent(sql, {
            leadId: rows[0].id,
            eventType: body.event_type || "page_view",
            source: "site",
            title: "Nouvelle interaction lead",
            payload: body,
            important: body.event_type && body.event_type !== "page_view",
          });
        }
      } catch (wfErr) {
        console.warn("[lead-touchpoint] workflow skipped", wfErr.message);
      }
    }
    return res.status(200).json({ ok: true, stored: true });
  } catch (e) {
    console.error("[lead-touchpoint]", e);
    return res.status(200).json({ ok: true, stored: false });
  }
};

function documentTitle(body) {
  return body.page_title || null;
}
