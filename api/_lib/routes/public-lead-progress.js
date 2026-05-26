/**
 * POST /api/lead-progress — sauvegarde étape questionnaire / abandon
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { recordFunnelEvent } = require("../funnel-tracker");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const rl = rateLimit("lead-progress:" + ip, 60, 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: "Trop de requêtes" });
  }

  const parsed = parseJsonBody(req, 65536);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body;

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(200).json({
      ok: true,
      leadId: body.leadId,
      stored: false,
      warning: "DATABASE_URL manquant — progression non persistée",
    });
  }

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);
    const result = await recordFunnelEvent(sql, body);
    return res.status(200).json({
      ok: true,
      leadId: result.leadId,
      pipelineStage: result.pipelineStage,
      stored: true,
    });
  } catch (e) {
    console.error("[lead-progress]", e);
    return res.status(500).json({ error: "Erreur enregistrement progression" });
  }
};
