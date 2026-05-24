/**
 * Mode lecture contrat — inspire dashboard/contracts/[id] multisite
 */
window.CrmContractReading = {
  esc: function (s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
  },

  render: function (container, contract, contact, extras) {
    extras = extras || {};
    var c = contract;
    var bank = (contact && contact.metadata && contact.metadata.bank) || {};
    if (typeof contact.metadata === "string") {
      try {
        bank = JSON.parse(contact.metadata).bank || {};
      } catch (e) {}
    }

    container.innerHTML =
      '<div class="crm-reading">' +
      '<header class="crm-reading-head"><div><p class="crm-ref">' +
      this.esc(c.id) +
      "</p><h2>" +
      this.esc(c.policy_number || c.contract_type || "Contrat") +
      '</h2><p class="crm-sub">' +
      this.esc(c.insurer || "—") +
      " · " +
      this.esc(c.status) +
      '</p></div><span class="status-badge">' +
      this.esc(c.status) +
      "</span></header>" +
      '<div class="crm-reading-grid">' +
      '<section class="panel"><h3>Client</h3><p><a href="./crm-contact.html?id=' +
      encodeURIComponent(c.contact_id) +
      '">' +
      this.esc(extras.contactName || "") +
      "</a></p></section>" +
      '<section class="panel"><h3>Conditions</h3><dl class="req-dl">' +
      "<dt>Début</dt><dd>" +
      (c.start_date ? new Date(c.start_date).toLocaleDateString("fr-FR") : "—") +
      "</dd><dt>Fin</dt><dd>" +
      (c.end_date ? new Date(c.end_date).toLocaleDateString("fr-FR") : "—") +
      "</dd><dt>Prime</dt><dd>" +
      (c.premium != null ? Number(c.premium).toLocaleString("fr-FR") + " € / mois" : "—") +
      "</dd></dl></section>" +
      '<section class="panel"><h3>Coordonnées bancaires</h3><p>' +
      (bank.iban ? this.esc(bank.accountHolder) + " — " + this.esc(bank.iban) : "Non renseignées") +
      '</p></section><section class="panel"><h3>Véhicules liés</h3><ul>' +
      (extras.vehicles || [])
        .slice(0, 5)
        .map(
          function (v) {
            return "<li>" + window.CrmContractReading.esc(v.registration || v.brand + " " + v.model) + "</li>";
          }.bind(this)
        )
        .join("") +
      "</ul></section>" +
      '<section class="panel"><h3>Sinistres</h3><ul>' +
      (extras.claims || [])
        .slice(0, 5)
        .map(function (cl) {
          return (
            "<li>" +
            window.CrmContractReading.esc(cl.claim_type) +
            " — " +
            window.CrmContractReading.esc(cl.status) +
            "</li>"
          );
        })
        .join("") +
      "</ul></section></div>" +
      (c.description ? '<section class="panel"><h3>Description</h3><p style="white-space:pre-wrap">' + this.esc(c.description) + "</p></section>" : "") +
      '<section class="panel"><h3>Actions</h3><div style="display:flex;flex-wrap:wrap;gap:8px">' +
      '<a class="btn btn-primary" href="./crm-contract-avenant.html?id=' +
      encodeURIComponent(c.id) +
      "&contactId=" +
      encodeURIComponent(c.contact_id) +
      '">Débuter un avenant</a>' +
      '<a class="btn btn-ghost" href="./crm-claim-new.html?contactId=' +
      encodeURIComponent(c.contact_id) +
      '">Nouveau sinistre</a>' +
      '<a class="btn btn-ghost" href="./crm-financial-payments.html">Paiements</a>' +
      '<a class="btn btn-ghost" href="./crm-contact.html?id=' +
      encodeURIComponent(c.contact_id) +
      '">Modifier coordonnées</a>' +
      "</div></section></div>";
  },
};
