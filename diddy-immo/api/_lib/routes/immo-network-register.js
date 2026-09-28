/**
 * POST /api/immo-network/register
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp, isHoneypotFilled } = require("../security");
const { getSql } = require("../db");
const Store = require("../immo-network-store");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("immo-net-reg:" + ip, 8, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requêtes" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  if (isHoneypotFilled(body)) return res.status(200).json({ ok: true });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const result = await Store.registerPartner(sql, body);
    return res.status(result.existing ? 200 : 201).json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message || "Erreur" });
  }
};
