const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { requireCrm } = require("../rbac");
const { summarizeDocument } = require("../ai-document-analyzer");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const ip = getClientIp(req);
  const rl = rateLimit("ai-summarize:" + ip, 20, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requêtes IA" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const text = parsed.body && parsed.body.text ? String(parsed.body.text).trim() : "";
  if (!text || text.length < 10) return res.status(400).json({ error: "Texte trop court" });

  const result = await summarizeDocument(text);
  if (!result.success) return res.status(502).json({ ok: false, error: result.error });
  return res.status(200).json({ ok: true, summary: result.summary });
};
