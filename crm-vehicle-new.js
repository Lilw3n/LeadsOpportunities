(function () {
  var TOKEN_KEY = "lo_token";
  if (!localStorage.getItem(TOKEN_KEY)) location.href = "./crm.html";

  document.getElementById("vehForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var contactId = fd.get("contactId");
    fetch("/api/crm/modules?resource=vehicles&contactId=" + encodeURIComponent(contactId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY),
      },
      body: JSON.stringify({
        registration: fd.get("registration"),
        brand: fd.get("brand") || null,
        model: fd.get("model") || null,
        year: fd.get("year") ? Number(fd.get("year")) : null,
        vehicle_type: fd.get("vehicleType") || "Voiture particuliere",
        status: fd.get("status") || "En attente",
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) {
          document.getElementById("vehMsg").textContent = res.error || "Erreur";
          return;
        }
        location.href = "./crm-vehicle-detail.html?id=" + encodeURIComponent(res.item.id) + "&contactId=" + encodeURIComponent(contactId);
      });
  };
})();
