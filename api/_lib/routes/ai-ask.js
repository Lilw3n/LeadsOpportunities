const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { requireCrm } = require("../rbac");
const { askQuestionAboutDocument } = require("../ai-document-analyzer");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const ip = getClientIp(req);
  const rl = rateLimit("ai-ask:" + ip, 30, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requêtes IA" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const text = body.text ? String(body.text).trim() : "";
  const question = body.question ? String(body.question).trim() : "";
  if (!text || !question) return res.status(400).json({ error: "text et question requis" });

  const result = await askQuestionAboutDocument(text, question);
  if (!result.success) return res.status(502).json({ ok: false, error: result.error });
  return res.status(200).json({ ok: true, answer: result.answer });
};
