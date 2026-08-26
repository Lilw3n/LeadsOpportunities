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
    this.session = { email: null, phone: null, contactId: null, leadId: null, firstName: null, lastName: null };
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

    var form = this.root.closest("form") || document.querySelector("[data-quote-wizard], form[data-track-form]");
    if (form && !form._devisDocsIdentityBound) {
      form._devisDocsIdentityBound = true;
      form.addEventListener("input", function (e) {
        var n = e.target && e.target.name;
        if (!n) return;
        if (/^(email|phone|telephone|firstName|lastName|prenom|nom)$/.test(n)) {
          self.scheduleImmediateUpload();
        }
      });
    }

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
    this.scheduleImmediateUpload();
  };

  DevisDocumentUpload.prototype._formValue = function (form, names) {
    if (!form) return "";
    for (var i = 0; i < names.length; i++) {
      var el = form.querySelector("[name='" + names[i] + "']");
      if (el && String(el.value || "").trim()) return String(el.value).trim();
    }
    return "";
  };

  DevisDocumentUpload.prototype.hasIdentity = function () {
    var s = this.session || {};
    return !!(s.email || s.phone || s.contactId || s.leadId || (s.firstName && s.lastName));
  };

  DevisDocumentUpload.prototype.syncSessionFromForm = function () {
    var form = this.root.closest("form") || document.querySelector("[data-quote-wizard], form[data-track-form]");
    if (form) {
      var email = this._formValue(form, ["email"]);
      var phone = this._formValue(form, ["phone", "telephone"]);
      var firstName = this._formValue(form, ["firstName", "prenom"]);
      var lastName = this._formValue(form, ["lastName", "nom"]);
      if (email) this.session.email = email.toLowerCase();
      if (phone) this.session.phone = phone;
      if (firstName) this.session.firstName = firstName;
      if (lastName) this.session.lastName = lastName;
    }
    try {
      var leadId = localStorage.getItem("lo_draft_lead_id") || localStorage.getItem("lo_immo_deposit_lead_id");
      if (leadId) this.session.leadId = leadId;
      var contactId = localStorage.getItem("lo_draft_contact_id");
      if (contactId && !this.session.contactId) this.session.contactId = contactId;
    } catch (e) {}
    return this.session;
  };

  DevisDocumentUpload.prototype.scheduleImmediateUpload = function () {
    var self = this;
    clearTimeout(self._uploadTimer);
    self._uploadTimer = setTimeout(function () {
      self.syncSessionFromForm();
      if (!self.hasIdentity()) {
        var st = self.root.querySelector("[data-docs-status]");
        if (st) {
          st.hidden = false;
          st.style.color = "#64748b";
          st.textContent = "Renseignez nom et prénom (ou un e-mail / téléphone) pour envoyer immédiatement vers Drive.";
        }
        return;
      }
      self.uploadQueued().then(function () {
        self.fetchRemoteList();
      });
    }, 200);
  };

  DevisDocumentUpload.prototype.setSession = function (session) {
    session = session || {};
    this.session.email = session.email || this.session.email;
    this.session.phone = session.phone || this.session.phone;
    this.session.contactId = session.contactId || this.session.contactId;
    this.session.leadId = session.leadId || this.session.leadId;
    this.session.firstName = session.firstName || this.session.firstName;
    this.session.lastName = session.lastName || this.session.lastName;
  };

  DevisDocumentUpload.prototype.uploadQueued = function () {
    var self = this;
    this.syncSessionFromForm();
    if (!this.queue.length) return Promise.resolve({ uploaded: [], errors: [] });
    if (!this.hasIdentity()) {
      return Promise.resolve({
        uploaded: [],
        errors: [{ error: "nom+prénom, e-mail, téléphone, contactId ou leadId manquant" }],
      });
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
              credentials: "same-origin",
                body: JSON.stringify({
                email: self.session.email,
                phone: self.session.phone || null,
                firstName: self.session.firstName || null,
                lastName: self.session.lastName || null,
                contactId: self.session.contactId,
                leadId: self.session.leadId,
                fileName: item.fileName,
                documentType: item.documentType,
                mimeType: item.mimeType,
                fileBase64: dataUrl,
                vertical: self.need,
                need: self.need,
                source: "devis_wizard",
                perTypeFolder: true,
              }),
            });
          })
          .then(function (r) {
            return r.text().then(function (text) {
              var data = {};
              try {
                data = text ? JSON.parse(text) : {};
              } catch (e) {
                throw new Error("Réponse serveur invalide (" + r.status + ")");
              }
              if (!r.ok || !data.ok) throw new Error((data && data.error) || "Upload échoué (" + r.status + ")");
              return data;
            });
          })
          .then(function (data) {
            item.status = "done";
            item.result = data;
            if (data.contactId) {
              self.session.contactId = data.contactId;
              try {
                localStorage.setItem("lo_draft_contact_id", data.contactId);
              } catch (e) {}
            }
            self.uploaded.push(item);
            acc.uploaded.push(item);
            self.queue = self.queue.filter(function (q) {
              return q.id !== item.id;
            });
            var okSt = self.root.querySelector("[data-docs-status]");
            if (okSt) {
              okSt.hidden = false;
              okSt.style.color = "#047857";
              okSt.textContent = "Envoyé vers Drive.";
            }
            self.renderQueue();
            return acc;
          })
          .catch(function (err) {
            item.status = "error";
            item.error = err.message || "Erreur";
            acc.errors.push({ item: item, error: item.error });
            var errSt = self.root.querySelector("[data-docs-status]");
            if (errSt) {
              errSt.hidden = false;
              errSt.style.color = "#b91c1c";
              errSt.textContent = "Échec Drive : " + item.error;
            }
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
          "</span>" +
          (q.status === "error" && q.error
            ? '<span class="devis-doc-error-msg">' + esc(q.error) + "</span>"
            : "") +
          "</div>" +
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
    docs = docs || [];
    if (!docs.length) {
      container.hidden = true;
      return;
    }
    container.hidden = false;
    var grid = container.querySelector("[data-docs-visual-grid]") || container;
    if (global.LoDocumentGallery) {
      global.LoDocumentGallery.mount(grid, docs, {
        contactId: this.session.contactId,
        email: this.session.email,
        emptyText: "Aucun document.",
        onDeleted: function () {
          /* rechargé via fetchRemoteList côté appelant si besoin */
        },
      });
      return;
    }
    grid.innerHTML = docs
      .map(function (d) {
        var visual = d.thumbnailLink
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
          (it.required ? ' <span class="req">nécessaire</span>' : " <span class=\"opt\">optionnel</span>") +
          "</li>"
        );
      })
      .join("");
    var typeOpts = cfg.items
      .map(function (it) {
        return '<option value="' + esc(it.type) + '">' + esc(it.label) + "</option>";
      })
      .join("");
    var extraHtml = "";
    if (cfg.extraFields && cfg.extraFields.length) {
      extraHtml =
        '<div class="devis-docs-extra" style="margin:12px 0">' +
        cfg.extraFields
          .map(function (f) {
            return (
              "<label style=\"display:block;margin:8px 0 4px;font-weight:600;font-size:.9rem\">" +
              esc(f.label) +
              '<input name="' +
              esc(f.name) +
              '" type="' +
              esc(f.type || "text") +
              '" placeholder="' +
              esc(f.placeholder || "") +
              '" data-optional' +
              (f.required ? " required" : "") +
              " style=\"width:100%;margin-top:4px\" /></label>"
            );
          })
          .join("") +
        "</div>";
    }

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
      extraHtml +
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
      '<div data-docs-queue class="devis-docs-queue"></div>' +
      '<p class="small" data-docs-status style="margin-top:8px;color:#64748b">Envoi immédiat vers Drive dès que nom et prénom (ou un e-mail / téléphone) sont renseignés.</p>' +
      '<div data-docs-visual-panel hidden style="margin-top:14px"><div data-docs-visual-grid></div></div>' +
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
