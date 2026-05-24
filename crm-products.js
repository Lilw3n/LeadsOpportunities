(function () {
  if (!localStorage.getItem("lo_token")) location.href = "./crm.html";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function render() {
    var q = document.getElementById("prodSearch").value.toLowerCase();
    var cat = document.getElementById("prodFilter").value;
    var list = window.CrmProductService.all().filter(function (p) {
      if (cat && p.category !== cat) return false;
      if (q && p.name.toLowerCase().indexOf(q) < 0 && (p.description || "").toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    document.getElementById("prodGrid").innerHTML = list
      .map(function (p) {
        return (
          '<article class="prod-card">' +
          '<span class="prod-badge">' +
          esc(p.category) +
          "</span>" +
          '<span class="prod-badge">' +
          esc(p.type) +
          "</span>" +
          "<h3>" +
          esc(p.name) +
          "</h3>" +
          '<p class="prod-meta">' +
          esc(p.description) +
          "</p>" +
          "<p style='margin:12px 0 0'><strong>" +
          Number(p.price).toLocaleString("fr-FR") +
          " €</strong> · Commission " +
          p.commission +
          "%</p>" +
          '<p class="prod-meta">Cibles : ' +
          esc((p.audience || []).join(", ")) +
          "</p>" +
          '<p style="margin-top:10px"><a href="./crm-quote-new.html?productId=' +
          encodeURIComponent(p.id) +
          '" class="btn btn-primary btn-sm">+ Devis</a> ' +
          '<a href="./crm-contract-new.html?productId=' +
          encodeURIComponent(p.id) +
          '" class="btn btn-ghost btn-sm">+ Contrat</a></p>' +
          "</article>"
        );
      })
      .join("");
  }

  document.getElementById("prodSearch").oninput = render;
  document.getElementById("prodFilter").onchange = render;
  render();
})();
