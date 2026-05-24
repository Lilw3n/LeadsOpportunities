/**
 * POST /api/external/login — connexion client par email (inspire external/login multisite)
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const crypto = require("crypto");

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
  if (!email) return res.status(400).json({ error: "Email requis" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const rows = await sql`
      SELECT id, first_name, last_name, email, phone, company, contact_type
      FROM crm_contacts
      WHERE LOWER(email) = ${email}
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    if (!rows.length) {
      return res.status(404).json({ error: "Aucun dossier client pour cet email. Inscrivez-vous d'abord." });
    }
    const c = rows[0];
    const token = "ext_" + crypto.randomBytes(24).toString("hex");
    return res.status(200).json({
      ok: true,
      token: token,
      profile: {
        id: c.id,
        firstName: c.first_name,
        lastName: c.last_name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        contactType: c.contact_type,
      },
    });
  } catch (e) {
    console.error("[external/login]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
