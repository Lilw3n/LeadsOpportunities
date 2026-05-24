(function () {
  var TOKEN_KEY = "lo_token";
  if (!localStorage.getItem(TOKEN_KEY)) location.href = "./crm.html";

  document.getElementById("reqForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var contactId = fd.get("contactId");
    fetch("/api/crm/modules?resource=insurance-requests&contactId=" + encodeURIComponent(contactId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY),
      },
      body: JSON.stringify({
        request_type: fd.get("requestType"),
        status: "En attente",
        description: (fd.get("description") || "") + (fd.get("productType") ? "\nProduit: " + fd.get("productType") : ""),
        amount: fd.get("amount") ? Number(fd.get("amount")) : null,
        priority: fd.get("priority") || "Moyenne",
        requested_date: new Date().toISOString().slice(0, 10),
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) {
          document.getElementById("reqMsg").textContent = res.error || "Erreur";
          return;
        }
        location.href = "./crm-contact.html?id=" + encodeURIComponent(contactId);
      });
  };
})();
