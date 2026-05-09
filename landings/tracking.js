(function () {
  function canUseGtag() {
    return typeof window.gtag === "function" && window.GOOGLE_TRACKING;
  }

  function sendGoogleEvent(name, payload) {
    if (!canUseGtag()) return;
    var cfg = window.GOOGLE_TRACKING || {};
    var vertical = (payload && payload.vertical) || getVerticalFromPath();

    window.gtag("event", name, {
      send_to: cfg.ga4MeasurementId,
      event_category: "lead_generation",
      event_label: vertical,
      value: 1,
      vertical: vertical,
      variant: (payload && payload.variant) || "",
    });

    if (name === "form_submit" && cfg.adsLeadConversionId) {
      window.gtag("event", "conversion", {
        send_to: cfg.adsLeadConversionId,
        value: 1,
        currency: "EUR",
      });
    }

    if (name === "phone_click" && cfg.adsPhoneConversionId) {
      window.gtag("event", "conversion", {
        send_to: cfg.adsPhoneConversionId,
        value: 1,
        currency: "EUR",
      });
    }

    if (name === "whatsapp_click" && cfg.adsWhatsappConversionId) {
      window.gtag("event", "conversion", {
        send_to: cfg.adsWhatsappConversionId,
        value: 1,
        currency: "EUR",
      });
    }
  }

  function getVerticalFromPath() {
    var path = window.location.pathname;
    if (path.indexOf("vtc") !== -1) return "vtc";
    if (path.indexOf("sante") !== -1) return "sante";
    if (path.indexOf("credit-immo") !== -1) return "credit_immo";
    return "unknown";
  }

  function getUtmPayload() {
    var params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      gclid: params.get("gclid") || "",
    };
  }

  function collectFormData(form) {
    var fd = new FormData(form);
    var o = {};
    fd.forEach(function (v, k) {
      o[k] = v;
    });
    return o;
  }

  function postLeadApi(body) {
    return fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(function () {});
  }

  function trackEvent(name, payload) {
    var data = {
      event: name,
      ts: new Date().toISOString(),
      page: window.location.pathname,
      payload: Object.assign(
        {
          vertical: getVerticalFromPath(),
        },
        getUtmPayload(),
        payload || {}
      ),
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
    sendGoogleEvent(name, data.payload);
    console.log("[tracking]", data);
  }

  function getVariant() {
    var params = new URLSearchParams(window.location.search);
    var v = params.get("variant");
    if (v === "price" || v === "speed") return v;
    return "speed";
  }

  function applyVariant() {
    var variant = getVariant();
    var hero = document.querySelector("[data-hero-title]");
    var subtitle = document.querySelector("[data-hero-subtitle]");

    if (!hero || !subtitle) return variant;

    if (variant === "price") {
      hero.textContent = hero.getAttribute("data-price-title");
      subtitle.textContent = subtitle.getAttribute("data-price-subtitle");
    } else {
      hero.textContent = hero.getAttribute("data-speed-title");
      subtitle.textContent = subtitle.getAttribute("data-speed-subtitle");
    }

    trackEvent("ab_variant_seen", { variant: variant });
    return variant;
  }

  function bindTracking() {
    var variant = applyVariant();
    var ctas = document.querySelectorAll("[data-track='cta_click']");
    var phoneLinks = document.querySelectorAll("[data-track='phone_click']");
    var whatsappLinks = document.querySelectorAll("[data-track='whatsapp_click']");
    var form = document.querySelector("form[data-track-form]");

    ctas.forEach(function (btn) {
      btn.addEventListener("click", function () {
        trackEvent("cta_click", { variant: variant, label: btn.textContent.trim() });
      });
    });

    phoneLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        trackEvent("phone_click", { variant: variant });
      });
    });

    whatsappLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        trackEvent("whatsapp_click", { variant: variant });
      });
    });

    if (form) {
      var firstInput = form.querySelector("input,select,textarea");
      if (firstInput) {
        firstInput.addEventListener("focus", function onFirstFocus() {
          trackEvent("form_start", { variant: variant });
          firstInput.removeEventListener("focus", onFirstFocus);
        });
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        trackEvent("form_submit", { variant: variant });
        var data = collectFormData(form);
        var leadPayload = Object.assign(
          {
            source: "landing_form",
            vertical: getVerticalFromPath(),
            page: window.location.pathname,
            variant: variant,
          },
          getUtmPayload(),
          data
        );
        if (typeof window.saveLeadRequest === "function") {
          window.saveLeadRequest(leadPayload);
        }
        postLeadApi(leadPayload);
        var msg = document.querySelector("[data-form-success]");
        if (msg) msg.hidden = false;
      });
    }
  }

  document.addEventListener("DOMContentLoaded", bindTracking);
})();
