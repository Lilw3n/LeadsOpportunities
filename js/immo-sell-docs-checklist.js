/**
 * Checklist vendeur Laforêt — checkbox + upload par pièce.
 * Drive : dossier client Nom_Prenom_Tel_Email → sous-dossier par type de pièce.
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

  var queue = [];
  var session = { email: null, phone: null, contactId: null, leadId: null };

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
      '<label class="immo-doc-line-btn" title="PDF, JPG ou PNG — max 12 Mo">' +
      '<input type="file" accept="' +
      ACCEPT +
      '" hidden data-sell-doc-input data-doc-type="' +
      esc(item.type) +
      '" />' +
      "<span>Déposer</span></label>" +
      '<span class="immo-doc-line-file" data-sell-doc-file hidden></span>' +
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
      '<p class="small immo-sell-docs-drive-hint">Cochez et déposez les pièces — elles passent en <strong>En attente</strong> puis en <strong>Déposé</strong> dès l’envoi ou la sauvegarde (avec e-mail / téléphone). Les fichiers restent sur cet appareil tant qu’ils ne sont pas archivés.</p>' +
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
    counter.textContent = checked + " / " + boxes.length + " pièces cochées";
  }

  function setLineState(line, state, fileName) {
    if (!line) return;
    line.classList.remove("is-queued", "is-done", "is-error");
    if (state) line.classList.add(state);
    var fileEl = line.querySelector("[data-sell-doc-file]");
    var btn = line.querySelector(".immo-doc-line-btn span");
    if (fileName && fileEl) {
      fileEl.hidden = false;
      fileEl.textContent = fileName;
    }
    if (btn && state === "is-done") btn.textContent = "Déposé";
    if (btn && state === "is-queued") btn.textContent = "En attente";
  }

  function addFile(file, documentType, mount) {
    if (!isAllowedFile(file)) {
      alert("Format refusé — déposez uniquement PDF, JPG ou PNG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      alert("Fichier trop volumineux (max 12 Mo) : " + file.name);
      return;
    }
    queue = queue.filter(function (q) {
      return q.documentType !== documentType;
    });
    queue.push({
      file: file,
      fileName: file.name,
      documentType: documentType,
      mimeType: mimeForFile(file),
      status: "queued",
    });
    var line = mount.querySelector('[data-sell-doc-line="' + documentType + '"]');
    var chk = line && line.querySelector("[data-sell-doc-check]");
    if (chk) chk.checked = true;
    setLineState(line, "is-queued", file.name);
    refreshCounter(mount);
  }

  function bindMount(mount) {
    mount.addEventListener("change", function (e) {
      var input = e.target.closest("[data-sell-doc-input]");
      if (!input || !mount.contains(input)) return;
      if (!input.files || !input.files[0]) return;
      addFile(input.files[0], input.getAttribute("data-doc-type") || "autre_doc", mount);
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
    } catch (e) {}
    if (global.QuoteIntelligence && global.QuoteIntelligence.getDraftLeadId) {
      session.leadId = session.leadId || global.QuoteIntelligence.getDraftLeadId();
    }
    return session;
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
              "Ajoutez un e-mail ou un téléphone (ou envoyez le dossier) pour archiver les pièces — elles restent en attente sur cet appareil.",
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

    return pending.reduce(
      function (chain, item) {
        return chain.then(function (acc) {
          item.status = "uploading";
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
                throw new Error((res.data && res.data.error) || "Upload impossible");
              }
              item.status = "done";
              var line = document.querySelector('[data-sell-doc-line="' + item.documentType + '"]');
              setLineState(line, "is-done", item.fileName);
              acc.uploaded.push(item);
              return acc;
            })
            .catch(function (err) {
              item.status = "error";
              item.error = err.message || "Erreur";
              var line = document.querySelector('[data-sell-doc-line="' + item.documentType + '"]');
              setLineState(line, "is-error", item.fileName);
              acc.errors.push({ item: item, error: item.error });
              return acc;
            });
        });
      },
      Promise.resolve({ uploaded: [], errors: [] })
    ).then(function (result) {
      queue = queue.filter(function (q) {
        return q.status !== "done";
      });
      return result;
    });
  }

  function boot() {
    document.querySelectorAll("[data-sell-docs-mount]").forEach(renderMount);
  }

  global.ImmoSellDocsChecklist = {
    renderMount: renderMount,
    setSession: setSession,
    syncSessionFromForm: syncSessionFromForm,
    flushPendingUploads: flushPendingUploads,
    uploadAll: uploadAll,
    getQueue: function () {
      return queue.slice();
    },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
