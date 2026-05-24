(function () {
  var items = [];
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function render(list) {
    var mount = document.getElementById("bankMount");
    if (!list.length) {
      mount.innerHTML = "<p class='panel'>Aucune coordonnée bancaire — renseignez l'IBAN via le wizard devis→contrat ou la fiche contact.</p>";
      return;
    }
    mount.innerHTML =
      "<table><thead><tr><th>Client</th><th>Titulaire</th><th>IBAN</th><th>BIC</th><th></th></tr></thead><tbody>" +
      list
        .map(function (b) {
          return (
            "<tr><td><a href='./crm-contact.html?id=" +
            encodeURIComponent(b.contactId) +
            "'>" +
            esc(b.contactName) +
            "</a></td><td>" +
            esc(b.accountHolder) +
            "</td><td style='font-family:monospace;font-size:.85rem'>" +
            esc(b.iban) +
            "</td><td>" +
            esc(b.bic) +
            "</td><td><a href='./crm-contact.html?id=" +
            encodeURIComponent(b.contactId) +
            "#bank' class='btn btn-ghost btn-sm'>Fiche</a></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
  }

  fetch("/api/crm/bank-details", {
    headers: { Authorization: "Bearer " + localStorage.getItem("lo_token") },
  })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      items = res.ok ? res.items || [] : [];
      render(items);
    });

  document.getElementById("bankSearch").oninput = function (e) {
    var q = e.target.value.trim().toLowerCase();
    if (!q) return render(items);
    render(
      items.filter(function (b) {
        return (
          String(b.contactName || "").toLowerCase().indexOf(q) >= 0 ||
          String(b.iban || "").toLowerCase().indexOf(q) >= 0 ||
          String(b.accountHolder || "").toLowerCase().indexOf(q) >= 0
        );
      })
    );
  };
})();
