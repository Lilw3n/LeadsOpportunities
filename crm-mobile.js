(function () {
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }
  var token = localStorage.getItem("lo_token");
  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  fetch("/api/crm/overview", { headers: { Authorization: "Bearer " + token } })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d.ok) return;
      document.getElementById("mobKpis").innerHTML =
        '<div class="mob-kpi"><strong>' + (d.quotesOpen || 0) + '</strong>Devis</div>' +
        '<div class="mob-kpi"><strong>' + (d.contractsSigned || 0) + '</strong>Contrats</div>' +
        '<div class="mob-kpi"><strong>' + (d.claimsActive || 0) + '</strong>Sinistres</div>' +
        '<div class="mob-kpi"><strong>' + (d.leadsWeek || 0) + '</strong>Leads 7j</div>';
    });

  fetch("/api/crm/contacts?limit=12", { headers: { Authorization: "Bearer " + token } })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      var el = document.getElementById("mobContacts");
      if (!res.ok || !res.contacts) {
        el.innerHTML = "<p style='padding:12px'>Aucun contact</p>";
        return;
      }
      el.innerHTML = res.contacts
        .map(function (c) {
          var name = ((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email;
          return (
            '<a class="mob-card" href="./crm-contact.html?id=' + encodeURIComponent(c.id) + '">' +
            "<strong>" + esc(name) + "</strong><br><span style='font-size:.85rem;color:#64748b'>" +
            esc(c.contact_type) + "</span></a>"
          );
        })
        .join("");
    });
})();
