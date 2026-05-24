window.CrmAlertsPanel = {
  render: function (alerts, esc) {
    esc = esc || function (s) {
      return String(s == null ? "" : s);
    };
    if (!alerts || !alerts.length) {
      return '<p class="alerts-empty">Aucune alerte pour le moment.</p>';
    }
    return (
      '<ul class="alerts-list">' +
      alerts
        .map(function (a) {
          var href = a.contactId
            ? "./crm-contact.html?id=" + encodeURIComponent(a.contactId)
            : "#";
          return (
            '<li class="alert-item alert-' +
            esc(a.priority || "medium") +
            '"><a href="' +
            href +
            '"><strong>' +
            esc(a.title) +
            "</strong><span>" +
            esc(a.message) +
            "</span></a></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  },
};
