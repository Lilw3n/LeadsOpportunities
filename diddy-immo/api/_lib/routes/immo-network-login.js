/**
 * POST /api/immo-network/login
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const Store = require("../immo-network-store");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("immo-net-login:" + ip, 20, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requêtes" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const result = await Store.loginPartner(sql, body.email, body.password);
    if (!result.ok) return res.status(401).json(result);
    return res.status(200).json(result);
  } catch (e) {
    console.error("[immo-network/login]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
