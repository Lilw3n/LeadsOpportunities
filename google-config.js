(function () {
  function isPlaceholder(id) {
    return !id || String(id).indexOf("XXXX") !== -1;
  }

  var defaults = {
    ga4MeasurementId: "G-JX8E35693F",
    adsConversionId: "AW-XXXXXXXXXX",
    adsLeadConversionId: "AW-XXXXXXXXXX/lead_form_submit",
    adsPhoneConversionId: "AW-XXXXXXXXXX/phone_click",
    adsWhatsappConversionId: "AW-XXXXXXXXXX/whatsapp_click",
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
  };

  var cfg = window.GOOGLE_TRACKING;
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
