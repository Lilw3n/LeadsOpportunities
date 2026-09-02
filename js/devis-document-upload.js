/**
 * Upload pièces justificatives — même UI que l’immo (lignes Déposer / Reçu)
 * pour tous les questionnaires (auto, habitation, VTC, santé, crédit…).
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

  function isAllowedFile(file) {
    var mime = mimeForFile(file);
    if (mime === "application/pdf" || mime === "image/jpeg" || mime === "image/png") return true;
    return /\.(pdf|jpe?g|png)$/i.test(file.name || "");
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

  function statusLabel(status) {
    if (status === "received" || status === "done") return "Reçu";
    if (status === "transmitted") return "Transmis";
    if (status === "uploading") return "Envoi…";
    if (status === "error") return "Erreur";
    if (status === "queued") return "En attente";
    return "";
  }

  function statusClass(status) {
    if (status === "received" || status === "done") return "is-received";
    if (status === "transmitted") return "is-transmitted";
    if (status === "uploading") return "is-uploading";
    if (status === "error") return "is-error";
    if (status === "queued") return "is-queued";
    return "";
  }

  function aggregateStatus(items) {
    if (!items || !items.length) return null;
    if (items.some(function (i) {
      return i.status === "error";
    }))
      return "error";
    if (items.some(function (i) {
      return i.status === "uploading";
    }))
      return "uploading";
    if (items.some(function (i) {
      return i.status === "queued";
    }))
      return "queued";
    if (
      items.every(function (i) {
        return i.status === "received" || i.status === "done";
      })
    )
      return "received";
    if (
      items.some(function (i) {
        return i.status === "transmitted" || i.status === "received" || i.status === "done";
      })
    )
      return "transmitted";
    return "queued";
  }

  function driveConfirmed(data) {
    data = data || {};
    if (data.drive && data.drive.simulated) return false;
    if (data.simulated) return false;
    var att = data.attachment || {};
    var drive = data.drive || {};
    var fileId = drive.fileId || drive.id || att.driveFileId || "";
    if (!fileId || String(fileId).indexOf("sim_") === 0) return false;
    return !!(fileId || drive.webViewLink || att.webViewLink);
  }

  function DevisDocumentUpload(root, options) {
    this.root = root;
    this.options = options || {};
    this.need = options.need || "default";
    this.queue = [];
    this.uploaded = [];
    this.session = {
      email: null,
      phone: null,
      contactId: null,
      leadId: null,
      firstName: null,
      lastName: null,
      docsSessionId: null,
    };
    this.config = global.DEVIS_DOCUMENT_CONFIG
      ? global.DEVIS_DOCUMENT_CONFIG.getConfig(this.need)
      : { title: "Pièces justificatives", intro: "", items: [] };
    this._bind();
  }

  DevisDocumentUpload.prototype._bind = function () {
    var self = this;

    var form = this.root.closest("form") || document.querySelector("[data-quote-wizard], form[data-track-form]");
    if (form && !form._devisDocsIdentityBound) {
      form._devisDocsIdentityBound = true;
      form.addEventListener("input", function (e) {
        var t = e.target;
        if (!t) return;
        var n = t.name || "";
        if (/^(email|phone|telephone|firstName|lastName|prenom|nom)$/.test(n) || t.type === "email" || t.type === "tel") {
          self.scheduleImmediateUpload();
          self.scheduleIdentitySync();
        }
      });
    }

    this.root.addEventListener("input", function (e) {
      var t = e.target;
      if (!t || !self.root.contains(t)) return;
      if (t.hasAttribute("data-docs-identity-email") || t.hasAttribute("data-docs-identity-phone")) {
        self.scheduleImmediateUpload();
        self.scheduleIdentitySync();
      }
    });

    this.root.addEventListener("click", function (e) {
      var retry = e.target && e.target.closest ? e.target.closest("[data-docs-retry]") : null;
      if (!retry || !self.root.contains(retry)) return;
      e.preventDefault();
      var id = retry.getAttribute("data-docs-retry");
      self.queue.forEach(function (q) {
        if (q.id === id && q.status === "error") {
          q.status = "queued";
          q.error = null;
          q._retriedNoLead = false;
        }
      });
      self.scheduleImmediateUpload();
    });

    this.root.addEventListener("change", function (e) {
      var input = e.target && e.target.closest ? e.target.closest("[data-docs-input]") : null;
      if (!input || !self.root.contains(input)) return;
      if (!input.files || !input.files.length) return;
      var docType = input.getAttribute("data-doc-type") || "generic";
      Array.prototype.forEach.call(input.files, function (file) {
        self.addFile(file, docType);
      });
      input.value = "";
    });

    this.root.addEventListener("dragover", function (e) {
      var line = e.target && e.target.closest ? e.target.closest("[data-docs-line]") : null;
      if (!line || !self.root.contains(line)) return;
      e.preventDefault();
      line.classList.add("is-queued");
    });
    this.root.addEventListener("dragleave", function (e) {
      var line = e.target && e.target.closest ? e.target.closest("[data-docs-line]") : null;
      if (!line || !self.root.contains(line)) return;
      if (line.contains(e.relatedTarget)) return;
      if (!self.itemsForType(line.getAttribute("data-docs-line")).length) {
        line.classList.remove("is-queued");
      }
    });
    this.root.addEventListener("drop", function (e) {
      var line = e.target && e.target.closest ? e.target.closest("[data-docs-line]") : null;
      if (!line || !self.root.contains(line)) return;
      e.preventDefault();
      var docType = line.getAttribute("data-docs-line") || "generic";
      var files = e.dataTransfer && e.dataTransfer.files;
      if (!files || !files.length) return;
      Array.prototype.forEach.call(files, function (file) {
        self.addFile(file, docType);
      });
    });
  };

  DevisDocumentUpload.prototype.addFile = function (file, documentType) {
    if (!isAllowedFile(file)) {
      alert("Format refusé — déposez uniquement PDF, JPG ou PNG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      alert("Fichier trop volumineux (max 12 Mo) : " + file.name);
      return;
    }
    this.ensureDocsSession();
    var item = {
      id: "q_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      file: file,
      fileName: file.name,
      documentType: documentType || "generic",
      mimeType: mimeForFile(file),
      status: "queued",
      preview: null,
      error: null,
    };
    this.queue.push(item);
    this.renderQueue();
    this.scheduleImmediateUpload();
  };

  DevisDocumentUpload.prototype._formValue = function (form, names) {
    if (!form) return "";
    for (var i = 0; i < names.length; i++) {
      var els = form.querySelectorAll("[name='" + names[i] + "']");
      for (var j = 0; j < els.length; j++) {
        var v = String(els[j].value || "").trim();
        if (v) return v;
      }
    }
    return "";
  };

  DevisDocumentUpload.prototype._firstEmail = function (root) {
    var v = this._formValue(root, ["email", "Email", "ownerEmail[]"]);
    if (v) return v;
    if (!root) return "";
    var idEl = root.querySelector("[data-docs-identity-email]");
    if (idEl && String(idEl.value || "").trim()) return String(idEl.value).trim();
    var els = root.querySelectorAll("input[type='email']");
    for (var i = 0; i < els.length; i++) {
      var t = String(els[i].value || "").trim();
      if (t) return t;
    }
    return "";
  };

  DevisDocumentUpload.prototype.ensureDocsSession = function (create) {
    if (this.session.docsSessionId) return this.session.docsSessionId;
    try {
      var id = localStorage.getItem("lo_docs_session_id");
      if (id && /^[a-zA-Z0-9_-]{8,80}$/.test(id)) {
        this.session.docsSessionId = id;
        return id;
      }
      if (create === false) return null;
      id = "ds_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 12);
      localStorage.setItem("lo_docs_session_id", id);
      this.session.docsSessionId = id;
    } catch (e) {
      if (create === false) return this.session.docsSessionId || null;
      this.session.docsSessionId = this.session.docsSessionId || "ds_mem_" + Date.now().toString(36);
    }
    return this.session.docsSessionId;
  };

  DevisDocumentUpload.prototype.hasIdentity = function () {
    var s = this.session || {};
    return !!(s.email || s.phone || (s.firstName && s.lastName));
  };

  DevisDocumentUpload.prototype.syncSessionFromForm = function () {
    var form = this.root.closest("form") || document.querySelector("[data-quote-wizard], form[data-track-form], [data-url-capture-form]");
    var scopes = [];
    if (form) scopes.push(form);
    if (this.root && this.root !== form) scopes.push(this.root);
    if (document.body && document.body !== form) scopes.push(document.body);
    var self = this;
    scopes.forEach(function (root) {
      var email = self._firstEmail(root);
      var phone = self._formValue(root, ["phone", "telephone", "ownerPhone[]"]);
      var idPhone = root.querySelector("[data-docs-identity-phone]");
      if (idPhone && String(idPhone.value || "").trim()) phone = String(idPhone.value).trim();
      var firstName = self._formValue(root, ["firstName", "prenom", "ownerFirstName[]"]);
      var lastName = self._formValue(root, ["lastName", "nom", "ownerLastName[]"]);
      if (email) self.session.email = email.toLowerCase();
      if (phone) self.session.phone = phone;
      if (firstName) self.session.firstName = firstName;
      if (lastName) self.session.lastName = lastName;
    });
    this.ensureDocsSession(false);
    try {
      var storedEmail = localStorage.getItem("lo_client_email");
      if (storedEmail && !this.session.email) this.session.email = String(storedEmail).trim().toLowerCase();
      if (this.session.email) localStorage.setItem("lo_client_email", this.session.email);
      var leadId = localStorage.getItem("lo_draft_lead_id") || localStorage.getItem("lo_immo_deposit_lead_id");
      if (leadId && !this._ignoreLeadId) this.session.leadId = leadId;
      var contactId = localStorage.getItem("lo_draft_contact_id");
      if (contactId && !this.session.contactId) this.session.contactId = contactId;
    } catch (e) {}
    this._syncIdentityStrip();
    return this.session;
  };

  DevisDocumentUpload.prototype._syncIdentityStrip = function () {
    var box = this.root.querySelector("[data-docs-identity]");
    if (!box) return;
    var form = this.root.closest("form");
    var audit =
      (form && form.dataset.auditMode === "1") ||
      (document.body && document.body.classList.contains("form-audit-active"));
    var formHas =
      !!(this._formValue(form, ["email", "Email"]) ||
        this._formValue(form, ["phone", "telephone"]) ||
        (this._formValue(form, ["firstName", "prenom"]) && this._formValue(form, ["lastName", "nom"])));
    box.hidden = !!(audit || formHas);
  };

  DevisDocumentUpload.prototype.setStatusText = function (message, tone) {
    var st = this.root.querySelector("[data-docs-status]");
    if (!st) return;
    st.hidden = !message;
    st.style.color = tone === "error" ? "#b91c1c" : tone === "ok" ? "#047857" : "#64748b";
    st.textContent = message || "";
  };

  DevisDocumentUpload.prototype.scheduleImmediateUpload = function () {
    var self = this;
    clearTimeout(self._uploadTimer);
    self._uploadTimer = setTimeout(function () {
      self.syncSessionFromForm();
      self.uploadQueued().then(function () {
        self.fetchRemoteList();
      });
    }, 200);
  };

  DevisDocumentUpload.prototype.scheduleIdentitySync = function () {
    var self = this;
    clearTimeout(self._identityTimer);
    self._identityTimer = setTimeout(function () {
      self.syncSessionFromForm();
      if (!self.session.contactId && !self.session.docsSessionId) return;
      if (!self.hasIdentity()) return;
      var form = self.root.closest("form") || document.querySelector("[data-quote-wizard], form[data-track-form]");
      if (global.QuoteIntelligence && global.QuoteIntelligence.saveProgress && form) {
        global.QuoteIntelligence.saveProgress(form, 0, "documents", "identity_update");
      }
    }, 700);
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

  DevisDocumentUpload.prototype.itemsForType = function (documentType) {
    var list = [];
    var seen = Object.create(null);
    function pushUnique(item) {
      if (!item) return;
      var key = item.id || item.driveFileId || item.fileName + "|" + item.status;
      if (seen[key]) return;
      seen[key] = true;
      list.push(item);
    }
    this.uploaded.forEach(function (u) {
      if (u.documentType === documentType) pushUnique(u);
    });
    this.queue.forEach(function (q) {
      if (q.documentType !== documentType) return;
      if (q.status === "received" || q.status === "done" || q.status === "transmitted") return;
      pushUnique(q);
    });
    return list;
  };

  DevisDocumentUpload.prototype.refreshLine = function (documentType) {
    var line = this.root.querySelector('[data-docs-line="' + documentType + '"]');
    if (!line) return;
    var items = this.itemsForType(documentType);
    var agg = aggregateStatus(items);
    line.classList.remove("is-queued", "is-done", "is-error", "is-transmitted", "is-uploading", "is-received");
    if (agg === "queued") line.classList.add("is-queued");
    if (agg === "uploading") line.classList.add("is-uploading");
    if (agg === "transmitted") line.classList.add("is-transmitted");
    if (agg === "received") line.classList.add("is-done", "is-received");
    if (agg === "error") line.classList.add("is-error");

    var badge = line.querySelector("[data-docs-status-badge]");
    if (badge) {
      if (!agg) {
        badge.hidden = true;
        badge.textContent = "";
        badge.className = "immo-doc-status-badge";
      } else {
        badge.hidden = false;
        var label = statusLabel(agg);
        badge.textContent = label + (items.length > 1 ? " · " + items.length : "");
        badge.className = "immo-doc-status-badge " + statusClass(agg);
      }
    }

    var btn = line.querySelector(".immo-doc-line-btn span");
    if (btn) btn.textContent = items.length ? "Ajouter +" : "Déposer";

    var listEl = line.querySelector("[data-docs-files]");
    if (!listEl) return;
    if (!items.length) {
      listEl.hidden = true;
      listEl.innerHTML = "";
      return;
    }
    listEl.hidden = false;
    listEl.innerHTML = items
      .map(function (item) {
        var pill = statusLabel(item.status) || "—";
        return (
          "<li>" +
          '<span class="immo-doc-file-pill ' +
          statusClass(item.status) +
          '">' +
          esc(pill) +
          "</span>" +
          '<span class="immo-doc-file-name" title="' +
          esc(item.fileName) +
          '">' +
          esc(item.fileName) +
          "</span>" +
          (item.status === "error" && item.error
            ? '<span class="devis-doc-error-msg">' +
              esc(item.error) +
              ' <button type="button" class="devis-doc-retry" data-docs-retry="' +
              esc(item.id) +
              '">Réessayer</button></span>'
            : "") +
          "</li>"
        );
      })
      .join("");
  };

  DevisDocumentUpload.prototype.renderQueue = function () {
    var self = this;
    var types = {};
    this.queue.concat(this.uploaded).forEach(function (item) {
      if (item.documentType) types[item.documentType] = true;
    });
    this.root.querySelectorAll("[data-docs-line]").forEach(function (line) {
      types[line.getAttribute("data-docs-line")] = true;
    });
    Object.keys(types).forEach(function (type) {
      self.refreshLine(type);
    });
  };

  DevisDocumentUpload.prototype._uploadBody = function (item, extra) {
    extra = extra || {};
    this.ensureDocsSession();
    return {
      email: this.session.email || null,
      phone: this.session.phone || null,
      firstName: this.session.firstName || null,
      lastName: this.session.lastName || null,
      contactId: this.session.contactId || null,
      leadId: extra.leadId !== undefined ? extra.leadId : this._ignoreLeadId ? null : this.session.leadId,
      docsSessionId: this.session.docsSessionId || null,
      fileName: item.fileName,
      documentType: item.documentType,
      mimeType: item.mimeType,
      fileBase64: extra.fileBase64,
      vertical: this.need,
      need: this.need,
      source: "devis_wizard",
      perTypeFolder: true,
    };
  };

  DevisDocumentUpload.prototype.uploadQueued = function () {
    var self = this;
    this.syncSessionFromForm();
    if (!this.queue.length) return Promise.resolve({ uploaded: [], errors: [] });
    var pending = this.queue.filter(function (q) {
      return q.status === "queued" || q.status === "error";
    });
    return pending.reduce(function (chain, item) {
      return chain.then(function (acc) {
        item.status = "uploading";
        item.error = null;
        self.renderQueue();
        return readFileAsBase64(item.file)
          .then(function (dataUrl) {
            return fetch("/api/external/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "same-origin",
              body: JSON.stringify(self._uploadBody(item, { fileBase64: dataUrl })),
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
              if (!r.ok || !data.ok) {
                if (data.code === "contact_missing") {
                  try {
                    localStorage.removeItem("lo_draft_lead_id");
                    localStorage.removeItem("lo_immo_deposit_lead_id");
                  } catch (e2) {}
                  self.session.leadId = null;
                  self._ignoreLeadId = true;
                }
                throw new Error((data && data.error) || "Upload échoué (" + r.status + ")");
              }
              if (!driveConfirmed(data)) {
                throw new Error(
                  (data && data.error) ||
                    "Drive non confirmé — le fichier n’a pas été archivé."
                );
              }
              return data;
            });
          })
          .then(function (data) {
            item.status = "received";
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
            self.setStatusText("Envoyé vers Drive.", "ok");
            self.renderQueue();
            return acc;
          })
          .catch(function (err) {
            var msg = err.message || "Erreur";
            if (!item._retriedNoLead && self._ignoreLeadId) {
              item._retriedNoLead = true;
              item.status = "queued";
              item.error = null;
              self.setStatusText("Nouvel essai sans dossier périmé…", "info");
              self.renderQueue();
              return readFileAsBase64(item.file)
                .then(function (dataUrl) {
                  return fetch("/api/external/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify(self._uploadBody(item, { fileBase64: dataUrl, leadId: null })),
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
                    if (!r.ok || !data.ok) {
                      throw new Error((data && data.error) || "Upload échoué (" + r.status + ")");
                    }
                    if (!driveConfirmed(data)) {
                      throw new Error(
                        (data && data.error) || "Drive non confirmé — le fichier n’a pas été archivé."
                      );
                    }
                    return data;
                  });
                })
                .then(function (data) {
                  item.status = "received";
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
                  self.setStatusText("Envoyé vers Drive.", "ok");
                  self.renderQueue();
                  return acc;
                })
                .catch(function (err2) {
                  item.status = "error";
                  item.error = err2.message || msg;
                  acc.errors.push({ item: item, error: item.error });
                  self.setStatusText("Échec Drive : " + item.error, "error");
                  self.renderQueue();
                  return acc;
                });
            }
            item.status = "error";
            item.error = msg;
            acc.errors.push({ item: item, error: item.error });
            self.setStatusText("Échec Drive : " + item.error, "error");
            self.renderQueue();
            return acc;
          });
      });
    }, Promise.resolve({ uploaded: [], errors: [] }));
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
        onDeleted: function () {},
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

  function renderLine(item) {
    return (
      '<div class="immo-doc-line" data-docs-line="' +
      esc(item.type) +
      '">' +
      '<span class="immo-doc-line-label">' +
      esc(item.label) +
      "</span>" +
      '<div class="immo-doc-line-upload">' +
      '<span class="immo-doc-status-badge" data-docs-status-badge hidden></span>' +
      '<label class="immo-doc-line-btn" title="PDF, JPG ou PNG — max 12 Mo">' +
      '<input type="file" accept="' +
      ACCEPT +
      '" multiple hidden data-docs-input data-doc-type="' +
      esc(item.type) +
      '" />' +
      "<span>Déposer</span></label>" +
      "</div>" +
      '<ul class="immo-doc-file-list" data-docs-files hidden></ul>' +
      "</div>"
    );
  }

  function renderGroup(group) {
    var lines = (group.items || []).map(renderLine).join("");
    var driveNote = group.driveFolder
      ? '<p class="immo-doc-drive-hint">→ Drive : <code>' + esc(group.driveFolder) + "</code></p>"
      : "";
    return (
      '<details class="immo-doc-cat" open data-docs-group="' +
      esc(group.id) +
      '">' +
      "<summary>" +
      esc(group.legend) +
      "</summary>" +
      driveNote +
      '<div class="immo-doc-cat-lines">' +
      lines +
      "</div></details>"
    );
  }

  function extraFieldsHtml(cfg) {
    if (!cfg.extraFields || !cfg.extraFields.length) return "";
    return (
      '<div class="devis-docs-extra" style="margin:12px 0">' +
      cfg.extraFields
        .map(function (f) {
          return (
            '<label style="display:block;margin:8px 0 4px;font-weight:600;font-size:.9rem">' +
            esc(f.label) +
            '<input name="' +
            esc(f.name) +
            '" type="' +
            esc(f.type || "text") +
            '" placeholder="' +
            esc(f.placeholder || "") +
            '" data-optional' +
            (f.required ? " required" : "") +
            ' style="width:100%;margin-top:4px" /></label>'
          );
        })
        .join("") +
      "</div>"
    );
  }

  function buildChecklistHtml(need, options) {
    options = options || {};
    var cfg = global.DEVIS_DOCUMENT_CONFIG ? global.DEVIS_DOCUMENT_CONFIG.getConfig(need) : null;
    if (!cfg) return "";
    var groups =
      global.DEVIS_DOCUMENT_CONFIG && global.DEVIS_DOCUMENT_CONFIG.getGroups
        ? global.DEVIS_DOCUMENT_CONFIG.getGroups(need)
        : [{ id: "docs", legend: "Pièces justificatives", driveFolder: "01_identite", items: cfg.items || [] }];
    var includeTitle = options.includeTitle !== false;
    return (
      '<div class="devis-docs-step" data-devis-documents-root>' +
      (includeTitle ? "<h3>" + esc(cfg.title) + "</h3>" : "") +
      '<p class="wizard-step-intro">' +
      esc(cfg.intro) +
      "</p>" +
      extraFieldsHtml(cfg) +
      '<div class="devis-docs-identity" data-docs-identity>' +
      '<p class="small">Le fichier part <strong>tout de suite</strong> vers Drive. Sans nom / e-mail / téléphone, le dossier s’appelle <strong>Dossier provisoire</strong> — il sera renommé quand les infos seront à jour.</p>' +
      '<div class="devis-docs-identity-row">' +
      '<input type="email" data-docs-identity-email autocomplete="email" placeholder="E-mail (pour nommer le dossier)" />' +
      '<input type="tel" data-docs-identity-phone autocomplete="tel" placeholder="Téléphone (optionnel)" />' +
      "</div></div>" +
      '<div class="immo-doc-categories devis-docs-groups">' +
      groups.map(renderGroup).join("") +
      "</div>" +
      '<p class="small" data-docs-status style="margin-top:8px;color:#64748b">Pastille verte = Reçu sur Drive. Sans contact : dossier « Dossier provisoire », renommé plus tard.</p>' +
      '<div data-docs-visual-panel hidden style="margin-top:14px"><div data-docs-visual-grid></div></div>' +
      "</div>"
    );
  }

  function buildStepHtml(need) {
    return (
      '<section class="wizard-step" hidden data-step="documents" data-step-name="documents" data-optional-step="1">' +
      buildChecklistHtml(need, { includeTitle: true }) +
      "</section>"
    );
  }

  function mountOnRoot(root, need) {
    if (!root) return null;
    var uploader = new DevisDocumentUpload(root, { need: need });
    uploader.renderQueue();
    return uploader;
  }

  function mountInForm(form, need) {
    var step = form.querySelector('[data-step-name="documents"]');
    if (!step) return null;
    var root = step.querySelector("[data-devis-documents-root]");
    if (!root) return null;
    var uploader = mountOnRoot(root, need);
    form._devisDocumentUpload = uploader;
    return uploader;
  }

  global.DevisDocumentUpload = {
    DevisDocumentUpload: DevisDocumentUpload,
    buildStepHtml: buildStepHtml,
    buildChecklistHtml: buildChecklistHtml,
    mountInForm: mountInForm,
    mountOnRoot: mountOnRoot,
    ACCEPT: ACCEPT,
    MAX_BYTES: MAX_BYTES,
  };
})(typeof window !== "undefined" ? window : global);
