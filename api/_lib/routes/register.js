const { randomUUID } = require("crypto");
const { hashPassword, signToken } = require("../auth");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const rl = rateLimit("auth-register:" + getClientIp(req), 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: "Trop de tentatives, réessayez plus tard" });
  }

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body;
  if (!body || !body.email || !body.password) {
    return res.status(400).json({ error: "Email et mot de passe requis" });
  }

  const email = String(body.email).trim().toLowerCase();
  const password = String(body.password);
  const fullName = body.fullName ? String(body.fullName).trim() : null;
  const phone = body.phone ? String(body.phone).trim() : null;

  if (password.length < 8) {
    return res.status(400).json({ error: "Mot de passe trop court (min 8 caractères)" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Email invalide" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return res.status(409).json({ error: "Un compte existe déjà avec cet email" });
    }

    const { hash, salt } = hashPassword(password);
    const userId = randomUUID();
    const adminEmails = (process.env.ADMIN_EMAILS || "courtier972@gmail.com")
      .split(",")
      .map(function (e) {
        return e.trim().toLowerCase();
      })
      .filter(Boolean);
    const role = adminEmails.indexOf(email) !== -1 ? "admin" : "user";
    const crmRole = role === "admin" ? "admin" : null;

    await sql`
      INSERT INTO users (id, email, password_hash, salt, role, crm_role, full_name, phone, status)
      VALUES (${userId}, ${email}, ${hash}, ${salt}, ${role}, ${crmRole}, ${fullName}, ${phone}, 'active')
    `;

    const token = signToken({ userId, email, role, crmRole });
    return res.status(201).json({
      ok: true,
      token,
      user: { id: userId, email, role, crmRole, fullName },
    });
  } catch (e) {
    console.error("[auth/register]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
