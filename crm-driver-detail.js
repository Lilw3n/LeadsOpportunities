(function () {
  var TOKEN_KEY = "lo_token";
  var driverId = new URLSearchParams(location.search).get("id");
  var contactId = new URLSearchParams(location.search).get("contactId");

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  if (!localStorage.getItem(TOKEN_KEY) || !driverId || !contactId) {
    location.href = "./crm-drivers.html";
    return;
  }

  fetch("/api/crm/contact?id=" + encodeURIComponent(contactId), {
    headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      document.getElementById("drvLoading").classList.add("hidden");
      if (!res.ok) return;
      var d = (res.drivers || []).find(function (x) {
        return x.id === driverId;
      });
      if (!d) {
        document.getElementById("drvLoading").textContent = "Conducteur introuvable";
        document.getElementById("drvLoading").classList.remove("hidden");
        return;
      }
      var name = ((res.contact.first_name || "") + " " + (res.contact.last_name || "")).trim();
      var full = ((d.first_name || "") + " " + (d.last_name || "")).trim();
      document.getElementById("drvApp").classList.remove("hidden");
      document.getElementById("drvApp").innerHTML =
        "<h1>" +
        esc(full || "Conducteur") +
        "</h1><dl style='display:grid;grid-template-columns:160px 1fr;gap:8px;margin-top:16px'>" +
        "<dt>Permis</dt><dd>" +
        esc(d.license_type || "—") +
        (d.license_number ? " · " + esc(d.license_number) : "") +
        "</dd><dt>Date permis</dt><dd>" +
        (d.license_date ? new Date(d.license_date).toLocaleDateString("fr-FR") : "—") +
        "</dd><dt>Statut</dt><dd>" +
        esc(d.status) +
        "</dd></dl>" +
        "<p style='margin-top:20px'><a href='./crm-contact.html?id=" +
        encodeURIComponent(contactId) +
        "'>" +
        esc(name) +
        " — fiche contact</a></p>" +
        "<p><a href='./crm-eligibility-test.html?product=vtc-taxi'>Tester éligibilité VTC →</a></p>";
    });
})();
