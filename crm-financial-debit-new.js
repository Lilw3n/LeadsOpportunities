(function () {
  var KEY = "lo_financial_manual";
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }
  document.getElementById("debitForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var list = [];
    try {
      list = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (err) {}
    list.unshift({
      id: "deb_m_" + Date.now(),
      type: "debit",
      label: fd.get("label"),
      amount: Number(fd.get("amount")),
      status: fd.get("status"),
      contactId: "",
      contactName: "Fournisseur",
      manual: true,
    });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
    location.href = "./crm-financial-debits.html";
  };
})();
