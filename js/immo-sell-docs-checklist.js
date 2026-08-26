/**
 * Checklist vendeur Laforêt — checkbox + upload multi-fichiers par pièce.
 * Statuts : En attente → Envoi… → Transmis → Reçu (Drive confirmé).
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
    if (data.drive && data.drive.simulated) return false;
    if (data.simulated) return false;
    var att = data.attachment || {};
    var drive = data.drive || {};
    var fileId = drive.fileId || drive.id || att.driveFileId || "";
    if (!fileId || String(fileId).indexOf("sim_") === 0) return false;
    return !!(fileId || drive.webViewLink || att.webViewLink);
  }

  var queue = [];
  var uploaded = [];
  var session = { email: null, phone: null, contactId: null, leadId: null, driveWebViewLink: null, drivePath: null };

  function updateDriveBanner() {
    var banner = document.querySelector("[data-sell-doc-drive-banner]");
    if (!banner || !session.driveWebViewLink) {
      if (banner) banner.hidden = true;
      return;
    }
    banner.hidden = false;
    var pathHint = session.drivePath
      ? '<span class="immo-doc-drive-path">Chemin : <code>' + esc(session.drivePath) + "</code></span>"
      : "";
    banner.innerHTML =
      pathHint +
      '<a class="immo-doc-drive-open" href="' +
      esc(session.driveWebViewLink) +
      '" target="_blank" rel="noopener">Ouvrir le dossier Drive</a>' +
      '<span class="immo-doc-drive-note">Pièces aussi copiées dans le dossier contact CRM.</span>';
  }

  function showChecklistError(message) {
    var hint = document.querySelector(".immo-sell-docs-drive-hint");
    if (hint) {
      hint.insertAdjacentHTML(
        "afterend",
        '<p class="small immo-doc-panel-foot is-error" data-sell-doc-error>' + esc(message) + "</p>"
      );
      var errEl = document.querySelector("[data-sell-doc-error]");
      if (errEl) {
        setTimeout(function () {
          if (errEl.parentNode) errEl.parentNode.removeChild(errEl);
        }, 12000);
      }
    }
  }

  function renderLine(item) {
    return (
      '<div class="immo-doc-line" data-sell-doc-line="' +
      esc(item.type) +
      '">' +
      '<span class="immo-doc-line-label">' +
      esc(item.label) +
      "</span>" +
      '<input type="checkbox" class="immo-doc-line-check-sr" name="sellDoc[]" value="' +
      esc(item.type) +
      '" data-sell-doc-check tabindex="-1" aria-hidden="true" />' +
      '<div class="immo-doc-line-upload">' +
      '<span class="immo-doc-status-badge" data-sell-doc-status hidden></span>' +
      '<label class="immo-doc-line-btn" title="PDF, JPG ou PNG — max 12 Mo">' +
      '<input type="file" accept="' +
      ACCEPT +
      '" multiple hidden data-sell-doc-input data-doc-type="' +
      esc(item.type) +
      '" />' +
      "<span>Déposer</span></label>" +
      "</div>" +
      '<ul class="immo-doc-file-list" data-sell-doc-files hidden></ul>' +
      "</div>"
    );
  }

  function renderGroup(group) {
    var lines = (group.items || []).map(renderLine).join("");
    var driveNote = group.driveFolder
      ? '<p class="immo-doc-drive-hint">→ Drive : <code>' + esc(group.driveFolder) + "</code></p>"
      : "";
    return (
      '<details class="immo-doc-cat" open data-sell-doc-group="' +
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

  function renderMount(mount) {
    if (!mount || mount.dataset.sellDocsRendered) return;
    var groups =
      global.ImmoDocumentsConfig && global.ImmoDocumentsConfig.getChecklistGroups
        ? global.ImmoDocumentsConfig.getChecklistGroups()
        : [];
    if (!groups.length) return;
    mount.dataset.sellDocsRendered = "1";
    mount.innerHTML =
      '<p class="small immo-sell-docs-drive-hint">Déposez les pièces déjà disponibles — envoi <strong>immédiat</strong> vers Drive (statut après dépôt : En attente → Transmis → Reçu).</p>' +
      '<div class="immo-doc-drive-banner" data-sell-doc-drive-banner hidden></div>' +
      groups.map(renderGroup).join("");
    bindMount(mount);
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
    counter.textContent = checked + " / " + boxes.length + " pièces déposées";
  }

  function itemsForType(documentType) {
    var list = [];
    var seen = Object.create(null);
    function pushUnique(item) {
      if (!item) return;
      var key = item.id || item.driveFileId || item.fileName + "|" + item.status;
      if (seen[key]) return;
      seen[key] = true;
      list.push(item);
    }
    uploaded.forEach(function (u) {
      if (u.documentType === documentType) pushUnique(u);
    });
    queue.forEach(function (q) {
      if (q.documentType !== documentType) return;
      if (q.status === "received" || q.status === "transmitted") return;
      pushUnique(q);
    });
    return list;
  }

  function notifyDocsUpdated() {
    try {
      document.dispatchEvent(new CustomEvent("immo-sell-docs-updated"));
    } catch (e) {}
  }

  function refreshLine(documentType, mount) {
    var root = mount || document;
    var line = root.querySelector
      ? root.querySelector('[data-sell-doc-line="' + documentType + '"]')
      : document.querySelector('[data-sell-doc-line="' + documentType + '"]');
    if (!line) line = document.querySelector('[data-sell-doc-line="' + documentType + '"]');
    if (!line) {
      notifyDocsUpdated();
      return;
    }
    var items = itemsForType(documentType);
    var agg = aggregateStatus(items);
    line.classList.remove("is-queued", "is-done", "is-error", "is-transmitted", "is-uploading", "is-received");
    if (agg === "queued") line.classList.add("is-queued");
    if (agg === "uploading") line.classList.add("is-uploading");
    if (agg === "transmitted") line.classList.add("is-transmitted");
    if (agg === "received") line.classList.add("is-done", "is-received");
    if (agg === "error") line.classList.add("is-error");

    var badge = line.querySelector("[data-sell-doc-status]");
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

    var listEl = line.querySelector("[data-sell-doc-files]");
    if (!listEl) {
      notifyDocsUpdated();
      return;
    }
    if (!items.length) {
      listEl.hidden = true;
      listEl.innerHTML = "";
      notifyDocsUpdated();
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
    notifyDocsUpdated();
  }

  function addFile(file, documentType, mount) {
    if (!isAllowedFile(file)) {
      alert("Format refusé — déposez uniquement PDF, JPG ou PNG.");
      return false;
    }
    if (file.size > MAX_BYTES) {
      alert("Fichier trop volumineux (max 12 Mo) : " + file.name);
      return false;
    }
    queue.push({
      id: "sell_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      file: file,
      fileName: file.name,
      documentType: documentType,
      mimeType: mimeForFile(file),
      status: "queued",
    });
    var root = mount && mount.querySelector ? mount : document.querySelector("[data-sell-docs-mount]") || document;
    var line = root.querySelector ? root.querySelector('[data-sell-doc-line="' + documentType + '"]') : null;
    var chk = line && line.querySelector("[data-sell-doc-check]");
    if (chk) chk.checked = true;
    refreshLine(documentType, mount);
    refreshCounter(mount);
    notifyDocsUpdated();
    scheduleImmediateUpload();
    return true;
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

  function syncSessionFromForm() {
    var form = document.querySelector("[data-url-capture-form]");
    if (form) {
      var em = form.querySelector("[name='email']");
      var ph = form.querySelector("[name='phone']");
      if (em && String(em.value || "").trim()) session.email = String(em.value).trim().toLowerCase();
      if (ph && String(ph.value || "").trim()) session.phone = String(ph.value).trim();
    }
    try {
      var leadId = localStorage.getItem("lo_immo_deposit_lead_id") || localStorage.getItem("lo_draft_lead_id");
      if (leadId) session.leadId = leadId;
      var propId = localStorage.getItem("lo_immo_deposit_property_id");
      if (propId) session.propertyId = propId;
    } catch (e) {}
    if (global.QuoteIntelligence && global.QuoteIntelligence.getDraftLeadId) {
      session.leadId = session.leadId || global.QuoteIntelligence.getDraftLeadId();
    }
    return session;
  }

  var uploadInFlight = null;
  var uploadRetryTimer = null;

  function ensureLeadThenFlush() {
    syncSessionFromForm();
    var ensure =
      global.AcheteurImmoDepositGuide && global.AcheteurImmoDepositGuide.ensureServerLead
        ? global.AcheteurImmoDepositGuide.ensureServerLead()
        : Promise.resolve(session.leadId);
    return Promise.resolve(ensure)
      .then(function (leadId) {
        if (leadId) session.leadId = leadId;
        syncSessionFromForm();
        var vendeurPanel = document.querySelector('[data-immo-docs-panel="vendeur"]');
        if (vendeurPanel && vendeurPanel._immoDocs && vendeurPanel._immoDocs.ensureDraftProperty) {
          return vendeurPanel._immoDocs.ensureDraftProperty().then(function () {
            if (vendeurPanel._immoDocs.session.propertyId) {
              session.propertyId = vendeurPanel._immoDocs.session.propertyId;
            }
            if (vendeurPanel._immoDocs.session.contactId) {
              session.contactId = vendeurPanel._immoDocs.session.contactId;
            }
            return session;
          });
        }
        return fetch("/api/immo-listing-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            leadId: session.leadId || null,
            propertyId: session.propertyId || null,
            email: session.email || null,
            phone: session.phone || null,
            vertical: "vendeur_immo",
          }),
        })
          .then(function (r) {
            return r.json().then(function (data) {
              return { ok: r.ok, data: data };
            });
          })
          .then(function (res) {
            if (res.ok && res.data && res.data.ok) {
              if (res.data.leadId) session.leadId = res.data.leadId;
              if (res.data.contactId) session.contactId = res.data.contactId;
              if (res.data.propertyId) {
                session.propertyId = res.data.propertyId;
                try {
                  localStorage.setItem("lo_immo_deposit_property_id", res.data.propertyId);
                } catch (e) {}
              }
            }
            return session;
          })
          .catch(function () {
            return session;
          });
      })
      .then(function () {
        syncSessionFromForm();
        return flushPendingUploads();
      });
  }

  function runImmediateUpload() {
    var pending = queue.some(function (q) {
      return q.status === "queued" || q.status === "error";
    });
    if (!pending) return;
    if (uploadInFlight) {
      uploadInFlight.finally(function () {
        clearTimeout(uploadRetryTimer);
        uploadRetryTimer = setTimeout(runImmediateUpload, 40);
      });
      return;
    }
    uploadInFlight = ensureLeadThenFlush().finally(function () {
      uploadInFlight = null;
    });
  }

  function scheduleImmediateUpload() {
    clearTimeout(uploadRetryTimer);
    uploadRetryTimer = setTimeout(runImmediateUpload, 80);
  }

  function bindContactRetry() {
    if (bindContactRetry._bound) return;
    bindContactRetry._bound = true;
    document.addEventListener(
      "change",
      function (e) {
        var t = e.target;
        if (!t || !t.name) return;
        if (t.name !== "email" && t.name !== "phone" && t.name !== "telephone") return;
        var pending = queue.some(function (q) {
          return q.status === "queued" || q.status === "error";
        });
        if (pending) scheduleImmediateUpload();
      },
      true
    );
    document.addEventListener("lo:lead-progress-saved", function (ev) {
      var detail = (ev && ev.detail) || {};
      if (detail.leadId) session.leadId = detail.leadId;
      if (detail.contactId) session.contactId = detail.contactId;
      var pending = queue.some(function (q) {
        return q.status === "queued" || q.status === "error";
      });
      if (pending) scheduleImmediateUpload();
    });
  }

  function flushPendingUploads() {
    syncSessionFromForm();
    var pending = queue.filter(function (q) {
      return q.status === "queued" || q.status === "error";
    });
    if (!pending.length) return Promise.resolve({ uploaded: [], errors: [], skipped: true });
    if (!session.email && !session.phone && !session.contactId && !session.leadId) {
      return Promise.resolve({
        uploaded: [],
        errors: [
          {
            error:
              "Ajoutez un e-mail ou un téléphone pour archiver les pièces — elles restent en attente sur cet appareil.",
          },
        ],
        needsContact: true,
      });
    }
    return uploadAll();
  }

  function uploadAll() {
    syncSessionFromForm();
    var pending = queue.filter(function (q) {
      return q.status === "queued" || q.status === "error";
    });
    if (!pending.length) return Promise.resolve({ uploaded: [], errors: [] });
    if (!session.email && !session.phone && !session.contactId && !session.leadId) {
      return Promise.resolve({
        uploaded: [],
        errors: [{ error: "email, téléphone, contactId ou leadId requis pour les uploads checklist" }],
      });
    }

    return pending
      .reduce(
        function (chain, item) {
          return chain.then(function (acc) {
            item.status = "uploading";
            refreshLine(item.documentType);
            return readFileAsBase64(item.file)
              .then(function (dataUrl) {
                /* Priorité : Drive du bien (fonctionne) ; sinon contact (checklist). */
                if (session.propertyId) {
                  return fetch("/api/immo-listing-document", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "same-origin",
                    body: JSON.stringify({
                      propertyId: session.propertyId,
                      email: session.email || null,
                      phone: session.phone || null,
                      contactId: session.contactId || null,
                      leadId: session.leadId,
                      documentType: item.documentType,
                      documentGroup: item.documentType === "mandat_annexe" ? "titre" : "diagnostics",
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
                  throw new Error((res.data && res.data.error) || "Upload impossible");
                }
                if (res.data.contactId) session.contactId = res.data.contactId;
                if (res.data.leadId) session.leadId = res.data.leadId;
                if (res.data.propertyId) session.propertyId = res.data.propertyId;
                if (res.data.driveWebViewLink) session.driveWebViewLink = res.data.driveWebViewLink;
                if (res.data.drivePath) session.drivePath = res.data.drivePath;
                updateDriveBanner();
                var att = (res.data && res.data.attachment) || {};
                var drive = (res.data && res.data.drive) || {};
                item.driveFileId = drive.fileId || att.driveFileId || null;
                item.webViewLink = drive.webViewLink || att.webViewLink || null;
                item.status = driveConfirmed(res) ? "received" : "transmitted";
                if (item.status !== "received" && res.data && res.data.ok && !drive.simulated) {
                  item.status = item.driveFileId ? "received" : "transmitted";
                }
                uploaded.push({
                  id: item.id,
                  fileName: item.fileName,
                  documentType: item.documentType,
                  status: item.status,
                  driveFileId: item.driveFileId,
                  webViewLink: item.webViewLink,
                });
                acc.uploaded.push(item);
                refreshLine(item.documentType);
                return acc;
              })
              .catch(function (err) {
                item.status = "error";
                item.error = err.message || "Erreur";
                refreshLine(item.documentType);
                acc.errors.push({ item: item, error: item.error });
                if (/non autoris|403|propertyId/i.test(item.error)) {
                  try {
                    localStorage.removeItem("lo_immo_deposit_property_id");
                    session.propertyId = null;
                  } catch (e) {}
                }
                showChecklistError(item.error + " — rechargez (Ctrl+F5) si besoin.");
                return acc;
              });
          });
        },
        Promise.resolve({ uploaded: [], errors: [] })
      )
      .then(function (result) {
        queue = queue.filter(function (q) {
          return q.status !== "received" && q.status !== "transmitted";
        });
        var refreshed = Object.create(null);
        result.uploaded.forEach(function (u) {
          var t = u.documentType;
          if (t && !refreshed[t]) {
            refreshed[t] = true;
            refreshLine(t);
          }
        });
        result.errors.forEach(function (err) {
          var t = err.item && err.item.documentType;
          if (t && !refreshed[t]) {
            refreshed[t] = true;
            refreshLine(t);
          }
        });
        return result;
      });
  }

  function boot() {
    document.querySelectorAll("[data-sell-docs-mount]").forEach(renderMount);
    bindContactRetry();
  }

  global.ImmoSellDocsChecklist = {
    renderMount: renderMount,
    setSession: setSession,
    syncSessionFromForm: syncSessionFromForm,
    flushPendingUploads: flushPendingUploads,
    uploadAll: uploadAll,
    scheduleImmediateUpload: scheduleImmediateUpload,
    addFile: addFile,
    getQueue: function () {
      return queue.slice();
    },
    getUploaded: function () {
      return uploaded.slice();
    },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
