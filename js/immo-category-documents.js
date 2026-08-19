/**
 * Upload documents par catégories — dépôt bien + financement recherche.
 * Multi-fichiers, aperçu latéral, lien Drive.
 */
(function (global) {
  var Preview = global.ImmoDocPreview;
  var MAX_BYTES = Preview ? Preview.MAX_BYTES : 12 * 1024 * 1024;
  var ACCEPT = ".pdf,.jpg,.jpeg,.png";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

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
    if (/\.webp$/i.test(file.name)) return "image/webp";
    return "image/jpeg";
  }

  function isAllowedFile(file) {
    var mime = mimeForFile(file);
    if (mime === "application/pdf" || mime === "image/jpeg" || mime === "image/png") return true;
    return /\.(pdf|jpe?g|png)$/i.test(file.name || "");
  }

  function ImmoCategoryDocuments(root, options) {
    this.root = root;
    this.mode = options.mode || "vendeur";
    this.config = global.ImmoDocumentsConfig ? global.ImmoDocumentsConfig.getConfig(this.mode) : { groups: [] };
    this.queue = [];
    this.session = { email: null, phone: null, propertyId: null, leadId: null, contactId: null };
    this._render();
    this._bind();
    if (Preview) {
      Preview.ensureWorkspace(this.root);
      Preview.attachGroupPreview(this.root, "details.immo-doc-cat", this._groupItems.bind(this));
    }
  }

  ImmoCategoryDocuments.prototype._groupItems = function (groupEl) {
    var slot = groupEl.querySelector("[data-immo-doc-slot]");
    var gid = slot && slot.getAttribute("data-immo-doc-slot");
    if (!gid) return [];
    return this.queue.filter(function (q) {
      return q.groupId === gid;
    });
  };

  ImmoCategoryDocuments.prototype._filesForType = function (documentType) {
    return this.queue.filter(function (q) {
      return q.documentType === documentType;
    });
  };

  ImmoCategoryDocuments.prototype._findLine = function (documentType) {
    return this.root.querySelector('[data-immo-doc-line="' + documentType + '"]');
  };

  ImmoCategoryDocuments.prototype._previewContext = function (line) {
    if (!line) return "";
    var lbl = line.querySelector(".immo-doc-line-label");
    return lbl ? lbl.textContent.replace(/\s+/g, " ").trim() : "";
  };

  ImmoCategoryDocuments.prototype._refreshLine = function (documentType) {
    if (!Preview) return;
    var line = this._findLine(documentType);
    var list = this._filesForType(documentType);
    var self = this;
    Preview.refreshLineFiles(line, list, function (item) {
      Preview.showPreview(self.root, item, self._previewContext(line));
    });
    Preview.syncLineState(line, list);
  };

  ImmoCategoryDocuments.prototype._updateChip = function (item) {
    if (!item.chipEl || !Preview) return;
    var st = item.chipEl.querySelector(".immo-doc-file-chip-status");
    if (st) {
      st.className =
        "immo-doc-file-chip-status immo-doc-file-chip-status--" + (item.status || "queued");
      st.textContent = Preview.statusLabel(item.status);
    }
  };

  ImmoCategoryDocuments.prototype.setSession = function (session) {
    Object.assign(this.session, session || {});
  };

  ImmoCategoryDocuments.prototype._renderGroup = function (g) {
    var lines = (g.items || [])
      .map(function (it) {
        return (
          '<div class="immo-doc-line" data-immo-doc-line="' +
          esc(it.type) +
          '">' +
          '<span class="immo-doc-line-label">' +
          esc(it.label) +
          "</span>" +
          '<div class="immo-doc-line-upload">' +
          '<label class="immo-doc-line-btn" title="PDF, JPG ou PNG — max 12 Mo, plusieurs fichiers">' +
          '<input type="file" data-immo-doc-input accept="' +
          ACCEPT +
          '" multiple data-doc-type="' +
          esc(it.type) +
          '" hidden />' +
          "<span>Déposer</span></label>" +
          "</div></div>"
        );
      })
      .join("");
    var driveNote = g.driveFolder
      ? '<p class="immo-doc-drive-hint">→ Drive : <code>' + esc(g.driveFolder) + "</code></p>"
      : "";
    return (
      '<details class="immo-doc-cat" open data-immo-doc-group="' +
      esc(g.id) +
      '">' +
      "<summary>" +
      esc(g.label) +
      "</summary>" +
      driveNote +
      '<div class="immo-doc-cat-lines" data-immo-doc-slot="' +
      esc(g.id) +
      '">' +
      lines +
      "</div></details>"
    );
  };

  ImmoCategoryDocuments.prototype._render = function () {
    var cfg = this.config;
    var groupsHtml = "";

    if (cfg.zones && cfg.zones.length) {
      groupsHtml = cfg.zones
        .map(function (zone) {
          var inner = zone.groups.map(this._renderGroup.bind(this)).join("");
          return (
            '<section class="immo-doc-zone" data-immo-doc-zone="' +
            esc(zone.id) +
            '">' +
            '<h5 class="immo-doc-zone-title">' +
            esc(zone.label) +
            "</h5>" +
            (zone.driveHint ? '<p class="immo-doc-zone-hint">' + esc(zone.driveHint) + "</p>" : "") +
            inner +
            "</section>"
          );
        }, this)
        .join("");
    } else {
      groupsHtml = (cfg.groups || []).map(this._renderGroup.bind(this)).join("");
    }

    this.root.innerHTML =
      '<div class="immo-doc-panel-inner">' +
      '<h4 class="immo-doc-panel-title">' +
      esc(cfg.title) +
      "</h4>" +
      '<p class="small immo-doc-panel-intro">' +
      esc(cfg.intro) +
      " Plusieurs fichiers par ligne (max 12 Mo chacun) — cliquez l’œil pour l’aperçu.</p>" +
      '<div class="immo-doc-categories">' +
      groupsHtml +
      "</div>" +
      '<p class="small immo-doc-panel-foot" data-immo-doc-status hidden></p>' +
      "</div>";
  };

  ImmoCategoryDocuments.prototype._bind = function () {
    var self = this;
    this.root.addEventListener("change", function (e) {
      var input = e.target.closest("[data-immo-doc-input]");
      if (!input || !self.root.contains(input) || !input.files || !input.files.length) return;
      var slot = input.closest("[data-immo-doc-slot]");
      var group = slot && slot.getAttribute("data-immo-doc-slot");
      var docType = input.getAttribute("data-doc-type") || "autre_doc";
      Array.prototype.forEach.call(input.files, function (file) {
        self.addFile(file, docType, group);
      });
      input.value = "";
    });
  };

  ImmoCategoryDocuments.prototype.addFile = function (file, documentType, groupId) {
    if (!isAllowedFile(file)) {
      alert("Format refuse — deposez uniquement PDF, JPG ou PNG.");
      return;
    }
    var existing = this._filesForType(documentType);
    var err = Preview ? Preview.validateFile(file, existing.length) : null;
    if (err) {
      alert(err);
      return;
    }
    if (!Preview && file.size > MAX_BYTES) {
      alert("Fichier trop volumineux (max 12 Mo) : " + file.name);
      return;
    }

    var item = {
      id: "doc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      file: file,
      fileName: file.name,
      fileSize: file.size,
      documentType: documentType || "autre_doc",
      groupId: groupId || "",
      mimeType: mimeForFile(file),
      status: "queued",
      previewUrl: Preview ? Preview.createPreviewUrl(file) : null,
      webViewLink: null,
      driveFileId: null,
    };
    this.queue.push(item);
    this._renderQueues();
    this._refreshLine(documentType);
    if (Preview) {
      Preview.showPreview(this.root, item, this._previewContext(this._findLine(documentType)));
    }
    document.dispatchEvent(
      new CustomEvent("lo:immo-doc-file", {
        detail: { documentType: documentType, status: "queued", mode: this.mode },
      })
    );
    if (global.ImmoDepositDriveSession && global.ImmoDepositDriveSession.hasSession()) {
      global.ImmoDepositDriveSession.scheduleUpload();
    }
  };

  ImmoCategoryDocuments.prototype._renderQueues = function () {
    var st = this.root.querySelector("[data-immo-doc-status]");
    if (!st) return;
    var pending = this.queue.filter(function (q) {
      return q.status === "queued" || q.status === "uploading" || q.status === "error";
    }).length;
    var done = this.queue.filter(function (q) {
      return q.status === "done";
    }).length;
    st.hidden = !this.queue.length;
    if (this.queue.length) {
      st.textContent =
        this.queue.length +
        " fichier(s)" +
        (done ? " · " + done + " sur Drive" : "") +
        (pending ? " · " + pending + " en attente" : "") +
        (global.ImmoDepositDriveSession && global.ImmoDepositDriveSession.hasSession()
          ? " — envoi automatique"
          : " — envoyés après enregistrement du dossier");
    }
  };

  ImmoCategoryDocuments.prototype.uploadAll = function () {
    var self = this;
    var pending = this.queue.filter(function (q) {
      return q.status === "queued" || q.status === "error";
    });
    if (!pending.length) return Promise.resolve({ uploaded: [], errors: [] });

    if (this.mode === "vendeur" || this.mode === "vendeur-immo") {
      if (
        !this.session.propertyId ||
        (!this.session.email && !this.session.phone && !this.session.contactId)
      ) {
        return Promise.resolve({
          uploaded: [],
          errors: [{ error: "propertyId et email, téléphone ou contactId requis pour les documents bien" }],
        });
      }
    } else if (!this.session.email && !this.session.contactId) {
      return Promise.resolve({ uploaded: [], errors: [{ error: "email ou contactId requis" }] });
    }

    return pending
      .reduce(
        function (chain, item) {
          return chain.then(function (acc) {
            item.status = "uploading";
            self._updateChip(item);
            return readFileAsBase64(item.file)
              .then(function (dataUrl) {
                if (self.mode === "vendeur" || self.mode === "vendeur-immo") {
                  return fetch("/api/immo-listing-document", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({
                      propertyId: self.session.propertyId,
                      email: self.session.email,
                      phone: self.session.phone,
                      contactId: self.session.contactId,
                      leadId: self.session.leadId,
                      documentType: item.documentType,
                      documentGroup: item.groupId,
                      fileName: item.fileName,
                      mimeType: item.mimeType,
                      fileBase64: dataUrl,
                    }),
                  });
                }
                return fetch("/api/external/upload", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "same-origin",
                  body: JSON.stringify({
                    email: self.session.email,
                    contactId: self.session.contactId,
                    leadId: self.session.leadId,
                    fileName: item.fileName,
                    documentType: item.documentType,
                    mimeType: item.mimeType,
                    fileBase64: dataUrl,
                    vertical: "acheteur-immo",
                    need: "acheteur-immo",
                    source: "immo_recherche_docs",
                    description: "Catégorie : " + (item.groupId || ""),
                  }),
                });
              })
              .then(function (r) {
                return r.json().then(function (data) {
                  return { ok: r.ok, data: data };
                });
              })
              .then(function (res) {
                if (!res.ok || !res.data || !res.data.ok) {
                  throw new Error((res.data && (res.data.error || res.data.message)) || "Upload impossible");
                }
                var meta = Preview ? Preview.extractDriveMeta(res.data) : {};
                if (meta.simulated) {
                  throw new Error("Google Drive non disponible — contactez votre conseiller");
                }
                item.status = "done";
                item.webViewLink = meta.webViewLink || (res.data.drive && res.data.drive.webViewLink) || null;
                item.driveFileId = meta.driveFileId;
                self._updateChip(item);
                self._refreshLine(item.documentType);
                document.dispatchEvent(
                  new CustomEvent("lo:immo-doc-file", {
                    detail: { documentType: item.documentType, status: "done", mode: self.mode },
                  })
                );
                acc.uploaded.push(item);
                return acc;
              })
              .catch(function (err) {
                item.status = "error";
                item.error = err.message || "Erreur";
                self._updateChip(item);
                self._refreshLine(item.documentType);
                acc.errors.push({ item: item, error: item.error });
                return acc;
              });
          });
        },
        Promise.resolve({ uploaded: [], errors: [] })
      )
      .then(function (result) {
        self._renderQueues();
        var st = self.root.querySelector("[data-immo-doc-status]");
        if (st && result.uploaded.length) {
          st.hidden = false;
          st.textContent =
            result.uploaded.length +
            " document(s) enregistré(s) sur Drive" +
            (result.errors.length ? " — " + result.errors.length + " erreur(s)." : ".");
        }
        return result;
      });
  };

  function mount(selector, mode) {
    var el = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!el || el.dataset.immoDocsBound) return el && el._immoDocs;
    el.dataset.immoDocsBound = "1";
    var inst = new ImmoCategoryDocuments(el, { mode: mode });
    el._immoDocs = inst;
    return inst;
  }

  function boot() {
    document.querySelectorAll("[data-immo-docs-panel]").forEach(function (el) {
      mount(el, el.getAttribute("data-immo-docs-panel") || "vendeur");
    });
  }

  global.ImmoCategoryDocuments = {
    mount: mount,
    ImmoCategoryDocuments: ImmoCategoryDocuments,
    uploadPanel: function (selector, session) {
      var el = document.querySelector(selector);
      if (!el || !el._immoDocs) return Promise.resolve({ uploaded: [], errors: [] });
      el._immoDocs.setSession(session || {});
      return el._immoDocs.uploadAll();
    },
  };

  document.addEventListener("lo:lead-sent", function (ev) {
    var detail = (ev && ev.detail) || {};
    var payload = detail.payload || {};
    var result = detail.result || {};
    var email = payload.email || "";
    var panel = document.querySelector('[data-immo-docs-panel="acheteur"]');
    if (!panel || !panel._immoDocs) return;
    panel._immoDocs.setSession({
      email: email,
      contactId: result.contactId || null,
      leadId: result.leadId || payload.leadId || null,
    });
    panel._immoDocs.uploadAll();
  });

  document.addEventListener("lo:listing-submitted", function (ev) {
    var detail = (ev && ev.detail) || {};
    var session = detail.session || {};
    var panel = document.querySelector('[data-immo-docs-panel="vendeur"]');
    if (!panel || !panel._immoDocs || !session.propertyId) return;
    panel._immoDocs.setSession(session);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
