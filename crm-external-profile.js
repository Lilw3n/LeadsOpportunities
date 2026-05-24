(function () {
  if (!localStorage.getItem("lo_token")) location.href = "./crm.html";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  document.getElementById("btnLookup").onclick = function () {
    var email = document.getElementById("extEmail").value.trim();
    var box = document.getElementById("extProfile");
    if (!email) return;
    box.innerHTML = "<p>Recherche…</p>";
    fetch("/api/crm/universal-search?q=" + encodeURIComponent(email) + "&entity=contacts", {
      headers: { Authorization: "Bearer " + localStorage.getItem("lo_token") },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        var c = res.ok && res.results && res.results.contacts && res.results.contacts[0];
        if (!c) {
          box.innerHTML = "<p>Aucun contact pour cet e-mail.</p>";
          return;
        }
        return fetch("/api/crm/contact?id=" + encodeURIComponent(c.id), {
          headers: { Authorization: "Bearer " + localStorage.getItem("lo_token") },
        }).then(function (r2) {
          return r2.json();
        }).then(function (full) {
          if (!full.ok) {
            box.innerHTML = "<p>Fiche introuvable.</p>";
            return;
          }
          var ct = full.contact;
          var name = ((ct.first_name || "") + " " + (ct.last_name || "")).trim();
          box.innerHTML =
            "<h2 style='margin:0 0 8px'>" +
            esc(name) +
            "</h2>" +
            "<p style='color:var(--muted)'>" +
            esc(ct.email) +
            " · " +
            esc(ct.phone || "—") +
            " · " +
            esc(ct.contact_type) +
            "</p>" +
            "<div class='crm-kpis' style='margin:16px 0'>" +
            '<div class="kpi-card panel"><div class="kpi-label">Contrats</div><div class="kpi-value">' +
            (full.contracts || []).length +
            '</div></div><div class="kpi-card panel"><div class="kpi-label">Devis</div><div class="kpi-value">' +
            (full.quotes || []).length +
            '</div></div><div class="kpi-card panel"><div class="kpi-label">Sinistres</div><div class="kpi-value">' +
            (full.claims || []).length +
            "</div></div></div>" +
            '<p><a href="./crm-contact.html?id=' +
            encodeURIComponent(c.id) +
            '" class="btn btn-primary">Ouvrir fiche CRM</a> ' +
            '<a href="./crm-simulate.html?contactId=' +
            encodeURIComponent(c.id) +
            '" class="btn btn-ghost">Simulation portail</a> ' +
            '<a href="./external/index.html" class="btn btn-ghost" target="_blank" rel="noopener">Portail client</a></p>';
        });
      });
  };

  var params = new URLSearchParams(location.search);
  if (params.get("email")) {
    document.getElementById("extEmail").value = params.get("email");
    document.getElementById("btnLookup").click();
  }
})();
