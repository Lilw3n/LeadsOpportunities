/**
 * Upload documents par catégories — dépôt bien + financement recherche.
 * Multi-fichiers + statuts : En attente → Envoi… → Transmis → Reçu (Drive confirmé).
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

  function statusLabel(status) {
    if (status === "received") return "Reçu";
    if (status === "transmitted") return "Transmis";
    if (status === "uploading") return "Envoi…";
    if (status === "error") return "Erreur";
    if (status === "queued") return "En attente";
    return "";
  }

  function statusClass(status) {
    if (status === "received") return "is-received";
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
        return i.status === "received";
      })
    )
      return "received";
    if (
      items.some(function (i) {
        return i.status === "transmitted" || i.status === "received";
      })
    )
      return "transmitted";
    return "queued";
  }

  function driveConfirmed(res) {
    var data = (res && res.data) || {};
    var att = data.attachment || {};
    var drive = data.drive || {};
    return !!(
      drive.fileId ||
      drive.id ||
      drive.webViewLink ||
      att.driveFileId ||
      att.webViewLink ||
      (data.fileId && !data.simulated)
    );
  }

  function ImmoCategoryDocuments(root, options) {
    this.root = root;
    this.mode = options.mode || "vendeur";
    this.config = global.ImmoDocumentsConfig ? global.ImmoDocumentsConfig.getConfig(this.mode) : { groups: [] };
    this.queue = [];
    this.uploaded = [];
    this.crmMode = !!(options && options.crmMode);
    this.session = { email: null, phone: null, propertyId: null, leadId: null, contactId: null };
    this._render();
    this._bind();
  }

  ImmoCategoryDocuments.prototype.setSession = function (session) {
    Object.assign(this.session, session || {});
  };

  ImmoCategoryDocuments.prototype.setCrmMode = function (on) {
    this.crmMode = !!on;
    this._renderQueues();
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
          '<span class="immo-doc-status-badge" data-immo-doc-status-badge hidden></span>' +
          '<label class="immo-doc-line-btn" title="Plusieurs PDF / JPG / PNG — max 12 Mo chacun">' +
          '<input type="file" data-immo-doc-input accept="' +
          ACCEPT +
          '" data-doc-type="' +
          esc(it.type) +
          '" multiple hidden />' +
          "<span>Déposer</span></label>" +
          "</div>" +
          '<ul class="immo-doc-file-list" data-immo-doc-files hidden></ul>' +
          "</div>"
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
      "</div>" +
      '<div class="immo-doc-queue" data-immo-doc-queue hidden></div>' +
      "</details>"
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
      esc(cfg.intro || "") +
      " Plusieurs photos / PDF par pièce. Statut : <strong>En attente</strong> → <strong>Transmis</strong> → <strong>Reçu</strong> (confirmé Drive)." +
      "</p>" +
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

  ImmoCategoryDocuments.prototype._itemsForType = function (documentType) {
    var list = [];
    this.uploaded.forEach(function (u) {
      if (u.documentType === documentType) list.push(u);
    });
    this.queue.forEach(function (q) {
      if (q.documentType === documentType) list.push(q);
    });
    return list;
  };

  ImmoCategoryDocuments.prototype._refreshLine = function (documentType) {
    var line = this.root.querySelector('[data-immo-doc-line="' + documentType + '"]');
    if (!line) return;
    var items = this._itemsForType(documentType);
    var agg = aggregateStatus(items);
    line.classList.remove("is-queued", "is-done", "is-error", "is-transmitted", "is-uploading", "is-received");
    if (agg === "queued") line.classList.add("is-queued");
    if (agg === "uploading") line.classList.add("is-uploading");
    if (agg === "transmitted") line.classList.add("is-transmitted");
    if (agg === "received") line.classList.add("is-done", "is-received");
    if (agg === "error") line.classList.add("is-error");

    var badge = line.querySelector("[data-immo-doc-status-badge]");
    if (badge) {
      if (!agg) {
        badge.hidden = true;
        badge.textContent = "";
        badge.className = "immo-doc-status-badge";
      } else {
        badge.hidden = false;
        badge.textContent = statusLabel(agg) + (items.length > 1 ? " · " + items.length : "");
        badge.className = "immo-doc-status-badge " + statusClass(agg);
      }
    }

    var btn = line.querySelector(".immo-doc-line-btn span");
    if (btn) btn.textContent = items.length ? "Ajouter +" : "Déposer";

    var listEl = line.querySelector("[data-immo-doc-files]");
    if (!listEl) return;
    if (!items.length) {
      listEl.hidden = true;
      listEl.innerHTML = "";
      return;
    }
    listEl.hidden = false;
    listEl.innerHTML = items
      .map(function (item) {
        return (
          "<li>" +
          '<span class="immo-doc-file-pill ' +
          statusClass(item.status) +
          '">' +
          esc(statusLabel(item.status) || "—") +
          "</span>" +
          '<span class="immo-doc-file-name" title="' +
          esc(item.fileName) +
          '">' +
          esc(item.fileName) +
          "</span>" +
          "</li>"
        );
      })
      .join("");
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
    this._refreshLine(documentType);
    if (!this.crmMode) this.scheduleImmediateUpload();
  };

  ImmoCategoryDocuments.prototype.syncSessionFromPage = function () {
    var form = document.querySelector("[data-url-capture-form], form[data-quote-wizard], form[data-track-form]");
    if (form) {
      var em = form.querySelector("[name='email']");
      var ph = form.querySelector("[name='phone']");
      if (em && String(em.value || "").trim()) this.session.email = String(em.value).trim().toLowerCase();
      if (ph && String(ph.value || "").trim()) this.session.phone = String(ph.value).trim();
    }
    try {
      var leadId = localStorage.getItem("lo_immo_deposit_lead_id") || localStorage.getItem("lo_draft_lead_id");
      if (leadId) this.session.leadId = leadId;
    } catch (e) {}
    if (global.QuoteIntelligence && global.QuoteIntelligence.getDraftLeadId) {
      this.session.leadId = this.session.leadId || global.QuoteIntelligence.getDraftLeadId();
    }
    return this.session;
  };

  ImmoCategoryDocuments.prototype.scheduleImmediateUpload = function () {
    var self = this;
    clearTimeout(self._uploadTimer);
    self._uploadTimer = setTimeout(function () {
      self.syncSessionFromPage();
      var ensure =
        global.AcheteurImmoDepositGuide && global.AcheteurImmoDepositGuide.ensureServerLead
          ? global.AcheteurImmoDepositGuide.ensureServerLead()
          : Promise.resolve(self.session.leadId);
      Promise.resolve(ensure).then(function (leadId) {
        if (leadId) self.session.leadId = leadId;
        self.syncSessionFromPage();
        if (self.mode === "vendeur" || self.mode === "vendeur-immo") {
          if (!self.session.propertyId || !self.session.email) return null;
        } else if (!self.session.email && !self.session.contactId && !self.session.leadId) {
          return null;
        }
        return self.uploadAll();
      });
    }, 80);
  };

  ImmoCategoryDocuments.prototype._renderQueues = function () {
    var st = this.root.querySelector("[data-immo-doc-status]");
    if (st) {
      var n = this.queue.filter(function (q) {
        return q.status === "queued" || q.status === "error";
      }).length;
      st.hidden = !n;
      if (n) {
        st.textContent = this.crmMode
          ? n + " fichier(s) en attente — cliquez « Enregistrer les pièces » pour envoyer."
          : n + " fichier(s) — envoi immédiat en cours…";
      }
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
    } else if (!this.session.email && !this.session.contactId && !this.session.leadId && !this.session.phone) {
      return Promise.resolve({ uploaded: [], errors: [{ error: "email, téléphone, contactId ou leadId requis" }] });
    }

    return pending
      .reduce(
        function (chain, item) {
          return chain.then(function (acc) {
            item.status = "uploading";
            self._refreshLine(item.documentType);
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
                    phone: self.session.phone,
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
                var att = (res.data && res.data.attachment) || {};
                var drive = (res.data && res.data.drive) || {};
                item.driveFileId = drive.fileId || att.driveFileId || null;
                item.webViewLink = drive.webViewLink || att.webViewLink || null;
                item.status = driveConfirmed(res) ? "received" : "transmitted";
                self.uploaded.push({
                  id: item.id,
                  fileName: item.fileName,
                  documentType: item.documentType,
                  groupId: item.groupId,
                  status: item.status,
                  driveFileId: item.driveFileId,
                  webViewLink: item.webViewLink,
                });
                acc.uploaded.push(item);
                self._refreshLine(item.documentType);
                return acc;
              })
              .catch(function (err) {
                item.status = "error";
                item.error = err.message || "Erreur";
                acc.errors.push({ item: item, error: item.error });
                self._refreshLine(item.documentType);
                return acc;
              });
          });
        },
        Promise.resolve({ uploaded: [], errors: [] })
      )
      .then(function (result) {
        self.queue = self.queue.filter(function (q) {
          return q.status !== "received" && q.status !== "transmitted";
        });
        self._renderQueues();
        var st = self.root.querySelector("[data-immo-doc-status]");
        if (st && result.uploaded.length) {
          st.hidden = false;
          var received = result.uploaded.filter(function (u) {
            return u.status === "received";
          }).length;
          var transmitted = result.uploaded.length - received;
          var parts = [];
          if (received) parts.push(received + " reçu(s)");
          if (transmitted) parts.push(transmitted + " transmis");
          st.textContent =
            parts.join(" · ") +
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

  document.addEventListener("lo:lead-progress-saved", function (ev) {
    var detail = (ev && ev.detail) || {};
    document.querySelectorAll("[data-immo-docs-panel]").forEach(function (panel) {
      if (!panel._immoDocs || panel._immoDocs.crmMode) return;
      if (detail.leadId) panel._immoDocs.session.leadId = detail.leadId;
      if (detail.contactId) panel._immoDocs.session.contactId = detail.contactId;
      var pending = panel._immoDocs.queue.some(function (q) {
        return q.status === "queued" || q.status === "error";
      });
      if (pending) panel._immoDocs.scheduleImmediateUpload();
    });
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
