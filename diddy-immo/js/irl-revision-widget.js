/**
 * Widget calculateur IRL — [data-irl-widget]
 */
(function () {
  function el(root, sel) {
    return root.querySelector(sel);
  }

  function formatEuro(n) {
    return (Number(n) || 0).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €";
  }

  function boot(root) {
    var Irl = window.IrlRevision;
    if (!Irl || root._irlWired) return;
    root._irlWired = true;

    var rentEl = el(root, "[data-irl-rent]");
    var oldEl = el(root, "[data-irl-old]");
    var newEl = el(root, "[data-irl-new]");
    var outNew = el(root, "[data-irl-out-new]");
    var outDelta = el(root, "[data-irl-out-delta]");
    var outPct = el(root, "[data-irl-out-pct]");
    var src = el(root, "[data-irl-source]");
    if (src) src.textContent = Irl.SOURCE;

    var latest = Irl.latest();
    var prev = Irl.sameQuarterPreviousYear(latest.id) || Irl.find("2025-T2");
    if (oldEl && !oldEl.options.length) oldEl.innerHTML = Irl.optionsHtml(prev ? prev.id : "");
    if (newEl && !newEl.options.length) newEl.innerHTML = Irl.optionsHtml(latest.id);
    if (oldEl && prev) oldEl.value = prev.id;
    if (newEl && latest) newEl.value = latest.id;

    function render() {
      var r = Irl.revise(rentEl ? rentEl.value : 0, oldEl ? oldEl.value : "", newEl ? newEl.value : "");
      if (outNew) outNew.textContent = r.ok ? formatEuro(r.newRent) : "—";
      if (outDelta) {
        outDelta.textContent = r.ok ? (r.delta >= 0 ? "+" : "") + formatEuro(r.delta) : "—";
      }
      if (outPct) outPct.textContent = r.ok ? (r.pct >= 0 ? "+" : "") + String(r.pct).replace(".", ",") + " %" : "—";
      root.dispatchEvent(
        new CustomEvent("lo:irl-revised", { bubbles: true, detail: r })
      );
    }

    [rentEl, oldEl, newEl].forEach(function (node) {
      if (!node) return;
      node.addEventListener("input", render);
      node.addEventListener("change", render);
    });
    render();
  }

  function start() {
    document.querySelectorAll("[data-irl-widget]").forEach(boot);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
