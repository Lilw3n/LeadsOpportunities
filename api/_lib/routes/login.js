/**
 * POST /api/auth/login
 *
 * Toute connexion e-mail/mot de passe (admin ou client) → code à 6 chiffres
 * envoyé sur la boîte mail (Resend). Google OAuth reste sans code.
 *
 * Stockage du code : challenge HMAC signé (pas de Neon obligatoire).
 * Si Neon est down / non upgradé : admins + vérificateurs peuvent se connecter
 * avec le mot de passe partagé + code e-mail (session offline).
 */
const { randomUUID } = require("crypto");
const {
  verifyPassword,
  hashPassword,
  signToken,
} = require("../auth");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { sendViaResend } = require("../mail-send");
const { isAdminEmail } = require("../admin-emails");
const {
  isVerifierEmail,
  isPublicVerifierEmail,
  isVerifierSharedPassword,
} = require("../verifier-access");
const {
  isSiteCurrentlyLocked,
  setGateCookieForEmail,
  siteAccessForEmail,
  isAllowedLoginEmail,
} = require("../site-lock-auth");
const {
  createLoginChallenge,
  verifyLoginChallenge,
  refreshLoginChallenge,
  offlineUserId,
} = require("../login-code-challenge");

function userResponse(user, siteAccess) {
  const publicOnly = siteAccess === "public" || isPublicVerifierEmail(user.email);
  const access = siteAccess || (publicOnly ? "public" : isAdminEmail(user.email) ? "full" : null);
  const crmRole = publicOnly
    ? null
    : user.role === "admin"
      ? user.crm_role || "admin"
      : user.crm_role;
  const role = publicOnly ? "user" : user.role;
  return {
    id: user.id,
    email: user.email,
    role: role,
    crmRole: crmRole || null,
    fullName: user.full_name,
    phone: user.phone,
    isSiteAdmin: !publicOnly && role === "admin",
    isCollaborator: !publicOnly && role !== "admin" && !!crmRole,
    siteAccess: access,
    isPublicVerifier: publicOnly,
    publicAccess: publicOnly,
    offline: !!user.offline,
  };
}

async function sendLoginCodeEmail(email, code) {
  return sendViaResend({
    to: email,
    subject: "Code de connexion — Leads Opportunities",
    text:
      "Votre code de sécurité : " +
      code +
      "\n\nValable 15 minutes. Si vous n'avez pas demandé cette connexion, ignorez cet e-mail.",
    html:
      '<div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px">' +
      '<h2 style="color:#0f766e">Code de sécurité</h2>' +
      "<p>Entrez ce code pour finaliser votre connexion :</p>" +
      '<p style="font-size:32px;font-weight:700;letter-spacing:6px;color:#0f766e;text-align:center;margin:24px 0">' +
      code +
      "</p>" +
      "<p>Expire dans <strong>15 minutes</strong>.</p>" +
      "</div>",
  });
}

async function sendCodeChallenge(user) {
  const challenge = createLoginChallenge(user);
  const sent = await sendLoginCodeEmail(challenge.email, challenge.code);
  return { challenge: challenge, sent: sent };
}

function issueSessionFromUser(res, user, locked) {
  const siteAccess =
    siteAccessForEmail(user.email) ||
    (isPublicVerifierEmail(user.email) ? "public" : user.role === "admin" ? "full" : null);
  const publicOnly = siteAccess === "public";
  const role = publicOnly ? "user" : user.role;
  const crmRole = publicOnly
    ? null
    : user.role === "admin"
      ? user.crm_role || "admin"
      : user.crm_role;
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: role,
    crmRole: crmRole || null,
    siteAccess: siteAccess,
    offline: !!user.offline,
  });
  if (siteAccess) setGateCookieForEmail(res, user.email);
  return {
    ok: true,
    token: token,
    siteAccess: siteAccess,
    siteLocked: locked,
    user: userResponse(
      {
        id: user.id,
        email: user.email,
        role: role,
        crm_role: crmRole,
        full_name: user.full_name || user.fullName || null,
        phone: user.phone || null,
        offline: !!user.offline,
      },
      siteAccess
    ),
  };
}

