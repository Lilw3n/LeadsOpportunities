(function () {
  var TOKEN_KEY = "lo_token";
  var params = new URLSearchParams(location.search);
  var quoteId = params.get("id");
  var token = localStorage.getItem(TOKEN_KEY);

  if (!token || !quoteId) {
    location.href = "./crm.html";
    return;
  }

  document.getElementById("backLink").href =
    "./crm-quote-detail.html?id=" + encodeURIComponent(quoteId);
  document.getElementById("editLink").href =
    "./crm-quote-editor.html?id=" + encodeURIComponent(quoteId);

  document.getElementById("btnPrint").onclick = function () {
    var frame = document.getElementById("docFrame");
    if (frame && frame.contentWindow) frame.contentWindow.print();
    else window.print();
  };

  document.getElementById("btnSendMail").onclick = function () {
    fetch("/api/crm/quotes?id=" + encodeURIComponent(quoteId), {
      headers: { Authorization: "Bearer " + token },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) return;
        return fetch("/api/crm/contact?id=" + encodeURIComponent(res.quote.contact_id), {
          headers: { Authorization: "Bearer " + token },
        })
          .then(function (r2) {
            return r2.json();
          })
          .then(function (cRes) {
            var email = (cRes.contact && cRes.contact.email) || "";
            var docUrl =
              location.origin +
              "/crm-quote-document.html?id=" +
              encodeURIComponent(quoteId);
            var subj = encodeURIComponent("Votre devis Leads Opportunities");
            var body = encodeURIComponent(
              "Bonjour,\n\nVeuillez trouver votre devis Leads Opportunities.\n\n" +
                "Consultez-le ici : " +
                docUrl +
                "\n\nPour valider, repondez a cet e-mail ou contactez-nous.\n\nBien cordialement,\nLeads Opportunities"
            );
            location.href = "mailto:" + encodeURIComponent(email) + "?subject=" + subj + "&body=" + body;
          });
      });
  };

  fetch("/api/crm/quote-document?id=" + encodeURIComponent(quoteId) + "&format=html", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (r) {
      if (!r.ok) throw new Error("Erreur " + r.status);
      return r.text();
    })
    .then(function (html) {
      document.getElementById("docStatus").hidden = true;
      var wrap = document.getElementById("docFrameWrap");
      wrap.hidden = false;
      var frame = document.getElementById("docFrame");
      frame.srcdoc = html;
    })
    .catch(function (e) {
      document.getElementById("docStatus").textContent =
        "Impossible de charger le devis : " + String(e);
    });
})();
