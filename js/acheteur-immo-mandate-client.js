/**
 * Mandat vendeur — vue client : opt-in + fourchette prix + pièces jointes (annexe).
 */
(function () {
  var ANNEX_TYPE = "mandat_annexe";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function statusLabel(status) {
    if (status === "received") return "Reçu";
    if (status === "transmitted") return "Transmis";
    if (status === "uploading") return "Envoi…";
    if (status === "error") return "Erreur";
    if (status === "queued") return "En attente";
    return "";
  }

  function annexItems() {
    var items = [];
    var seen = {};
    function push(it) {
      if (!it || it.documentType !== ANNEX_TYPE) return;
      var key = it.id || it.fileName;
      if (!key || seen[key]) return;
      seen[key] = true;
      items.push(it);
    }
    if (window.ImmoSellDocsChecklist) {
      (window.ImmoSellDocsChecklist.getQueue() || []).forEach(push);
      (window.ImmoSellDocsChecklist.getUploaded() || []).forEach(push);
    }
    return items;
  }

  function renderAnnexList(wrap) {
    var list = qs("[data-mandate-annex-list]", wrap);
    if (!list) return;
    var items = annexItems();
    if (!items.length) {
      list.hidden = true;
      list.innerHTML = "";
      return;
    }
    list.hidden = false;
    list.innerHTML = items
      .map(function (item) {
        var st = statusLabel(item.status);
        var cls = item.status ? " is-" + item.status : "";
        return (
          "<li>" +
          (st ? '<span class="immo-mandate-annex-status' + cls + '">' + esc(st) + "</span>" : "") +
          "<span>" +
          esc(item.fileName) +
          "</span>" +
          "</li>"
        );
      })
      .join("");
  }

  function addAnnexFiles(files, wrap) {
    if (!files || !files.length) return;
    var checklist = window.ImmoSellDocsChecklist;
    var mount = document.querySelector("[data-sell-docs-mount]");
    Array.prototype.forEach.call(files, function (file) {
      if (checklist && typeof checklist.addFile === "function") {
        checklist.addFile(file, ANNEX_TYPE, mount);
      }
    });
    renderAnnexList(wrap);
  }

  function syncMandatePrefUi(wrap) {
    var note = qs("[data-mandate-exclusif-note]", wrap);
    var checked = wrap.querySelector("[name='sellMandatePreference']:checked");
    var val = checked ? String(checked.value || "") : "exclusif";
    if (note) note.classList.toggle("is-muted", val !== "exclusif");
  }

  function syncMandateFields(wrap) {
    if (!wrap) return;
    var chk = qs("[data-sell-wants-mandate]", wrap);
    var fields = qs("[data-sell-mandate-fields]", wrap);
    if (!chk || !fields) return;
    var open = !!chk.checked;
    fields.hidden = !open;
    fields.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.disabled = !open;
    });
    if (open) {
      syncMandatePrefUi(wrap);
      renderAnnexList(wrap);
    }
    if (window.ImmoTracfinMandate && window.ImmoTracfinMandate.syncVisibility) {
      window.ImmoTracfinMandate.syncVisibility(wrap);
    }
    var rgpdHint = document.querySelector("[data-rgpd-mandate-hint]");
    if (rgpdHint) rgpdHint.hidden = !open;
  }

  function bind(root) {
    if (!root || root.dataset.mandateClientBound) return;
    root.dataset.mandateClientBound = "1";
    root.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-mandate-add-annex]") : null;
      if (!btn || !root.contains(btn)) return;
      e.preventDefault();
      var input = qs("[data-mandate-annex-input]", root);
      if (input && !input.disabled) input.click();
    });
    root.addEventListener("change", function (e) {
      var t = e.target;
      if (!t) return;
      if (t.matches("[data-mandate-annex-input]")) {
        addAnnexFiles(t.files, root);
        t.value = "";
        return;
      }
      if (t.matches("[data-sell-wants-mandate]")) {
        syncMandateFields(root);
      }
      if (t.matches("[name='sellMandatePreference']")) {
        syncMandatePrefUi(root);
      }
    });
    document.addEventListener("immo-sell-docs-updated", function () {
      renderAnnexList(root);
    });
    syncMandateFields(root);
  }

  function boot() {
    document.querySelectorAll("[data-client-mandate-panel]").forEach(bind);
  }

  window.AcheteurImmoMandateClient = { bind: bind, sync: syncMandateFields };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
