(function () {
  var TOKEN_KEY = "lo_token";
  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var type = params.get("type") || "receivables";
  var typeLabels = { receivables: "Créance", payments: "Paiement", debits: "Débit" };

  if (!localStorage.getItem(TOKEN_KEY) || !id) {
    location.href = "./crm-financial.html";
    return;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function manualEntry() {
    try {
      var all = JSON.parse(localStorage.getItem("lo_financial_manual") || "[]");
      return all.find(function (m) {
        return m.id === id;
      });
    } catch (e) {
      return null;
    }
  }

  function renderRich(e) {
    document.title = (e.label || typeLabels[type]) + " | Financier";
    var docs = [
      { name: "Facture_" + id.slice(0, 8) + ".pdf", type: "Facture", size: "245 Ko" },
      { name: "Reçu_paiement.pdf", type: "Reçu", size: "156 Ko" },
    ];
    var history = [
      { date: new Date().toLocaleString("fr-FR"), action: "Consultation fiche", user: "CRM" },
      { date: "—", action: "Statut : " + (e.status || "—"), user: "Système" },
    ];
    if (e.manual) history.unshift({ date: new Date().toLocaleString("fr-FR"), action: "Saisie manuelle", user: "Agent" });

    document.getElementById("detailMount").innerHTML =
      '<section class="crm-page-panel crm-gradient-panel"><div><p class="crm-eyebrow">Finance</p><h2>' +
      esc(e.label) +
      '</h2><p class="crm-muted-inline">Réf. ' +
      esc(id) +
      "</p></div></section>" +
      '<nav style="font-size:.85rem;color:var(--muted);margin-bottom:12px"><a href="./crm-financial.html">Financier</a> → <a href="./crm-financial-' +
      (type === "payments" ? "payments" : type === "debits" ? "debits" : "receivables") +
      '.html">' +
      esc(typeLabels[type] + "s") +
      "</a></nav>" +
      '<div class="crm-kpis" style="margin:20px 0">' +
      '<div class="kpi-card panel"><div class="kpi-label">Montant</div><div class="kpi-value">' +
      Number(e.amount).toLocaleString("fr-FR") +
      " €</div></div>" +
      '<div class="kpi-card panel"><div class="kpi-label">Statut</div><div class="kpi-value" style="font-size:1rem">' +
      esc(e.status) +
      "</div></div>" +
      '<div class="kpi-card panel"><div class="kpi-label">Assureur</div><div class="kpi-value" style="font-size:1rem">' +
      esc(e.insurer || "—") +
      "</div></div></div>" +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
      '<section class="panel"><h2 style="margin-top:0;font-size:1rem">Client</h2>' +
      "<p><strong>" +
      esc(e.contactName) +
      '</strong></p><p style="font-size:.9rem;color:var(--muted)">' +
      (e.contactEmail ? esc(e.contactEmail) : "") +
      "</p>" +
      '<p style="margin-top:10px"><a href="./crm-contact.html?id=' +
      encodeURIComponent(e.contactId) +
      '" class="btn btn-ghost btn-sm">Fiche contact</a></p></section>' +
      '<section class="panel"><h2 style="margin-top:0;font-size:1rem">Coordonnées bancaires</h2>' +
      "<p style='font-size:.9rem'>IBAN : FR76 •••• •••• •••• (masqué)</p>" +
      "<p style='font-size:.9rem;color:var(--muted)'>Transaction : TXN-" +
      esc(id.slice(0, 12)) +
      "</p></section></div>" +
      '<section class="panel" style="margin-top:16px"><h2 style="margin-top:0;font-size:1rem">Documents</h2><ul style="margin:0;padding-left:18px">' +
      docs
        .map(function (d) {
          return "<li>" + esc(d.name) + " — " + esc(d.type) + " (" + esc(d.size) + ")</li>";
        })
        .join("") +
      "</ul></section>" +
      '<section class="panel" style="margin-top:16px"><h2 style="margin-top:0;font-size:1rem">Historique</h2><table><thead><tr><th>Date</th><th>Action</th><th>Par</th></tr></thead><tbody>" +
      history
        .map(function (h) {
          return "<tr><td>" + esc(h.date) + "</td><td>" + esc(h.action) + "</td><td>" + esc(h.user) + "</td></tr>";
        })
        .join("") +
      "</tbody></table></section>" +
      '<p style="margin-top:16px">' +
      (e.contactId && !e.manual
        ? "<a href='./crm-contract-detail.html?id=" +
          encodeURIComponent(e.id) +
          "&contactId=" +
          encodeURIComponent(e.contactId) +
          "' class='btn btn-ghost'>Voir contrat lié</a> "
        : "") +
      "<a href='./crm-pending-documents.html' class='btn btn-ghost'>Documents en attente</a></p>";
  }

  var manual = manualEntry();
  if (manual) {
    renderRich({
      id: manual.id,
      label: manual.label || typeLabels[type],
      amount: manual.amount,
      status: manual.status || "En attente",
      contactId: manual.contactId || "",
      contactName: manual.contactName || "—",
      insurer: manual.insurer,
      manual: true,
    });
    return;
  }

  fetch("/api/crm/financial-entries?type=" + encodeURIComponent(type) + "&id=" + encodeURIComponent(id), {
    headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (res) {
      if (!res.ok || !res.entry) {
        document.getElementById("detailMount").innerHTML = "<p>Introuvable</p>";
        return;
      }
      renderRich(res.entry);
    });
})();
