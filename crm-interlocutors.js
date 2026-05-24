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

  var all = [];

  function render(list) {
    var mount = document.getElementById("intMount");
    var kpis = document.getElementById("intKpis");
    if (kpis) {
      var clients = list.filter(function (c) { return c.contact_type === "client"; }).length;
      kpis.innerHTML =
        '<div class="kpi-card panel"><div class="kpi-label">Total</div><div class="kpi-value">' +
        list.length +
        '</div></div><div class="kpi-card panel"><div class="kpi-label">Clients</div><div class="kpi-value">' +
        clients +
        "</div></div>";
    }
    if (!list.length) {
      mount.innerHTML = "<p>Aucun interlocuteur</p>";
      return;
    }
    mount.innerHTML =
      "<table><thead><tr><th>Nom</th><th>Type</th><th>Email</th><th>Entreprise</th><th>Actions</th></tr></thead><tbody>" +
      list
        .map(function (c) {
          var name = ((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email || "—";
          return (
            "<tr><td><a href='./crm-contact.html?id=" +
            encodeURIComponent(c.id) +
            "'>" +
            esc(name) +
            "</a></td><td>" +
            esc(c.contact_type) +
            "</td><td>" +
            esc(c.email || "—") +
            "</td><td>" +
            esc(c.company || "—") +
            "</td><td><a href='./crm-contact-modules.html?id=" +
            encodeURIComponent(c.id) +
            "'>Modules</a> · <a href='./crm-interlocutor-social.html?id=" +
            encodeURIComponent(c.id) +
            "'>Social</a> · <a href='./crm-simulate.html'>Simuler</a></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function load(q) {
    var url = "/api/crm/contacts?limit=150";
    if (q && q.length >= 2) url += "&search=" + encodeURIComponent(q);
    fetch(url, { headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) } })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) {
          document.getElementById("intMount").innerHTML = "<p>Erreur</p>";
          return;
        }
        all = res.contacts || [];
        var type = document.getElementById("intFilterType");
        var ft = type ? type.value : "";
        var list = all;
        if (ft) list = list.filter(function (c) { return c.contact_type === ft; });
        if (q && q.length >= 2) {
          var ql = q.toLowerCase();
          list = list.filter(function (c) {
            var hay = ((c.first_name || "") + " " + (c.last_name || "") + " " + (c.email || "") + " " + (c.company || "")).toLowerCase();
            return hay.indexOf(ql) >= 0;
          });
        }
        render(list);
      });
  }

  var timer;
  document.getElementById("intSearch").oninput = function () {
    clearTimeout(timer);
    timer = setTimeout(function () { load(document.getElementById("intSearch").value.trim()); }, 280);
  };
  var ft = document.getElementById("intFilterType");
  if (ft) ft.onchange = function () { load(document.getElementById("intSearch").value.trim()); };

  load("");
})();
