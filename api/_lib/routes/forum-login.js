/**
 * POST /api/auth/forum-login
 * Connexion forum : Google (via autre route) ou e-mail + mot de passe.
 * Mot de passe partagé (FORUM_SHARED_PASSWORD, défaut MrRollin) : crée le compte
 * si besoin. Lecture du forum reste libre sans compte ; ici = pour poster.
 * Ne s'applique pas aux comptes admin / CRM (ils gardent leur auth normale).
 */
const { randomUUID } = require("crypto");
const { hashPassword, verifyPassword, signToken, safeEqual } = require("../auth");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");

function sharedForumPassword() {
  return String(process.env.FORUM_SHARED_PASSWORD || "MrRollin");
}

function isStaffUser(user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.crm_role) return true;
  return false;
}

function userPayload(user) {
  const crmRole = user.role === "admin" ? user.crm_role || "admin" : user.crm_role;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    crmRole: crmRole || null,
    fullName: user.full_name || user.fullName || null,
    isSiteAdmin: user.role === "admin",
    isCollaborator: user.role !== "admin" && !!crmRole,
  };
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const rl = rateLimit("auth-forum-login:" + getClientIp(req), 20, 15 * 60 * 1000);
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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Email invalide" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Mot de passe trop court" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  const shared = sharedForumPassword();
  const usesShared = safeEqual(password, shared);

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    const rows = await sql`
      SELECT id, email, password_hash, salt, role, crm_role, full_name, phone, status, google_id, auth_provider
      FROM users WHERE email = ${email}
      LIMIT 1
    `;

    if (rows.length === 0) {
      if (!usesShared && password.length < 8) {
        return res.status(400).json({
          error: "Mot de passe trop court (min 8), ou utilisez le mot de passe forum partagé.",
        });
      }
      const { hash, salt } = hashPassword(password);
      const userId = randomUUID();
      const name = fullName || email.split("@")[0];
      await sql`
        INSERT INTO users (
          id, email, password_hash, salt, role, crm_role, full_name, status, auth_provider
        ) VALUES (
          ${userId}, ${email}, ${hash}, ${salt}, 'user', NULL, ${name}, 'active', 'password'
        )
      `;
      const token = signToken({ userId, email, role: "user", crmRole: null });
      return res.status(200).json({
        ok: true,
        created: true,
        token,
        user: {
          id: userId,
          email,
          role: "user",
          crmRole: null,
          fullName: name,
          isSiteAdmin: false,
          isCollaborator: false,
        },
      });
    }

    const user = rows[0];
    if (user.status && user.status !== "active") {
      return res.status(403).json({ error: "Compte désactivé. Contactez l’administrateur." });
    }

    if (isStaffUser(user)) {
      if (usesShared) {
        return res.status(401).json({
          error: "Compte équipe : utilisez Google ou votre mot de passe CRM (pas le mot de passe forum).",
        });
      }
      if (!verifyPassword(password, user.password_hash, user.salt)) {
        return res.status(401).json({
          error: "Mot de passe incorrect. Compte équipe : préférez « Continuer avec Google ».",
        });
      }
    } else {
      const okPass =
        (user.password_hash && verifyPassword(password, user.password_hash, user.salt)) || usesShared;
      if (!okPass) {
        if (user.google_id || user.auth_provider === "google") {
          return res.status(401).json({
            error: "Ce compte utilise Google. Cliquez sur « Continuer avec Google », ou utilisez le mot de passe forum.",
          });
        }
        return res.status(401).json({ error: "Identifiants invalides" });
      }
      // Première connexion forum via mot de passe partagé sur un compte Google sans hash
      if (usesShared && (!user.password_hash || user.auth_provider === "google")) {
        const { hash, salt } = hashPassword(shared);
        await sql`
          UPDATE users SET
            password_hash = COALESCE(password_hash, ${hash}),
            salt = COALESCE(salt, ${salt}),
            auth_provider = CASE
              WHEN auth_provider = 'google' THEN 'both'
              ELSE COALESCE(auth_provider, 'password')
            END,
            updated_at = NOW()
          WHERE id = ${user.id}
        `;
      }
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
      created: false,
      token,
      user: userPayload(user),
    });
  } catch (e) {
    console.error("[auth/forum-login]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
