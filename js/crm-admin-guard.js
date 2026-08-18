/**
 * Garde d'accès CRM — administrateur site (unique) vs collaborateurs.
 */
window.CrmAdminGuard = {
  currentUser: function () {
    if (window.LoCollaborator) return window.LoCollaborator.currentUser();
    try {
      return JSON.parse(localStorage.getItem("lo_user") || "{}");
    } catch (e) {
      return {};
    }
  },

  isSiteAdmin: function () {
    if (window.LoCollaborator) return window.LoCollaborator.isSiteAdmin();
    var u = this.currentUser();
    return u.role === "admin";
  },

  /** @deprecated Utiliser isSiteAdmin — seul l'admin site gère l'équipe. */
  isAdmin: function () {
    return this.isSiteAdmin();
  },

  isCollaborator: function () {
    if (window.LoCollaborator) return window.LoCollaborator.isCollaborator();
    var u = this.currentUser();
    return u.role !== "admin" && !!(u.crmRole || u.crm_role);
  },

  canManageTeam: function () {
    return this.isSiteAdmin();
  },

  ensureAuth: function () {
    if (!localStorage.getItem("lo_token")) {
      location.href = "./crm.html";
      return false;
    }
    return true;
  },

  ensureAdmin: function (mountId) {
    if (!this.ensureAuth()) return false;
    if (this.isSiteAdmin()) return true;
    var el = mountId ? document.getElementById(mountId) : null;
    var html =
      '<div class="crm-empty-state"><h3>Accès réservé à l\'administrateur</h3>' +
      "<p>La gestion des collaborateurs et les paramètres sensibles sont limités au compte administrateur.</p>" +
      '<p style="margin-top:14px"><a class="btn btn-primary" href="./crm.html">Retour CRM</a></p></div>';
    if (el) el.innerHTML = html;
    else document.body.innerHTML = html;
    return false;
  },
};
