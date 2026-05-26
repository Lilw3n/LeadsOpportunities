/**
 * POST /api/tariff-quote — devis indicatif interne (courtier)
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { computeTariffQuote } = require("../tariff-engine");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rl = rateLimit("tariff-quote:" + ip, 40, 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requêtes" });

  const parsed = parseJsonBody(req, 65536);
  if (parsed.error) return res.status(400).json({ error: parsed.error });

  try {
    const result = computeTariffQuote(parsed.body);
    return res.status(200).json(result);
  } catch (e) {
    console.error("[tariff-quote]", e);
    return res.status(500).json({ error: "Calcul devis impossible" });
  }
};
