/**
 * POST /api/referral/visit — enregistre une visite avec code parrain (public, rate limit).
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { recordReferralEvent, normalizeCode } = require("../referral-store");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const rl = rateLimit("referral-visit:" + getClientIp(req), 60, 60 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: "Trop de requêtes" });
  }

  const parsed = parseJsonBody(req, 4096);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const code = normalizeCode(body.referral_code || body.code);
  if (!code) return res.status(400).json({ error: "code_requis" });

  const evt = await recordReferralEvent({
    eventType: "visit",
    partnerCode: code,
    visitorId: body.visitor_id || body.visitorId || null,
    metadata: { page: body.page_path || body.page || null },
  });

  if (!evt) {
    return res.status(200).json({ ok: false, valid: false });
  }

  return res.status(200).json({
    ok: true,
    valid: true,
    code: evt.partnerCode,
    displayName: evt.partner.display_name,
  });
};
