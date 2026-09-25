/**
 * POST /api/auth/login
 *
 * Vérificateurs (3 e-mails + admins) :
 *   1) { email, password } → valide MrRollin / mdp stocké, envoie code e-mail
 *      → { ok, needsCode: true, email }
 *   2) { email, code } → session JWT
 *   3) { email, resend: true } → renvoie le code
 *
 * Google OAuth reste un chemin séparé (sans code).
 * Mot de passe partagé indépendant de Google.
 */
const { randomUUID } = require("crypto");
const {
  verifyPassword,
  hashPassword,
  signToken,
  generateResetCode,
} = require("../auth");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { sendViaResend } = require("../mail-send");
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

async function sendLoginCodeEmail(email, code) {
  return sendViaResend({
    to: email,
    subject: "Code de connexion — Leads Opportunities",
    text:
      "Votre code de sécurité pour finaliser la connexion : " +
      code +
      "\n\nValable 15 minutes. Si vous n'avez pas demandé cette connexion, ignorez cet e-mail.",
    html:
      '<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px">' +
      '<h2 style="color:#1e3a5f">Code de sécurité</h2>' +
      "<p>Entrez ce code pour finaliser votre connexion (revue juridique) :</p>" +
      '<p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#0d9488;text-align:center;margin:24px 0">' +
      code +
      "</p>" +
      "<p>Expire dans <strong>15 minutes</strong>.</p>" +
      '<p style="color:#94a3b8;font-size:13px">Si vous n\'êtes pas à l\'origine de cette demande, ignorez cet e-mail.</p>' +
      "</div>",
  });
}

async function storeAndSendCode(sql, userId, email) {
  const code = generateResetCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await sql`
    UPDATE users SET reset_code = ${code}, reset_code_expires = ${expires}, updated_at = now()
    WHERE id = ${userId}
  `;
  const sent = await sendLoginCodeEmail(email, code);
  return { code, sent };
}

async function issueSession(sql, user) {
  await sql`
    UPDATE users SET
      last_login_at = now(),
      reset_code = NULL,
      reset_code_expires = NULL,
      updated_at = now()
    WHERE id = ${user.id}
  `;
  const crmRole = user.role === "admin" ? user.crm_role || "admin" : user.crm_role;
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    crmRole: crmRole || null,
  });
  return { ok: true, token, user: userResponse(user) };
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const rl = rateLimit("auth-login:" + getClientIp(req), 20, 15 * 60 * 1000);
  if (!rl.allowed) {
    return res.status(429).json({ error: "Trop de tentatives, réessayez plus tard" });
  }

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = body.password != null ? String(body.password) : "";
  const code = body.code != null ? String(body.code).trim() : "";
  const resendOnly = !!body.resend;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Email invalide" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  const verifierOk = isVerifierEmail(email);

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);
    const { isAdminEmail } = require("../admin-emails");

    // ——— Étape 2 : code e-mail ———
    if (code) {
      const rows = await sql`
        SELECT id, email, password_hash, salt, role, crm_role, full_name, phone, status,
               google_id, auth_provider, reset_code, reset_code_expires
        FROM users WHERE email = ${email}
        LIMIT 1
      `;
      if (!rows.length) {
        return res.status(401).json({ error: "Code invalide ou expiré" });
      }
      const user = rows[0];
      if (user.status && user.status !== "active") {
        return res.status(403).json({ error: "Compte desactive. Contactez l administrateur." });
      }
      if (!user.reset_code || String(user.reset_code) !== code) {
        return res.status(401).json({ error: "Code invalide ou expiré" });
      }
      if (!user.reset_code_expires || new Date(user.reset_code_expires) < new Date()) {
        return res.status(401).json({ error: "Code expiré — renvoyez un nouveau code" });
      }
      return res.status(200).json(await issueSession(sql, user));
    }

    // ——— Renvoi code ———
    if (resendOnly) {
      if (!verifierOk) {
        return res.status(403).json({ error: "Renvoi réservé aux comptes vérificateurs." });
      }
      const rows = await sql`
        SELECT id, email, status FROM users WHERE email = ${email} LIMIT 1
      `;
      if (!rows.length) {
        return res.status(400).json({ error: "Recommencez avec e-mail + mot de passe." });
      }
      const { sent } = await storeAndSendCode(sql, rows[0].id, email);
      if (!sent.ok) {
        return res.status(502).json({
          error: sent.error || "Envoi du code impossible.",
          needsCode: true,
          email,
        });
      }
      return res.status(200).json({
        ok: true,
        needsCode: true,
        email,
        message: "Nouveau code envoyé à " + email,
      });
    }

    // ——— Étape 1 : e-mail + mot de passe ———
    if (!password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const sharedOk = isVerifierSharedPassword(password);

    let rows = await sql`
      SELECT id, email, password_hash, salt, role, crm_role, full_name, phone, status, google_id, auth_provider
      FROM users WHERE email = ${email}
    `;

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

    if (isSiteLegalLockEnabled() && !verifierOk && user.role !== "admin" && !user.crm_role) {
      return res.status(403).json({
        error: "Site en revue juridique : seuls les administrateurs et vérificateurs peuvent se connecter.",
      });
    }

    const storedOk =
      !!(user.password_hash && user.salt && verifyPassword(password, user.password_hash, user.salt));
    const sharedAllowed = sharedOk && verifierOk;

    if (!storedOk && !sharedAllowed) {
      return res.status(401).json({
        error:
          "Mot de passe incorrect. Vérificateurs : utilisez MrRollin, ou « Continuer avec Google » (chemin séparé).",
      });
    }

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

    // Vérificateurs : toujours un code e-mail avant la session
    if (verifierOk) {
      const { sent } = await storeAndSendCode(sql, user.id, email);
      if (!sent.ok) {
        return res.status(502).json({
          error:
            sent.error ||
            "Impossible d’envoyer le code de sécurité. Vérifiez RESEND_API_KEY / domaine mail.",
          needsCode: false,
          email,
        });
      }
      return res.status(200).json({
        ok: true,
        needsCode: true,
        email,
        message: "Un code de sécurité a été envoyé à " + email,
      });
    }

    // Autres comptes (hors lock) : session directe
    return res.status(200).json(await issueSession(sql, user));
  } catch (e) {
    console.error("[auth/login]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
