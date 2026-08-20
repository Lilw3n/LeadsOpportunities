/**
 * Actions contextuelles fiche contact / prospect — inspire menus multisite liés au dossier.
 */
window.CrmContactActions = {
  groups: function (contactId) {
    var q = "contactId=" + encodeURIComponent(contactId);
    return [
      {
        id: "primary",
        label: "Actions principales",
        items: [
          { label: "+ Devis wizard", href: "./crm-quote-wizard.html?" + q, primary: true },
          { label: "+ Devis rapide", href: "./crm-quote-new.html?" + q },
          { label: "Dossier complet", href: "./crm-create-complete.html?" + q },
          { label: "Événement", href: "./crm-event-create.html?" + q },
          { label: "Vue modules", href: "./crm-contact-modules.html?id=" + encodeURIComponent(contactId) },
        ],
      },
      {
        id: "contrats",
        label: "Devis & contrats",
        items: [
          { label: "Wizard devis → contrat", href: "./crm-quote-contract-wizard.html?type=contract&" + q },
          { label: "+ Contrat", href: "./crm-contract-new.html?" + q },
          { label: "Avenant contrat", href: "./crm-contract-avenant.html?" + q, note: "depuis un contrat" },
          { label: "Paiement devis", href: "./crm-quote-payment.html?" + q },
          { label: "+ Demande assurance", href: "./crm-insurance-request-new.html?" + q },
        ],
      },
      {
        id: "auto",
        label: "Auto & sinistres",
        items: [
          { label: "+ Véhicule", href: "./crm-vehicle-new.html?" + q },
          { label: "+ Conducteur", href: "./crm-driver-new.html?" + q },
          { label: "+ Sinistre", href: "./crm-claim-new.html?" + q },
          { label: "Test éligibilité", href: "./crm-eligibility-test.html?" + q },
          { label: "Dérogations", href: "./crm-derogations.html" },
        ],
      },
      {
        id: "suivi",
        label: "Suivi & outils",
        items: [
          { label: "Suivi événements", href: "./crm-event-manager.html" },
          { label: "Agenda", href: "./crm-calendar.html" },
          { label: "Simulation portail", href: "./crm-simulate.html?" + q },
        ],
      },
    ];
  },

  items: function (contactId) {
    return this.groups(contactId).reduce(function (acc, g) {
      return acc.concat(g.items);
    }, []);
  },

  render: function (mount, contactId) {
    if (!mount || !contactId) return;
    var groups = this.groups(contactId);
    var primary = groups[0];
    var rest = groups.slice(1);

    function linkHtml(it) {
      var cls = it.primary ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm";
      return '<a href="' + it.href + '" class="' + cls + '">' + it.label + "</a>";
    }

    var html =
      '<div class="contact-actions panel">' +
      '<div class="contact-actions-head"><strong>Actions sur ce dossier</strong>' +
      '<span class="contact-actions-sub">Réservé à cette fiche client / prospect</span></div>' +
      '<div class="contact-actions-primary">' +
      primary.items.map(linkHtml).join("") +
      "</div>";

    rest.forEach(function (g) {
      html +=
        '<details class="contact-actions-group">' +
        "<summary>" +
        g.label +
        ' <span class="contact-actions-count">' +
        g.items.length +
        "</span></summary>" +
        '<div class="contact-actions-grid">' +
        g.items.map(linkHtml).join("") +
        "</div></details>";
    });

    html += "</div>";
    mount.innerHTML = html;
  },
};
