(function () {
  var TOKEN_KEY = "lo_token";

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function card(label, value, sub) {
    return (
      '<div class="kpi-card panel"><div class="kpi-label">' +
      label +
      '</div><div class="kpi-value">' +
      value +
      "</div>" +
      (sub ? '<div class="kpi-sub">' + sub + "</div>" : "") +
      "</div>"
    );
  }

  if (!token()) {
    location.href = "./crm.html";
    return;
  }

  fetch("/api/crm/statistics", {
    headers: { Authorization: "Bearer " + token() },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      var el = document.getElementById("statsGrid");
      if (!res.ok) {
        el.innerHTML = "<p>" + (res.error || "Erreur") + "</p>";
        return;
      }
      var c = res.contacts || {};
      el.innerHTML =
        card("Contacts total", res.contactsTotal, "Prospects " + (c.prospect || 0) + " · Clients " + (c.client || 0)) +
        card("Contrats actifs", res.contractsActive || 0) +
        card("Sinistres ouverts", res.claimsOpen || 0) +
        card("Devis en cours", res.quotesOpen) +
        card("Événements ce mois", res.eventsThisMonth) +
        card("Véhicules dossiers", res.vehiclesTotal) +
        card("Demandes en attente", res.documentsPending || 0) +
        card("Leads 7 jours", res.leadsWeek) +
        card("Contrats signés", res.contractsSigned || 0);

      var btnEx = document.getElementById("btnStatsExport");
      if (btnEx) {
        btnEx.onclick = function () {
          var csv =
            "indicateur;valeur\nContacts;" +
            res.contactsTotal +
            "\nContrats actifs;" +
            (res.contractsActive || 0) +
            "\nSinistres ouverts;" +
            (res.claimsOpen || 0) +
            "\nDevis;" +
            (res.quotesOpen || 0);
          var a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
          a.download = "stats-crm-" + new Date().toISOString().slice(0, 10) + ".csv";
          a.click();
        };
      }

      var links = document.getElementById("statsLinks");
      if (links) {
        links.innerHTML =
          '<a class="panel" href="./crm-contracts.html" style="padding:14px;text-decoration:none;color:inherit"><strong>📄 Contrats</strong></a>' +
          '<a class="panel" href="./crm-claims.html" style="padding:14px;text-decoration:none;color:inherit"><strong>⚠️ Sinistres</strong></a>' +
          '<a class="panel" href="./crm-financial.html" style="padding:14px;text-decoration:none;color:inherit"><strong>💰 Financier</strong></a>' +
          '<a class="panel" href="./crm-periods.html" style="padding:14px;text-decoration:none;color:inherit"><strong>📅 Périodes</strong></a>';
      }
    });
})();
