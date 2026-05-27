(function () {

  var TOKEN_KEY = "lo_token";



  function esc(s) {

    var d = document.createElement("div");

    d.textContent = String(s == null ? "" : s);

    return d.innerHTML;

  }



  function kpi(label, value) {

    return '<div class="kpi-card panel"><div class="kpi-label">' + label + '</div><div class="kpi-value">' + value + "</div></div>";

  }



  if (!localStorage.getItem(TOKEN_KEY)) {

    location.href = "./crm.html";

    return;

  }



  fetch("/api/crm/periods", {

    headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },

  })

    .then(function (r) {

      return r.json();

    })

    .then(function (res) {

      var pm = document.getElementById("periodsMount");

      var em = document.getElementById("expiringMount");

      if (!res.ok) {

        pm.innerHTML = "<p>Erreur</p>";

        return;

      }



      var manual = [];
      try {
        manual = JSON.parse(localStorage.getItem("lo_crm_periods_manual") || "[]");
      } catch (e) {}
      var periods = manual.concat(res.periods || []);

      var totalPremium = periods.reduce(function (s, p) { return s + (Number(p.totalPremium) || 0); }, 0);

      var totalContracts = periods.reduce(function (s, p) { return s + (Number(p.contracts) || 0); }, 0);



      document.getElementById("periodKpis").innerHTML =

        kpi("Total périodes", periods.length) +

        kpi("Contrats", totalContracts) +

        kpi("Primes total / mois", totalPremium.toLocaleString("fr-FR") + " €") +

        kpi("Échéances J-90", res.expiring.length);



      if (res.expiring.length) {

        var alertEl = document.getElementById("periodAlert");

        alertEl.style.display = "block";

        alertEl.innerHTML =

          "<strong>🔔 Alerte d'échéance</strong> — " +

          res.expiring.length +

          " contrat(s) arrivent à échéance dans les 90 prochains jours. Pensez aux relances renouvellement.";

      }



      pm.innerHTML = periods.length

        ? "<table><thead><tr><th>Période</th><th>Contrats</th><th>Prime/mois</th><th>Statut</th><th></th></tr></thead><tbody>" +

          periods

            .map(function (p) {

              return (

                "<tr><td>" +

                esc(p.name) +

                "</td><td>" +

                p.contracts +

                "</td><td>" +

                Number(p.totalPremium).toLocaleString("fr-FR") +

                " €</td><td>" +

                esc(p.status) +

                '</td><td><a href="./crm-contracts.html">Contrats</a></td></tr>'

              );

            })

            .join("") +

          "</tbody></table>"

        : "<p>Aucun contrat daté — les périodes apparaissent quand des contrats ont une date de fin.</p>";



      em.innerHTML = res.expiring.length

        ? "<ul style='margin:0;padding-left:18px'>" +

          res.expiring

            .map(function (e) {

              return (

                "<li style='margin-bottom:8px'><a href=\"./crm-contact.html?id=" +

                encodeURIComponent(e.contactId) +

                '">' +

                esc(e.contactName) +

                "</a> — " +

                esc(e.insurer || "—") +

                " · fin " +

                new Date(e.endDate).toLocaleDateString("fr-FR") +

                ' · <a href="./crm-quote-new.html">Devis renouvellement</a></li>'

              );

            })

            .join("") +

          "</ul>"

        : "<p>Aucune échéance dans les 90 prochains jours ✅</p>";



      document.getElementById("activityMount").innerHTML =

        "<ul style='margin:0;padding-left:18px'>" +

        "<li>Période activée — il y a 2 heures</li>" +

        "<li>Rapport de période généré — il y a 1 jour</li>" +

        "<li>Alerte renouvellement J-45 — il y a 2 jours</li>" +

        (res.expiring.length ? "<li>" + res.expiring.length + " contrat(s) en fenêtre J-90 — maintenant</li>" : "") +

        "</ul>";

    });

  var btnPn = document.getElementById("btnPeriodNotify");
  var boxPn = document.getElementById("periodNotifyBox");
  if (btnPn && boxPn) {
    btnPn.onclick = function () {
      boxPn.classList.toggle("hidden");
      var cfg = {};
      try {
        cfg = JSON.parse(localStorage.getItem("lo_period_notify_cfg") || "{}");
      } catch (e) {}
      boxPn.innerHTML =
        '<p style="margin:0 0 10px;font-size:.9rem"><strong>Rappels de renouvellement</strong> — préférences locales (complète les alertes CRM)</p>' +
        '<label style="display:block;margin:8px 0"><input type="checkbox" id="pnJ90" ' +
        (cfg.j90 !== false ? "checked" : "") +
        ' /> Alerte renouvellement J-90</label>' +
        '<label style="display:block;margin:8px 0"><input type="checkbox" id="pnJ45" ' +
        (cfg.j45 !== false ? "checked" : "") +
        ' /> Rappel J-45</label>' +
        '<label style="display:block;margin:8px 0"><input type="checkbox" id="pnEmail" ' +
        (cfg.email ? "checked" : "") +
        ' /> Email automatique courtier</label>' +
        '<button type="button" class="btn btn-primary btn-sm" id="pnSave" style="margin-top:8px">Enregistrer</button>';
      document.getElementById("pnSave").onclick = function () {
        localStorage.setItem(
          "lo_period_notify_cfg",
          JSON.stringify({
            j90: document.getElementById("pnJ90").checked,
            j45: document.getElementById("pnJ45").checked,
            email: document.getElementById("pnEmail").checked,
          })
        );
        alert("Configuration enregistrée — alertes intelligentes synchronisées (simulation).");
      };
    };
  }

})();


