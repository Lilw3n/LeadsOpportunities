/**
 * Ciblage audience France : bannière hors périmètre, blocage formulaires, dimension GA4.
 */
(function () {
  var STATE = { loaded: false, country: null, inFrance: true, audience: "unknown" };

  function canonicalUrl() {
    var c = document.querySelector('link[rel="canonical"]');
    if (c && c.href) return c.href;
    return window.location.origin + window.location.pathname;
  }

  function trackAudience() {
    if (typeof window.gtag !== "function") return;
    window.gtag("set", "user_properties", {
      visitor_country: STATE.country || "unknown",
      in_france_audience: STATE.inFrance ? "yes" : "no",
      audience_scope: STATE.audience,
    });
    window.gtag("event", "audience_geo_check", {
      visitor_country: STATE.country || "unknown",
      in_france_audience: STATE.inFrance,
      page_path: window.location.pathname,
    });
  }

  function showBanner() {
    if (document.getElementById("geo-france-banner")) return;
    var wrap = document.createElement("div");
    wrap.id = "geo-france-banner";
    wrap.setAttribute("role", "status");
    wrap.innerHTML =
      '<div class="geo-france-banner-inner">' +
      "<p><strong>Service réservé à la France</strong> — Courtier ORIAS : assurances et crédit immobilier en France métropolitaine et DOM-TOM uniquement. " +
      "Si vous êtes en France, vous pouvez continuer ; sinon ce site ne correspond probablement pas à votre besoin.</p>" +
      '<button type="button" class="geo-france-dismiss" aria-label="Fermer">Compris</button>' +
      "</div>";
    document.body.appendChild(wrap);
    wrap.querySelector(".geo-france-dismiss").addEventListener("click", function () {
      try {
        sessionStorage.setItem("lo_geo_banner_dismissed", "1");
      } catch (e) {}
      wrap.remove();
    });
  }

  function blockForeignForms() {
    if (STATE.inFrance || STATE.audience === "unknown") return;

    document.querySelectorAll("form").forEach(function (form) {
      if (form.dataset.geoGuardBound) return;
      form.dataset.geoGuardBound = "1";
      form.addEventListener(
        "submit",
        function (e) {
          if (STATE.inFrance || STATE.audience === "unknown") return;
          e.preventDefault();
          e.stopPropagation();
          var msg = form.querySelector("[data-geo-blocked-msg]");
          if (!msg) {
            msg = document.createElement("p");
            msg.dataset.geoBlockedMsg = "1";
            msg.className = "geo-france-form-block";
            msg.textContent =
              "Ce formulaire est réservé aux résidents en France (assurance & crédit immo ORIAS).";
            form.appendChild(msg);
          }
          msg.hidden = false;
        },
        true
      );
    });
  }

  function applyState(data) {
    STATE.loaded = true;
    STATE.country = data.country || null;
    STATE.inFrance = data.inFrance !== false;
    STATE.audience = data.audience || "unknown";
    window.LO_GEO_AUDIENCE = {
      country: STATE.country,
      inFrance: STATE.inFrance,
      audience: STATE.audience,
      isFranceAudience: function () {
        return STATE.inFrance || STATE.audience === "unknown";
      },
    };
    trackAudience();
    if (!STATE.inFrance && STATE.audience === "foreign") {
      try {
        if (!sessionStorage.getItem("lo_geo_banner_dismissed")) showBanner();
      } catch (e) {
        showBanner();
      }
      blockForeignForms();
    }
    window.dispatchEvent(
      new CustomEvent("lo:geo-audience", { detail: Object.assign({}, STATE) })
    );
  }

  function fetchHint() {
    return fetch("/api/geo-hint", { credentials: "same-origin" })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (data && data.ok) applyState(data);
      })
      .catch(function () {
        applyState({ country: null, inFrance: true, audience: "unknown" });
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fetchHint();
  });
})();
