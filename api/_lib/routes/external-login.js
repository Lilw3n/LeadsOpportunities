/**
 * POST /api/external/login — connexion portail par mot de passe
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const { ensureExternalPortalSchema, loginPortalAccount } = require("../external-portal");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const ip = getClientIp(req);
  const rl = rateLimit("ext-login:" + ip, 20, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const email = parsed.body && parsed.body.email ? String(parsed.body.email).trim().toLowerCase() : "";
  const password = parsed.body && parsed.body.password ? String(parsed.body.password) : "";
  if (!email || !password) return res.status(400).json({ error: "Email et mot de passe requis" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    await ensureExternalPortalSchema(sql);
    const logged = await loginPortalAccount(sql, email, password);
    return res.status(200).json({
      ok: true,
      token: logged.token,
      user: logged.user,
    });
  } catch (e) {
    console.error("[external/login]", e);
    return res.status(/invalide|requis|inactif/i.test(e.message) ? 401 : 500).json({
      ok: false,
      error: e.message || "Erreur serveur",
    });
  }
};
