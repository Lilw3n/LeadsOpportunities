/**
 * Garde d'accès admin CRM (complément des contrôles API).
 */
window.CrmAdminGuard = {
  currentUser: function () {
    try {
      return JSON.parse(localStorage.getItem("lo_user") || "{}");
    } catch (e) {
      return {};
    }
  },

  isAdmin: function () {
    var u = this.currentUser();
    return u.role === "admin" || u.crm_role === "admin" || u.crmRole === "admin";
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
    if (this.isAdmin()) return true;
    var el = mountId ? document.getElementById(mountId) : null;
    var html =
      '<div class="crm-empty-state"><h3>Accès réservé</h3>' +
      "<p>Cette section est limitée aux administrateurs CRM.</p>" +
      '<p style="margin-top:14px"><a class="btn btn-primary" href="./crm.html">Retour tableau de bord</a></p></div>';
    if (el) el.innerHTML = html;
    else document.body.innerHTML = html;
    return false;
  },
};
