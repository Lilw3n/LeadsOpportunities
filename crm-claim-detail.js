(function () {
  var TOKEN_KEY = "lo_token";
  var claimId = new URLSearchParams(location.search).get("id");
  var contactId = new URLSearchParams(location.search).get("contactId");

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  if (!localStorage.getItem(TOKEN_KEY) || !claimId || !contactId) {
    location.href = "./crm-claims.html";
    return;
  }

  fetch("/api/crm/contact?id=" + encodeURIComponent(contactId), {
    headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      document.getElementById("claimLoading").classList.add("hidden");
      if (!res.ok) return;
      var cl = (res.claims || []).find(function (x) {
        return x.id === claimId;
      });
      if (!cl) {
        document.getElementById("claimLoading").textContent = "Sinistre introuvable";
        document.getElementById("claimLoading").classList.remove("hidden");
        return;
      }
      var name = ((res.contact.first_name || "") + " " + (res.contact.last_name || "")).trim();
      document.getElementById("claimApp").classList.remove("hidden");
      document.getElementById("claimApp").innerHTML =
        "<h1>Sinistre " +
        esc(cl.claim_type || "—") +
        "</h1><p>Statut : <strong>" +
        esc(cl.status) +
        "</strong></p>" +
        "<dl style='display:grid;grid-template-columns:160px 1fr;gap:8px;margin-top:16px'>" +
        "<dt>Date</dt><dd>" +
        (cl.claim_date ? new Date(cl.claim_date).toLocaleDateString("fr-FR") : "—") +
        "</dd><dt>Montant</dt><dd>" +
        (cl.amount != null ? Number(cl.amount).toLocaleString("fr-FR") + " €" : "—") +
        "</dd><dt>Description</dt><dd>" +
        esc(cl.description || "—") +
        "</dd></dl>" +
        "<p style='margin-top:20px;display:flex;flex-wrap:wrap;gap:8px'>" +
        '<button type="button" class="btn btn-ghost" id="btnPrintClaim">Imprimer / PDF</button>' +
        "<a class='btn btn-ghost' href='./crm-contact.html?id=" +
        encodeURIComponent(contactId) +
        "'>" +
        esc(name) +
        " — fiche contact</a></p>" +
        "<p><a href='./crm-documents.html'>Documents en attente →</a></p>";
      var btnPrintClaim = document.getElementById("btnPrintClaim");
      if (btnPrintClaim) {
        btnPrintClaim.onclick = function () {
          if (window.PrintDocument) {
            window.PrintDocument.fromClaim(cl, res.contact || {}, { contactName: name });
          }
        };
      }
    });
})();
