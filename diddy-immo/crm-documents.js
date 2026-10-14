(function () {

  var TOKEN_KEY = "lo_token";



  function esc(s) {

    var d = document.createElement("div");

    d.textContent = String(s == null ? "" : s);

    return d.innerHTML;

  }



  function linkContact(id, name) {

    return (

      '<a href="./crm-contact.html?id=' + encodeURIComponent(id) + '">' + esc(name) + "</a>"

    );

  }



  function approve(docId, docType, action) {

    return fetch("/api/crm/document-approve", {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY),

      },

      body: JSON.stringify({ documentId: docId, type: docType, action: action }),

    }).then(function (r) {

      return r.json();

    });

  }

  function downloadExport(type, id, eventId, index) {

    var token = localStorage.getItem(TOKEN_KEY);

    var q = "type=" + encodeURIComponent(type);

    if (type === "event-attachment") {

      q += "&eventId=" + encodeURIComponent(eventId) + "&index=" + encodeURIComponent(String(index));

    } else {

      q += "&id=" + encodeURIComponent(id);

    }

    return fetch("/api/crm/document-download?" + q, {

      headers: { Authorization: "Bearer " + token },

    }).then(function (r) {

      if (!r.ok) {

        return r.text().then(function (t) {

          var msg = "Erreur " + r.status;

          try {

            var j = JSON.parse(t);

            if (j && j.error) msg = j.error;

          } catch (ignore) {}

          throw new Error(msg);

        });

      }

      return r.blob();

    }).then(function (blob) {

      var a = document.createElement("a");

      a.href = URL.createObjectURL(blob);

      a.download = (type === "quote" ? "devis-" : type === "request" ? "demande-" : "piece-") + (id || eventId) + ".json";

      a.click();

      URL.revokeObjectURL(a.href);

    }).catch(function (e) {

      alert(e.message || "Erreur telechargement");

    });

  }



  if (!localStorage.getItem(TOKEN_KEY)) {

    location.href = "./crm.html";

    return;

  }



  fetch("/api/crm/pending-documents", {

    headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },

  })

    .then(function (r) {

      return r.json();

    })

    .then(function (res) {

      var dm = document.getElementById("docsMount");

      var qm = document.getElementById("quotesMount");

      var rm = document.getElementById("reqMount");

      if (!res.ok) {

        dm.innerHTML = "<p>Erreur</p>";

        return;

      }

      dm.innerHTML = res.documents.length

        ? "<table><thead><tr><th>Document</th><th>Type</th><th>Contact</th><th>Date</th><th>Actions</th></tr></thead><tbody>" +

          res.documents

            .map(function (d) {

              var parts = String(d.id).split("_att_");

              var evId = parts.length === 2 ? parts[0] : "";

              var attIdx = parts.length === 2 ? parts[1] : "";

              return (

                "<tr><td>" +

                esc(d.name) +

                "</td><td>" +

                esc(d.type) +

                "</td><td>" +

                linkContact(d.contactId, d.contactName) +

                "</td><td>" +

                new Date(d.createdAt).toLocaleDateString("fr-FR") +

                '</td><td>' +

                (evId

                  ? '<button type="button" class="btn btn-ghost btn-sm btn-dl-crm" data-dl-type="event-attachment" data-event-id="' +

                    esc(evId) +

                    '" data-att-index="' +

                    esc(attIdx) +

                    '">Télécharger</button>'

                  : "—") +

                "</td></tr>"

              );

            })

            .join("") +

          "</tbody></table>"

        : "<p>Aucune pièce jointe en attente</p>";



      qm.innerHTML = res.quotes.length

        ? "<table><thead><tr><th>Devis</th><th>Statut</th><th>Contact</th><th>Actions</th></tr></thead><tbody>" +

          res.quotes

            .map(function (q) {

              return (

                "<tr><td><a href=\"./crm-quote-detail.html?id=" +

                encodeURIComponent(q.id) +

                '">' +

                esc(q.title) +

                "</a></td><td>" +

                esc(q.status) +

                "</td><td>" +

                linkContact(q.contactId, q.contactName) +

                '</td><td><button type="button" class="btn btn-ghost btn-sm btn-dl-crm" data-dl-type="quote" data-dl-id="' +

                esc(q.id) +

                '">Télécharger</button> <button type="button" class="btn btn-primary btn-sm btn-approve" data-id="' +

                esc(q.id) +

                '" data-type="quote">Valider</button> <button type="button" class="btn btn-ghost btn-sm btn-reject" data-id="' +

                esc(q.id) +

                '" data-type="quote">Rejeter</button></td></tr>'

              );

            })

            .join("") +

          "</tbody></table>"

        : "<p>Aucun devis en attente</p>";



      rm.innerHTML = res.requests.length

        ? "<table><thead><tr><th>Demande</th><th>Contact</th><th>Date</th><th>Actions</th></tr></thead><tbody>" +

          res.requests

            .map(function (r) {

              return (

                "<tr><td>" +

                esc(r.name) +

                "</td><td>" +

                linkContact(r.contactId, r.contactName) +

                "</td><td>" +

                new Date(r.createdAt).toLocaleDateString("fr-FR") +

                '</td><td><button type="button" class="btn btn-ghost btn-sm btn-dl-crm" data-dl-type="request" data-dl-id="' +

                esc(r.id) +

                '">Télécharger</button> <button type="button" class="btn btn-primary btn-sm btn-approve" data-id="' +

                esc(r.id) +

                '" data-type="request">Approuver</button> <button type="button" class="btn btn-ghost btn-sm btn-reject" data-id="' +

                esc(r.id) +

                '" data-type="request">Rejeter</button></td></tr>'

              );

            })

            .join("") +

          "</tbody></table>"

        : "<p>Aucune demande en attente</p>";



      document.querySelectorAll(".btn-dl-crm").forEach(function (btn) {

        btn.onclick = function () {

          var t = btn.getAttribute("data-dl-type");

          if (t === "event-attachment") {

            downloadExport(t, "", btn.getAttribute("data-event-id"), btn.getAttribute("data-att-index"));

          } else {

            downloadExport(t, btn.getAttribute("data-dl-id"));

          }

        };

      });



      document.querySelectorAll(".btn-approve, .btn-reject").forEach(function (btn) {

        btn.onclick = function () {

          var act = btn.classList.contains("btn-approve") ? "approve" : "reject";

          approve(btn.getAttribute("data-id"), btn.getAttribute("data-type"), act).then(function (r) {

            alert(r.message || r.error || "OK");

            if (r.ok) location.reload();

          });

        };

      });

    });



  fetch("/api/drive/files", {

    headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },

  })

    .then(function (r) {

      return r.json();

    })

    .then(function (res) {

      var el = document.getElementById("driveMount");

      if (!el) return;

      if (!res.ok) {

        el.innerHTML = "<p>Drive indisponible</p>";

        return;

      }

      var files = res.files || res.demoFiles || [];

      el.innerHTML =

        (res.configured ? "" : "<p style='color:var(--muted)'>" + esc(res.message || "Mode démo") + "</p>") +

        (files.length

          ? "<ul>" +

            files

              .map(function (f) {

                return "<li>" + esc(f.name) + " <span style='color:var(--muted);font-size:.85rem'>" + esc(f.mimeType || "") + "</span></li>";

              })

              .join("") +

            "</ul>"

          : "<p>Aucun fichier</p>") +

        '<p><a href="./test-drive.html">Explorer Drive →</a></p>';

    });

})();


