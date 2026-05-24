(function () {
  var TOKEN_KEY = "lo_token";
  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }

  document.querySelector("[name=claimDate]").value = new Date().toISOString().slice(0, 10);

  document.getElementById("claimForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var contactId = fd.get("contactId");
    fetch("/api/crm/modules?resource=claims&contactId=" + encodeURIComponent(contactId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY),
      },
      body: JSON.stringify({
        claim_type: fd.get("claimType"),
        claim_date: fd.get("claimDate"),
        amount: fd.get("amount") ? Number(fd.get("amount")) : null,
        description: fd.get("description"),
        insurer: fd.get("insurer") || null,
        status: fd.get("status") || "En attente",
        vehicle_id: fd.get("vehicleId") || null,
        driver_id: fd.get("driverId") || null,
        responsible: fd.get("responsible") === "true",
        percentage: fd.get("percentage") ? Number(fd.get("percentage")) : 0,
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) {
          document.getElementById("clMsg").textContent = res.error || "Erreur";
          return;
        }
        var id = (res.item && res.item.id) || "";
        location.href =
          "./crm-claim-detail.html?id=" +
          encodeURIComponent(id) +
          "&contactId=" +
          encodeURIComponent(contactId);
      });
  };
})();
