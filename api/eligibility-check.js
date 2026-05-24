/**
 * POST /api/eligibility-check — règles + partenaires (blocages / alertes)
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("./_lib/security");
const { computeEligibility } = require("./_lib/eligibility-engine");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rl = rateLimit("eligibility:" + ip, 50, 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requêtes" });

  const parsed = parseJsonBody(req, 32768);
  if (parsed.error) return res.status(400).json({ error: parsed.error });

  try {
    const eligibility = computeEligibility(parsed.body);
    return res.status(200).json({ ok: true, eligibility: eligibility });
  } catch (e) {
    console.error("[eligibility-check]", e);
    return res.status(500).json({ error: "Contrôle éligibilité impossible" });
  }
};
