const { verifyPassword, signToken } = require("../auth");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const rl = rateLimit("auth-login:" + getClientIp(req), 10, 15 * 60 * 1000);
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

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    const rows = await sql`
      SELECT id, email, password_hash, salt, role, full_name
      FROM users WHERE email = ${email}
    `;
    if (rows.length === 0) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const user = rows[0];
    if (!verifyPassword(password, user.password_hash, user.salt)) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    await sql`UPDATE users SET last_login_at = now() WHERE id = ${user.id}`;

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return res.status(200).json({
      ok: true,
      token,
      user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
    });
  } catch (e) {
    console.error("[auth/login]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
