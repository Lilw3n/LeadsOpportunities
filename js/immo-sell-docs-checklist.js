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
      '<p class="small immo-sell-docs-no-upload-hint">Fichier : section « Documents du bien » (§3) — une seule fois.</p>' +
      "</div>"
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
      '<p class="small immo-sell-docs-drive-hint">Cochez ce que vous avez déjà — les PDF (DPE, actes…) se déposent dans « Documents du bien » (§3), pas ici (évite les doublons Drive).</p>' +
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

  function uploadAll() {
    return Promise.resolve({ uploaded: [], errors: [], skipped: "checklist_checkbox_only" });
  }

  function boot() {
    document.querySelectorAll("[data-sell-docs-mount]").forEach(renderMount);
  }

  global.ImmoSellDocsChecklist = {
    renderMount: renderMount,
    setSession: setSession,
    uploadAll: uploadAll,
    getQueue: function () {
      return queue.slice();
    },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
