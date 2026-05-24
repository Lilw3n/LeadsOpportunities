(function () {
  var TOKEN_KEY = "lo_token";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }

  var sessions = [];
  try {
    sessions = JSON.parse(localStorage.getItem("lead_analysis_sessions") || "[]");
  } catch (e) {}

  var filter = "";

  function render() {
    var el = document.getElementById("leadsMount");
    var list = sessions.filter(function (s) {
      if (!filter) return true;
      return (s.leadQualification || {}).leadCategory === filter;
    });

    if (!sessions.length) {
      el.innerHTML =
        "<p>Aucune session locale — testez <a href='./external/assurance/devis-intelligent.html'>Devis intelligent IA</a></p>";
      return;
    }

    var hot = sessions.filter(function (s) {
      return (s.leadQualification || {}).leadCategory === "hot";
    }).length;

    el.innerHTML =
      '<div class="crm-kpis" style="margin-bottom:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px">' +
      '<div class="kpi-card panel"><div class="kpi-label">Sessions</div><div class="kpi-value">' +
      sessions.length +
      '</div></div><div class="kpi-card panel"><div class="kpi-label">🔥 Hot</div><div class="kpi-value">' +
      hot +
      "</div></div></div>" +
      '<p style="margin-bottom:12px"><button type="button" class="btn btn-ghost btn-sm filt-btn active" data-f="">Tous</button> ' +
      '<button type="button" class="btn btn-ghost btn-sm filt-btn" data-f="hot">Hot</button> ' +
      '<button type="button" class="btn btn-ghost btn-sm filt-btn" data-f="warm">Warm</button> ' +
      '<button type="button" class="btn btn-ghost btn-sm filt-btn" data-f="cold">Cold</button> ' +
      '<button type="button" id="btnExportLeads" class="btn btn-ghost btn-sm">Exporter CSV</button></p>';

    if (!list.length) {
      el.innerHTML += "<p>Aucune session pour ce filtre.</p>";
      bind();
      return;
    }

    el.innerHTML +=
      "<table><thead><tr><th>Date</th><th>Client</th><th>Produit</th><th>Faisabilité</th><th>Catégorie</th><th>Commission</th><th></th></tr></thead><tbody>" +
      list
        .map(function (s) {
          var q = s.leadQualification || {};
          var f = s.feasibilityAnalysis || {};
          var p = (s.sessionData && s.sessionData.clientProfile && s.sessionData.clientProfile.personalInfo) || {};
          var name = ((p.firstName || "") + " " + (p.lastName || "")).trim() || p.email || "—";
          return (
            "<tr><td>" +
            new Date(Number(String(s.id).replace("lead_", "")) || Date.now()).toLocaleDateString("fr-FR") +
            "</td><td>" +
            esc(name) +
            "</td><td>" +
            esc((s.sessionData && s.sessionData.needs && s.sessionData.needs.primaryInsurance) || "—") +
            "</td><td>" +
            (f.overallFeasibility || "—") +
            "%</td><td>" +
            esc(q.leadCategory || "—") +
            "</td><td>" +
            ((q.revenueEstimate && q.revenueEstimate.commission) || "—") +
            " €</td><td><button type='button' class='btn btn-ghost btn-sm btn-relance' data-email='" +
            esc(p.email || "") +
            "'>Relancer</button></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";

    bind();
  }

  function bind() {
    document.querySelectorAll(".filt-btn").forEach(function (btn) {
      btn.onclick = function () {
        filter = btn.getAttribute("data-f");
        document.querySelectorAll(".filt-btn").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        render();
      };
    });
    var ex = document.getElementById("btnExportLeads");
    if (ex) {
      ex.onclick = function () {
        var csv =
          "date;client;produit;faisabilite;categorie;commission\n" +
          sessions
            .map(function (s) {
              var q = s.leadQualification || {};
              var f = s.feasibilityAnalysis || {};
              var p = (s.sessionData && s.sessionData.clientProfile && s.sessionData.clientProfile.personalInfo) || {};
              return [
                s.id,
                ((p.firstName || "") + " " + (p.lastName || "")).trim(),
                (s.sessionData.needs && s.sessionData.needs.primaryInsurance) || "",
                f.overallFeasibility || "",
                q.leadCategory || "",
                (q.revenueEstimate && q.revenueEstimate.commission) || "",
              ].join(";");
            })
            .join("\n");
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        a.download = "leads-ia-" + new Date().toISOString().slice(0, 10) + ".csv";
        a.click();
      };
    }
    document.querySelectorAll(".btn-relance").forEach(function (btn) {
      btn.onclick = function () {
        var em = btn.getAttribute("data-email");
        if (em) location.href = "mailto:" + em + "?subject=Suite à votre analyse assurance";
        else alert("Email non renseigné dans la session.");
      };
    });
  }

  render();
})();
