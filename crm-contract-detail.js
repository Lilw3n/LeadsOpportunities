(function () {
  var TOKEN_KEY = "lo_token";
  var contractId = new URLSearchParams(location.search).get("id");
  var contactId = new URLSearchParams(location.search).get("contactId");

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  if (!token() || !contractId || !contactId) {
    location.href = "./crm-contracts.html";
    return;
  }

  document.getElementById("linkContact").href = "./crm-contact.html?id=" + encodeURIComponent(contactId);
  var linkAv = document.getElementById("linkAvenant");
  if (linkAv) {
    linkAv.href =
      "./crm-contract-avenant.html?id=" +
      encodeURIComponent(contractId) +
      "&contactId=" +
      encodeURIComponent(contactId);
    linkAv.classList.remove("hidden");
  }
  var lastContract = null;
  var lastContact = null;
  var lastExtras = {};

  document.getElementById("btnPrint").onclick = function () {
    if (window.PrintDocument && lastContract) {
      window.PrintDocument.fromContract(lastContract, lastContact || {}, lastExtras);
    } else {
      window.print();
    }
  };

  fetch("/api/crm/contact?id=" + encodeURIComponent(contactId), {
    headers: { Authorization: "Bearer " + token() },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      document.getElementById("contractLoading").classList.add("hidden");
      if (!res.ok) {
        document.getElementById("contractLoading").textContent = res.error || "Erreur";
        document.getElementById("contractLoading").classList.remove("hidden");
        return;
      }
      var contract = (res.contracts || []).find(function (c) {
        return c.id === contractId;
      });
      if (!contract) {
        document.getElementById("contractLoading").textContent = "Contrat introuvable";
        document.getElementById("contractLoading").classList.remove("hidden");
        return;
      }
      var name = ((res.contact.first_name || "") + " " + (res.contact.last_name || "")).trim();
      lastContract = contract;
      lastContact = res.contact;
      lastExtras = {
        contactName: name || res.contact.email,
        vehicles: res.vehicles,
        claims: res.claims,
      };
      window.CrmContractReading.render(document.getElementById("contractMount"), contract, res.contact, lastExtras);
    });
})();
