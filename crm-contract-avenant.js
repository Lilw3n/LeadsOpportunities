(function () {
  var TOKEN_KEY = "lo_token";
  var params = new URLSearchParams(location.search);
  var contractId = params.get("id");
  var contactId = params.get("contactId");

  if (!localStorage.getItem(TOKEN_KEY) || !contractId || !contactId) {
    location.href = "./crm-contracts.html";
    return;
  }

  document.getElementById("contractId").value = contractId;
  document.getElementById("contactId").value = contactId;
  document.getElementById("backLink").href =
    "./crm-contract-detail.html?id=" + encodeURIComponent(contractId) + "&contactId=" + encodeURIComponent(contactId);

  fetch("/api/crm/contact?id=" + encodeURIComponent(contactId), {
    headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
  })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (!res.ok) return;
      var ct = (res.contracts || []).find(function (c) { return c.id === contractId; });
      if (!ct) return;
      if (ct.premium != null) document.querySelector("[name=premium]").value = ct.premium;
      if (ct.end_date) document.querySelector("[name=endDate]").value = String(ct.end_date).slice(0, 10);
      if (ct.status) document.querySelector("[name=status]").value = ct.status;
    });

  document.getElementById("avenantForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var desc = (fd.get("notes") || "") + "\n[Avenant " + new Date().toLocaleDateString("fr-FR") + "] " + fd.get("avenantType");
    fetch(
      "/api/crm/modules?resource=contracts&contactId=" + encodeURIComponent(contactId) + "&id=" + encodeURIComponent(contractId),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY),
        },
        body: JSON.stringify({
          premium: fd.get("premium") ? Number(fd.get("premium")) : undefined,
          end_date: fd.get("endDate") || undefined,
          status: fd.get("status"),
          description: desc,
        }),
      }
    )
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) {
          document.getElementById("avMsg").textContent = res.error || "Erreur";
          return;
        }
        location.href = document.getElementById("backLink").href;
      });
  };
})();
