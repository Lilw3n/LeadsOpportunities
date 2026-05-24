(function () {
  var TOKEN_KEY = "lo_token";

  function card(label, value) {
    return (
      '<div class="kpi-card panel"><div class="kpi-label">' +
      label +
      '</div><div class="kpi-value">' +
      value +
      "</div></div>"
    );
  }

  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }

  fetch("/api/crm/financial-overview", {
    headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      var el = document.getElementById("finStats");
      if (!res.ok) {
        el.innerHTML = "<p>Erreur</p>";
        return;
      }
      var s = res.stats;
      el.innerHTML =
        card("Revenus totaux (estim.)", s.totalRevenue.toLocaleString("fr-FR") + " €") +
        card("Créances en attente", s.pendingReceivables.toLocaleString("fr-FR") + " €") +
        card("Dépenses totales (estim.)", Math.round(s.totalRevenue * 0.12).toLocaleString("fr-FR") + " €") +
        card("Bénéfice net (estim.)", (s.netProfit != null ? s.netProfit : Math.round(s.totalRevenue * 0.15)).toLocaleString("fr-FR") + " €") +
        card("Contrats actifs", s.activeContracts) +
        card("Devis en cours", s.quotesPending);
    });
})();
