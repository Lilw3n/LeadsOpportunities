/**
 * Rôles CRM — inspire dashboard/users/roles multisite
 */
window.CrmRoles = {
  ROLES: [
    {
      id: "admin",
      label: "Administrateur",
      rank: 0,
      icon: "👑",
      badge: "RANG ÉLEVÉ",
      users: 2,
      desc: "Accès total CRM, utilisateurs, paramètres, financier.",
      perms: ["crm:all", "users:manage", "financial:write", "settings:write", "export:data"],
    },
    {
      id: "direction",
      label: "Direction / Management",
      rank: 1,
      icon: "🏗️",
      badge: "RANG ÉLEVÉ",
      users: 3,
      desc: "Le comptable est élevé au rang 1 pour ses responsabilités financières critiques.",
      perms: ["crm:read", "financial:write", "reports:view", "team:manage", "documents:approve"],
    },
    {
      id: "specialist",
      label: "Agents spécialisés",
      rank: 2,
      icon: "🛡️",
      users: 5,
      desc: "Sinistres, dérogations, partenaires grossistes, éligibilité.",
      perms: ["claims:write", "partners:read", "eligibility:test", "quotes:write", "contracts:read"],
    },
    {
      id: "internal",
      label: "Utilisateurs internes",
      rank: 3,
      icon: "💼",
      users: 8,
      desc: "Contacts, devis, événements, simulation client.",
      perms: ["contacts:write", "quotes:write", "events:write", "documents:read"],
    },
    {
      id: "external",
      label: "Utilisateurs externes",
      rank: 4,
      icon: "🌐",
      users: 12,
      desc: "Apporteurs et portail client limité aux leads et commissions.",
      perms: ["leads:read", "portal:access", "profile:own"],
    },
  ],

  ALL_PERMS: [
    "crm:all",
    "users:manage",
    "financial:write",
    "settings:write",
    "export:data",
    "crm:read",
    "reports:view",
    "team:manage",
    "documents:approve",
    "claims:write",
    "partners:read",
    "eligibility:test",
    "quotes:write",
    "contracts:read",
    "contacts:write",
    "events:write",
    "documents:read",
    "leads:read",
    "portal:access",
    "profile:own",
  ],

  render: function (mount) {
    var self = this;
    var totalUsers = this.ROLES.reduce(function (s, r) {
      return s + r.users;
    }, 0);

    mount.innerHTML =
      '<p style="color:var(--muted)">Système de rôles hiérarchique avec permissions granulaires.</p>' +
      '<div class="crm-kpis" style="margin:16px 0">' +
      '<div class="kpi-card panel"><div class="kpi-label">Total rôles</div><div class="kpi-value">' +
      this.ROLES.length +
      '</div></div><div class="kpi-card panel"><div class="kpi-label">Utilisateurs actifs</div><div class="kpi-value">' +
      totalUsers +
      "</div></div></div>" +
      "<h2 style='font-size:1rem;margin:20px 0 10px'>Hiérarchie des rôles</h2>" +
      this.ROLES.map(function (r) {
        var avail = self.ALL_PERMS.filter(function (p) {
          return r.perms.indexOf(p) < 0;
        });
        return (
          '<details class="panel" style="margin-bottom:10px;padding:14px"><summary style="cursor:pointer;font-weight:600">' +
          r.icon +
          " Niveau " +
          r.rank +
          " — " +
          r.label +
          (r.badge ? ' <span style="font-size:.7rem;background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:6px;margin-left:6px">' + r.badge + "</span>" : "") +
          '</summary><p style="margin:10px 0;color:var(--muted);font-size:.9rem">' +
          r.desc +
          '</p><p style="font-size:.85rem;margin:0 0 8px"><strong>Utilisateurs:</strong> ' +
          r.users +
          ' · <code style="font-size:.78rem">' +
          r.id +
          "</code></p>" +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">' +
          '<div><strong style="font-size:.85rem">Permissions assignées</strong><ul style="margin:6px 0 0;padding-left:18px;font-size:.82rem">' +
          r.perms.map(function (p) {
            return "<li>" + p + ' <button type="button" class="btn btn-ghost btn-sm btn-perm-remove" data-role="' + r.id + '" data-perm="' + p + '">Retirer</button></li>';
          }).join("") +
          "</ul></div>" +
          '<div><strong style="font-size:.85rem">Permissions disponibles</strong><ul style="margin:6px 0 0;padding-left:18px;font-size:.82rem">' +
          avail.slice(0, 5).map(function (p) {
            return "<li>" + p + ' <button type="button" class="btn btn-ghost btn-sm btn-perm-add" data-role="' + r.id + '" data-perm="' + p + '">Assigner</button></li>';
          }).join("") +
          (avail.length > 5 ? "<li>… +" + (avail.length - 5) + " autres</li>" : "") +
          "</ul></div></div></details>"
        );
      }).join("") +
      '<p style="margin-top:16px"><a href="./crm-permissions.html">Voir matrice permissions →</a> · <a href="./crm-users-internal.html">Gérer les comptes →</a></p>';

    mount.querySelectorAll(".btn-perm-add, .btn-perm-remove").forEach(function (btn) {
      btn.onclick = function () {
        alert(
          (btn.classList.contains("btn-perm-add") ? "Assigner " : "Retirer ") +
            btn.getAttribute("data-perm") +
            " pour " +
            btn.getAttribute("data-role") +
            " — persistance RBAC à brancher (Neon)."
        );
      };
    });
  },
};
