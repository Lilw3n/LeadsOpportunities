(function () {
  var Lib = window.CrmPretImmo;
  if (!Lib) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  function parseNum(raw) {
    var s = String(raw || "")
      .trim()
      .replace(/\s/g, "")
      .replace(",", ".");
    var n = Number(s);
    return isNaN(n) ? 0 : n;
  }

  function formatInputAmount(n) {
    return Math.round(n).toLocaleString("fr-FR");
  }

  function render() {
    var amount = parseNum(document.getElementById("pvhAmount").value);
    var rate = parseNum(document.getElementById("pvhRate").value);
    var rows = Lib.pvhTable(amount, rate, [5, 10, 15, 20]);
    document.getElementById("pvhBody").innerHTML = rows
      .map(function (r) {
        return (
          "<tr><td>" +
          r.years +
          " ans</td><td>" +
          Lib.euro(r.amount).replace(" €", "") +
          " €</td></tr>"
        );
      })
      .join("");
  }

  document.getElementById("pvhCalc").onclick = render;
  document.getElementById("pvhAmount").addEventListener("change", function () {
    var n = parseNum(this.value);
    if (n > 0) this.value = formatInputAmount(n);
  });
  ["pvhAmount", "pvhRate"].forEach(function (id) {
    document.getElementById(id).addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        render();
      }
    });
  });

  render();
})();
