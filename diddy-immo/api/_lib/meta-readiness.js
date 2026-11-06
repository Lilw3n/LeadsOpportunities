const { getMetaConfig, sendMetaEvent } = require("./meta-capi");

const DEFAULT_PIXEL_ID = "4470774303164658";
const DEFAULT_PAGE_ID = "1183829618147455";

function buildMetaReadiness() {
  var pixelId = String(process.env.META_PIXEL_ID || DEFAULT_PIXEL_ID).trim();
  var capiToken = String(process.env.META_CAPI_TOKEN || "").trim();
  var appSecret = String(process.env.META_APP_SECRET || "").trim();
  var verifyToken = String(process.env.META_VERIFY_TOKEN || "").trim();
  var pageToken = String(process.env.META_PAGE_ACCESS_TOKEN || "").trim();
  var pageId = String(process.env.META_PAGE_ID || DEFAULT_PAGE_ID).trim();

  var vercelVars = [
    { key: "META_PIXEL_ID", ok: !!pixelId, required: true },
    { key: "META_CAPI_TOKEN", ok: !!capiToken, required: true },
    { key: "META_APP_SECRET", ok: !!appSecret, required: false, note: "Webhook Lead Ads" },
    { key: "META_VERIFY_TOKEN", ok: !!verifyToken, required: false, note: "Webhook GET verify" },
    { key: "META_PAGE_ACCESS_TOKEN", ok: !!pageToken, required: false, note: "Graph API leads" },
    { key: "META_PAGE_ID", ok: !!pageId, required: false },
  ];

  var missingRequired = vercelVars.filter(function (v) {
    return v.required && !v.ok;
  });

  return {
    ok: missingRequired.length === 0,
    pixel_id: pixelId,
    page_id: pageId,
    pixel_configured: !!pixelId,
    capi_configured: !!(pixelId && capiToken),
    capi_token_present: !!capiToken,
    webhook_configured: !!(appSecret && verifyToken),
    verify_token_present: !!verifyToken,
    lead_ads_configured: !!(pageToken && pageId),
    events: {
      browser: ["PageView", "JourneyFormStart", "JourneyStep", "Lead", "qualified_lead"],
      server: ["Lead", "qualified_lead"],
    },
    optimization: {
      primary_conversion: "Lead",
      qualified_conversion: "qualified_lead",
      qualified_threshold: 50,
      dedup_event_id: "leadId (navigateur + serveur)",
      qualified_dedup_event_id: "leadId_ql",
      retarget_abandon: "JourneyFormStart sans Lead → /landings/rappel.html",
    },
    vercel_vars: vercelVars,
    missing_required: missingRequired.map(function (v) {
      return v.key;
    }),
    events_manager_url:
      "https://business.facebook.com/events_manager2/list/pixel/" + encodeURIComponent(pixelId),
    test_landing_url:
      "https://www.leadsopportunities.fr/landings/rappel.html?utm_source=meta&utm_medium=paid_social&utm_campaign=pixel-check",
    docs: "./docs/META-ADS-AUTOMATION.md",
  };
}

async function validateMetaCapiToken() {
  var cfg = getMetaConfig();
  if (!cfg) return { ok: false, reason: "missing_meta_config" };

  var url =
    "https://graph.facebook.com/" +
    cfg.apiVersion +
    "/" +
    encodeURIComponent(cfg.pixelId) +
    "?fields=name,is_unavailable" +
    "&access_token=" +
    encodeURIComponent(cfg.token);

  try {
    var r = await fetch(url);
    var data = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) {
      return {
        ok: false,
        reason: "graph_api_error",
        error: (data.error && data.error.message) || r.statusText,
        code: data.error && data.error.code,
      };
    }
    return {
      ok: true,
      pixel_id: cfg.pixelId,
      pixel_name: data.name || null,
      is_unavailable: !!data.is_unavailable,
    };
  } catch (e) {
    return { ok: false, reason: "network_error", error: e.message };
  }
}

async function sendMetaTestLead(testEventCode, req) {
  if (!testEventCode) return { ok: false, error: "test_event_code requis" };
  var cfg = getMetaConfig();
  if (!cfg) return { ok: false, error: "META_PIXEL_ID ou META_CAPI_TOKEN manquant sur Vercel" };

  var eventId = "crm_test_" + Date.now();
  var clientIp =
    (req && req.headers["x-forwarded-for"] && String(req.headers["x-forwarded-for"]).split(",")[0].trim()) ||
    (req && req.headers["x-real-ip"]) ||
    "127.0.0.1";
  var clientUa = (req && req.headers["user-agent"]) || "LeadsOpportunities/meta-readiness-test";

  return sendMetaEvent({
    eventName: "Lead",
    eventId: eventId,
    pageUrl: "https://www.leadsopportunities.fr/crm-pubs.html",
    clientIp: clientIp,
    clientUa: clientUa,
    testEventCode: testEventCode,
    customData: {
      currency: "EUR",
      value: 1,
      content_name: "crm_test",
      source: "crm_meta_readiness",
    },
  });
}

module.exports = {
  buildMetaReadiness,
  validateMetaCapiToken,
  sendMetaTestLead,
};
