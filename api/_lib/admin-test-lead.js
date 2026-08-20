/**
 * Bypass validation admin test côté API (token CRM requis).
 */
const { getAuthUser } = require("./auth");
const { loadUser, canAccessCrm, toCrmUser } = require("./rbac");

async function optionalAdminTest(req, body) {
  if (!body || (body.adminTest !== true && body.testMode !== true)) {
    return { ok: false, user: null };
  }
  const decoded = await getAuthUser(req);
  if (!decoded) return { ok: false, user: null };
  const user = await loadUser(decoded);
  if (!user || !canAccessCrm(user)) return { ok: false, user: null };
  return { ok: true, user: toCrmUser(user) };
}

function applyAdminTestDefaults(body, defaults) {
  defaults = defaults || {};
  var out = Object.assign({}, body || {});
  if (!out.email) out.email = defaults.email || "test.admin@leadsopportunities.fr";
  if (!out.phone) out.phone = defaults.phone || "0600000000";
  if (!out.firstName && !out.prenom) out.firstName = defaults.firstName || "Test";
  if (!out.lastName && !out.nom) out.lastName = defaults.lastName || "Admin";
  if (!out.city && !out.searchCities) out.city = defaults.city || "Nancy";
  if (!out.postal_code && !out.postalProject) out.postal_code = defaults.postal || "54000";
  out.adminTest = true;
  out.testMode = true;
  return out;
}

module.exports = {
  optionalAdminTest,
  applyAdminTestDefaults,
};
