/**
 * POST /api/external/register — vraie inscription portail
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp, isHoneypotFilled } = require("../security");
const { getSql } = require("../db");
const { ensureExternalPortalSchema, registerPortalAccount } = require("../external-portal");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("ext-register:" + ip, 10, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  if (isHoneypotFilled(body)) return res.status(200).json({ ok: true });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    await ensureExternalPortalSchema(sql);
    const created = await registerPortalAccount(sql, body);
    return res.status(201).json({
      ok: true,
      token: created.token,
      user: created.user,
    });
  } catch (e) {
    console.error("[external/register]", e);
    var status = /existe déjà|existe déjà|existe deja/i.test(e.message)
      ? 409
      : /requis|invalide|court/i.test(e.message)
        ? 400
        : 500;
    return res.status(status).json({ ok: false, error: e.message || "Erreur serveur" });
  }
};
