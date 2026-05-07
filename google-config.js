(function () {
  // Remplace ces valeurs par tes IDs Google Ads / GA4.
  window.GOOGLE_TRACKING = {
    ga4MeasurementId: "G-XXXXXXXXXX",
    adsConversionId: "AW-XXXXXXXXXX",
    adsLeadConversionId: "AW-XXXXXXXXXX/lead_form_submit",
    adsPhoneConversionId: "AW-XXXXXXXXXX/phone_click",
    adsWhatsappConversionId: "AW-XXXXXXXXXX/whatsapp_click",
  };

  var cfg = window.GOOGLE_TRACKING;
  if (!cfg.ga4MeasurementId && !cfg.adsConversionId) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;
  window.gtag("js", new Date());

  if (cfg.ga4MeasurementId) {
    window.gtag("config", cfg.ga4MeasurementId);
  }
  if (cfg.adsConversionId) {
    window.gtag("config", cfg.adsConversionId);
  }

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4MeasurementId || cfg.adsConversionId);
  document.head.appendChild(script);
})();
