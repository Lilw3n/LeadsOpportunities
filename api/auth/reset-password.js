const { hashPassword, signToken, setCors } = require("../_lib/auth");

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "JSON invalide" }); }
  }
  if (!body || !body.email || !body.code || !body.newPassword) {
    return res.status(400).json({ error: "Email, code et nouveau mot de passe requis" });
  }

  const email = String(body.email).trim().toLowerCase();
  const code = String(body.code).trim();
  const newPassword = String(body.newPassword);

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Mot de passe trop court (min 8 caractères)" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    const rows = await sql`
      SELECT id, email, role, reset_code, reset_code_expires
      FROM users WHERE email = ${email}
    `;
    if (rows.length === 0) {
      return res.status(400).json({ error: "Code invalide ou expiré" });
    }

    const user = rows[0];
    if (!user.reset_code || user.reset_code !== code) {
      return res.status(400).json({ error: "Code invalide ou expiré" });
    }
    if (new Date(user.reset_code_expires) < new Date()) {
      return res.status(400).json({ error: "Code expiré, demandez-en un nouveau" });
    }

    const { hash, salt } = hashPassword(newPassword);
    await sql`
      UPDATE users
      SET password_hash = ${hash}, salt = ${salt}, reset_code = NULL, reset_code_expires = NULL, updated_at = now()
      WHERE id = ${user.id}
    `;

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return res.status(200).json({ ok: true, token, message: "Mot de passe réinitialisé" });
  } catch (e) {
    console.error("[auth/reset-password]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
