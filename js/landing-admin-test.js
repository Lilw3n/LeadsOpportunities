/**
 * Mode test admin — parcours landings sans champs obligatoires.
 * Réservé aux comptes CRM connectés (lo_token). Activation : ?test=1 ou barre fixe.
 *
 * Diffère du « mode contrôle » (FormAudit) : permet un envoi réel avec données minimales.
 */
(function (global) {
  var STORAGE_KEY = "lo_landing_test_mode";

  function readUser() {
    try {
      return JSON.parse(localStorage.getItem("lo_user") || "{}");
    } catch (e) {
      return {};
    }
  }

  function hasCrmToken() {
    try {
      return !!localStorage.getItem("lo_token");
    } catch (e) {
      return false;
    }
  }

  /** Admin site ou collaborateur CRM connecté. */
  function canUse() {
    if (!hasCrmToken()) return false;
    var u = readUser();
    if (u.role === "admin" || u.isSiteAdmin) return true;
    var crm = u.crmRole || u.crm_role;
    return !!(crm && crm !== "apporteur");
  }

  function enabledFromUrl() {
    var p = new URLSearchParams(window.location.search);
    var t = (p.get("test") || p.get("mode") || "").toLowerCase();
    return t === "1" || t === "test" || t === "admin-test";
  }

  function enabledFromStorage() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function setEnabled(on) {
    if (!canUse()) on = false;
    try {
      if (on) localStorage.setItem(STORAGE_KEY, "1");
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    syncUi();
    try {
      document.dispatchEvent(new CustomEvent("lo:admin-test-change", { detail: { active: on } }));
    } catch (ev) {}
  }

  function isActive() {
    if (!canUse()) return false;
    return enabledFromUrl() || enabledFromStorage();
  }

  function skipValidation() {
    return isActive();
  }

  function authHeaders(extra) {
    extra = extra || {};
    var h = Object.assign({}, extra);
    if (hasCrmToken()) h.Authorization = "Bearer " + localStorage.getItem("lo_token");
    return h;
  }

  function testEmail() {
    return "test.admin+" + Date.now().toString(36) + "@leadsopportunities.fr";
  }

  function patchPayload(payload) {
    if (!isActive()) return payload || {};
    payload = Object.assign({}, payload || {});
    payload.adminTest = true;
    payload.testMode = true;
    payload.source = payload.source ? payload.source + "_admin_test" : "admin_test";
    if (!payload.email) payload.email = testEmail();
    if (!payload.phone) payload.phone = "0600000000";
    if (!payload.firstName && !payload.prenom) payload.firstName = "Test";
    if (!payload.lastName && !payload.nom) payload.lastName = "Admin";
    if (!payload.city && !payload.searchCities) payload.city = "Nancy";
    if (!payload.postal_code && !payload.postalProject) payload.postal_code = "54000";
    payload.pipeline_stage = payload.pipeline_stage || "admin_test";
    payload.adminTestBy = (readUser().email || readUser().fullName || "crm").slice(0, 120);
    payload.adminTestPage = window.location.pathname;
    return payload;
  }

  function patchImmoListingPayload(payload) {
    if (!isActive()) return payload || {};
    payload = patchPayload(payload);
    payload.role = payload.role || "vendeur";
    if (!payload.urls || !payload.urls.length) {
      if (!payload.externalListings || !payload.externalListings.length) {
        payload.urls = [];
      }
    }
    return payload;
  }

  function relaxForms() {
    if (!isActive()) return;
    document.querySelectorAll("form").forEach(function (f) {
      f.setAttribute("novalidate", "novalidate");
    });
  }

  function syncUi() {
    var active = isActive();
    document.documentElement.setAttribute("data-admin-test", active ? "1" : "0");
    document.body.classList.toggle("landing-admin-test-active", active);
    if (active) relaxForms();
    var bar = document.getElementById("landingAdminTestBar");
    if (bar) {
      var toggle = bar.querySelector("[data-admin-test-toggle]");
      if (toggle) toggle.checked = active;
      bar.hidden = !canUse();
    }
  }

  function mountBar() {
    if (!canUse() || document.getElementById("landingAdminTestBar")) return;
    var bar = document.createElement("div");
    bar.id = "landingAdminTestBar";
    bar.className = "landing-admin-test-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Mode test admin");
    bar.innerHTML =
      "<strong>Test admin</strong>" +
      '<label class="landing-admin-test-toggle">' +
      '<input type="checkbox" data-admin-test-toggle /> Mode test — valider sans champs obligatoires</label>' +
      '<span class="landing-admin-test-hint">Connecté CRM · envoi réel tagué admin_test</span>';
    document.body.insertBefore(bar, document.body.firstChild);

    var toggle = bar.querySelector("[data-admin-test-toggle]");
    toggle.checked = isActive();
    toggle.addEventListener("change", function () {
      setEnabled(toggle.checked);
    });

    if (enabledFromUrl() && canUse()) setEnabled(true);
    else syncUi();
  }

  function boot() {
    if (!canUse()) {
      document.documentElement.setAttribute("data-admin-test", "0");
      return;
    }
    mountBar();
    syncUi();
  }

  global.LandingAdminTest = {
    canUse: canUse,
    isActive: isActive,
    skipValidation: skipValidation,
    setEnabled: setEnabled,
    patchPayload: patchPayload,
    patchImmoListingPayload: patchImmoListingPayload,
    authHeaders: authHeaders,
    hasCrmToken: hasCrmToken,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : global);
