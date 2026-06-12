/**
 * Upload pièces justificatives — parcours devis (file → base64 → API → Drive).
 */
(function (global) {
  var MAX_BYTES = 12 * 1024 * 1024;
  var ACCEPT = ".pdf,.jpg,.jpeg,.png";

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function mimeForFile(file) {
    if (file.type) return file.type;
    if (/\.pdf$/i.test(file.name)) return "application/pdf";
    if (/\.png$/i.test(file.name)) return "image/png";
    return "image/jpeg";
  }

  function iconForMime(mime) {
    if (!mime) return "📄";
    if (mime.indexOf("pdf") !== -1) return "📕";
    if (mime.indexOf("image") !== -1) return "🖼️";
    return "📄";
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function DevisDocumentUpload(root, options) {
    this.root = root;
    this.options = options || {};
    this.need = options.need || "default";
    this.queue = [];
    this.uploaded = [];
    this.session = { email: null, contactId: null, leadId: null };
    this.config = global.DEVIS_DOCUMENT_CONFIG
      ? global.DEVIS_DOCUMENT_CONFIG.getConfig(this.need)
      : { title: "Pièces justificatives", intro: "", items: [] };
    this._bind();
  }

  DevisDocumentUpload.prototype._bind = function () {
    var self = this;
    var drop = this.root.querySelector("[data-docs-drop]");
    var input = this.root.querySelector("[data-docs-input]");
    var typeSel = this.root.querySelector("[data-docs-type]");

    if (drop && input) {
      drop.addEventListener("click", function () {
        input.click();
      });
      drop.addEventListener("dragover", function (e) {
        e.preventDefault();
        drop.classList.add("is-dragover");
      });
      drop.addEventListener("dragleave", function () {
        drop.classList.remove("is-dragover");
      });
      drop.addEventListener("drop", function (e) {
        e.preventDefault();
        drop.classList.remove("is-dragover");
        var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) self.addFile(f, typeSel ? typeSel.value : "generic");
      });
      input.addEventListener("change", function () {
        if (input.files && input.files[0]) self.addFile(input.files[0], typeSel ? typeSel.value : "generic");
        input.value = "";
      });
    }
  };

  DevisDocumentUpload.prototype.addFile = function (file, documentType) {
    if (file.size > MAX_BYTES) {
      alert("Fichier trop volumineux (max 12 Mo) : " + file.name);
      return;
    }
    var item = {
      id: "q_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      file: file,
      fileName: file.name,
      documentType: documentType || "generic",
      mimeType: mimeForFile(file),
      status: "queued",
      preview: null,
    };
    var self = this;
    if (item.mimeType.indexOf("image") !== -1) {
      readFileAsBase64(file).then(function (dataUrl) {
        item.preview = dataUrl;
        self.renderQueue();
      });
    }
    this.queue.push(item);
    this.renderQueue();
  };

  DevisDocumentUpload.prototype.setSession = function (session) {
    this.session.email = session.email || this.session.email;
    this.session.contactId = session.contactId || this.session.contactId;
    this.session.leadId = session.leadId || this.session.leadId;
  };

  DevisDocumentUpload.prototype.uploadQueued = function () {
    var self = this;
    if (!this.queue.length) return Promise.resolve({ uploaded: [], errors: [] });
    if (!this.session.email && !this.session.contactId) {
      return Promise.resolve({ uploaded: [], errors: [{ error: "email ou contactId manquant" }] });
    }
    var pending = this.queue.filter(function (q) {
      return q.status === "queued" || q.status === "error";
    });
    return pending.reduce(function (chain, item) {
      return chain.then(function (acc) {
        item.status = "uploading";
        self.renderQueue();
        return readFileAsBase64(item.file)
          .then(function (dataUrl) {
            return fetch("/api/external/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: self.session.email,
                contactId: self.session.contactId,
                leadId: self.session.leadId,
                fileName: item.fileName,
                documentType: item.documentType,
                mimeType: item.mimeType,
                fileBase64: dataUrl,
                vertical: self.need,
                need: self.need,
                source: "devis_wizard",
              }),
            });
          })
          .then(function (r) {
            return r.json().then(function (data) {
              if (!r.ok || !data.ok) throw new Error((data && data.error) || "Upload echoue");
              return data;
            });
          })
          .then(function (data) {
            item.status = "done";
            item.result = data;
            self.uploaded.push(item);
            acc.uploaded.push(item);
            self.renderQueue();
            return acc;
          })
          .catch(function (err) {
            item.status = "error";
            item.error = err.message || "Erreur";
            acc.errors.push({ item: item, error: item.error });
            self.renderQueue();
            return acc;
          });
      });
    }, Promise.resolve({ uploaded: [], errors: [] }));
  };

  DevisDocumentUpload.prototype.renderQueue = function () {
    var mount = this.root.querySelector("[data-docs-queue]");
    if (!mount) return;
    var all = this.queue.concat([]);
    if (!all.length) {
      mount.innerHTML = '<p class="small" style="color:#64748b">Aucun fichier en attente.</p>';
      return;
    }
    mount.innerHTML = all
      .map(function (q) {
        var thumb = q.preview
          ? '<img class="devis-doc-thumb" src="' + q.preview + '" alt="" />'
          : '<div class="devis-doc-thumb">' + iconForMime(q.mimeType) + "</div>";
        return (
          '<div class="devis-doc-card" data-doc-id="' +
          esc(q.id) +
          '">' +
          thumb +
          '<div class="devis-doc-meta"><strong>' +
          esc(q.fileName) +
          "</strong><span>" +
          esc(q.documentType) +
          "</span></div>" +
          '<span class="devis-doc-status devis-doc-status--' +
          esc(q.status) +
          '">' +
          (q.status === "done"
            ? "Envoyé"
            : q.status === "uploading"
              ? "Envoi…"
              : q.status === "error"
                ? "Erreur"
                : "En attente") +
          "</span></div>"
        );
      })
      .join("");
  };

  DevisDocumentUpload.prototype.renderVisualPanel = function (container, docs) {
    if (!container) return;
    docs = docs || this.uploaded.map(function (u) {
      var att = (u.result && u.result.attachment) || {};
      return {
        name: att.name || u.fileName,
        mimeType: att.mimeType || u.mimeType,
        webViewLink: att.webViewLink || null,
        thumbnailLink: att.thumbnailLink || null,
        preview: u.preview,
      };
    });
    if (!docs.length) {
      container.hidden = true;
      return;
    }
    container.hidden = false;
    var grid = container.querySelector("[data-docs-visual-grid]") || container;
    grid.innerHTML = docs
      .map(function (d) {
        var visual = d.preview
          ? '<img src="' + d.preview + '" alt="" />'
          : d.thumbnailLink
            ? '<img src="' + d.thumbnailLink + '" alt="" />'
            : '<div class="icon">' + iconForMime(d.mimeType) + "</div>";
        var link = d.webViewLink
          ? '<a href="' + esc(d.webViewLink) + '" target="_blank" rel="noopener">Ouvrir dans Drive</a>'
          : "";
        return (
          '<div class="devis-docs-visual">' +
          visual +
          "<p>" +
          esc(d.name) +
          (link ? "<br>" + link : "") +
          "</p></div>"
        );
      })
      .join("");
  };

  DevisDocumentUpload.prototype.fetchRemoteList = function () {
    var self = this;
    if (!this.session.email && !this.session.contactId) return Promise.resolve([]);
    var q = this.session.contactId
      ? "contactId=" + encodeURIComponent(this.session.contactId)
      : "email=" + encodeURIComponent(this.session.email);
    return fetch("/api/external/documents-list?" + q)
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) return [];
        return res.documents || [];
      })
      .catch(function () {
        return [];
      })
      .then(function (docs) {
        self.renderVisualPanel(self.root.querySelector("[data-docs-visual-panel]"), docs);
        return docs;
      });
  };

  function buildStepHtml(need) {
    var cfg = global.DEVIS_DOCUMENT_CONFIG ? global.DEVIS_DOCUMENT_CONFIG.getConfig(need) : null;
    if (!cfg) return "";
    var checklist = cfg.items
      .map(function (it) {
        return (
          "<li>" +
          esc(it.label) +
          (it.required ? ' <span class="req">recommandé</span>' : "") +
          "</li>"
        );
      })
      .join("");
    var typeOpts = cfg.items
      .map(function (it) {
        return '<option value="' + esc(it.type) + '">' + esc(it.label) + "</option>";
      })
      .join("");

    return (
      '<section class="wizard-step" hidden data-step="documents" data-step-name="documents" data-optional-step="1">' +
      '<div class="devis-docs-step" data-devis-documents-root>' +
      "<h3>" +
      esc(cfg.title) +
      "</h3>" +
      '<p class="wizard-step-intro">' +
      esc(cfg.intro) +
      "</p>" +
      '<ul class="devis-docs-checklist">' +
      checklist +
      "</ul>" +
      '<label style="display:block;margin:12px 0 6px;font-weight:600;font-size:.9rem">Type de document</label>' +
      '<select data-docs-type data-optional>' +
      typeOpts +
      "</select>" +
      '<div class="devis-docs-drop" data-docs-drop style="margin-top:12px">' +
      "<strong>Glissez un fichier ici ou cliquez</strong>" +
      "<p>PDF, JPG, PNG — max 12 Mo. Vous pouvez passer cette étape et envoyer plus tard.</p>" +
      '<input type="file" data-docs-input accept="' +
      ACCEPT +
      '" hidden />' +
      "</div>" +
      '<div data-docs-queue class="devis-docs-queue"></div>" +
      '<p class="small" style="margin-top:8px;color:#64748b">Les fichiers seront envoyés à la validation du formulaire et archivés pour votre conseiller.</p>' +
      "</div></section>"
    );
  }

  function mountInForm(form, need) {
    var step = form.querySelector('[data-step-name="documents"]');
    if (!step) return null;
    var root = step.querySelector("[data-devis-documents-root]");
    if (!root) return null;
    var uploader = new DevisDocumentUpload(root, { need: need });
    uploader.renderQueue();
    form._devisDocumentUpload = uploader;
    return uploader;
  }

  global.DevisDocumentUpload = {
    DevisDocumentUpload: DevisDocumentUpload,
    buildStepHtml: buildStepHtml,
    mountInForm: mountInForm,
    ACCEPT: ACCEPT,
    MAX_BYTES: MAX_BYTES,
  };
})(typeof window !== "undefined" ? window : global);
