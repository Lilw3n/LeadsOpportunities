const { getAuthUser } = require("../auth");
const { applyApiGuards } = require("../security");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const decoded = await getAuthUser(req);
  if (!decoded) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(200).json({ ok: true, user: decoded });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    const rows = await sql`
      SELECT id, email, role, crm_role, full_name, phone, status, created_at, last_login_at
      FROM users WHERE id = ${decoded.userId}
    `;
    if (rows.length === 0) {
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }

    const u = rows[0];
    return res.status(200).json({
      ok: true,
      user: {
        id: u.id,
        email: u.email,
        role: u.role,
        crmRole: u.role === "admin" ? u.crm_role || "admin" : u.crm_role,
        fullName: u.full_name,
        status: u.status,
        phone: u.phone,
        createdAt: u.created_at,
        lastLoginAt: u.last_login_at,
      },
    });
  } catch (e) {
    console.error("[auth/me]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
