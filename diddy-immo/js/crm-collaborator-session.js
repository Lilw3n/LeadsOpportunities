/**
 * Session collaborateur CRM — rafraîchit lo_user depuis /api/auth/me.
 */
(function (global) {
  var TOKEN_KEY = "lo_token";
  var USER_KEY = "lo_user";

  function currentUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function isSiteAdmin(u) {
    u = u || currentUser();
    return u.role === "admin" || u.isSiteAdmin === true;
  }

  function isCollaborator(u) {
    u = u || currentUser();
    if (isSiteAdmin(u)) return false;
    return !!(u.crmRole || u.crm_role);
  }

  function canAccessCrm(u) {
    return isSiteAdmin(u) || isCollaborator(u);
  }

  function roleLabel(u) {
    u = u || currentUser();
    if (isSiteAdmin(u)) return "Administrateur";
    var r = u.crmRole || u.crm_role || "";
    if (r === "staff") return "Collaborateur staff";
    if (r === "commercial") return "Commercial";
    if (r === "apporteur") return "Apporteur";
    return r || "Utilisateur";
  }

  function refreshSession() {
    var token = localStorage.getItem(TOKEN_KEY);
    if (!token) return Promise.resolve(null);
    return fetch("/api/auth/me", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data.ok && data.user) {
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          return data.user;
        }
        if (data.error === "Compte desactive") {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
        return null;
      })
      .catch(function () {
        return null;
      });
  }

  global.LoCollaborator = {
    currentUser: currentUser,
    isSiteAdmin: isSiteAdmin,
    isCollaborator: isCollaborator,
    canAccessCrm: canAccessCrm,
    roleLabel: roleLabel,
    refreshSession: refreshSession,
  };
})(typeof window !== "undefined" ? window : globalThis);
