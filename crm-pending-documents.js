(function () {
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  fetch("/api/crm/pending-documents", {
    headers: { Authorization: "Bearer " + localStorage.getItem("lo_token") },
  })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      var mount = document.getElementById("pendMount");
      if (!res.ok) {
        mount.textContent = res.error || "Erreur";
        return;
      }
      var docs = res.documents || [];
      var quotes = res.quotes || [];
      var reqs = res.requests || [];
      document.getElementById("pendKpis").innerHTML =
        '<div class="kpi-card panel"><div class="kpi-label">Pièces</div><div class="kpi-value">' +
        docs.length +
        '</div></div><div class="kpi-card panel"><div class="kpi-label">Devis</div><div class="kpi-value">' +
        quotes.length +
        '</div></div><div class="kpi-card panel"><div class="kpi-label">Demandes</div><div class="kpi-value">' +
        reqs.length +
        "</div></div>";

      var html = "";
      if (quotes.length) {
        html +=
          "<h2 style='font-size:1rem;margin:20px 0 8px'>Devis en attente</h2><table><thead><tr><th>Réf.</th><th>Client</th><th>Statut</th></tr></thead><tbody>" +
          quotes
            .map(function (q) {
              return (
                "<tr><td><a href='./crm-quote-detail.html?id=" +
                encodeURIComponent(q.id) +
                "'>" +
                esc(q.title || q.id) +
                "</a></td><td><a href='./crm-contact.html?id=" +
                encodeURIComponent(q.contactId) +
                "'>" +
                esc(q.contactName) +
                "</a></td><td>" +
                esc(q.status) +
                "</td></tr>"
              );
            })
            .join("") +
          "</tbody></table>";
      }
      if (reqs.length) {
        html +=
          "<h2 style='font-size:1rem;margin:20px 0 8px'>Demandes assurance</h2><ul>" +
          reqs
            .map(function (r) {
              return (
                "<li><a href='./crm-contact.html?id=" +
                encodeURIComponent(r.contactId) +
                "'>" +
                esc(r.contactName) +
                "</a> — " +
                esc(r.type) +
                " · " +
                esc(r.status) +
                "</li>"
              );
            })
            .join("") +
          "</ul>";
      }
      if (docs.length) {
        html +=
          "<h2 style='font-size:1rem;margin:20px 0 8px'>Pièces jointes événements</h2><ul>" +
          docs
            .map(function (d) {
              return (
                "<li>" +
                esc(d.name) +
                " — " +
                esc(d.contactName) +
                " · <button type='button' class='btn btn-ghost btn-sm btn-approve-doc' data-id='" +
                esc(d.id) +
                "'>Approuver</button></li>"
              );
            })
            .join("") +
          "</ul>";
      }
      if (!html) html = "<p class='panel'>Aucun document en attente.</p>";
      mount.innerHTML = html;
      mount.querySelectorAll(".btn-approve-doc").forEach(function (btn) {
        btn.onclick = function () {
          alert("Document " + btn.getAttribute("data-id") + " marqué approuvé (simulation).");
        };
      });
    });
})();
