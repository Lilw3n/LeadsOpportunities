/**
 * Galerie documents — aperçu (image / PDF Drive) + suppression (corbeille client / définitive admin).
 */
(function (global) {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isAdminViewer(opts) {
    if (opts && opts.isAdmin === true) return true;
    try {
      if (global.CrmSession && global.CrmSession.isSiteAdmin && global.CrmSession.isSiteAdmin()) return true;
    } catch (e) {}
    try {
      var u = JSON.parse(localStorage.getItem("lo_crm_user") || localStorage.getItem("lo_user") || "null");
      if (u && u.role === "admin") return true;
    } catch (e2) {}
    return false;
  }

  function previewUrl(doc) {
    if (!doc) return null;
    if (doc.previewUrl) return doc.previewUrl;
    if (doc.driveFileId && String(doc.driveFileId).indexOf("sim_") !== 0) {
      return "https://drive.google.com/file/d/" + encodeURIComponent(doc.driveFileId) + "/preview";
    }
    if (doc.webViewLink) return doc.webViewLink;
    if (doc.thumbnailLink) return doc.thumbnailLink;
    return null;
  }

  function isImage(doc) {
    var m = String((doc && doc.mimeType) || "").toLowerCase();
    var n = String((doc && doc.name) || (doc && doc.fileName) || "").toLowerCase();
    return m.indexOf("image/") === 0 || /\.(jpe?g|png|webp|gif)$/.test(n);
  }

  function isPdf(doc) {
    var m = String((doc && doc.mimeType) || "").toLowerCase();
    var n = String((doc && doc.name) || (doc && doc.fileName) || "").toLowerCase();
    return m.indexOf("pdf") !== -1 || /\.pdf$/.test(n);
  }

  function ensureModal() {
    var el = document.getElementById("loDocPreviewModal");
    if (el) return el;
    el = document.createElement("div");
    el.id = "loDocPreviewModal";
    el.className = "lo-doc-modal";
    el.hidden = true;
    el.innerHTML =
      '<div class="lo-doc-modal-backdrop" data-lo-doc-close></div>' +
      '<div class="lo-doc-modal-panel" role="dialog" aria-modal="true" aria-label="Aperçu document">' +
      '<header class="lo-doc-modal-head">' +
      '<strong class="lo-doc-modal-title" data-lo-doc-title></strong>' +
      '<button type="button" class="lo-doc-modal-x" data-lo-doc-close aria-label="Fermer">×</button>' +
      "</header>" +
      '<div class="lo-doc-modal-body" data-lo-doc-body></div>' +
      '<footer class="lo-doc-modal-foot">' +
      '<a class="lo-doc-modal-open" data-lo-doc-open target="_blank" rel="noopener">Ouvrir dans Drive</a>' +
      '<button type="button" class="lo-doc-modal-close-btn" data-lo-doc-close>Fermer</button>' +
      "</footer></div>";
    document.body.appendChild(el);
    el.addEventListener("click", function (e) {
      if (e.target.closest("[data-lo-doc-close]")) closePreview();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !el.hidden) closePreview();
    });
    return el;
  }

  function openPreview(doc) {
    var modal = ensureModal();
    var title = modal.querySelector("[data-lo-doc-title]");
    var body = modal.querySelector("[data-lo-doc-body]");
    var open = modal.querySelector("[data-lo-doc-open]");
    var name = doc.name || doc.fileName || "Document";
    title.textContent = name;
    var url = previewUrl(doc);
    var thumb = doc.thumbnailLink || "";
    body.innerHTML = "";
    if (isImage(doc) && (thumb || url || doc.webViewLink)) {
      var img = document.createElement("img");
      img.className = "lo-doc-modal-img";
      img.alt = name;
      img.src = thumb || url || doc.webViewLink;
      body.appendChild(img);
    } else if (url) {
      var iframe = document.createElement("iframe");
      iframe.className = "lo-doc-modal-frame";
      iframe.title = name;
      iframe.src = url;
      iframe.setAttribute("allow", "autoplay");
      body.appendChild(iframe);
    } else {
      body.innerHTML = '<p class="lo-doc-modal-empty">Aperçu indisponible — ouvrez le fichier dans Drive.</p>';
    }
    if (doc.webViewLink || url) {
      open.hidden = false;
      open.href = doc.webViewLink || url;
    } else {
      open.hidden = true;
      open.removeAttribute("href");
    }
    modal.hidden = false;
    document.documentElement.classList.add("lo-doc-modal-open");
  }

  function closePreview() {
    var modal = document.getElementById("loDocPreviewModal");
    if (!modal) return;
    modal.hidden = true;
    var body = modal.querySelector("[data-lo-doc-body]");
    if (body) body.innerHTML = "";
    document.documentElement.classList.remove("lo-doc-modal-open");
  }

  function tileHtml(doc, opts) {
    opts = opts || {};
    var admin = isAdminViewer(opts);
    var name = doc.name || doc.fileName || "Document";
    var type = doc.type || doc.documentType || "";
    var thumb =
      doc.thumbnailLink
        ? '<img src="' + esc(doc.thumbnailLink) + '" alt="" loading="lazy" />'
        : isPdf(doc)
          ? '<span class="lo-doc-icon lo-doc-icon--pdf">PDF</span>'
          : isImage(doc)
            ? '<span class="lo-doc-icon lo-doc-icon--img">IMG</span>'
            : '<span class="lo-doc-icon">DOC</span>';
    var actions =
      '<button type="button" class="lo-doc-btn" data-lo-doc-preview>Aperçu</button>';
    if (doc.webViewLink) {
      actions +=
        '<a class="lo-doc-btn lo-doc-btn--ghost" href="' +
        esc(doc.webViewLink) +
        '" target="_blank" rel="noopener">Drive</a>';
    }
    if (!doc.trashed) {
      if (admin) {
        actions +=
          '<button type="button" class="lo-doc-btn lo-doc-btn--danger" data-lo-doc-delete-hard title="Suppression définitive (admin)">Supprimer</button>';
      }
      actions +=
        '<button type="button" class="lo-doc-btn lo-doc-btn--warn" data-lo-doc-delete-soft title="Retirer du dossier → corbeille Drive">Corbeille</button>';
    } else {
      actions += '<span class="lo-doc-trashed-badge">En corbeille</span>';
    }
    return (
      '<article class="lo-doc-tile' +
      (doc.trashed ? " is-trashed" : "") +
      '" data-lo-doc-id="' +
      esc(doc.eventId || doc.driveFileId || "") +
      '" data-drive-file-id="' +
      esc(doc.driveFileId || "") +
      '" data-event-id="' +
      esc(doc.eventId || "") +
      '" data-property-id="' +
      esc(doc.propertyId || "") +
      '">' +
      '<button type="button" class="lo-doc-thumb" data-lo-doc-preview aria-label="Aperçu ' +
      esc(name) +
      '">' +
      thumb +
      "</button>" +
      '<div class="lo-doc-body">' +
      "<strong>" +
      esc(name) +
      "</strong>" +
      (type ? '<span class="lo-doc-type">' + esc(type) + "</span>" : "") +
      (doc.propertyTitle ? '<span class="lo-doc-meta">' + esc(doc.propertyTitle) + "</span>" : "") +
      '<div class="lo-doc-actions">' +
      actions +
      "</div></div></article>"
    );
  }

  function deleteDocument(doc, opts, permanent) {
    opts = opts || {};
    var admin = isAdminViewer(opts);
    var msg = permanent
      ? "Supprimer définitivement ce document du site et de Google Drive ? Irréversible."
      : "Retirer ce document du dossier ? Il sera déplacé dans la corbeille Drive (_corbeille).";
    if (!confirm(msg)) return Promise.resolve({ cancelled: true });

    var payload = {
      contactId: opts.contactId || doc.contactId || null,
      email: opts.email || null,
      eventId: doc.eventId || null,
      driveFileId: doc.driveFileId || null,
      propertyId: doc.propertyId || opts.propertyId || null,
      permanent: !!permanent,
    };

    var url = admin || opts.crmMode
      ? "/api/crm/document-delete"
      : "/api/external/document-delete";

    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (res) {
        if (!res.ok || !res.data || !res.data.ok) {
          throw new Error((res.data && res.data.error) || "Suppression impossible");
        }
        return res.data;
      });
  }

  function mount(container, documents, options) {
    options = options || {};
    if (!container) return null;
    var docs = (documents || []).filter(function (d) {
      if (!d) return false;
      if (options.showTrashed) return true;
      return !d.trashed && d.status !== "cancelled";
    });
    if (!docs.length) {
      container.innerHTML =
        '<p class="lo-doc-empty">' +
        esc(options.emptyText || "Aucun document pour le moment.") +
        "</p>";
      return { refresh: function () {} };
    }
    container.innerHTML =
      '<div class="lo-doc-gallery" data-lo-doc-gallery>' +
      docs.map(function (d) {
        return tileHtml(d, options);
      }).join("") +
      "</div>";

    container.querySelectorAll(".lo-doc-tile").forEach(function (tile, idx) {
      var doc = docs[idx];
      tile.addEventListener("click", function (e) {
        var previewBtn = e.target.closest("[data-lo-doc-preview]");
        var hardBtn = e.target.closest("[data-lo-doc-delete-hard]");
        var softBtn = e.target.closest("[data-lo-doc-delete-soft]");
        if (previewBtn) {
          e.preventDefault();
          openPreview(doc);
          return;
        }
        if (hardBtn) {
          e.preventDefault();
          deleteDocument(doc, options, true)
            .then(function (res) {
              if (res && res.cancelled) return;
              if (typeof options.onDeleted === "function") options.onDeleted(doc, res);
              else mount(container, docs.filter(function (x) { return x !== doc; }), options);
            })
            .catch(function (err) {
              alert(err.message || "Erreur");
            });
          return;
        }
        if (softBtn) {
          e.preventDefault();
          deleteDocument(doc, options, false)
            .then(function (res) {
              if (res && res.cancelled) return;
              if (typeof options.onDeleted === "function") options.onDeleted(doc, res);
              else mount(container, docs.filter(function (x) { return x !== doc; }), options);
            })
            .catch(function (err) {
              alert(err.message || "Erreur");
            });
        }
      });
    });

    return {
      openPreview: openPreview,
      closePreview: closePreview,
    };
  }

  global.LoDocumentGallery = {
    mount: mount,
    openPreview: openPreview,
    closePreview: closePreview,
    deleteDocument: deleteDocument,
    previewUrl: previewUrl,
    isAdminViewer: isAdminViewer,
  };
})(typeof window !== "undefined" ? window : global);
