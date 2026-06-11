(function () {
  var TOKEN_KEY = "lo_token";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY),
    };
  }

  function statusBadge(st) {
    if (st === "approved") return '<span class="lead-dossier-status approved">Valide</span>';
    if (st === "rejected") return '<span class="lead-dossier-status rejected">Refuse</span>';
    return '<span class="lead-dossier-status pending">En attente</span>';
  }

  function openPreview(docId) {
    fetch("/api/crm/lead-document?id=" + encodeURIComponent(docId), {
      headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok || !res.document) {
          alert(res.error || "Apercu indisponible");
          return;
        }
        var doc = res.document;
        var modal = document.getElementById("leadDocPreviewModal");
        if (!modal) {
          modal = document.createElement("div");
          modal.id = "leadDocPreviewModal";
          modal.style.cssText =
            "position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;";
          document.body.appendChild(modal);
        }
        modal.innerHTML = "";
        var card = document.createElement("div");
        card.style.cssText =
          "background:#fff;border-radius:14px;max-width:900px;width:100%;max-height:92vh;overflow:auto;padding:20px";

        var head = document.createElement("div");
        head.style.cssText = "display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px";
        var meta = document.createElement("div");
        var h2 = document.createElement("h2");
        h2.style.margin = "0 0 6px";
        h2.textContent = doc.displayName;
        var sub = document.createElement("p");
        sub.style.cssText = "margin:0;color:#64748b;font-size:.9rem";
        sub.textContent = (doc.fileName || "") + " · " + (doc.email || "") + " · dossier " + (doc.leadId || "");
        meta.appendChild(h2);
        meta.appendChild(sub);
        var closeBtn = document.createElement("button");
        closeBtn.type = "button";
        closeBtn.className = "btn btn-ghost";
        closeBtn.textContent = "Fermer";
        closeBtn.onclick = function () {
          modal.remove();
        };
        head.appendChild(meta);
        head.appendChild(closeBtn);
        card.appendChild(head);

        var previewWrap = document.createElement("div");
        if (doc.contentBase64 && doc.mimeType && doc.mimeType.indexOf("image/") === 0) {
          var img = document.createElement("img");
          img.src = doc.contentBase64;
          img.alt = doc.displayName;
          img.style.cssText = "max-width:100%;max-height:55vh;border-radius:8px";
          previewWrap.appendChild(img);
        } else if (doc.contentBase64 && doc.mimeType === "application/pdf") {
          var iframe = document.createElement("iframe");
          iframe.src = doc.contentBase64;
          iframe.title = "PDF";
          iframe.style.cssText = "width:100%;height:55vh;border:0;border-radius:8px";
          previewWrap.appendChild(iframe);
        } else {
          var p = document.createElement("p");
          p.textContent = "Apercu non disponible pour ce type de fichier.";
          previewWrap.appendChild(p);
        }
        card.appendChild(previewWrap);

        var rename = document.createElement("input");
        rename.type = "text";
        rename.id = "leadDocRename";
        rename.value = doc.displayName;
        rename.style.cssText = "padding:8px;border:1px solid #e2e8f0;border-radius:8px;width:100%";
        var reason = document.createElement("input");
        reason.type = "text";
        reason.id = "leadDocRejectReason";
        reason.placeholder = "Motif refus (si refus)";
        reason.style.cssText = "padding:8px;border:1px solid #e2e8f0;border-radius:8px;width:100%";

        var fields = document.createElement("div");
        fields.style.cssText = "margin-top:14px;display:grid;gap:8px";
        fields.innerHTML = '<label style="font-size:.85rem;font-weight:600">Renommer (optionnel)</label>';
        fields.appendChild(rename);
        var lbl2 = document.createElement("label");
        lbl2.style.cssText = "font-size:.85rem;font-weight:600";
        lbl2.textContent = "Motif refus (si refus)";
        fields.appendChild(lbl2);
        fields.appendChild(reason);
        card.appendChild(fields);

        var actions = document.createElement("div");
        actions.style.cssText = "margin-top:16px;display:flex;gap:8px;flex-wrap:wrap";
        var approveBtn = document.createElement("button");
        approveBtn.type = "button";
        approveBtn.className = "btn btn-primary";
        approveBtn.textContent = "Approuver";
        approveBtn.onclick = function () {
          reviewDoc(doc.id, "approve");
        };
        var rejectBtn = document.createElement("button");
        rejectBtn.type = "button";
        rejectBtn.className = "btn btn-ghost";
        rejectBtn.textContent = "Refuser";
        rejectBtn.onclick = function () {
          reviewDoc(doc.id, "reject");
        };
        actions.appendChild(approveBtn);
        actions.appendChild(rejectBtn);
        card.appendChild(actions);
        modal.appendChild(card);

        modal.onclick = function (e) {
          if (e.target === modal) modal.remove();
        };
      });
  }

  function reviewDoc(id, action) {
    var renameEl = document.getElementById("leadDocRename");
    var reasonEl = document.getElementById("leadDocRejectReason");
    fetch("/api/crm/lead-document-review", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        id: id,
        action: action,
        displayName: renameEl ? renameEl.value.trim() : null,
        reason: reasonEl ? reasonEl.value.trim() : null,
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        alert(res.message || res.error || "OK");
        if (res.ok) location.reload();
      });
  }

  function loadLeadDossiers() {
    var mount = document.getElementById("leadDossierMount");
    if (!mount) return;
    fetch("/api/crm/lead-documents?status=pending", {
      headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) {
          mount.innerHTML = "<p>Erreur chargement dossiers</p>";
          return;
        }
        if (!res.documents.length) {
          mount.innerHTML = "<p>Aucune piece dossier VTC en attente</p>";
          return;
        }
        mount.innerHTML =
          "<table><thead><tr><th>Document</th><th>Type</th><th>Dossier / e-mail</th><th>Date</th><th>Statut</th><th>Actions</th></tr></thead><tbody>" +
          res.documents
            .map(function (d) {
              return (
                "<tr><td>" +
                esc(d.displayName) +
                "<br><small style='color:#64748b'>" +
                esc(d.fileName) +
                "</small></td><td>" +
                esc(d.docType) +
                "</td><td>" +
                esc(d.leadId || "—") +
                "<br><small>" +
                esc(d.email || "") +
                "</small></td><td>" +
                new Date(d.createdAt).toLocaleString("fr-FR") +
                "</td><td>" +
                statusBadge(d.status) +
                '</td><td><button type="button" class="btn btn-ghost btn-sm btn-preview-lead-doc" data-id="' +
                esc(d.id) +
                '">Visualiser</button> <button type="button" class="btn btn-primary btn-sm btn-quick-approve" data-id="' +
                esc(d.id) +
                '">Valider</button> <button type="button" class="btn btn-ghost btn-sm btn-quick-reject" data-id="' +
                esc(d.id) +
                '">Refuser</button></td></tr>'
              );
            })
            .join("") +
          "</tbody></table>";

        mount.querySelectorAll(".btn-preview-lead-doc").forEach(function (btn) {
          btn.onclick = function () {
            openPreview(btn.getAttribute("data-id"));
          };
        });
        mount.querySelectorAll(".btn-quick-approve").forEach(function (btn) {
          btn.onclick = function () {
            if (confirm("Approuver ce document ?")) reviewDoc(btn.getAttribute("data-id"), "approve");
          };
        });
        mount.querySelectorAll(".btn-quick-reject").forEach(function (btn) {
          btn.onclick = function () {
            var reason = prompt("Motif du refus (envoye au suivi interne) :");
            if (reason === null) return;
            fetch("/api/crm/lead-document-review", {
              method: "POST",
              headers: authHeaders(),
              body: JSON.stringify({
                id: btn.getAttribute("data-id"),
                action: "reject",
                reason: reason,
              }),
            })
              .then(function (r) {
                return r.json();
              })
              .then(function (res) {
                alert(res.message || res.error || "OK");
                if (res.ok) location.reload();
              });
          };
        });
      });
  }

  document.addEventListener("DOMContentLoaded", loadLeadDossiers);
})();
