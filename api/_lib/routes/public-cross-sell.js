/**
 * POST /api/cross-sell — opportunités multi-contrats (usage courtier / interne)
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { computeCrossSell } = require("../cross-sell-engine");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rl = rateLimit("cross-sell:" + getClientIp(req), 40, 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requêtes" });

  const parsed = parseJsonBody(req, 65536);
  if (parsed.error) return res.status(400).json({ error: parsed.error });

  try {
    const analysis = computeCrossSell(parsed.body);
    return res.status(200).json({ ok: true, crossSell: analysis });
  } catch (e) {
    console.error("[cross-sell]", e);
    return res.status(500).json({ error: "Analyse multi-contrats impossible", detail: e.message });
  }
};
