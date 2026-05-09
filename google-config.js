(function () {
  function isPlaceholder(id) {
    return !id || String(id).indexOf("XXXX") !== -1;
  }

  // Remplace ces valeurs par tes IDs Google Ads / GA4 (sans laisser XXXX).
  window.GOOGLE_TRACKING = {
    ga4MeasurementId: "G-XXXXXXXXXX",
    adsConversionId: "AW-XXXXXXXXXX",
    adsLeadConversionId: "AW-XXXXXXXXXX/lead_form_submit",
    adsPhoneConversionId: "AW-XXXXXXXXXX/phone_click",
    adsWhatsappConversionId: "AW-XXXXXXXXXX/whatsapp_click",
  };

  var cfg = window.GOOGLE_TRACKING;
  var primaryGa = !isPlaceholder(cfg.ga4MeasurementId) ? cfg.ga4MeasurementId : null;
  var primaryAds = !isPlaceholder(cfg.adsConversionId) ? cfg.adsConversionId : null;
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
    "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(primaryGa || primaryAds);
  document.head.appendChild(script);
})();
