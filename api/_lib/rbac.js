const { getAuthUser } = require("./auth");
const { getSql } = require("./db");

const CONTACT_TYPES = ["prospect", "client", "apporteur"];
const CRM_STAFF_ROLES = ["admin", "staff", "commercial"];
const ALL_CRM_ROLES = ["admin", "staff", "commercial", "apporteur"];

async function loadUser(decoded) {
  const sql = getSql();
  if (!sql || !decoded?.userId) return null;
  const rows = await sql`
    SELECT id, email, role, crm_role, full_name, phone, google_id, auth_provider
    FROM users WHERE id = ${decoded.userId} LIMIT 1
  `;
  return rows[0] || null;
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
  const r = effectiveCrmRole(user);
  return user?.role === "admin" || r === "admin" || r === "staff";
}

function canManageAllContacts(user) {
  const r = effectiveCrmRole(user);
  return user?.role === "admin" || CRM_STAFF_ROLES.indexOf(r) !== -1;
}

async function requireCrm(req, res) {
  const decoded = await getAuthUser(req);
  if (!decoded) {
    res.status(401).json({ error: "Non authentifie" });
    return null;
  }
  const user = await loadUser(decoded);
  if (!user) {
    res.status(401).json({ error: "Compte introuvable" });
    return null;
  }
  if (!canAccessCrm(user)) {
    res.status(403).json({ error: "Acces CRM refuse" });
    return null;
  }
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    crmRole: effectiveCrmRole(user),
    fullName: user.full_name,
    phone: user.phone,
    linkedContactId: null,
  };
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
  canAccessCrm,
  canManageUsers,
  canManageAllContacts,
  requireCrm,
  contactScopeFilter,
  effectiveCrmRole,
};
