(function () {
  var KEY = "lo_financial_manual";
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }
  document.getElementById("payForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var list = [];
    try {
      list = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (err) {}
    list.unshift({
      id: "pay_m_" + Date.now(),
      type: "payment",
      label: fd.get("label"),
      amount: Number(fd.get("amount")),
      status: fd.get("status"),
      contactId: fd.get("contactId") || "",
      contactName: fd.get("contactId") ? "Client " + fd.get("contactId") : "—",
      manual: true,
    });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
    location.href = "./crm-financial-payments.html";
  };
})();
