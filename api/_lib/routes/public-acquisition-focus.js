/**
 * GET /api/acquisition-focus — focus vertical public (rotation 4 semaines)
 */
const { applyApiGuards, rateLimit, getClientIp } = require("../security");
const {
  readJson,
  buildRotationState,
  toPublicFocus,
  ACTIVE_PATH,
} = require("../meta-campaign-rotation");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rl = rateLimit("acquisition-focus:" + getClientIp(req), 120, 60 * 1000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requêtes" });

  try {
    var cached = readJson(ACTIVE_PATH);
    var maxAgeMs = 6 * 60 * 60 * 1000;
    if (cached && cached.generatedAt && Date.now() - new Date(cached.generatedAt).getTime() < maxAgeMs) {
      res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
      return res.status(200).json(toPublicFocus(cached));
    }

    var state = await buildRotationState({});
    res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=3600");
    return res.status(200).json(toPublicFocus(state));
  } catch (e) {
    console.error("[acquisition-focus]", e);
    return res.status(500).json({ error: "Focus acquisition indisponible" });
  }
};
