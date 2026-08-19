/**
 * Checklist vendeur — suivi par cases à cocher uniquement.
 * Les fichiers se déposent une seule fois en section 3 (ImmoCategoryDocuments).
 */
(function (global) {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var session = { email: null, phone: null, contactId: null, leadId: null };

  function renderLine(item) {
    return (
      '<div class="immo-doc-line immo-doc-line--check-only" data-sell-doc-line="' +
      esc(item.type) +
      '">' +
      '<label class="field-check immo-doc-line-check">' +
      '<input type="checkbox" name="sellDoc[]" value="' +
      esc(item.type) +
      '" data-sell-doc-check /> ' +
      esc(item.label) +
      "</label>" +
      '<a href="#" class="immo-sell-doc-goto small" data-sell-doc-goto="' +
      esc(item.type) +
      '" title="Aller au dépôt fichier (section 3)">Déposer →</a>' +
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

  function scrollToSection3Type(documentType) {
    var line = document.querySelector(
      '[data-immo-docs-panel="vendeur"] [data-immo-doc-line="' + documentType + '"]'
    );
    if (!line) {
      var wrap = document.querySelector("[data-immo-docs-vendeur-wrap]");
      if (wrap) wrap.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    var details = line.closest("details.immo-doc-cat");
    if (details && !details.open) details.open = true;
    line.scrollIntoView({ behavior: "smooth", block: "center" });
    line.classList.add("immo-doc-line--highlight");
    setTimeout(function () {
      line.classList.remove("immo-doc-line--highlight");
    }, 1800);
  }

  function syncCheckbox(documentType, checked) {
    document.querySelectorAll('[data-sell-doc-check][value="' + documentType + '"]').forEach(function (chk) {
      chk.checked = !!checked;
    });
    document.querySelectorAll("[data-sell-docs-mount]").forEach(refreshCounter);
  }

  function hasUploadedInSection3(documentType) {
    var panel = document.querySelector('[data-immo-docs-panel="vendeur"]');
    if (!panel || !panel._immoDocs || !panel._immoDocs.queue) return false;
    return panel._immoDocs.queue.some(function (q) {
      return q.documentType === documentType && (q.status === "queued" || q.status === "uploading" || q.status === "done");
    });
  }

  function refreshFromSection3() {
    var panel = document.querySelector('[data-immo-docs-panel="vendeur"]');
    if (!panel || !panel._immoDocs) return;
    var types = {};
    panel._immoDocs.queue.forEach(function (q) {
      if (q.status === "queued" || q.status === "uploading" || q.status === "done") {
        types[q.documentType] = true;
      }
    });
    Object.keys(types).forEach(function (t) {
      syncCheckbox(t, true);
    });
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
      '<p class="small immo-sell-docs-drive-hint">Cochez ce que vous avez ou prévoyez de fournir. <strong>Les fichiers se déposent une seule fois</strong> dans la section 3 « Documents du bien » (ci-dessus) — pas ici.</p>' +
      groups.map(renderGroup).join("");
    bindMount(mount);
    refreshFromSection3();
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
    counter.textContent = checked + " / " + boxes.length + " types cochés";
  }

  function bindMount(mount) {
    mount.addEventListener("click", function (e) {
      var link = e.target.closest("[data-sell-doc-goto]");
      if (!link || !mount.contains(link)) return;
      e.preventDefault();
      scrollToSection3Type(link.getAttribute("data-sell-doc-goto") || "");
    });
    mount.addEventListener("change", function () {
      refreshCounter(mount);
    });
  }

  function setSession(next) {
    Object.assign(session, next || {});
  }

  function boot() {
    document.querySelectorAll("[data-sell-docs-mount]").forEach(renderMount);
  }

  document.addEventListener("lo:immo-doc-file", function (ev) {
    var detail = (ev && ev.detail) || {};
    if (!detail.documentType) return;
    syncCheckbox(detail.documentType, true);
  });

  global.ImmoSellDocsChecklist = {
    renderMount: renderMount,
    setSession: setSession,
    uploadAll: function () {
      return Promise.resolve({ uploaded: [], errors: [] });
    },
    syncFromSection3: refreshFromSection3,
    getQueue: function () {
      return [];
    },
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
