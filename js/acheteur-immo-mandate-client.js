/**
 * Mandat vendeur — vue client : opt-in explicite + fourchette prix (sans honoraires).
 */
(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
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
    if (open) syncMandatePrefUi(wrap);
  }

  function bind(root) {
    if (!root || root.dataset.mandateClientBound) return;
    root.dataset.mandateClientBound = "1";
    root.addEventListener("change", function (e) {
      if (e.target && e.target.matches("[data-sell-wants-mandate]")) {
        syncMandateFields(root);
      }
      if (e.target && e.target.matches("[name='sellMandatePreference']")) {
        syncMandatePrefUi(root);
      }
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
