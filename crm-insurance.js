(function () {
  var TOKEN_KEY = "lo_token";

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

  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }

  fetch("/api/crm/insurance-hub", {
    headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      var el = document.getElementById("insStats");
      if (!res.ok) {
        el.innerHTML = "<p>" + (res.error || "Erreur") + "</p>";
        return;
      }
      var s = res.stats;
      el.innerHTML =
        card("Véhicules", s.totalVehicles) +
        card("Conducteurs", s.activeDrivers) +
        card("Contrats actifs", s.activePolicies, s.totalContracts + " total") +
        card("Sinistres en cours", s.pendingClaims, s.claimsThisMonth + " ce mois") +
        card("Prime mensuelle", (s.monthlyPremium || 0).toLocaleString("fr-FR") + " €") +
        card("Échéances 30j", s.expiringThisMonth);
    });
})();
