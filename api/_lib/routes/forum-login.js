/**
 * POST /api/auth/forum-login
 *
 * Étape 1 — { email, password } : valide le mdp (MrRollin partagé ou perso),
 * crée le compte si besoin, envoie un code à 6 chiffres par e-mail.
 * → { ok, needsCode: true, email }
 *
 * Étape 2 — { email, code } : vérifie le code → session JWT.
 * → { ok, token, user }
 *
 * Google OAuth reste sans code (e-mail déjà vérifié par Google).
 * Lecture du forum libre sans compte.
 */
const { randomUUID } = require("crypto");
const {
  hashPassword,
  verifyPassword,
  signToken,
  safeEqual,
  generateResetCode,
} = require("../auth");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { sendViaResend } = require("../mail-send");

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

async function sendConfirmEmail(email, code) {
  return sendViaResend({
    to: email,
    subject: "Code de confirmation forum — Leads Opportunities",
    text:
      "Votre code de confirmation pour le forum Leads Opportunities : " +
      code +
      "\n\nValable 15 minutes. Si vous n'avez pas demandé cette connexion, ignorez cet e-mail.",
    html:
      '<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px">' +
      '<h2 style="color:#1e3a5f">Confirmation forum</h2>' +
      "<p>Entrez ce code pour finaliser votre connexion :</p>" +
      '<p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#1e4f8a;text-align:center;margin:24px 0">' +
      code +
      "</p>" +
      "<p>Ce code expire dans <strong>15 minutes</strong>.</p>" +
      '<p style="color:#94a3b8;font-size:13px">Si vous n\'avez pas demandé cette connexion, ignorez cet e-mail.</p>' +
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
  const sent = await sendConfirmEmail(email, code);
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
  return {
    ok: true,
    token,
    user: userPayload(user),
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
  const body = parsed.body || {};
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = body.password != null ? String(body.password) : "";
  const code = body.code != null ? String(body.code).trim() : "";
  const fullName = body.fullName ? String(body.fullName).trim() : null;
  const resendOnly = !!body.resend;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Email invalide" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    // ——— Étape 2 : vérifier le code ———
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
        return res.status(403).json({ error: "Compte désactivé. Contactez l’administrateur." });
      }
      if (!user.reset_code || String(user.reset_code) !== code) {
        return res.status(401).json({ error: "Code invalide ou expiré" });
      }
      if (!user.reset_code_expires || new Date(user.reset_code_expires) < new Date()) {
        return res.status(401).json({ error: "Code expiré — renvoyez un nouveau code" });
      }
      const session = await issueSession(sql, user);
      return res.status(200).json(session);
    }

    // ——— Renvoi de code (e-mail déjà connu, mdp déjà validé côté UI) ———
    if (resendOnly) {
      const rows = await sql`
        SELECT id, email, status, reset_code_expires
        FROM users WHERE email = ${email}
        LIMIT 1
      `;
      if (!rows.length) {
        return res.status(400).json({ error: "Recommencez la connexion (e-mail + mot de passe)." });
      }
      if (rows[0].status && rows[0].status !== "active") {
        return res.status(403).json({ error: "Compte désactivé." });
      }
      const { sent } = await storeAndSendCode(sql, rows[0].id, email);
      if (!sent.ok) {
        return res.status(502).json({
          error: sent.error || "Envoi du code impossible. Réessayez plus tard.",
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
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const shared = sharedForumPassword();
    const usesShared = safeEqual(password, shared);

    let rows = await sql`
      SELECT id, email, password_hash, salt, role, crm_role, full_name, phone, status, google_id, auth_provider
      FROM users WHERE email = ${email}
      LIMIT 1
    `;

    let created = false;
    let user;

    if (!rows.length) {
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
      created = true;
      user = {
        id: userId,
        email,
        role: "user",
        crm_role: null,
        full_name: name,
        status: "active",
      };
    } else {
      user = rows[0];
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
          (user.password_hash && verifyPassword(password, user.password_hash, user.salt)) ||
          usesShared;
        if (!okPass) {
          if (user.google_id || user.auth_provider === "google") {
            return res.status(401).json({
              error:
                "Ce compte utilise Google. Cliquez sur « Continuer avec Google », ou utilisez le mot de passe forum.",
            });
          }
          return res.status(401).json({ error: "Identifiants invalides" });
        }
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
    }

    const { sent } = await storeAndSendCode(sql, user.id, email);
    if (!sent.ok) {
      return res.status(502).json({
        error:
          sent.error ||
          "Impossible d’envoyer le code de confirmation. Vérifiez RESEND_API_KEY / domaine mail.",
        needsCode: false,
        email,
      });
    }

    return res.status(200).json({
      ok: true,
      needsCode: true,
      created,
      email,
      message: "Un code de confirmation a été envoyé à " + email,
    });
  } catch (e) {
    console.error("[auth/forum-login]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
