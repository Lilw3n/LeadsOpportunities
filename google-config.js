(function () {
  window.dataLayer = window.dataLayer || [];
  function gtagConsent() {
    window.dataLayer.push(arguments);
  }
  if (!window.__loConsentDefaultSet) {
    window.__loConsentDefaultSet = true;
    gtagConsent("consent", "default", {
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });
  }

  function isPlaceholder(id) {
    return !id || String(id).indexOf("XXXX") !== -1;
  }

  var defaults = {
    ga4MeasurementId: "G-JX8E35693F",
    adsConversionId: "AW-XXXXXXXXXX",
    adsLeadConversionId: "AW-XXXXXXXXXX/lead_form_submit",
    adsPhoneConversionId: "AW-XXXXXXXXXX/phone_click",
    adsWhatsappConversionId: "AW-XXXXXXXXXX/whatsapp_click",
    adsQualifiedLeadConversionId: "AW-XXXXXXXXXX/qualified_lead",
    metaPixelId: "",
    tiktokPixelId: "",
    pinterestTagId: "",
    clarityProjectId: "x7yqp46fj9",
  };

  var env = window.GOOGLE_TRACKING_FROM_ENV || {};
  function merge(key) {
    var v = env[key];
    if (v && String(v).trim() && String(v).indexOf("XXXX") === -1) {
      return String(v).trim();
    }
    return defaults[key];
  }

  window.GOOGLE_TRACKING = {
    ga4MeasurementId: merge("ga4MeasurementId"),
    adsConversionId: merge("adsConversionId"),
    adsLeadConversionId: merge("adsLeadConversionId"),
    adsPhoneConversionId: merge("adsPhoneConversionId"),
    adsWhatsappConversionId: merge("adsWhatsappConversionId"),
    adsQualifiedLeadConversionId: merge("adsQualifiedLeadConversionId"),
    metaPixelId: merge("metaPixelId"),
    tiktokPixelId: merge("tiktokPixelId"),
    pinterestTagId: merge("pinterestTagId"),
    clarityProjectId: merge("clarityProjectId"),
  };

  var cfg = window.GOOGLE_TRACKING;
  window.SOCIAL_TRACKING = {
    metaPixelId: cfg.metaPixelId,
    tiktokPixelId: cfg.tiktokPixelId,
    pinterestTagId: cfg.pinterestTagId,
  };

  if (cfg.metaPixelId && cfg.metaPixelId.indexOf("XXXX") === -1 && !window.fbq) {
    window.fbq = function () {
      window.fbq.callMethod
        ? window.fbq.callMethod.apply(window.fbq, arguments)
        : window.fbq.queue.push(arguments);
    };
    window.fbq.queue = [];
    window.fbq.loaded = true;
    window.fbq.version = "2.0";
    var fb = document.createElement("script");
    fb.async = true;
    fb.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(fb);
    window.fbq("init", cfg.metaPixelId);
    window.fbq("track", "PageView");
  }

  if (cfg.pinterestTagId && cfg.pinterestTagId.indexOf("XXXX") === -1 && !window.pintrk) {
    window.pintrk = function () {
      window.pintrk.queue.push(Array.prototype.slice.call(arguments));
    };
    window.pintrk.queue = [];
    var pin = document.createElement("script");
    pin.async = true;
    pin.src = "https://s.pinimg.com/ct/core.js";
    document.head.appendChild(pin);
    window.pintrk("load", cfg.pinterestTagId);
    window.pintrk("page");
  }

  if (cfg.tiktokPixelId && cfg.tiktokPixelId.indexOf("XXXX") === -1 && !window.ttq) {
    window.ttq = {
      _i: cfg.tiktokPixelId,
      _events: [],
      track: function () {
        this._events.push(arguments);
      },
      page: function () {
        this._events.push(["PageView"]);
      },
    };
    var tt = document.createElement("script");
    tt.async = true;
    tt.src = "https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=" + encodeURIComponent(cfg.tiktokPixelId);
    document.head.appendChild(tt);
    window.ttq.page();
  }

  if (
    cfg.clarityProjectId &&
    cfg.clarityProjectId.indexOf("XXXX") === -1 &&
    !document.getElementById("clarity-script") &&
    !document.querySelector('script[src="/js/clarity-snippet.js"]')
  ) {
    var claritySnippet = document.createElement("script");
    claritySnippet.src = "/js/clarity-snippet.js";
    document.head.appendChild(claritySnippet);
  }

  if (
    cfg.clarityProjectId &&
    cfg.clarityProjectId.indexOf("XXXX") === -1 &&
    !document.querySelector('script[src="/js/clarity-init.js"]')
  ) {
    var clarityBoot = document.createElement("script");
    clarityBoot.src = "/js/clarity-init.js";
    clarityBoot.defer = true;
    document.head.appendChild(clarityBoot);
  }

  var primaryGa = !isPlaceholder(cfg.ga4MeasurementId) ? cfg.ga4MeasurementId : null;
  var primaryAds = !isPlaceholder(cfg.adsConversionId) ? cfg.adsConversionId : null;

  var staticTagPresent = !!document.querySelector(
    'script[src*="googletagmanager.com/gtag/js"]'
  );

  if (staticTagPresent) {
    if (primaryAds && typeof window.gtag === "function") {
      window.gtag("config", cfg.adsConversionId);
    }
    return;
  }

  if (!primaryGa && !primaryAds) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;
  window.gtag("js", new Date());

  if (primaryGa) {
    window.gtag("config", cfg.ga4MeasurementId);
  }
  if (primaryAds) {
    window.gtag("config", cfg.adsConversionId);
  }

  var script = document.createElement("script");
  script.async = true;
  script.src =
    "https://www.googletagmanager.com/gtag/js?id=" +
    encodeURIComponent(primaryGa || primaryAds);
  document.head.appendChild(script);

})();
