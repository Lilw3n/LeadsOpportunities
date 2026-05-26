(function () {
  var TOKEN_KEY = "lo_token";

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function card(label, value, sub) {
    return (
      '<div class="kpi-card"><div class="kpi-label">' +
      esc(label) +
      '</div><div class="kpi-value">' +
      (value == null ? "—" : esc(value)) +
      "</div>" +
      (sub ? '<div class="kpi-sub">' + esc(sub) + "</div>" : "") +
      "</div>"
    );
  }

  function moduleCard(title, desc, href) {
    return '<a class="crm-module-card" href="' + href + '"><strong>' + esc(title) + "</strong><span>" + esc(desc) + "</span></a>";
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
        el.innerHTML =
          '<div class="crm-empty-state"><h3>Statistiques indisponibles</h3><p>' +
          esc(res.error || "Vérifiez la configuration CRM et les migrations statistiques.") +
          "</p></div>";
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
          moduleCard("Contrats", "Suivre les signatures, avenants et échéances.", "./crm-contracts.html") +
          moduleCard("Devis", "Relancer les offres en attente et transformer.", "./crm-quotes.html") +
          moduleCard("Sinistres", "Prioriser les dossiers ouverts.", "./crm-claims.html") +
          moduleCard("Finance", "Paiements, créances et débits.", "./crm-financial.html") +
          moduleCard("Documents", "Pièces manquantes et dossiers incomplets.", "./crm-pending-documents.html") +
          moduleCard("Acquisition", "Voir les leads entrants à traiter.", "./crm-acquisition.html");
      }
    })
    .catch(function () {
      document.getElementById("statsGrid").innerHTML =
        '<div class="crm-empty-state"><h3>Connexion impossible</h3><p>Le service statistiques ne répond pas pour le moment.</p></div>';
    });
})();
