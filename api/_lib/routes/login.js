/**
 * POST /api/auth/login
 * E-mail + mot de passe. Google et mot de passe sont indépendants :
 * un compte Google peut aussi se connecter avec le mdp stocké ou le mdp
 * partagé vérificateur (MrRollin) si l’e-mail est autorisé.
 */
const { randomUUID } = require("crypto");
const { verifyPassword, hashPassword, signToken } = require("../auth");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const {
  isVerifierEmail,
  isVerifierSharedPassword,
  isSiteLegalLockEnabled,
} = require("../verifier-access");

function userResponse(user) {
  const crmRole = user.role === "admin" ? user.crm_role || "admin" : user.crm_role;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    crmRole: crmRole || null,
    fullName: user.full_name,
    phone: user.phone,
    isSiteAdmin: user.role === "admin",
    isCollaborator: user.role !== "admin" && !!crmRole,
  };
}

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
  const sharedOk = isVerifierSharedPassword(password);
  const verifierOk = isVerifierEmail(email);

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);
    const { isAdminEmail } = require("../admin-emails");

    let rows = await sql`
      SELECT id, email, password_hash, salt, role, crm_role, full_name, phone, status, google_id, auth_provider
      FROM users WHERE email = ${email}
    `;

    // Compte vérificateur inexistant + mdp partagé → création auto (indépendant de Google)
    if (!rows.length && sharedOk && verifierOk) {
      const userId = randomUUID();
      const { hash, salt } = hashPassword(password);
      const role = isAdminEmail(email) ? "admin" : "user";
      const crmRole = role === "admin" ? "admin" : null;
      const fullName = email.split("@")[0];
      await sql`
        INSERT INTO users (
          id, email, password_hash, salt, role, crm_role, full_name, status, auth_provider
        ) VALUES (
          ${userId}, ${email}, ${hash}, ${salt}, ${role}, ${crmRole}, ${fullName}, 'active', 'password'
        )
      `;
      rows = [
        {
          id: userId,
          email,
          password_hash: hash,
          salt,
          role,
          crm_role: crmRole,
          full_name: fullName,
          phone: null,
          status: "active",
          google_id: null,
          auth_provider: "password",
        },
      ];
    }

    if (!rows.length) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const user = rows[0];
    if (user.status && user.status !== "active") {
      return res.status(403).json({ error: "Compte desactive. Contactez l administrateur." });
    }

    // Pendant le verrouillage juridique : seuls admin / vérificateurs
    if (isSiteLegalLockEnabled() && !verifierOk && user.role !== "admin" && !user.crm_role) {
      return res.status(403).json({
        error: "Site en revue juridique : seuls les administrateurs et vérificateurs peuvent se connecter.",
      });
    }

    const storedOk =
      !!(user.password_hash && user.salt && verifyPassword(password, user.password_hash, user.salt));

    // Mdp partagé vérificateur : indépendant de Google (même si auth_provider === 'google')
    const sharedAllowed = sharedOk && verifierOk;

    if (!storedOk && !sharedAllowed) {
      if (user.auth_provider === "google" && !user.password_hash) {
        return res.status(401).json({
          error:
            "Ce compte Google n’a pas encore de mot de passe local. Utilisez « Continuer avec Google », ou le mot de passe vérificateur si vous y êtes autorisé.",
        });
      }
      if (user.google_id) {
        return res.status(401).json({
          error:
            "Mot de passe incorrect. Vous pouvez aussi utiliser « Continuer avec Google » (indépendant du mot de passe).",
        });
      }
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // Dissociation : associer un hash mdp sans retirer Google
    if (sharedAllowed && (!user.password_hash || !storedOk)) {
      const { hash, salt } = hashPassword(password);
      await sql`
        UPDATE users SET
          password_hash = ${hash},
          salt = ${salt},
          auth_provider = CASE
            WHEN google_id IS NOT NULL OR auth_provider = 'google' THEN 'both'
            ELSE 'password'
          END,
          updated_at = now()
        WHERE id = ${user.id}
      `;
    }

    await sql`UPDATE users SET last_login_at = now() WHERE id = ${user.id}`;

    const crmRole = user.role === "admin" ? user.crm_role || "admin" : user.crm_role;
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      crmRole: crmRole || null,
    });
    return res.status(200).json({
      ok: true,
      token,
      user: userResponse(user),
    });
  } catch (e) {
    console.error("[auth/login]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
