(function () {
  var TOKEN_KEY = "lo_token";
  var vehicleId = new URLSearchParams(location.search).get("id");
  var contactId = new URLSearchParams(location.search).get("contactId");

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  if (!localStorage.getItem(TOKEN_KEY) || !vehicleId || !contactId) {
    location.href = "./crm-vehicles.html";
    return;
  }

  fetch("/api/crm/contact?id=" + encodeURIComponent(contactId), {
    headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      document.getElementById("vehLoading").classList.add("hidden");
      if (!res.ok) return;
      var v = (res.vehicles || []).find(function (x) {
        return x.id === vehicleId;
      });
      if (!v) {
        document.getElementById("vehLoading").textContent = "Véhicule introuvable";
        document.getElementById("vehLoading").classList.remove("hidden");
        return;
      }
      var name = ((res.contact.first_name || "") + " " + (res.contact.last_name || "")).trim();
      document.getElementById("vehApp").classList.remove("hidden");
      document.getElementById("vehApp").innerHTML =
        "<h1>" +
        esc(v.registration || "Véhicule") +
        "</h1><p>" +
        esc((v.brand || "") + " " + (v.model || "")) +
        (v.year ? " · " + v.year : "") +
        "</p><dl style='display:grid;grid-template-columns:140px 1fr;gap:8px;margin-top:16px'>" +
        "<dt>Type</dt><dd>" +
        esc(v.vehicle_type) +
        "</dd><dt>Statut</dt><dd>" +
        esc(v.status) +
        "</dd></dl><p style='margin-top:20px'><a href='./crm-contact.html?id=" +
        encodeURIComponent(contactId) +
        "'>" +
        esc(name) +
        " — fiche contact</a></p><p><a href='./crm-eligibility-test.html?product=vtc-taxi'>Tester éligibilité VTC →</a></p>";
    });
})();
