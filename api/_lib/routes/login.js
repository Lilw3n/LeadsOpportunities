/**
 * POST /api/auth/login
 *
 * Site verrouillé (Buchet SITE_LOCK / LO SITE_LEGAL_LOCK) :
 *   seuls admins + vérificateurs juridiques.
 *
 * Vérificateurs / admins :
 *   1) { email, password } → MrRollin / mdp stocké → code e-mail
 *   2) { email, code } → session JWT + cookie porte (Buchet)
 *   3) { email, resend: true } → renvoie le code
 *
 * Google OAuth = chemin séparé (admins uniquement pendant le lock).
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
  };
}

async function sendLoginCodeEmail(email, code) {
  return sendViaResend({
    to: email,
    subject: "Code de connexion — Buchet Immobilier / Leads Opportunities",
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

async function storeAndSendCode(sql, userId, email) {
  const code = generateResetCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  await sql`
    UPDATE users SET reset_code = ${code}, reset_code_expires = ${expires}, updated_at = now()
    WHERE id = ${userId}
  `;
  return sendLoginCodeEmail(email, code);
}

async function issueSession(sql, res, user, locked) {
  await sql`
    UPDATE users SET
      last_login_at = now(),
      reset_code = NULL,
      reset_code_expires = NULL,
      updated_at = now()
    WHERE id = ${user.id}
  `;
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
  });
  if (siteAccess) setGateCookieForEmail(res, user.email);
  return {
    ok: true,
    token: token,
    siteAccess: siteAccess,
    siteLocked: locked,
    user: userResponse(user, siteAccess),
  };
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

  const locked = await isSiteCurrentlyLocked(req);
  const allowed = isAllowedLoginEmail(email) || isVerifierEmail(email);
  if (locked && !allowed) {
    return res.status(403).json({
      error:
        "Site temporairement verrouillé pour revue juridique. Connexion réservée aux administrateurs et vérificateurs.",
      locked: true,
    });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return res.status(500).json({ error: "Base de données non configurée" });

  const verifierOk = isVerifierEmail(email);

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    // ——— Étape 2 : code ———
    if (code) {
      const rows = await sql`
        SELECT id, email, password_hash, salt, role, crm_role, full_name, phone, status,
               google_id, auth_provider, reset_code, reset_code_expires
        FROM users WHERE email = ${email} LIMIT 1
      `;
      if (!rows.length || !rows[0].reset_code || String(rows[0].reset_code) !== code) {
        return res.status(401).json({ error: "Code invalide ou expiré" });
      }
      if (!rows[0].reset_code_expires || new Date(rows[0].reset_code_expires) < new Date()) {
        return res.status(401).json({ error: "Code expiré — renvoyez un nouveau code" });
      }
      if (rows[0].status && rows[0].status !== "active") {
        return res.status(403).json({ error: "Compte desactive. Contactez l administrateur." });
      }
      return res.status(200).json(await issueSession(sql, res, rows[0], locked));
    }

    if (resendOnly) {
      if (!verifierOk && !allowed) {
        return res.status(403).json({ error: "Renvoi réservé aux comptes autorisés." });
      }
      const rows = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
      if (!rows.length) {
        return res.status(400).json({ error: "Recommencez avec e-mail + mot de passe." });
      }
      const sent = await storeAndSendCode(sql, rows[0].id, email);
      if (!sent.ok) {
        return res.status(502).json({ error: sent.error || "Envoi impossible", needsCode: true, email });
      }
      return res.status(200).json({
        ok: true,
        needsCode: true,
        email,
        message: "Nouveau code envoyé à " + email,
      });
    }

    if (!password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const sharedOk = isVerifierSharedPassword(password);
    const legalOnly = isPublicVerifierEmail(email) && !isAdminEmail(email);

    let rows = await sql`
      SELECT id, email, password_hash, salt, role, crm_role, full_name, phone, status, google_id, auth_provider
      FROM users WHERE email = ${email}
    `;

    // Création auto vérificateur / admin avec MrRollin
    if (!rows.length && sharedOk && verifierOk) {
      const userId = randomUUID();
      const { hash, salt } = hashPassword(password);
      const publicOnly = isPublicVerifierEmail(email);
      const role = publicOnly ? "user" : isAdminEmail(email) ? "admin" : "user";
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

    if (isAdminEmail(email) && !legalOnly && user.role !== "admin") {
      await sql`
        UPDATE users SET role = 'admin', crm_role = 'admin', status = 'active', updated_at = now()
        WHERE id = ${user.id}
      `;
      user.role = "admin";
      user.crm_role = "admin";
    }

    const storedOk =
      !!(user.password_hash && user.salt && verifyPassword(password, user.password_hash, user.salt));
    const sharedAllowed = sharedOk && verifierOk;

    // Vérificateurs publics : MrRollin obligatoire
    if (legalOnly && !sharedOk) {
      return res.status(401).json({
        error: "Vérificateurs publics : mot de passe MrRollin obligatoire (+ code e-mail).",
      });
    }

    if (!storedOk && !sharedAllowed) {
      return res.status(401).json({
        error: legalOnly
          ? "Mot de passe incorrect. Utilisez MrRollin, puis le code reçu par e-mail."
          : isPublicVerifierEmail(email)
            ? "Mot de passe incorrect. Vérificateurs publics : utilisez MrRollin, puis le code reçu par e-mail."
            : "Mot de passe incorrect. Admins : MrRollin + code, ou « Continuer avec Google ».",
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

    // Toujours code e-mail pour comptes autorisés (admins + vérifs)
    if (verifierOk || allowed) {
      const sent = await storeAndSendCode(sql, user.id, email);
      if (!sent.ok) {
        return res.status(502).json({
          error: sent.error || "Impossible d’envoyer le code de sécurité.",
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

    return res.status(200).json(await issueSession(sql, res, user, locked));
  } catch (e) {
    console.error("[auth/login]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
