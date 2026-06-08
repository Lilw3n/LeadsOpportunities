/**
 * GET /api/google-config-env — JavaScript qui injecte les IDs Google depuis les variables Vercel.
 * Inclure AVANT google-config.js : <script src="/api/google-config-env"></script>
 */
const { applyApiGuards } = require("../security");

module.exports = function googleConfigEnv(req, res) {
  applyApiGuards(req, res);
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=120");

  var fromEnv = {
    ga4MeasurementId: String(process.env.GA4_MEASUREMENT_ID || "").trim(),
    adsConversionId: String(process.env.GOOGLE_ADS_ID || "").trim(),
    adsLeadConversionId: String(process.env.GOOGLE_ADS_CONVERSION_LEAD || "").trim(),
    adsPhoneConversionId: String(process.env.GOOGLE_ADS_CONVERSION_PHONE || "").trim(),
    adsWhatsappConversionId: String(process.env.GOOGLE_ADS_CONVERSION_WHATSAPP || "").trim(),
    adsQualifiedLeadConversionId: String(process.env.GOOGLE_ADS_CONVERSION_QUALIFIED_LEAD || "").trim(),
    metaPixelId: String(process.env.META_PIXEL_ID || "").trim(),
    tiktokPixelId: String(process.env.TIKTOK_PIXEL_ID || "").trim(),
    pinterestTagId: String(process.env.PINTEREST_TAG_ID || "").trim(),
  };

  res.status(200).send(
    "(function(){try{window.GOOGLE_TRACKING_FROM_ENV=" +
      JSON.stringify(fromEnv) +
      ";}catch(_){}})();"
  );
};
