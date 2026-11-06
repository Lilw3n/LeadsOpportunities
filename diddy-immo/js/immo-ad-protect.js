/**
 * Protection anti clic-droit / anti-copie pour annonces immo (démo privée + vitrine).
 * Dissuasion UX — pas un DRM absolu.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ImmoAdProtect = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function attach(rootEl, opts) {
    opts = opts || {};
    var el = rootEl || (typeof document !== "undefined" ? document.body : null);
    if (!el || el.__immoAdProtect) return { destroy: function () {} };
    el.__immoAdProtect = true;
    el.classList.add("immo-ad-protect");
    if (opts.watermark !== false) el.classList.add("immo-ad-protect--watermark");

    function block(e) {
      e.preventDefault();
      return false;
    }

    function onKey(e) {
      var key = (e.key || "").toLowerCase();
      var code = e.keyCode || e.which;
      var ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && (key === "c" || key === "x" || key === "s" || key === "a" || key === "p" || code === 67 || code === 88 || code === 83 || code === 65 || code === 80)) {
        e.preventDefault();
        return false;
      }
      if (key === "f12" || code === 123) {
        e.preventDefault();
        return false;
      }
      if (ctrl && e.shiftKey && (key === "i" || key === "j" || key === "c")) {
        e.preventDefault();
        return false;
      }
    }

    function onDrag(e) {
      if (e.target && (e.target.tagName === "IMG" || e.target.closest && e.target.closest("img, .immo-ad-media"))) {
        e.preventDefault();
        return false;
      }
    }

    el.addEventListener("contextmenu", block, true);
    el.addEventListener("copy", block, true);
    el.addEventListener("cut", block, true);
    el.addEventListener("selectstart", block, true);
    el.addEventListener("dragstart", onDrag, true);
    document.addEventListener("keydown", onKey, true);

    el.querySelectorAll("img").forEach(function (img) {
      img.setAttribute("draggable", "false");
      img.addEventListener("dragstart", block);
    });

    return {
      destroy: function () {
        el.removeEventListener("contextmenu", block, true);
        el.removeEventListener("copy", block, true);
        el.removeEventListener("cut", block, true);
        el.removeEventListener("selectstart", block, true);
        el.removeEventListener("dragstart", onDrag, true);
        document.removeEventListener("keydown", onKey, true);
        el.classList.remove("immo-ad-protect", "immo-ad-protect--watermark");
        delete el.__immoAdProtect;
      },
    };
  }

  return { attach: attach };
});
