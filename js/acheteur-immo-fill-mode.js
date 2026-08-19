/**
 * Mode remplissage : client (public) vs conseiller (interne).
 * URL : ?mode=client | ?mode=conseiller
 * Optionnel : &conseiller=Nom pour préremplir le champ conseiller.
 */
(function () {
  var STORAGE_KEY = "lo_immo_fill_mode";

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function getModeFromUrl() {
    var m = (new URLSearchParams(window.location.search).get("mode") || "").toLowerCase();
    if (m === "conseiller" || m === "agent" || m === "interne") return "conseiller";
    if (m === "client" || m === "public") return "client";
    return null;
  }

  function isCrmUser() {
    try {
      var u = JSON.parse(localStorage.getItem("lo_user") || "{}");
      return u.role === "admin" || u.role === "agent" || u.role === "conseiller";
    } catch (e) {
      return false;
    }
  }

  function currentMode() {
    var url = getModeFromUrl();
    if (url) return url;
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "conseiller" || stored === "client") return stored;
    } catch (e) {}
    if (isCrmUser()) return "conseiller";
    return "client";
  }

  function setMode(mode, opts) {
    opts = opts || {};
    mode = mode === "conseiller" ? "conseiller" : "client";
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {}
    document.documentElement.setAttribute("data-immo-fill-mode", mode);
    var toolbar = qs("[data-immo-fill-toolbar]");
    if (toolbar) toolbar.setAttribute("data-active-mode", mode);

    qsa('input[name="fillModeUi"]').forEach(function (r) {
      r.checked = r.value === mode;
    });

    qsa("[data-conseiller-only]").forEach(function (el) {
      el.hidden = mode !== "conseiller";
      qsa("input, select, textarea", el).forEach(function (inp) {
        inp.disabled = mode !== "conseiller";
      });
    });

    var badge = qs("[data-fill-mode-badge]");
    if (badge) {
      badge.textContent = mode === "conseiller" ? "Mode conseiller" : "Mode client";
    }

    if (opts.updateUrl !== false) {
      var params = new URLSearchParams(window.location.search);
      params.set("mode", mode);
      var next = window.location.pathname + "?" + params.toString() + window.location.hash;
      try {
        history.replaceState(null, "", next);
      } catch (e) {}
    }
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function prefillConseiller() {
    var params = new URLSearchParams(window.location.search);
    var name = params.get("conseiller") || params.get("agent");
    if (!name) return;
    var el = qs('[name="sellAdvisorName"]');
    if (el && !el.value) el.value = name.replace(/\+/g, " ");
  }

  function bindToolbar() {
    var toolbar = qs("[data-immo-fill-toolbar]");
    if (!toolbar || toolbar.dataset.fillBound) return;
    toolbar.dataset.fillBound = "1";

    qsa('input[name="fillModeUi"]', toolbar).forEach(function (r) {
      r.addEventListener("change", function () {
        if (r.checked) setMode(r.value);
      });
    });

    setMode(currentMode(), { updateUrl: !getModeFromUrl() });
    prefillConseiller();
  }

  function boot() {
    bindToolbar();
  }

  window.AcheteurImmoFillMode = {
    getMode: currentMode,
    setMode: setMode,
    isConseiller: function () {
      return currentMode() === "conseiller";
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
