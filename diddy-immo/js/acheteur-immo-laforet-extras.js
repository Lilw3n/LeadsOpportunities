/**
 * Fiche Laforêt — extras : construction <10 ans, checklist docs, matrice timeline.
 */
(function () {
  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function bindConstructionToggle(form) {
    var chk = qs("[data-sell-recent-build-toggle]", form);
    var panel = qs("[data-sell-recent-build-panel]", form);
    if (!chk || !panel) return;
    function sync() {
      panel.hidden = !chk.checked;
    }
    chk.addEventListener("change", sync);
    sync();
  }

  function bindFurnitureToggle(form) {
    var chk = qs("[data-sell-furniture-toggle]", form);
    var panel = qs("[data-sell-furniture-panel]", form);
    if (!chk || !panel) return;
    function sync() {
      panel.hidden = !chk.checked;
    }
    chk.addEventListener("change", sync);
    sync();
  }

  function bindDocsProgress(form) {
    var mount = qs("[data-sell-docs-mount]", form);
    if (!mount) return;
    var counter = qs("[data-sell-docs-counter]", mount);
    function refresh() {
      var boxes = mount.querySelectorAll('input[name="sellDoc[]"]');
      var checked = 0;
      boxes.forEach(function (b) {
        if (b.checked) checked++;
      });
      if (counter) {
        counter.textContent = checked + " / " + boxes.length + " pièces cochées";
      }
    }
    mount.addEventListener("change", refresh);
    refresh();
  }

  function bind(form) {
    if (!form || form.dataset.laforetExtrasBound) return;
    form.dataset.laforetExtrasBound = "1";
    bindConstructionToggle(form);
    bindFurnitureToggle(form);
    bindDocsProgress(form);
  }

  function boot() {
    var form = qs("form[data-acheteur-immo]");
    bind(form);
  }

  window.AcheteurImmoLaforetExtras = { bind: bind };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
