(function () {
  var KEY = "lo_crm_periods_manual";
  if (!localStorage.getItem("lo_token")) location.href = "./crm.html";

  document.getElementById("periodForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var name = fd.get("name") || "Période " + fd.get("quarter");
    var list = [];
    try {
      list = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (err) {}
    list.unshift({
      id: "per_" + Date.now(),
      name: name,
      quarter: fd.get("quarter"),
      status: fd.get("status") || "En attente",
      description: fd.get("description") || "",
      contracts: 0,
      totalPremium: 0,
      claims: 0,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(KEY, JSON.stringify(list));
    location.href = "./crm-periods.html";
  };
})();
