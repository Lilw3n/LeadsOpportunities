(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var items = [];
  var revealed = {};

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function maskIban(iban) {
    var s = String(iban || "").replace(/\s/g, "");
    if (s.length < 8) return "—";
    return s.slice(0, 4) + " •••• •••• •••• " + s.slice(-4);
  }

  function render(list) {
    var mount = document.getElementById("bankMount");
    if (!list.length) {
      mount.innerHTML =
        '<div class="crm-empty-state"><h3>Aucune coordonnée bancaire</h3>' +
        "<p>Renseignez l'IBAN via le wizard devis→contrat ou la fiche contact.</p>" +
        '<p style="margin-top:14px"><a class="btn btn-primary" href="./crm-quote-contract-wizard.html">Wizard devis→contrat</a> ' +
        '<a class="btn btn-ghost" href="./crm-contact.html">Fiches contacts</a></p></div>';
      return;
    }
    mount.innerHTML =
      "<table><thead><tr><th>Client</th><th>Titulaire</th><th>IBAN</th><th>BIC</th><th></th></tr></thead><tbody>" +
      list
        .map(function (b, i) {
          var key = b.contactId + "-" + i;
          var showFull = !!revealed[key];
          var ibanDisplay = showFull ? esc(b.iban) : esc(maskIban(b.iban));
          return (
            "<tr><td><a href='./crm-contact.html?id=" +
            encodeURIComponent(b.contactId) +
            "'>" +
            esc(b.contactName) +
            "</a></td><td>" +
            esc(b.accountHolder) +
            "</td><td style='font-family:monospace;font-size:.85rem'>" +
            ibanDisplay +
            " <button type='button' class='btn btn-ghost btn-sm btn-reveal-iban' data-key='" +
            esc(key) +
            "'>" +
            (showFull ? "Masquer" : "Afficher") +
            "</button></td><td>" +
            esc(b.bic) +
            "</td><td><a href='./crm-contact.html?id=" +
            encodeURIComponent(b.contactId) +
            "#bank' class='btn btn-ghost btn-sm'>Fiche</a></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";

    mount.querySelectorAll(".btn-reveal-iban").forEach(function (btn) {
      btn.onclick = function () {
        var k = btn.getAttribute("data-key");
        revealed[k] = !revealed[k];
        render(list);
      };
    });
  }

  document.getElementById("bankMount").innerHTML = '<div class="panel">Chargement…</div>';

  fetch("/api/crm/bank-details", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (r) {
      return r.json().then(function (body) {
        return { ok: r.ok, body: body };
      });
    })
    .then(function (res) {
      if (!res.ok || !res.body.ok) {
        document.getElementById("bankMount").innerHTML =
          '<div class="crm-empty-state"><h3>Accès refusé ou erreur</h3><p>' +
          esc((res.body && res.body.error) || "Impossible de charger les coordonnées.") +
          "</p></div>";
        return;
      }
      items = res.body.items || [];
      render(items);
    })
    .catch(function () {
      document.getElementById("bankMount").innerHTML =
        '<div class="crm-empty-state"><h3>Erreur réseau</h3><p>Réessayez ou reconnectez-vous au CRM.</p></div>';
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
