const { randomUUID } = require("crypto");
const { hashPassword, signToken, setCors } = require("../auth");

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "JSON invalide" }); }
  }
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
    const role = email === "courtier972@gmail.com" ? "admin" : "user";

    await sql`
      INSERT INTO users (id, email, password_hash, salt, role, full_name, phone)
      VALUES (${userId}, ${email}, ${hash}, ${salt}, ${role}, ${fullName}, ${phone})
    `;

    const token = signToken({ userId, email, role });
    return res.status(201).json({ ok: true, token, user: { id: userId, email, role, fullName } });
  } catch (e) {
    console.error("[auth/register]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