function offlineAdminUser(email) {
  const publicOnly = isPublicVerifierEmail(email) && !isAdminEmail(email);
  return {
    id: offlineUserId(email),
    email: email,
    role: publicOnly ? "user" : "admin",
    crm_role: publicOnly ? null : "admin",
    full_name: email.split("@")[0],
    phone: null,
    status: "active",
    offline: true,
  };
}

function getSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return { sql: null, error: "missing" };
  try {
    const { neon } = require("@neondatabase/serverless");
    return { sql: neon(dbUrl), error: null };
  } catch (e) {
    return { sql: null, error: e.message || "neon_init" };
  }
}

async function dbQuery(sql, fn) {
  if (!sql) return { ok: false, error: "no_db", rows: null };
  try {
    const rows = await fn(sql);
    return { ok: true, rows: rows };
  } catch (e) {
    console.error("[auth/login] neon", e && e.message ? e.message : e);
    return { ok: false, error: e.message || "db_error", rows: null };
  }
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
  const challengeToken = body.challengeToken != null ? String(body.challengeToken) : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Email invalide" });
  }

  const locked = await isSiteCurrentlyLocked(req);
  const allowed = isAllowedLoginEmail(email) || isVerifierEmail(email);
  if (locked && !allowed) {
    return res.status(403).json({
      error:
        "Site temporairement verrouillé pour revue juridique. Connexion réservée aux administrateurs et vérificateurs.",
      locked: true,
    });
  }

  const verifierOk = isVerifierEmail(email);
  const { sql } = getSql();

  try {
    // ——— Étape 2 : code (challenge signé, sans Neon) ———
    if (code) {
      if (!challengeToken) {
        return res.status(400).json({
          error: "Session de code manquante — recommencez avec e-mail + mot de passe.",
        });
      }
      const checked = verifyLoginChallenge(challengeToken, email, code);
      if (!checked.ok) {
        return res.status(401).json({ error: checked.error || "Code invalide ou expiré" });
      }
      const profile = checked.profile;
      if (profile.status && profile.status !== "active") {
        return res.status(403).json({ error: "Compte desactive. Contactez l administrateur." });
      }
      // Best-effort : nettoyer reset_code Neon si dispo
      if (sql && profile.id && !profile.offline) {
        await dbQuery(sql, (q) => q`
          UPDATE users SET
            last_login_at = now(),
            reset_code = NULL,
            reset_code_expires = NULL,
            updated_at = now()
          WHERE id = ${profile.id}
        `);
      }
      return res.status(200).json(issueSessionFromUser(res, profile, locked));
    }

    // ——— Renvoi code ———
    if (resendOnly) {
      if (!challengeToken) {
        return res.status(400).json({ error: "Recommencez avec e-mail + mot de passe." });
      }
      const refreshed = refreshLoginChallenge(challengeToken, email);
      if (!refreshed) {
        return res.status(400).json({ error: "Session expirée — recommencez la connexion." });
      }
      const sent = await sendLoginCodeEmail(refreshed.email, refreshed.code);
      if (!sent.ok) {
        return res.status(502).json({
          error: sent.error || "Envoi impossible",
          needsCode: true,
          email: email,
          challengeToken: refreshed.challengeToken,
        });
      }
      return res.status(200).json({
        ok: true,
        needsCode: true,
        email: email,
        challengeToken: refreshed.challengeToken,
        message: "Nouveau code envoyé à " + email,
      });
    }

    if (!password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const sharedOk = isVerifierSharedPassword(password);
    const legalOnly = isPublicVerifierEmail(email) && !isAdminEmail(email);

    // ——— Chemin Neon (si dispo) ———
    let user = null;
    let neonDown = !sql;

    if (sql) {
      const found = await dbQuery(
        sql,
        (q) => q`
          SELECT id, email, password_hash, salt, role, crm_role, full_name, phone, status, google_id, auth_provider
          FROM users WHERE email = ${email}
        `
      );
      if (!found.ok) {
        neonDown = true;
      } else if (found.rows && found.rows.length) {
        user = found.rows[0];
      } else if (sharedOk && verifierOk) {
        // Création auto vérificateur / admin
        const userId = randomUUID();
        const { hash, salt } = hashPassword(password);
        const publicOnly = isPublicVerifierEmail(email);
        const role = publicOnly ? "user" : isAdminEmail(email) ? "admin" : "user";
        const crmRole = role === "admin" ? "admin" : null;
        const fullName = email.split("@")[0];
        const inserted = await dbQuery(
          sql,
          (q) => q`
            INSERT INTO users (
              id, email, password_hash, salt, role, crm_role, full_name, status, auth_provider
            ) VALUES (
              ${userId}, ${email}, ${hash}, ${salt}, ${role}, ${crmRole}, ${fullName}, 'active', 'password'
            )
          `
        );
        if (inserted.ok) {
          user = {
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
          };
        } else {
          neonDown = true;
        }
      }
    }

    // ——— Fallback sans Neon : admins / vérificateurs uniquement ———
    if (!user && neonDown) {
      if (!verifierOk && !allowed) {
        return res.status(503).json({
          error:
            "Base de données indisponible (Neon). Connexion e-mail temporairement réservée aux administrateurs — ou utilisez « Continuer avec Google ».",
          neonDown: true,
        });
      }
      if (!sharedOk) {
        return res.status(401).json({
          error:
            "Base indisponible. Admins / vérificateurs : utilisez le mot de passe partagé, puis le code reçu par e-mail — ou Google.",
          neonDown: true,
        });
      }
      user = offlineAdminUser(email);
    }

    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    if (user.status && user.status !== "active") {
      return res.status(403).json({ error: "Compte desactive. Contactez l administrateur." });
    }

    if (!user.offline && sql && isAdminEmail(email) && !legalOnly && user.role !== "admin") {
      await dbQuery(
        sql,
        (q) => q`
          UPDATE users SET role = 'admin', crm_role = 'admin', status = 'active', updated_at = now()
          WHERE id = ${user.id}
        `
      );
      user.role = "admin";
      user.crm_role = "admin";
    }

    if (!user.offline) {
      const storedOk = !!(
        user.password_hash &&
        user.salt &&
        verifyPassword(password, user.password_hash, user.salt)
      );
      const sharedAllowed = sharedOk && verifierOk;

      if (legalOnly && !sharedOk) {
        return res.status(401).json({
          error: "Mot de passe incorrect. Utilisez le mot de passe partagé, puis le code reçu par e-mail.",
        });
      }

      if (!storedOk && !sharedAllowed) {
        return res.status(401).json({
          error: "Mot de passe incorrect.",
        });
      }

      if (sharedAllowed && (!user.password_hash || !storedOk) && sql) {
        const { hash, salt } = hashPassword(password);
        await dbQuery(
          sql,
          (q) => q`
            UPDATE users SET
              password_hash = ${hash},
              salt = ${salt},
              auth_provider = CASE
                WHEN google_id IS NOT NULL OR auth_provider = 'google' THEN 'both'
                ELSE 'password'
              END,
              updated_at = now()
            WHERE id = ${user.id}
          `
        );
      }
    }

    // Toujours code e-mail (admin, vérificateur ou client) — challenge sans Neon
    const { challenge, sent } = await sendCodeChallenge(user);
    if (!sent.ok) {
      return res.status(502).json({
        error: sent.error || "Impossible d’envoyer le code de sécurité.",
        needsCode: false,
        email: email,
      });
    }
    return res.status(200).json({
      ok: true,
      needsCode: true,
      email: email,
      challengeToken: challenge.challengeToken,
      message: "Un code de sécurité a été envoyé à " + email,
      neonDown: !!user.offline || neonDown,
    });
  } catch (e) {
    console.error("[auth/login]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
