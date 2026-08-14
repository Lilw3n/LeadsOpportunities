/**
 * Liste « Pièces à importer » — Importer / + / aperçu / Envoyer → Drive + o2switch.
 */
(function (global) {
  var MAX_BYTES = 12 * 1024 * 1024;
  var ACCEPT = ".pdf,.jpg,.jpeg,.png";

  var ICON_PLUS =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>';
  var ICON_EYE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var ICON_TRASH =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2M8 7l1 12h6l1-12" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_SEND =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M3.4 20.6 21 12 3.4 3.4 3 10l11 2L3 14z"/></svg>';

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function mimeForFile(file) {
    if (file.type) return file.type;
    if (/\.pdf$/i.test(file.name)) return "application/pdf";
    if (/\.png$/i.test(file.name)) return "image/png";
    return "image/jpeg";
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

  function uid() {
    return "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  }

  function PiecesImport(root, options) {
    this.root = root;
    this.options = options || {};
    this.need = options.need || "pieces";
    this.mode = options.mode || "standalone";
    this.session = {
      email: options.email || null,
      contactId: options.contactId || null,
      leadId: options.leadId || null,
    };
    this.config = global.DEVIS_DOCUMENT_CONFIG
      ? global.DEVIS_DOCUMENT_CONFIG.getConfig(this.need)
      : { title: "Envoi de vos pièces justificatives", section: "Pièces à importer", intro: "", items: [] };
    this.rows = (this.config.items || []).map(function (it) {
      return {
        type: it.type,
        label: it.label,
        required: !!it.required,
        files: [],
      };
    });
    this.uploaded = [];
    this.pendingRowIndex = null;
    this._bindShell();
    this.render();
  }

  PiecesImport.prototype._bindShell = function () {
    var self = this;
    if (!this.root.querySelector("[data-pi-input]")) {
      var input = document.createElement("input");
      input.type = "file";
      input.accept = ACCEPT;
      input.hidden = true;
      input.setAttribute("data-pi-input", "1");
      this.root.appendChild(input);
    }
    this.input = this.root.querySelector("[data-pi-input]");
    this.input.addEventListener("change", function () {
      var file = self.input.files && self.input.files[0];
      var idx = self.pendingRowIndex;
      self.input.value = "";
      self.pendingRowIndex = null;
      if (file != null && idx != null) self.addFile(idx, file);
    });
    this.root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-pi-action]");
      if (!btn) return;
      var action = btn.getAttribute("data-pi-action");
      var row = Number(btn.getAttribute("data-pi-row"));
      var fileId = btn.getAttribute("data-pi-file");
      if (action === "import" || action === "plus") self.openPicker(row);
      if (action === "preview") self.preview(row, fileId);
      if (action === "remove") self.removeFile(row, fileId);
      if (action === "send") self.send();
      if (action === "close-preview") self.closePreview();
    });
  };

  PiecesImport.prototype.openPicker = function (rowIndex) {
    this.pendingRowIndex = rowIndex;
    this.input.click();
  };

  PiecesImport.prototype.addFile = function (rowIndex, file) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      this.setMsg("Fichier trop volumineux (max 12 Mo) : " + file.name, "error");
      return;
    }
    var row = this.rows[rowIndex];
    if (!row) return;
    var item = {
      id: uid(),
      file: file,
      fileName: file.name,
      mimeType: mimeForFile(file),
      status: "queued",
      preview: null,
      objectUrl: URL.createObjectURL(file),
    };
    var self = this;
    if (item.mimeType.indexOf("image") !== -1) {
      readFileAsBase64(file).then(function (url) {
        item.preview = url;
        self.render();
      });
    }
    row.files.push(item);
    this.setMsg("");
    this.render();
  };

  PiecesImport.prototype.removeFile = function (rowIndex, fileId) {
    var row = this.rows[rowIndex];
    if (!row || !row.files.length) return;
    if (fileId) {
      row.files = row.files.filter(function (f) {
        if (f.id === fileId && f.objectUrl) URL.revokeObjectURL(f.objectUrl);
        return f.id !== fileId;
      });
    } else {
      var last = row.files.pop();
      if (last && last.objectUrl) URL.revokeObjectURL(last.objectUrl);
    }
    this.render();
  };

  PiecesImport.prototype.fileById = function (row, fileId) {
    if (!row || !row.files.length) return null;
    if (!fileId) return row.files[row.files.length - 1];
    for (var i = 0; i < row.files.length; i++) {
      if (row.files[i].id === fileId) return row.files[i];
    }
    return row.files[row.files.length - 1];
  };

  PiecesImport.prototype.preview = function (rowIndex, fileId) {
    var row = this.rows[rowIndex];
    var item = this.fileById(row, fileId);
    if (!item) return;
    var box = this.root.querySelector("[data-pi-preview]");
    var body = this.root.querySelector("[data-pi-preview-body]");
    var title = this.root.querySelector("[data-pi-preview-title]");
    if (!box || !body) return;
    title.textContent = item.fileName;
    if (item.mimeType.indexOf("image") !== -1) {
      body.innerHTML = '<img src="' + esc(item.objectUrl || item.preview) + '" alt="" />';
    } else {
      body.innerHTML =
        '<iframe src="' +
        esc(item.objectUrl) +
        '" title="' +
        esc(item.fileName) +
        '"></iframe>';
    }
    box.hidden = false;
  };

  PiecesImport.prototype.closePreview = function () {
    var box = this.root.querySelector("[data-pi-preview]");
    if (box) box.hidden = true;
  };

  PiecesImport.prototype.missingRequired = function () {
    return this.rows.filter(function (r) {
      return r.required && !r.files.length;
    });
  };

  PiecesImport.prototype.allFiles = function () {
    var out = [];
    this.rows.forEach(function (row) {
      row.files.forEach(function (f) {
        out.push({ row: row, item: f });
      });
    });
    return out;
  };

  PiecesImport.prototype.setSession = function (session) {
    this.session.email = session.email || this.session.email;
    this.session.contactId = session.contactId || this.session.contactId;
    this.session.leadId = session.leadId || this.session.leadId;
  };

  PiecesImport.prototype.setMsg = function (text, kind) {
    var el = this.root.querySelector("[data-pi-msg]");
    if (!el) return;
    el.textContent = text || "";
    el.className = "pi-msg" + (kind ? " " + kind : "");
  };

  PiecesImport.prototype.uploadQueued = function () {
    var self = this;
    var pending = this.allFiles().filter(function (x) {
      return x.item.status === "queued" || x.item.status === "error";
    });
    if (!pending.length) return Promise.resolve({ uploaded: [], errors: [] });
    if (!this.session.email && !this.session.contactId) {
      return Promise.resolve({ uploaded: [], errors: [{ error: "email ou contactId manquant" }] });
    }
    return pending.reduce(function (chain, entry) {
      return chain.then(function (acc) {
        var item = entry.item;
        item.status = "uploading";
        self.render();
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
                documentType: entry.row.type,
                documentLabel: entry.row.label,
                mimeType: item.mimeType,
                fileBase64: dataUrl,
                vertical: self.need,
                need: self.need,
                source: self.options.source || "pieces_import",
              }),
            });
          })
          .then(function (r) {
            return r.json().then(function (data) {
              if (!r.ok || !data.ok) throw new Error((data && data.error) || "Envoi impossible");
              return data;
            });
          })
          .then(function (data) {
            item.status = "done";
            item.result = data;
            if (data.contactId) self.session.contactId = data.contactId;
            self.uploaded.push(item);
            acc.uploaded.push(item);
            self.render();
            return acc;
          })
          .catch(function (err) {
            item.status = "error";
            item.error = err.message || "Erreur";
            acc.errors.push({ item: item, error: item.error });
            self.render();
            return acc;
          });
      });
    }, Promise.resolve({ uploaded: [], errors: [] }));
  };

  PiecesImport.prototype.send = function () {
    var self = this;
    var emailInput = this.root.querySelector("[name=piEmail]");
    if (emailInput && emailInput.value) {
      this.session.email = String(emailInput.value).trim().toLowerCase();
    }
    var missing = this.missingRequired();
    if (missing.length) {
      this.setMsg("Pièce obligatoire manquante : " + missing[0].label, "error");
      return;
    }
    if (!this.allFiles().length) {
      this.setMsg("Ajoutez au moins un fichier avant d’envoyer.", "error");
      return;
    }
    if (!this.session.email && !this.session.contactId) {
      this.setMsg("Indiquez votre e-mail pour rattacher les pièces à votre dossier.", "error");
      return;
    }
    var sendBtn = this.root.querySelector('[data-pi-action="send"]');
    if (sendBtn) sendBtn.disabled = true;
    this.setMsg("Envoi vers votre dossier (Drive)…");
    this.uploadQueued().then(function (res) {
      if (sendBtn) sendBtn.disabled = false;
      if (res.errors.length && !res.uploaded.length) {
        self.setMsg(res.errors[0].error || "Envoi impossible", "error");
        return;
      }
      if (res.errors.length) {
        self.setMsg(
          res.uploaded.length +
            " pièce(s) envoyée(s), " +
            res.errors.length +
            " échec(s). Vous pouvez renvoyer les fichiers en erreur.",
          "error"
        );
        return;
      }
      self.showSuccess(res.uploaded.length);
    });
  };

  PiecesImport.prototype.showSuccess = function (count) {
    var mount = this.root.querySelector("[data-pi-main]");
    if (!mount) {
      this.setMsg(count + " pièce(s) transmise(s) et archivée(s).", "ok");
      return;
    }
    var back = this.options.backHref || "../index.html";
    mount.innerHTML =
      '<div class="pi-success"><h2>Pièces transmises</h2>' +
      "<p>" +
      count +
      " fichier(s) ont été déposés sur votre dossier (Google Drive" +
      (this.options.backupHint !== false ? ", copie de secours si configurée" : "") +
      ").</p>" +
      '<div class="pi-footer" style="justify-content:center"><a class="pi-btn-send" href="' +
      esc(back) +
      '">Terminer</a></div></div>';
  };

  PiecesImport.prototype.render = function () {
    var list = this.root.querySelector("[data-pi-list]");
    if (!list) return;
    var self = this;
    list.innerHTML = this.rows
      .map(function (row, idx) {
        var has = row.files.length > 0;
        var filesHtml = "";
        if (has) {
          filesHtml =
            '<ul class="pi-files">' +
            row.files
              .map(function (f) {
                return (
                  '<li class="pi-file"><strong>' +
                  esc(f.fileName) +
                  '</strong><span class="pi-file-status ' +
                  esc(f.status) +
                  '">' +
                  (f.status === "done"
                    ? "Envoyé"
                    : f.status === "uploading"
                      ? "Envoi…"
                      : f.status === "error"
                        ? "Erreur"
                        : "Prêt") +
                  '</span><button type="button" class="pi-file-mini" data-pi-action="preview" data-pi-row="' +
                  idx +
                  '" data-pi-file="' +
                  esc(f.id) +
                  '" aria-label="Aperçu">' +
                  ICON_EYE +
                  '</button><button type="button" class="pi-file-mini" data-pi-action="remove" data-pi-row="' +
                  idx +
                  '" data-pi-file="' +
                  esc(f.id) +
                  '" aria-label="Supprimer">' +
                  ICON_TRASH +
                  "</button></li>"
                );
              })
              .join("") +
            "</ul>";
        }
        return (
          '<div class="pi-row">' +
          '<div class="pi-row-main">' +
          '<div class="pi-label-wrap"><span class="pi-label">' +
          esc(row.label) +
          "</span>" +
          (row.required ? '<span class="pi-badge">Obligatoire</span>' : "") +
          "</div>" +
          '<div class="pi-actions">' +
          '<button type="button" class="pi-btn-import" data-pi-action="import" data-pi-row="' +
          idx +
          '">Importer</button>' +
          '<button type="button" class="pi-icon-btn" data-pi-action="plus" data-pi-row="' +
          idx +
          '" aria-label="Ajouter un exemplaire">' +
          ICON_PLUS +
          "</button>" +
          '<button type="button" class="pi-icon-btn" data-pi-action="preview" data-pi-row="' +
          idx +
          '" aria-label="Aperçu"' +
          (has ? "" : " disabled") +
          ">" +
          ICON_EYE +
          "</button>" +
          '<button type="button" class="pi-icon-btn" data-pi-action="remove" data-pi-row="' +
          idx +
          '" aria-label="Supprimer"' +
          (has ? "" : " disabled") +
          ">" +
          ICON_TRASH +
          "</button></div></div>" +
          filesHtml +
          "</div>"
        );
      })
      .join("");

    var intro = this.root.querySelector("[data-pi-intro]");
    if (intro) intro.textContent = this.config.intro;
    var title = this.root.querySelector("[data-pi-title]");
    if (title) title.textContent = this.config.title;
    var section = this.root.querySelector("[data-pi-section]");
    if (section) section.textContent = this.config.section || "Pièces à importer";
    var send = this.root.querySelector('[data-pi-action="send"]');
    if (send && this.mode === "standalone") {
      send.innerHTML = ICON_SEND + " Envoyer";
    }
  };

  function buildMarkup(options) {
    options = options || {};
    var back = options.backHref || "../index.html";
    var email = options.email || "";
    var showEmail = options.mode !== "embed" && !email;
    return (
      '<div class="pi-page" data-pieces-import-root>' +
      '<h1 class="pi-title" data-pi-title>Envoi de vos pièces justificatives</h1>' +
      '<div data-pi-main>' +
      '<section class="pi-card">' +
      '<h2 class="pi-section-title" data-pi-section>Pièces à importer</h2>' +
      '<p class="pi-intro" data-pi-intro></p>' +
      (showEmail
        ? '<div class="pi-email"><label>Votre e-mail (pour rattacher le dossier)<input type="email" name="piEmail" required placeholder="vous@email.fr" autocomplete="email"></label></div>'
        : '<input type="hidden" name="piEmail" value="' + esc(email) + '">') +
      '<div class="pi-list" data-pi-list></div>' +
      "</section>" +
      '<p class="pi-msg" data-pi-msg></p>' +
      (options.mode === "embed"
        ? ""
        : '<div class="pi-footer"><a class="pi-btn-back" href="' +
          esc(back) +
          '">Retour</a>' +
          '<button type="button" class="pi-btn-send" data-pi-action="send">' +
          ICON_SEND +
          " Envoyer</button></div>") +
      "</div>" +
      '<div class="pi-preview" data-pi-preview hidden><div class="pi-preview-box">' +
      '<div class="pi-preview-head"><strong data-pi-preview-title></strong>' +
      '<button type="button" class="pi-btn-back" data-pi-action="close-preview">Fermer</button></div>' +
      '<div data-pi-preview-body></div></div></div></div>'
    );
  }

  global.PiecesImport = {
    PiecesImport: PiecesImport,
    buildMarkup: buildMarkup,
    ACCEPT: ACCEPT,
    MAX_BYTES: MAX_BYTES,
  };
})(typeof window !== "undefined" ? window : global);
