/**
 * Matrice permissions — inspire dashboard/users/permissions multisite
 */
window.CrmPermissions = {
  ROLES: ["admin", "manager", "agent", "viewer"],
  ROLE_LABELS: {
    admin: "Administrateur",
    manager: "Gestionnaire",
    agent: "Agent commercial",
    viewer: "Lecture seule",
  },
  PERMISSIONS: [
    { id: "users.create", name: "Créer utilisateurs", category: "Utilisateurs", level: "high", roles: ["admin", "manager"] },
    { id: "users.read", name: "Consulter utilisateurs", category: "Utilisateurs", level: "medium", roles: ["admin", "manager", "agent"] },
    { id: "contacts.write", name: "Modifier contacts", category: "CRM", level: "medium", roles: ["admin", "manager", "agent"] },
    { id: "quotes.write", name: "Créer / modifier devis", category: "Commercial", level: "medium", roles: ["admin", "manager", "agent"] },
    { id: "financial.read", name: "Voir financier", category: "Financier", level: "high", roles: ["admin", "manager"] },
    { id: "financial.write", name: "Modifier financier", category: "Financier", level: "critical", roles: ["admin"] },
    { id: "insurance.claims", name: "Gérer sinistres", category: "Assurance", level: "high", roles: ["admin", "manager", "agent"] },
    { id: "documents.approve", name: "Approuver documents", category: "Admin", level: "high", roles: ["admin", "manager"] },
    { id: "partners.dispatch", name: "Envoyer aux partenaires", category: "Partenaires", level: "medium", roles: ["admin", "manager", "agent"] },
    { id: "settings.write", name: "Paramètres système", category: "Admin", level: "critical", roles: ["admin"] },
  ],

  render: function (mount) {
    var self = this;
    var byCat = {};
    this.PERMISSIONS.forEach(function (p) {
      if (!byCat[p.category]) byCat[p.category] = [];
      byCat[p.category].push(p);
    });
    var html =
      '<div class="panel"><p style="color:var(--muted)">Matrice lecture — alignée sur api/_lib/rbac.js · ' +
      this.PERMISSIONS.length +
      ' permissions · <a href="./crm-roles.html">Hiérarchie des rôles →</a></p></div>';
    Object.keys(byCat).forEach(function (cat) {
      html +=
        '<section class="panel" style="margin-top:16px"><h3>' +
        cat +
        '</h3><table><thead><tr><th>Permission</th><th>Niveau</th>' +
        self.ROLES.map(function (r) {
          return "<th>" + self.ROLE_LABELS[r] + "</th>";
        }).join("") +
        "</tr></thead><tbody>";
      byCat[cat].forEach(function (p) {
        html +=
          "<tr><td><strong>" +
          p.id +
          "</strong><br><span style='font-size:.85rem;color:var(--muted)'>" +
          p.name +
          "</span></td><td>" +
          p.level +
          "</td>" +
          self.ROLES.map(function (r) {
            return "<td>" + (p.roles.indexOf(r) >= 0 ? "✓" : "—") + "</td>";
          }).join("") +
          "</tr>";
      });
      html += "</tbody></table></section>";
    });
    html += '<p style="margin-top:16px"><a href="./crm.html">← Retour CRM (section Équipe)</a></p>';
    mount.innerHTML = html;
  },
};
