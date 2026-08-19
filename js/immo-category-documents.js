/**
 * Upload documents par catégories — dépôt bien + financement recherche.
 */
(function (global) {
  var MAX_BYTES = 12 * 1024 * 1024;
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
    this.uploaded = [];
    this.session = { email: null, phone: null, propertyId: null, leadId: null, contactId: null };
    this._render();
    this._bind();
  }

  ImmoCategoryDocuments.prototype.setSession = function (session) {
    Object.assign(this.session, session || {});
  };

  ImmoCategoryDocuments.prototype._renderGroup = function (g) {
    var opts = g.items
      .map(function (it) {
        return '<option value="' + esc(it.type) + '">' + esc(it.label) + "</option>";
      })
      .join("");
    var list = g.items
      .map(function (it) {
        return "<li>" + esc(it.label) + "</li>";
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
      '<ul class="immo-doc-cat-list">' +
      list +
      "</ul>" +
      '<div class="immo-doc-cat-upload" data-immo-doc-slot="' +
      esc(g.id) +
      '">' +
      '<label class="immo-doc-type-label">Type de pièce</label>' +
      '<select data-immo-doc-type data-optional>' +
      opts +
      "</select>" +
      '<div class="immo-doc-drop" data-immo-doc-drop tabindex="0" role="button">' +
      "<strong>Ajouter un fichier</strong>" +
      "<p>PDF, JPG, PNG — max 12 Mo</p>" +
      '<input type="file" data-immo-doc-input accept="' +
      ACCEPT +
      '" hidden />' +
      "</div>" +
      '<div class="immo-doc-queue" data-immo-doc-queue></div>' +
      "</div></details>"
    );
  };

  ImmoCategoryDocuments.prototype._render = function () {
    var cfg = this.config;
    var groupsHtml = "";

    if (cfg.zones && cfg.zones.length) {
      groupsHtml = cfg.zones
        .map(function (zone) {
          var inner = (zone.groups || []).map(this._renderGroup.bind(this)).join("");
          return (
            '<section class="immo-doc-zone" data-immo-doc-zone="' +
            esc(zone.id) +
            '">' +
            '<h5 class="immo-doc-zone-title">' +
            esc(zone.label) +
            "</h5>" +
            (zone.driveHint
              ? '<p class="immo-doc-zone-hint">' + esc(zone.driveHint) + "</p>"
              : "") +
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
      "</p>" +
      '<div class="immo-doc-categories">' +
      groupsHtml +
      "</div>" +
      '<p class="small immo-doc-panel-foot" data-immo-doc-status hidden></p>' +
      "</div>";
  };

  ImmoCategoryDocuments.prototype._bind = function () {
    var self = this;
    this.root.addEventListener("click", function (e) {
      var drop = e.target.closest("[data-immo-doc-drop]");
      if (!drop || !self.root.contains(drop)) return;
      var input = drop.querySelector("[data-immo-doc-input]");
      if (input) input.click();
    });

    this.root.addEventListener("change", function (e) {
      var input = e.target.closest("[data-immo-doc-input]");
      if (!input || !self.root.contains(input) || !input.files || !input.files[0]) return;
      var slot = input.closest("[data-immo-doc-slot]");
      var typeSel = slot && slot.querySelector("[data-immo-doc-type]");
      var group = slot && slot.getAttribute("data-immo-doc-slot");
      self.addFile(input.files[0], typeSel ? typeSel.value : "autre_doc", group);
      input.value = "";
    });

    this.root.addEventListener("dragover", function (e) {
      var drop = e.target.closest("[data-immo-doc-drop]");
      if (!drop || !self.root.contains(drop)) return;
      e.preventDefault();
      drop.classList.add("is-dragover");
    });
    this.root.addEventListener("dragleave", function (e) {
      var drop = e.target.closest("[data-immo-doc-drop]");
      if (drop) drop.classList.remove("is-dragover");
    });
    this.root.addEventListener("drop", function (e) {
      var drop = e.target.closest("[data-immo-doc-drop]");
      if (!drop || !self.root.contains(drop)) return;
      e.preventDefault();
      drop.classList.remove("is-dragover");
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (!f) return;
      var slot = drop.closest("[data-immo-doc-slot]");
      var typeSel = slot && slot.querySelector("[data-immo-doc-type]");
      var group = slot && slot.getAttribute("data-immo-doc-slot");
      self.addFile(f, typeSel ? typeSel.value : "autre_doc", group);
    });

    this.root.addEventListener("click", function (e) {
      var rm = e.target.closest("[data-immo-doc-remove]");
      if (!rm) return;
      var id = rm.getAttribute("data-immo-doc-remove");
      self.queue = self.queue.filter(function (q) {
        return q.id !== id;
      });
      self._renderQueues();
    });
  };

  ImmoCategoryDocuments.prototype.addFile = function (file, documentType, groupId) {
    if (!isAllowedFile(file)) {
      alert("Format refuse — deposez uniquement PDF, JPG ou PNG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      alert("Fichier trop volumineux (max 12 Mo) : " + file.name);
      return;
    }
    this.queue.push({
      id: "doc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      file: file,
      fileName: file.name,
      documentType: documentType || "autre_doc",
      groupId: groupId || "",
      mimeType: mimeForFile(file),
      status: "queued",
    });
    this._renderQueues();
  };

  ImmoCategoryDocuments.prototype._renderQueues = function () {
    var self = this;
    this.root.querySelectorAll("[data-immo-doc-slot]").forEach(function (slot) {
      var gid = slot.getAttribute("data-immo-doc-slot");
      var mount = slot.querySelector("[data-immo-doc-queue]");
      if (!mount) return;
      var items = self.queue.filter(function (q) {
        return q.groupId === gid;
      });
      if (!items.length) {
        mount.innerHTML = "";
        return;
      }
      mount.innerHTML = items
        .map(function (q) {
          return (
            '<div class="immo-doc-card">' +
            "<span>" +
            esc(q.fileName) +
            ' <em class="small">(' +
            esc(q.documentType) +
            ")</em></span>" +
            '<button type="button" class="btn btn-soft btn-sm" data-immo-doc-remove="' +
            esc(q.id) +
            '">Retirer</button></div>"
          );
        })
        .join("");
    });
    var st = this.root.querySelector("[data-immo-doc-status]");
    if (st) {
      var n = this.queue.length;
      st.hidden = !n;
      if (n) st.textContent = n + " fichier(s) en attente — envoyés avec le formulaire.";
    }
  };

  ImmoCategoryDocuments.prototype.uploadAll = function () {
    var self = this;
    var pending = this.queue.filter(function (q) {
      return q.status === "queued" || q.status === "error";
    });
    if (!pending.length) return Promise.resolve({ uploaded: [], errors: [] });

    if (this.mode === "vendeur" || this.mode === "vendeur-immo") {
      if (!this.session.propertyId || !this.session.email) {
        return Promise.resolve({
          uploaded: [],
          errors: [{ error: "propertyId et email requis pour les documents bien" }],
        });
      }
    } else if (!this.session.email && !this.session.contactId) {
      return Promise.resolve({ uploaded: [], errors: [{ error: "email ou contactId requis" }] });
    }

    return pending.reduce(
      function (chain, item) {
        return chain.then(function (acc) {
          item.status = "uploading";
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
                throw new Error((res.data && res.data.error) || "Upload impossible");
              }
              item.status = "done";
              self.uploaded.push(item);
              acc.uploaded.push(item);
              return acc;
            })
            .catch(function (err) {
              item.status = "error";
              item.error = err.message || "Erreur";
              acc.errors.push({ item: item, error: item.error });
              return acc;
            });
        });
      },
      Promise.resolve({ uploaded: [], errors: [] })
    ).then(function (result) {
      self.queue = self.queue.filter(function (q) {
        return q.status !== "done";
      });
      self._renderQueues();
      var st = self.root.querySelector("[data-immo-doc-status]");
      if (st && result.uploaded.length) {
        st.hidden = false;
        st.textContent =
          result.uploaded.length +
          " document(s) enregistré(s)" +
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
