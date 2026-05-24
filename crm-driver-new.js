(function () {
  var TOKEN_KEY = "lo_token";
  if (!localStorage.getItem(TOKEN_KEY)) location.href = "./crm.html";

  document.getElementById("drvForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var contactId = fd.get("contactId");
    fetch("/api/crm/modules?resource=drivers&contactId=" + encodeURIComponent(contactId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY),
      },
      body: JSON.stringify({
        first_name: fd.get("firstName"),
        last_name: fd.get("lastName"),
        license_number: fd.get("licenseNumber") || null,
        license_type: fd.get("licenseType") || null,
        status: fd.get("status") || "Actif",
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) {
          document.getElementById("drvMsg").textContent = res.error || "Erreur";
          return;
        }
        location.href = "./crm-driver-detail.html?id=" + encodeURIComponent(res.item.id) + "&contactId=" + encodeURIComponent(contactId);
      });
  };
})();
