/**
 * Actions contextuelles fiche contact / prospect — inspire menus multisite liés au dossier.
 */
window.CrmContactActions = {
  items: function (contactId) {
    var q = "contactId=" + encodeURIComponent(contactId);
    return [
      { label: "Dossier complet", href: "./crm-create-complete.html?" + q },
      { label: "+ Devis wizard", href: "./crm-quote-wizard.html?" + q, primary: true },
      { label: "+ Devis rapide", href: "./crm-quote-new.html?" + q },
      { label: "Wizard devis → contrat", href: "./crm-quote-contract-wizard.html?type=contract&" + q },
      { label: "+ Contrat", href: "./crm-contract-new.html?" + q },
      { label: "Avenant contrat", href: "./crm-contract-avenant.html?" + q, note: "depuis un contrat" },
      { label: "+ Sinistre", href: "./crm-claim-new.html?" + q },
      { label: "+ Véhicule", href: "./crm-vehicle-new.html?" + q },
      { label: "+ Conducteur", href: "./crm-driver-new.html?" + q },
      { label: "+ Demande assurance", href: "./crm-insurance-request-new.html?" + q },
      { label: "Paiement devis", href: "./crm-quote-payment.html?" + q },
      { label: "Déposer un document", href: "./crm-depot-drive.html?" + q },
      { label: "Test éligibilité", href: "./crm-eligibility-test.html?" + q },
      { label: "Dérogations", href: "./crm-derogations.html" },
      { label: "Simulation portail", href: "./crm-simulate.html?" + q },
      { label: "Vue modules", href: "./crm-contact-modules.html?id=" + encodeURIComponent(contactId) },
      { label: "Événement", href: "./crm-event-create.html?" + q },
    ];
  },

  render: function (mount, contactId) {
    if (!mount || !contactId) return;
    var items = this.items(contactId);
    mount.innerHTML =
      '<div class="contact-actions panel">' +
      '<div class="contact-actions-head"><strong>Actions sur ce dossier</strong>' +
      '<span class="contact-actions-sub">Réservé à cette fiche client / prospect</span></div>' +
      '<div class="contact-actions-grid">' +
      items
        .map(function (it) {
          var cls = it.primary ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm";
          return (
            '<a href="' +
            it.href +
            '" class="' +
            cls +
            '">' +
            it.label +
            "</a>"
          );
        })
        .join("") +
      "</div></div>";
  },
};
