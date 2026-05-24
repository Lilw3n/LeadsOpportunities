(function () {
  var TOKEN_KEY = "lo_token";
  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function kpi(label, val) {
    return '<div class="kpi-card panel"><div class="kpi-label">' + label + '</div><div class="kpi-value">' + val + "</div></div>";
  }

  fetch("/api/crm/insurance-requests", {
    headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      var mount = document.getElementById("reqMount");
      if (!res.ok || !res.requests || !res.requests.length) {
        mount.innerHTML =
          '<div class="crm-kpis" style="margin-bottom:16px">' +
          kpi("Total demandes", 0) +
          kpi("En attente", 0) +
          "</div><p>Aucune demande — créez-en depuis une fiche contact.</p>";
        return;
      }

      var reqs = res.requests;
      var pending = reqs.filter(function (r) {
        var s = String(r.status || "").toLowerCase();
        return s.indexOf("attente") >= 0 || s === "pending" || s.indexOf("traiter") >= 0;
      }).length;
      var done = reqs.length - pending;

      var filterStatus = document.getElementById("reqFilterStatus");
      var filterType = document.getElementById("reqFilterType");
      var q = document.getElementById("reqSearch");

      function render() {
        var list = reqs.slice();
        var fs = filterStatus ? filterStatus.value : "";
        var ft = filterType ? filterType.value : "";
        var query = q ? q.value.toLowerCase() : "";
        if (fs) list = list.filter(function (r) { return String(r.status || "").toLowerCase().indexOf(fs) >= 0; });
        if (ft) list = list.filter(function (r) { return String(r.request_type || "").toLowerCase().indexOf(ft) >= 0; });
        if (query) {
          list = list.filter(function (r) {
            var name = ((r.first_name || "") + " " + (r.last_name || "") + " " + (r.contact_email || "")).toLowerCase();
            return name.indexOf(query) >= 0 || String(r.request_type || "").toLowerCase().indexOf(query) >= 0;
          });
        }

        mount.innerHTML =
          '<div class="crm-kpis" style="margin-bottom:16px">' +
          kpi("Total demandes", reqs.length) +
          kpi("En attente", pending) +
          kpi("Traitées", done) +
          "</div>" +
          '<p style="margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px">' +
          '<a href="./crm-insurance-request-new.html" class="btn btn-primary btn-sm">+ Nouvelle demande</a>' +
          '<a href="./crm-create-complete.html" class="btn btn-ghost btn-sm">Dossier complet</a>' +
          '<a href="./crm-documents.html" class="btn btn-ghost btn-sm">Documents en attente</a>' +
          "</p>" +
          "<table><thead><tr><th>Date</th><th>Type</th><th>Produit</th><th>Priorité</th><th>Statut</th><th>Contact</th></tr></thead><tbody>" +
          list
            .map(function (r) {
              var name = ((r.first_name || "") + " " + (r.last_name || "")).trim() || r.contact_email;
              return (
                "<tr><td>" +
                new Date(r.created_at).toLocaleDateString("fr-FR") +
                "</td><td>" +
                esc(r.request_type) +
                "</td><td>" +
                esc(r.product_type || "—") +
                "</td><td>" +
                esc(r.priority || "Moyenne") +
                "</td><td>" +
                esc(r.status) +
                '</td><td><a href="./crm-contact.html?id=' +
                encodeURIComponent(r.contact_id) +
                '">' +
                esc(name) +
                "</a></td></tr>"
              );
            })
            .join("") +
          "</tbody></table>";
      }

      render();
      if (filterStatus) filterStatus.onchange = render;
      if (filterType) filterType.onchange = render;
      if (q) q.oninput = render;
    });
})();
