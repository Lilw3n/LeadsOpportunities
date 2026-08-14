/**
 * GET /api/referral/lookup?code=XXX — valide un code parrain (public).
 */
const { applyApiGuards } = require("../security");
const { findPartnerByCode, normalizeCode } = require("../referral-store");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const url = new URL(req.url, "http://localhost");
  const code = normalizeCode(url.searchParams.get("code") || "");
  if (!code) return res.status(400).json({ ok: false, error: "code_requis" });

  const partner = await findPartnerByCode(code);
  if (!partner) {
    return res.status(200).json({ ok: false, valid: false, code });
  }

  return res.status(200).json({
    ok: true,
    valid: true,
    code: partner.code,
    displayName: partner.display_name,
    rewardPct: Number(partner.reward_pct),
  });
};
