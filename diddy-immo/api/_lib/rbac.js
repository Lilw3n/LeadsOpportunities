const { getAuthUser } = require("./auth");
const { getSql } = require("./db");

const CONTACT_TYPES = ["prospect", "client", "apporteur"];
const CRM_STAFF_ROLES = ["admin", "staff", "commercial"];
const ALL_CRM_ROLES = ["admin", "staff", "commercial", "apporteur"];
/** Rôles assignables aux collaborateurs (jamais administrateur site). */
const COLLABORATOR_CRM_ROLES = ["staff", "commercial", "apporteur"];

function isSiteAdmin(user) {
  return !!(user && user.role === "admin");
}

function isCollaborator(user) {
  if (!user) return false;
  if (isSiteAdmin(user)) return false;
  const r = effectiveCrmRole(user);
  return COLLABORATOR_CRM_ROLES.indexOf(r) !== -1;
}

function userFromJwt(decoded) {
  if (!decoded || !decoded.userId) return null;
  var jwtRole = decoded.role === "admin" ? decoded.crmRole || "admin" : decoded.crmRole;
  if (decoded.role !== "admin" && (!jwtRole || ALL_CRM_ROLES.indexOf(jwtRole) < 0)) return null;
  return {
    id: decoded.userId,
    email: decoded.email || "",
    role: decoded.role || "user",
    crm_role: jwtRole,
    full_name: decoded.fullName || decoded.email || "Utilisateur",
    phone: null,
  };
}

async function loadUser(decoded) {
  const sql = getSql();
  if (!sql || !decoded?.userId) return null;
  try {
    const rows = await sql`
      SELECT id, email, role, crm_role, full_name, phone, google_id, auth_provider, linked_contact_id, status
      FROM users WHERE id = ${decoded.userId} LIMIT 1
    `;
    return rows[0] || null;
  } catch (e) {
    console.warn("[rbac] loadUser:", e.message);
    return userFromJwt(decoded);
  }
}

function effectiveCrmRole(user) {
  if (!user) return null;
  if (user.role === "admin") return user.crm_role || "admin";
  return user.crm_role || null;
}

function canAccessCrm(user) {
  const r = effectiveCrmRole(user);
  if (user?.role === "admin") return true;
  return ALL_CRM_ROLES.indexOf(r) !== -1;
}

function canManageUsers(user) {
  return isSiteAdmin(user);
}

function canManageCollaborators(user) {
  return isSiteAdmin(user);
}

function canManageAllContacts(user) {
  const r = effectiveCrmRole(user);
  return user?.role === "admin" || CRM_STAFF_ROLES.indexOf(r) !== -1;
}

function toCrmUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    crmRole: effectiveCrmRole(user),
    fullName: user.full_name,
    phone: user.phone,
    linkedContactId: user.linked_contact_id || null,
    isSiteAdmin: isSiteAdmin(user),
    isCollaborator: isCollaborator(user),
  };
}

async function optionalCrm(req) {
  const decoded = await getAuthUser(req);
  if (!decoded) return null;
  const user = await loadUser(decoded);
  if (!user || !canAccessCrm(user)) return null;
  return toCrmUser(user);
}

async function requireCrm(req, res) {
  const decoded = await getAuthUser(req);
  if (!decoded) {
    res.status(401).json({ error: "Non authentifie" });
    return null;
  }
  const user = await loadUser(decoded);
  if (user) {
    if (!canAccessCrm(user)) {
      res.status(403).json({ error: "Acces CRM refuse" });
      return null;
    }
    return toCrmUser(user);
  }
  const fallback = userFromJwt(decoded);
  if (fallback) {
    console.warn("[rbac] requireCrm: session JWT (base users indisponible)");
    return toCrmUser(fallback);
  }
  res.status(401).json({
    error: "Compte introuvable",
    detail: "Table users absente ou base non joignable — exécutez database/users.sql et database/crm.sql sur Neon.",
  });
  return null;
}

function contactScopeFilter(user) {
  if (canManageAllContacts(user)) return null;
  if (user.crmRole === "apporteur") return user.id;
  return user.id;
}

module.exports = {
  CONTACT_TYPES,
  CRM_STAFF_ROLES,
  ALL_CRM_ROLES,
  COLLABORATOR_CRM_ROLES,
  isSiteAdmin,
  isCollaborator,
  canAccessCrm,
  canManageUsers,
  canManageCollaborators,
  canManageAllContacts,
  requireCrm,
  optionalCrm,
  contactScopeFilter,
  effectiveCrmRole,
};
