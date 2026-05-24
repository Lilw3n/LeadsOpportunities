(function () {
  var TOKEN_KEY = "lo_token";
  function token() { return localStorage.getItem(TOKEN_KEY); }
  function download(name, csv) {
    if (window.CrmExport) window.CrmExport.download(name, csv);
    else {
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
    }
  }
  if (!token()) { location.href = "./crm.html"; return; }

  var msg = document.getElementById("exportMsg");
  function setMsg(t) { if (msg) msg.textContent = t; }

  document.getElementById("btnExportStats").onclick = function () {
    fetch("/api/crm/statistics", { headers: { Authorization: "Bearer " + token() } })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) { setMsg(res.error || "Erreur"); return; }
        var csv =
          "indicateur;valeur\nContacts;" + res.contactsTotal +
          "\nDevis ouverts;" + (res.quotesOpen || 0) +
          "\nContrats signés;" + (res.contractsSigned || 0) +
          "\nSinistres ouverts;" + (res.claimsOpen || 0) +
          "\nLeads 7j;" + (res.leadsWeek || 0);
        download("stats-resume.csv", csv);
        setMsg("Export statistiques téléchargé.");
      });
  };

  document.getElementById("btnExportContacts").onclick = function () {
    fetch("/api/crm/contacts?limit=500", { headers: { Authorization: "Bearer " + token() } })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok || !res.contacts) { setMsg(res.error || "Erreur"); return; }
        var csv = "id;type;prenom;nom;email;telephone\n" + res.contacts.map(function (c) {
          return [c.id, c.contact_type, c.first_name, c.last_name, c.email, c.phone].join(";");
        }).join("\n");
        download("contacts-export.csv", csv);
        setMsg("Contacts exportés.");
      });
  };

  document.getElementById("btnExportQuotes").onclick = function () {
    fetch("/api/crm/quotes", { headers: { Authorization: "Bearer " + token() } })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok || !res.quotes) { setMsg(res.error || "Erreur"); return; }
        var csv = "id;contact_id;statut;montant\n" + res.quotes.map(function (q) {
          return [q.id, q.contact_id, q.status, q.total_premium || q.amount].join(";");
        }).join("\n");
        download("devis-export.csv", csv);
        setMsg("Devis exportés.");
      });
  };
})();
