/**
 * GET /api/meta-status — diagnostic public (booléens uniquement, pas de secrets).
 * Sert à vérifier après deploy que META_CAPI_TOKEN est présent côté serveur.
 */
const { applyApiGuards } = require("../security");

module.exports = function metaStatus(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var pixelId = String(process.env.META_PIXEL_ID || "4470774303164658").trim();
  var capiConfigured = !!(pixelId && String(process.env.META_CAPI_TOKEN || "").trim());
  var webhookConfigured = !!(
    String(process.env.META_VERIFY_TOKEN || "").trim() &&
    String(process.env.META_APP_SECRET || "").trim()
  );
  var pageTokenConfigured = !!String(process.env.META_PAGE_ACCESS_TOKEN || "").trim();

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    ok: true,
    pixel_id: pixelId,
    pixel_configured: !!pixelId,
    capi_configured: capiConfigured,
    webhook_configured: webhookConfigured,
    lead_ads_token_configured: pageTokenConfigured,
    events: {
      browser: ["PageView", "JourneyFormStart", "JourneyStep", "Lead", "qualified_lead"],
      server: capiConfigured ? ["Lead", "qualified_lead"] : [],
    },
    priority_verticals: ["vtc", "sante", "credit_immo"],
    optimize_hint: "Ads Manager → conversion Lead (principal) + qualified_lead (scale)",
    docs: "./docs/META-ADS-AUTOMATION.md",
  });
};
