window.CrmAlertsPanel = {
  CATEGORY_LABELS: {
    eligibility: "Éligibilité",
    claim_aging: "Sinistres",
    reminder: "Rappels",
    event: "Événements",
  },

  priorityLabel: function (p) {
    var map = { critical: "Critique", urgent: "Urgent", high: "Haute", medium: "Moyenne", low: "Basse" };
    return map[p] || p || "—";
  },

  resolveHref: function (a) {
    if (a.href) return a.href;
    if (a.contactId) return "./crm-contact.html?id=" + encodeURIComponent(a.contactId);
    return "#";
  },

  renderEmpty: function (opts) {
    opts = opts || {};
    var variant = opts.variant || "compact";
    if (variant === "compact") {
      return '<p class="alerts-empty">Aucune alerte pour le moment.</p>';
    }
    return (
      '<div class="crm-empty-state"><h3>Aucune alerte dans cette vue</h3>' +
      "<p>Les alertes apparaissent quand un contrat arrive à échéance, un sinistre vieillit, un devis stagne ou un événement est en retard.</p>" +
      '<p style="margin:14px 0 0"><a class="btn btn-primary" href="./crm-periods.html">Voir les périodes</a> ' +
      '<a class="btn btn-ghost" href="./crm-contracts.html">Contrats</a></p></div>'
    );
  },

  renderCard: function (a, esc, variant) {
    var href = this.resolveHref(a);
    var cat = this.CATEGORY_LABELS[a.category] || a.category || a.type || "Alerte";
    var pri = esc(a.priority || "medium");
    if (variant === "compact") {
      return (
        '<li class="alert-item alert-' +
        pri +
        '"><a href="' +
        esc(href) +
        '"><strong>' +
        esc(a.title) +
        "</strong><span>" +
        esc(a.message) +
        "</span></a></li>"
      );
    }
    return (
      '<article class="crm-alert-card crm-alert-' +
      pri +
      '">' +
      '<div class="crm-alert-card-head">' +
      '<div><span class="crm-alert-cat">' +
      esc(cat) +
      "</span>" +
      (a.ruleId ? '<span class="crm-alert-rule">' + esc(a.ruleId) + "</span>" : "") +
      "</div>" +
      '<span class="crm-priority-dot crm-priority-' +
      pri +
      '" title="' +
      esc(this.priorityLabel(a.priority)) +
      '"></span></div>' +
      '<a class="crm-alert-title" href="' +
      esc(href) +
      '">' +
      esc(a.title) +
      "</a>" +
      '<p class="crm-alert-message">' +
      esc(a.message) +
      "</p>" +
      '<div class="crm-alert-actions">' +
      '<a class="btn btn-ghost btn-sm" href="' +
      esc(href) +
      '">Ouvrir</a>' +
      (a.contactId
        ? '<a class="btn btn-ghost btn-sm" href="./crm-contact.html?id=' +
          encodeURIComponent(a.contactId) +
          '">Contact</a>'
        : "") +
      "</div></article>"
    );
  },

  render: function (alerts, escOrOpts, maybeOpts) {
    var esc;
    var opts = {};
    if (typeof escOrOpts === "function") {
      esc = escOrOpts;
      opts = maybeOpts || {};
    } else {
      opts = escOrOpts || {};
      esc =
        opts.esc ||
        function (s) {
          var d = document.createElement("div");
          d.textContent = s == null ? "" : s;
          return d.innerHTML;
        };
    }
    var variant = opts.variant || "compact";
    if (!alerts || !alerts.length) return this.renderEmpty({ variant: variant });

    var self = this;
    if (variant === "compact") {
      return (
        '<ul class="alerts-list crm-alert-list-compact">' +
        alerts.map(function (a) { return self.renderCard(a, esc, "compact"); }).join("") +
        "</ul>"
      );
    }
    return (
      '<div class="crm-alert-list">' +
      alerts.map(function (a) { return self.renderCard(a, esc, "full"); }).join("") +
      "</div>"
    );
  },
};
