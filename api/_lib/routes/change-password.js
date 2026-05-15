const { getAuthUser, verifyPassword, hashPassword, setCors } = require("../auth");

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const decoded = await getAuthUser(req);
  if (!decoded) return res.status(401).json({ error: "Non authentifié" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "JSON invalide" }); }
  }
  if (!body || !body.oldPassword || !body.newPassword) {
    return res.status(400).json({ error: "Ancien et nouveau mot de passe requis" });
  }
  if (String(body.newPassword).length < 8) {
    return res.status(400).json({ error: "Nouveau mot de passe trop court (min 8)" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    const rows = await sql`SELECT password_hash, salt FROM users WHERE id = ${decoded.userId}`;
    if (rows.length === 0) return res.status(404).json({ error: "Utilisateur introuvable" });

    const { password_hash, salt } = rows[0];
    if (!verifyPassword(String(body.oldPassword), password_hash, salt)) {
      return res.status(403).json({ error: "Ancien mot de passe incorrect" });
    }

    const { hash: newHash, salt: newSalt } = hashPassword(String(body.newPassword));
    await sql`
      UPDATE users SET password_hash = ${newHash}, salt = ${newSalt}, updated_at = now()
      WHERE id = ${decoded.userId}
    `;

    return res.status(200).json({ ok: true, message: "Mot de passe modifié" });
  } catch (e) {
    console.error("[auth/change-password]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
