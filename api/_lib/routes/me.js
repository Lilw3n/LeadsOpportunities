/**
 * GET /api/auth/me
 * Si Neon est saturé / down : renvoie le profil depuis le JWT (session offline).
 */
const { getAuthUser } = require("../auth");
const { applyApiGuards } = require("../security");
const { isAdminEmail } = require("../admin-emails");
const { isPublicVerifierEmail } = require("../verifier-access");

function userFromJwt(decoded) {
  const email = String(decoded.email || "")
    .trim()
    .toLowerCase();
  const role =
    decoded.role ||
    (isAdminEmail(email) ? "admin" : "user");
  const publicOnly =
    decoded.siteAccess === "public" ||
    (!!email && isPublicVerifierEmail(email) && !isAdminEmail(email));
  const crmRole = publicOnly
    ? null
    : role === "admin"
      ? decoded.crmRole || "admin"
      : decoded.crmRole || null;
  const effectiveRole = publicOnly ? "user" : role;
  return {
    id: decoded.userId,
    email: email,
    role: effectiveRole,
    crmRole: crmRole,
    fullName: decoded.fullName || (email ? email.split("@")[0] : null),
    status: "active",
    phone: null,
    createdAt: null,
    lastLoginAt: null,
    isSiteAdmin: !publicOnly && effectiveRole === "admin",
    isCollaborator: !publicOnly && effectiveRole !== "admin" && !!crmRole,
    siteAccess: decoded.siteAccess || (isAdminEmail(email) ? "full" : publicOnly ? "public" : null),
    publicAccess: publicOnly,
    isPublicVerifier: publicOnly,
    offline: !!decoded.offline,
  };
}

function canUseJwtFallback(decoded) {
  if (!decoded || !decoded.email) return false;
  if (decoded.offline) return true;
  if (isAdminEmail(decoded.email)) return true;
  if (decoded.role === "admin" || decoded.crmRole) return true;
  if (decoded.siteAccess === "full" || decoded.siteAccess === "public") return true;
  return false;
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const decoded = await getAuthUser(req);
  if (!decoded) {
    return res.status(401).json({ error: "Non authentifié" });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return res.status(200).json({ ok: true, user: userFromJwt(decoded), neonDown: true });
  }

  try {
    const { neon } = require("@neondatabase/serverless");
    const sql = neon(dbUrl);

    const rows = await sql`
      SELECT id, email, role, crm_role, full_name, phone, status, created_at, last_login_at
      FROM users WHERE id = ${decoded.userId}
    `;

    // Compte offline (id synthétique) ou JWT admin : si pas en base, garder la session JWT
    if (rows.length === 0) {
      if (canUseJwtFallback(decoded)) {
        return res.status(200).json({
          ok: true,
          user: userFromJwt(decoded),
          neonDown: !!decoded.offline,
        });
      }
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }

    const u = rows[0];
    if (u.status && u.status !== "active") {
      return res.status(403).json({ error: "Compte desactive" });
    }
    const crmRole = u.role === "admin" ? u.crm_role || "admin" : u.crm_role;
    return res.status(200).json({
      ok: true,
      user: {
        id: u.id,
        email: u.email,
        role: u.role,
        crmRole: crmRole,
        fullName: u.full_name,
        status: u.status,
        phone: u.phone,
        createdAt: u.created_at,
        lastLoginAt: u.last_login_at,
        isSiteAdmin: u.role === "admin",
        isCollaborator: u.role !== "admin" && !!crmRole,
        siteAccess: decoded.siteAccess || null,
        offline: false,
      },
    });
  } catch (e) {
    console.error("[auth/me] neon", e && e.message ? e.message : e);
    // Neon saturé / compute stopped : ne pas déconnecter
    if (canUseJwtFallback(decoded)) {
      return res.status(200).json({
        ok: true,
        user: userFromJwt(decoded),
        neonDown: true,
      });
    }
    return res.status(503).json({
      error: "Base de données indisponible (Neon). Réessayez ou reconnectez-vous.",
      neonDown: true,
    });
  }
};
