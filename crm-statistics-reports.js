(function () {
  var TOKEN_KEY = "lo_token";
  function token() { return localStorage.getItem(TOKEN_KEY); }
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }
  if (!token()) { location.href = "./crm.html"; return; }

  var reports = [
    { id: "portfolio", title: "Portefeuille assurance", desc: "Devis, contrats, sinistres par statut" },
    { id: "contacts", title: "Répartition contacts", desc: "Prospects, clients, apporteurs" },
    { id: "financial", title: "Synthèse financière", desc: "Paiements, créances, débits" },
    { id: "activity", title: "Activité commerciale", desc: "Événements et leads 30 jours" },
  ];

  fetch("/api/crm/statistics", { headers: { Authorization: "Bearer " + token() } })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      var box = document.getElementById("reportsList");
      if (!res.ok) {
        box.innerHTML = "<p>" + esc(res.error || "Erreur") + "</p>";
        return;
      }
      box.innerHTML = reports
        .map(function (rep) {
          var body = "";
          if (rep.id === "portfolio") {
            body =
              "<ul><li>Devis en cours : <strong>" + (res.quotesOpen || 0) + "</strong></li>" +
              "<li>Contrats signés : <strong>" + (res.contractsSigned || 0) + "</strong></li>" +
              "<li>Sinistres ouverts : <strong>" + (res.claimsOpen || 0) + "</strong></li></ul>";
          } else if (rep.id === "contacts") {
            var c = res.contacts || {};
            body =
              "<ul><li>Total : <strong>" + res.contactsTotal + "</strong></li>" +
              "<li>Prospects : " + (c.prospect || 0) + "</li><li>Clients : " + (c.client || 0) + "</li></ul>";
          } else if (rep.id === "financial") {
            body = "<p>Consultez le <a href='./crm-financial.html'>hub financier</a> pour le détail des flux.</p>";
          } else {
            body =
              "<ul><li>Événements ce mois : <strong>" + (res.eventsThisMonth || 0) + "</strong></li>" +
              "<li>Leads 7 jours : <strong>" + (res.leadsWeek || 0) + "</strong></li></ul>";
          }
          return (
            '<article style="padding:16px 0;border-bottom:1px solid var(--line)">' +
            "<h3 style='margin:0 0 6px'>" + esc(rep.title) + "</h3>" +
            "<p style='margin:0 0 8px;color:var(--muted);font-size:.9rem'>" + esc(rep.desc) + "</p>" +
            body +
            "</article>"
          );
        })
        .join("");
    });
})();
