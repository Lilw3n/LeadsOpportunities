/**
 * Checklist vendeur — checkbox + upload multi-fichiers + aperçu latéral.
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
    return "image/jpeg";
  }

  function isAllowedFile(file) {
    var mime = mimeForFile(file);
    if (mime === "application/pdf" || mime === "image/jpeg" || mime === "image/png") return true;
    return /\.(pdf|jpe?g|png)$/i.test(file.name || "");
  }

  var files = [];
  var session = { email: null, phone: null, contactId: null, leadId: null };

  function filesForType(documentType) {
    return files.filter(function (f) {
      return f.documentType === documentType;
    });
  }

  function findLine(mount, documentType) {
    return mount.querySelector('[data-sell-doc-line="' + documentType + '"]');
  }

  function previewContext(line) {
    var lbl = line && line.querySelector(".immo-doc-line-check");
    return lbl ? lbl.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function refreshLine(mount, documentType) {
    var line = findLine(mount, documentType);
    var list = filesForType(documentType);
    if (!line || !Preview) return;
    Preview.refreshLineFiles(line, list, function (item) {
      Preview.showPreview(mount, item, previewContext(line));
    });
    Preview.syncLineState(line, list);
  }

  function renderLine(item) {
    return (
      '<div class="immo-doc-line" data-sell-doc-line="' +
      esc(item.type) +
      '">' +
      '<label class="field-check immo-doc-line-check">' +
      '<input type="checkbox" name="sellDoc[]" value="' +
      esc(item.type) +
      '" data-sell-doc-check /> ' +
      esc(item.label) +
      "</label>" +
      '<div class="immo-doc-line-upload">' +
      '<label class="immo-doc-line-btn" title="PDF, JPG ou PNG — max 12 Mo, plusieurs fichiers possibles">' +
      '<input type="file" accept="' +
      ACCEPT +
      '" multiple hidden data-sell-doc-input data-doc-type="' +
      esc(item.type) +
      '" />' +
      "<span>Déposer</span></label>" +
      "</div></div>"
    );
  }

  function renderGroup(group) {
    var lines = (group.items || []).map(renderLine).join("");
    return (
      '<fieldset class="immo-docs-group" data-sell-doc-group="' +
      esc(group.id) +
      '">' +
      "<legend>" +
      esc(group.legend) +
      "</legend>" +
      lines +
      "</fieldset>"
    );
  }

  function renderMount(mount) {
    if (!mount || mount.dataset.sellDocsRendered) return;
    var groups =
      global.ImmoDocumentsConfig && global.ImmoDocumentsConfig.getChecklistGroups
        ? global.ImmoDocumentsConfig.getChecklistGroups()
        : [];
    if (!groups.length) return;
    mount.dataset.sellDocsRendered = "1";
    mount.innerHTML =
      '<p class="small immo-sell-docs-drive-hint">Cochez et déposez les pièces (plusieurs fichiers par ligne, max 12 Mo chacun) — aperçu à droite via l’œil. Envoi sur Google Drive après enregistrement du dossier.</p>' +
      groups.map(renderGroup).join("");
    if (Preview) Preview.ensureWorkspace(mount);
    bindMount(mount);
    if (Preview) {
      Preview.attachGroupPreview(mount, "fieldset.immo-docs-group", function (groupEl) {
        var gid = groupEl.getAttribute("data-sell-doc-group");
        return files.filter(function (f) {
          var line = groupEl.querySelector('[data-sell-doc-line="' + f.documentType + '"]');
          return !!line;
        });
      });
    }
  }

  function refreshCounter(mount) {
    var root = mount.closest("details") || mount.parentElement;
    var counter = root && root.querySelector("[data-sell-docs-counter]");
    if (!counter) return;
    var boxes = mount.querySelectorAll('input[name="sellDoc[]"]');
    var checked = 0;
    boxes.forEach(function (b) {
      if (b.checked) checked++;
    });
    var uploaded = files.filter(function (f) {
      return f.status === "done";
    }).length;
    counter.textContent =
      checked + " / " + boxes.length + " types cochés" + (uploaded ? " · " + uploaded + " fichier(s) sur Drive" : "");
  }

  function addFile(file, documentType, mount) {
    if (!isAllowedFile(file)) {
      alert("Format refusé — déposez uniquement PDF, JPG ou PNG.");
      return;
    }
    var existing = filesForType(documentType);
    var err = Preview ? Preview.validateFile(file, existing.length) : null;
    if (err) {
      alert(err);
      return;
    }
    if (!Preview && file.size > MAX_BYTES) {
      alert("Fichier trop volumineux (max 12 Mo) : " + file.name);
      return;
    }

    var entry = {
      id: "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      file: file,
      fileName: file.name,
      fileSize: file.size,
      documentType: documentType,
      mimeType: mimeForFile(file),
      status: "queued",
      previewUrl: Preview ? Preview.createPreviewUrl(file) : null,
      webViewLink: null,
      driveFileId: null,
    };
    files.push(entry);

    var line = findLine(mount, documentType);
    var chk = line && line.querySelector("[data-sell-doc-check]");
    if (chk) chk.checked = true;
    refreshLine(mount, documentType);
    refreshCounter(mount);
    if (Preview) Preview.showPreview(mount, entry, previewContext(line));

    if (global.ImmoDepositDriveSession && global.ImmoDepositDriveSession.hasSession()) {
      global.ImmoDepositDriveSession.scheduleUpload();
    }
  }

  function bindMount(mount) {
    mount.addEventListener("change", function (e) {
      var input = e.target.closest("[data-sell-doc-input]");
      if (!input || !mount.contains(input)) return;
      if (!input.files || !input.files.length) return;
      var docType = input.getAttribute("data-doc-type") || "autre_doc";
      Array.prototype.forEach.call(input.files, function (file) {
        addFile(file, docType, mount);
      });
      input.value = "";
    });
    mount.addEventListener("change", function () {
      refreshCounter(mount);
    });
  }

  function setSession(next) {
    Object.assign(session, next || {});
  }

  function updateChip(item) {
    if (!item.chipEl) return;
    var st = item.chipEl.querySelector(".immo-doc-file-chip-status");
    if (st) {
      st.className =
        "immo-doc-file-chip-status immo-doc-file-chip-status--" + (item.status || "queued");
      st.textContent = Preview ? Preview.statusLabel(item.status) : item.status;
    }
  }

  function uploadAll() {
    var pending = files.filter(function (q) {
      return q.status === "queued" || q.status === "error";
    });
    if (!pending.length) return Promise.resolve({ uploaded: [], errors: [] });
    if (!session.email && !session.phone && !session.contactId) {
      return Promise.resolve({
        uploaded: [],
        errors: [{ error: "email, téléphone ou contactId requis pour les uploads checklist" }],
      });
    }

    var mount = document.querySelector("[data-sell-docs-mount]");

    return pending.reduce(
      function (chain, item) {
        return chain.then(function (acc) {
          item.status = "uploading";
          updateChip(item);
          return readFileAsBase64(item.file)
            .then(function (dataUrl) {
              return fetch("/api/external/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({
                  email: session.email,
                  phone: session.phone,
                  contactId: session.contactId,
                  leadId: session.leadId,
                  fileName: item.fileName,
                  documentType: item.documentType,
                  mimeType: item.mimeType,
                  fileBase64: dataUrl,
                  vertical: "vendeur-immo",
                  need: "vendeur-immo",
                  source: "immo_sell_checklist",
                  perTypeFolder: true,
                  description: "Checklist vente — " + item.documentType,
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
              item.webViewLink = meta.webViewLink;
              item.driveFileId = meta.driveFileId;
              updateChip(item);
              if (mount) refreshLine(mount, item.documentType);
              acc.uploaded.push(item);
              return acc;
            })
            .catch(function (err) {
              item.status = "error";
              item.error = err.message || "Erreur";
              updateChip(item);
              if (mount) refreshLine(mount, item.documentType);
              acc.errors.push({ item: item, error: item.error });
              return acc;
            });
        });
      },
      Promise.resolve({ uploaded: [], errors: [] })
    ).then(function (result) {
      if (mount) refreshCounter(mount);
      return result;
    });
  }

  function boot() {
    document.querySelectorAll("[data-sell-docs-mount]").forEach(renderMount);
  }

  global.ImmoSellDocsChecklist = {
    renderMount: renderMount,
    setSession: setSession,
    uploadAll: uploadAll,
    getQueue: function () {
      return files.slice();
    },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
