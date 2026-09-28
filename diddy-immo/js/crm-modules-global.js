/**
 * Rendu tableaux modules assurance globaux — inspire dashboard/insurance/* multisite
 */
window.CrmModulesGlobal = {
  esc: function (s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
  },

  contactLink: function (id, name) {
    return (
      '<a href="./crm-contact.html?id=' +
      encodeURIComponent(id) +
      '">' +
      this.esc(name) +
      "</a>"
    );
  },

  renderVehicles: function (items) {
    var self = this;
    if (!items.length) return "<p>Aucun véhicule</p>";
    return (
      "<table><thead><tr><th>Immat.</th><th>Véhicule</th><th>Statut</th><th>Contact</th></tr></thead><tbody>" +
      items
        .map(function (v) {
          return (
            "<tr><td>" +
            self.esc(v.registration || "—") +
            '</td><td><a href="./crm-vehicle-detail.html?id=' +
            encodeURIComponent(v.id) +
            "&contactId=" +
            encodeURIComponent(v.contactId) +
            '">' +
            self.esc((v.brand || "") + " " + (v.model || "")) +
            (v.year ? " (" + v.year + ")" : "") +
            "</td><td>" +
            self.esc(v.status) +
            "</td><td>" +
            self.contactLink(v.contactId, v.contactName) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>"
    );
  },

  renderDrivers: function (items) {
    var self = this;
    if (!items.length) return "<p>Aucun conducteur</p>";
    return (
      "<table><thead><tr><th>Nom</th><th>Permis</th><th>Statut</th><th>Contact</th></tr></thead><tbody>" +
      items
        .map(function (d) {
          return (
            "<tr><td><a href=\"./crm-driver-detail.html?id=" +
            encodeURIComponent(d.id) +
            "&contactId=" +
            encodeURIComponent(d.contactId) +
            '">' +
            self.esc(((d.first_name || "") + " " + (d.last_name || "")).trim()) +
            "</a></td><td>" +
            self.esc(d.license_type || d.license_number || "—") +
            "</td><td>" +
            self.esc(d.status) +
            "</td><td>" +
            self.contactLink(d.contactId, d.contactName) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>"
    );
  },

  renderClaims: function (items) {
    var self = this;
    if (!items.length) return "<p>Aucun sinistre</p>";
    return (
      "<table><thead><tr><th>Date</th><th>Type</th><th>Montant</th><th>Statut</th><th>Contact</th></tr></thead><tbody>" +
      items
        .map(function (cl) {
          return (
            "<tr><td>" +
            (cl.claim_date ? new Date(cl.claim_date).toLocaleDateString("fr-FR") : "—") +
            '</td><td><a href="./crm-claim-detail.html?id=' +
            encodeURIComponent(cl.id) +
            "&contactId=" +
            encodeURIComponent(cl.contactId) +
            '">' +
            self.esc(cl.claim_type || "—") +
            "</a></td><td>" +
            (cl.amount != null ? Number(cl.amount).toLocaleString("fr-FR") + " €" : "—") +
            "</td><td>" +
            self.esc(cl.status) +
            "</td><td>" +
            self.contactLink(cl.contactId, cl.contactName) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>"
    );
  },

  renderContracts: function (items) {
    var self = this;
    if (!items.length) return "<p>Aucun contrat</p>";
    return (
      "<table><thead><tr><th>Contrat</th><th>Assureur</th><th>Prime/mois</th><th>Fin</th><th>Statut</th><th>Contact</th></tr></thead><tbody>" +
      items
        .map(function (ct) {
          return (
            "<tr><td><a href=\"./crm-contract-detail.html?id=" +
            encodeURIComponent(ct.id) +
            "&contactId=" +
            encodeURIComponent(ct.contactId) +
            '">' +
            self.esc(ct.policy_number || ct.contract_type || "—") +
            "</a></td><td>" +
            self.esc(ct.insurer || "—") +
            "</td><td>" +
            (ct.premium != null ? Number(ct.premium).toLocaleString("fr-FR") + " €" : "—") +
            "</td><td>" +
            (ct.end_date ? new Date(ct.end_date).toLocaleDateString("fr-FR") : "—") +
            "</td><td>" +
            self.esc(ct.status) +
            "</td><td>" +
            self.contactLink(ct.contactId, ct.contactName) +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>"
    );
  },

  render: function (type, items) {
    if (type === "drivers") return this.renderDrivers(items);
    if (type === "claims") return this.renderClaims(items);
    if (type === "contracts") return this.renderContracts(items);
    return this.renderVehicles(items);
  },
};
