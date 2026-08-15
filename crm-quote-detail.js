(function () {
  var TOKEN_KEY = "lo_token";
  var quoteId = new URLSearchParams(location.search).get("id");
  var contact = null;

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function api(path, opts) {
    return fetch(path, {
      method: (opts && opts.method) || "GET",
      headers: Object.assign(
        { "Content-Type": "application/json" },
        token() ? { Authorization: "Bearer " + token() } : {}
      ),
      body: opts && opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (r) {
      return r.json();
    });
  }

  if (!token() || !quoteId) {
    location.href = "./crm-quotes.html";
    return;
  }

  api("/api/crm/quotes?id=" + encodeURIComponent(quoteId)).then(function (res) {
    document.getElementById("quoteLoading").classList.add("hidden");
    if (!res.ok || !res.quote) {
      document.getElementById("quoteLoading").textContent = res.error || "Devis introuvable";
      document.getElementById("quoteLoading").classList.remove("hidden");
      return;
    }
    var q = res.quote;
    document.getElementById("quoteApp").classList.remove("hidden");
    document.getElementById("linkContact").href =
      "./crm-contact.html?id=" + encodeURIComponent(q.contact_id);
    document.getElementById("linkEditDoc").href =
      "./crm-quote-editor.html?id=" + encodeURIComponent(quoteId);
    document.getElementById("linkViewDoc").href =
      "./crm-quote-document.html?id=" + encodeURIComponent(quoteId);
    document.getElementById("statusSelect").value = q.status || "brouillon";

    function renderReading() {
      if (window.CrmQuoteReadingMode) {
        var reading = window.CrmQuoteReadingMode.buildFromQuote(q, contact);
        window.CrmQuoteReadingMode.render(document.getElementById("readingMount"), reading);
      }
    }

    api("/api/crm/contact?id=" + encodeURIComponent(q.contact_id)).then(function (cRes) {
      if (cRes.ok) contact = cRes.contact;
      renderReading();
    });

    document.getElementById("btnPrint").onclick = function () {
      if (window.PrintDocument) window.PrintDocument.fromQuote(q, contact || {});
      else window.print();
    };
    var btnContract = document.getElementById("btnCreateContract");
    if (btnContract) {
      btnContract.href =
        "./crm-quote-contract-wizard.html?type=contract&contactId=" + encodeURIComponent(q.contact_id);
    }
    document.getElementById("btnSendQuote").onclick = function (e) {
      e.preventDefault();
      var docUrl =
        location.origin + "/crm-quote-document.html?id=" + encodeURIComponent(quoteId);
      var subj = encodeURIComponent("Votre devis Leads Opportunities");
      var body = encodeURIComponent(
        "Bonjour,\n\nVeuillez consulter votre devis Leads Opportunities :\n" +
          docUrl +
          "\n\nPour valider, repondez a cet e-mail.\n\nBien cordialement,\nLeads Opportunities"
      );
      var mail = contact && contact.email ? contact.email : "";
      location.href = "mailto:" + encodeURIComponent(mail) + "?subject=" + subj + "&body=" + body;
    };
    document.getElementById("btnSaveStatus").onclick = function () {
      api("/api/crm/quotes?id=" + encodeURIComponent(quoteId), {
        method: "PATCH",
        body: { status: document.getElementById("statusSelect").value },
      }).then(function (r2) {
        if (r2.ok) {
          q.status = document.getElementById("statusSelect").value;
          renderReading();
          alert("Statut mis à jour");
        } else alert(r2.error || "Erreur");
      });
    };
  });
})();
