const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { requireCrm } = require("../rbac");
const { batchSummarize } = require("../ai-document-analyzer");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const ip = getClientIp(req);
  const rl = rateLimit("ai-batch-sum:" + ip, 10, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requêtes batch" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const items = parsed.body && parsed.body.items;
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "items[] requis" });
  }
  if (items.length > 5) return res.status(400).json({ error: "Max 5 documents par batch" });

  const result = await batchSummarize(items);
  return res.status(200).json({ ok: true, ...result });
};
