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

  function readUser() {
    try {
      return JSON.parse(localStorage.getItem("lo_user") || "{}");
    } catch (e) {
      return {};
    }
  }

  /** Réservé au site admin / CRM (pas aux visiteurs / clients). */
  function isSiteAdmin() {
    var g = window.CrmAdminGuard;
    if (g && typeof g.isSiteAdmin === "function" && g.isSiteAdmin()) return true;
    var u = readUser();
    if (u.role === "admin" || u.isSiteAdmin === true) return true;
    var crm = String(u.crmRole || u.crm_role || "").toLowerCase();
    return crm === "admin" || crm === "staff";
  }

  function canUseConseillerMode() {
    return isSiteAdmin();
  }

  function currentMode() {
    if (!canUseConseillerMode()) return "client";
    var url = getModeFromUrl();
    if (url === "conseiller") return "conseiller";
    if (url === "client") return "client";
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "conseiller") return "conseiller";
    } catch (e) {}
    return "client";
  }

  function setMode(mode, opts) {
    opts = opts || {};
    if (!canUseConseillerMode()) mode = "client";
    else mode = mode === "conseiller" ? "conseiller" : "client";
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

    if (window.ImmoRgpdConfirmation && typeof window.ImmoRgpdConfirmation.syncQuestion === "function") {
      window.ImmoRgpdConfirmation.syncQuestion(document);
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

  function syncToolbarVisibility() {
    var admin = canUseConseillerMode();
    document.documentElement.setAttribute("data-immo-fill-admin", admin ? "1" : "0");
    var toolbar = qs("[data-immo-fill-toolbar]");
    if (!toolbar) return;
    toolbar.hidden = !admin;
    var conseillerOpt = toolbar.querySelector('input[name="fillModeUi"][value="conseiller"]');
    if (conseillerOpt) {
      var wrap = conseillerOpt.closest(".immo-fill-mode-opt");
      if (wrap) wrap.hidden = !admin;
    }
  }

  function bindToolbar() {
    var toolbar = qs("[data-immo-fill-toolbar]");
    if (!toolbar || toolbar.dataset.fillBound) return;
    toolbar.dataset.fillBound = "1";

    syncToolbarVisibility();

    if (!canUseConseillerMode()) {
      setMode("client", { updateUrl: false });
      return;
    }

    qsa('input[name="fillModeUi"]', toolbar).forEach(function (r) {
      r.addEventListener("change", function () {
        if (r.checked) setMode(r.value);
      });
    });

    var urlMode = getModeFromUrl();
    var params = new URLSearchParams(window.location.search);
    var autoConseiller = !urlMode && params.get("source") === "crm_resume";
    setMode(urlMode || (autoConseiller ? "conseiller" : currentMode()), {
      updateUrl: !urlMode && !autoConseiller,
    });
    prefillConseiller();
  }

  function boot() {
    bindToolbar();
  }

  window.AcheteurImmoFillMode = {
    getMode: currentMode,
    setMode: setMode,
    isSiteAdmin: isSiteAdmin,
    canUseConseillerMode: canUseConseillerMode,
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
