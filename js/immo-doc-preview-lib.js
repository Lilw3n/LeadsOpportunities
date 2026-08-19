/**
 * Aperçu documents vendeur — liste multi-fichiers, panneau latéral, lien Drive.
 */
(function (global) {
  var MAX_BYTES = 12 * 1024 * 1024;
  var MAX_FILES_PER_TYPE = 8;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " o";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " Ko";
    return (bytes / (1024 * 1024)).toFixed(1).replace(".0", "") + " Mo";
  }

  function createPreviewUrl(file) {
    if (!file) return null;
    try {
      return URL.createObjectURL(file);
    } catch (e) {
      return null;
    }
  }

  function revokePreviewUrl(url) {
    if (url && String(url).indexOf("blob:") === 0) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
    }
  }

  function validateFile(file, countForType) {
    if (!file) return "Fichier invalide";
    if ((countForType || 0) >= MAX_FILES_PER_TYPE) {
      return "Maximum " + MAX_FILES_PER_TYPE + " fichiers par type de pièce";
    }
    if (file.size > MAX_BYTES) {
      return "Fichier trop volumineux (max " + formatSize(MAX_BYTES) + ") : " + file.name;
    }
    return null;
  }

  function previewPanelHtml() {
    return (
      '<aside class="immo-doc-preview-panel" data-immo-doc-preview hidden>' +
      '<div class="immo-doc-preview-head">' +
      "<h5 data-immo-doc-preview-title>Aperçu</h5>" +
      '<button type="button" class="immo-doc-preview-close" data-immo-doc-preview-close aria-label="Fermer l\'aperçu">×</button>' +
      "</div>" +
      '<p class="immo-doc-preview-meta small" data-immo-doc-preview-meta hidden></p>' +
      '<div class="immo-doc-preview-body" data-immo-doc-preview-body>' +
      '<p class="immo-doc-preview-empty">Sélectionnez une pièce ou cliquez sur l’œil pour prévisualiser.</p>' +
      "</div>" +
      '<div class="immo-doc-preview-actions" data-immo-doc-preview-actions hidden>' +
      '<a class="btn btn-soft btn-sm" data-immo-doc-preview-drive target="_blank" rel="noopener">Ouvrir sur Google Drive</a>' +
      '<a class="btn btn-soft btn-sm" data-immo-doc-preview-download target="_blank" rel="noopener" download>Télécharger</a>' +
      "</div></aside>"
    );
  }

  function ensureWorkspace(mount) {
    if (!mount) return null;
    var existing = mount.querySelector("[data-immo-docs-workspace]");
    if (existing) return existing;

    var ws = document.createElement("div");
    ws.className = "immo-docs-workspace";
    ws.setAttribute("data-immo-docs-workspace", "");

    var main = document.createElement("div");
    main.className = "immo-docs-main";
    while (mount.firstChild) main.appendChild(mount.firstChild);

    ws.appendChild(main);
    ws.insertAdjacentHTML("beforeend", previewPanelHtml());
    mount.appendChild(ws);

    var panel = ws.querySelector("[data-immo-doc-preview]");
    var closeBtn = ws.querySelector("[data-immo-doc-preview-close]");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        hidePreview(ws);
      });
    }
    if (panel) panel._previewMount = mount;
    return ws;
  }

  function getWorkspace(mount) {
    return (mount && mount.querySelector("[data-immo-docs-workspace]")) || ensureWorkspace(mount);
  }

  function getPreviewPanel(mount) {
    var ws = getWorkspace(mount);
    return ws && ws.querySelector("[data-immo-doc-preview]");
  }

  function hidePreview(mountOrWs) {
    var ws =
      mountOrWs && mountOrWs.classList && mountOrWs.classList.contains("immo-docs-workspace")
        ? mountOrWs
        : getWorkspace(mountOrWs);
    var panel = ws && ws.querySelector("[data-immo-doc-preview]");
    if (panel) panel.hidden = true;
  }

  function resolvePreviewSrc(item) {
    if (!item) return null;
    if (item.previewUrl) return item.previewUrl;
    if (item.webViewLink) return item.webViewLink;
    return null;
  }

  function showPreview(mount, item, contextLabel) {
    var ws = getWorkspace(mount);
    if (!ws || !item) return;
    var panel = ws.querySelector("[data-immo-doc-preview]");
    var title = ws.querySelector("[data-immo-doc-preview-title]");
    var meta = ws.querySelector("[data-immo-doc-preview-meta]");
    var body = ws.querySelector("[data-immo-doc-preview-body]");
    var actions = ws.querySelector("[data-immo-doc-preview-actions]");
    var driveLink = ws.querySelector("[data-immo-doc-preview-drive]");
    var dlLink = ws.querySelector("[data-immo-doc-preview-download]");
    if (!panel || !body) return;

    panel.hidden = false;
    ws.querySelectorAll(".immo-doc-file-chip.is-preview-active").forEach(function (n) {
      n.classList.remove("is-preview-active");
    });
    if (item.chipEl) item.chipEl.classList.add("is-preview-active");

    if (title) title.textContent = contextLabel || item.fileName || "Aperçu";
    if (meta) {
      meta.hidden = false;
      var parts = [item.fileName];
      if (item.fileSize) parts.push(formatSize(item.fileSize));
      if (item.status === "queued") parts.push("En attente d'envoi");
      else if (item.status === "uploading") parts.push("Envoi en cours…");
      else if (item.status === "done") parts.push("Enregistré sur Drive");
      else if (item.status === "error") parts.push("Erreur : " + (item.error || ""));
      meta.textContent = parts.join(" · ");
    }

    var src = resolvePreviewSrc(item);
    var mime = item.mimeType || "";
    body.innerHTML = "";
    if (!src) {
      body.innerHTML = '<p class="immo-doc-preview-empty">Aperçu indisponible.</p>';
    } else if (/^image\//i.test(mime) || /\.(jpe?g|png|webp|gif)$/i.test(item.fileName || "")) {
      body.innerHTML =
        '<img class="immo-doc-preview-img" src="' + esc(src) + '" alt="' + esc(item.fileName || "") + '" />';
    } else if (/pdf/i.test(mime) || /\.pdf$/i.test(item.fileName || "")) {
      body.innerHTML =
        '<iframe class="immo-doc-preview-frame" src="' + esc(src) + '" title="' + esc(item.fileName || "") + '"></iframe>';
    } else {
      body.innerHTML =
        '<iframe class="immo-doc-preview-frame" src="' + esc(src) + '" title="' + esc(item.fileName || "") + '"></iframe>';
    }

    var hasDrive = !!(item.webViewLink && item.status === "done");
    if (actions) actions.hidden = !hasDrive && !src;
    if (driveLink) {
      if (hasDrive) {
        driveLink.href = item.webViewLink;
        driveLink.hidden = false;
      } else {
        driveLink.hidden = true;
        driveLink.removeAttribute("href");
      }
    }
    if (dlLink) {
      if (src) {
        dlLink.href = src;
        dlLink.download = item.fileName || "document";
        dlLink.hidden = false;
      } else {
        dlLink.hidden = true;
      }
    }
  }

  function statusLabel(status) {
    if (status === "done") return "Sur Drive";
    if (status === "uploading") return "Envoi…";
    if (status === "error") return "Erreur";
    return "En attente";
  }

  function renderFileChip(item, onPreview) {
    var chip = document.createElement("div");
    chip.className = "immo-doc-file-chip";
    chip.setAttribute("data-file-id", item.id);
    chip.innerHTML =
      '<span class="immo-doc-file-chip-name" title="' +
      esc(item.fileName) +
      '">' +
      esc(item.fileName) +
      "</span>" +
      '<span class="immo-doc-file-chip-size">' +
      formatSize(item.fileSize) +
      "</span>" +
      '<span class="immo-doc-file-chip-status immo-doc-file-chip-status--' +
      esc(item.status || "queued") +
      '">' +
      esc(statusLabel(item.status)) +
      "</span>" +
      '<button type="button" class="immo-doc-preview-eye" data-doc-preview-eye title="Aperçu" aria-label="Aperçu ' +
      esc(item.fileName) +
      '"><span aria-hidden="true">👁</span></button>';
    item.chipEl = chip;
    chip.querySelector("[data-doc-preview-eye]").addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (onPreview) onPreview(item);
    });
    chip.addEventListener("click", function (e) {
      if (e.target.closest("[data-doc-preview-eye]")) return;
      if (onPreview) onPreview(item);
    });
    return chip;
  }

  function refreshLineFiles(lineEl, items, onPreview) {
    if (!lineEl) return;
    var list = lineEl.querySelector("[data-doc-files-list]");
    if (!list) {
      list = document.createElement("div");
      list.className = "immo-doc-files-list";
      list.setAttribute("data-doc-files-list", "");
      lineEl.appendChild(list);
    }
    list.innerHTML = "";
    if (!items || !items.length) {
      list.hidden = true;
      return;
    }
    list.hidden = false;
    items.forEach(function (item) {
      list.appendChild(renderFileChip(item, onPreview));
    });
  }

  function syncLineState(lineEl, items) {
    if (!lineEl || !items) return;
    lineEl.classList.remove("is-queued", "is-done", "is-error", "is-mixed");
    var hasQueued = items.some(function (i) {
      return i.status === "queued" || i.status === "uploading";
    });
    var hasDone = items.some(function (i) {
      return i.status === "done";
    });
    var hasError = items.some(function (i) {
      return i.status === "error";
    });
    if (hasError) lineEl.classList.add("is-error");
    else if (hasQueued && hasDone) lineEl.classList.add("is-mixed");
    else if (hasQueued) lineEl.classList.add("is-queued");
    else if (hasDone) lineEl.classList.add("is-done");

    var btn = lineEl.querySelector(".immo-doc-line-btn span");
    if (btn) {
      if (hasDone && !hasQueued && !hasError) btn.textContent = items.length > 1 ? items.length + " déposés" : "Déposé";
      else if (hasQueued) btn.textContent = "+ Ajouter";
      else if (hasError) btn.textContent = "Réessayer";
      else btn.textContent = "Déposer";
    }
  }

  function attachGroupPreview(root, selector, getItems) {
    if (!root) return;
    root.querySelectorAll(selector).forEach(function (groupEl) {
      if (groupEl.dataset.docGroupPreviewBound) return;
      groupEl.dataset.docGroupPreviewBound = "1";
      groupEl.addEventListener("toggle", function () {
        if (!groupEl.open) return;
        var items = getItems(groupEl) || [];
        var first = null;
        for (var i = 0; i < items.length; i++) {
          if (items[i].status === "done" || items[i].previewUrl) {
            first = items[i];
            break;
          }
        }
        if (!first) return;
        var head = groupEl.querySelector("summary, legend");
        var label = head && head.textContent ? head.textContent.replace(/\s+/g, " ").trim() : "";
        showPreview(root, first, label);
      });
    });
  }

  function extractDriveMeta(resData) {
    var drive = (resData && resData.drive) || {};
    var att = (resData && resData.attachment) || {};
    return {
      webViewLink: drive.webViewLink || att.webViewLink || null,
      driveFileId: drive.fileId || att.driveFileId || null,
      simulated: !!(drive.simulated),
    };
  }

  global.ImmoDocPreview = {
    MAX_BYTES: MAX_BYTES,
    MAX_FILES_PER_TYPE: MAX_FILES_PER_TYPE,
    formatSize: formatSize,
    validateFile: validateFile,
    createPreviewUrl: createPreviewUrl,
    revokePreviewUrl: revokePreviewUrl,
    ensureWorkspace: ensureWorkspace,
    getWorkspace: getWorkspace,
    showPreview: showPreview,
    hidePreview: hidePreview,
    refreshLineFiles: refreshLineFiles,
    syncLineState: syncLineState,
    attachGroupPreview: attachGroupPreview,
    extractDriveMeta: extractDriveMeta,
    statusLabel: statusLabel,
  };
})(typeof window !== "undefined" ? window : global);
