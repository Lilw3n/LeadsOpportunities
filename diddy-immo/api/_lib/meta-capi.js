const crypto = require("crypto");

function sha256(v) {
  return crypto.createHash("sha256").update(String(v || "").trim().toLowerCase()).digest("hex");
}

function buildFbc(fbclid, eventTimeSec) {
  if (!fbclid) return null;
  var clickId = String(fbclid).trim();
  if (clickId.indexOf("fb.") === 0) return clickId;
  var ts = eventTimeSec || Math.floor(Date.now() / 1000);
  return "fb.1." + ts + "." + clickId;
}

function getMetaConfig() {
  const pixelId = process.env.META_PIXEL_ID || "4470774303164658";
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return null;
  return {
    pixelId: String(pixelId).trim(),
    token: String(token).trim(),
    apiVersion: process.env.META_CAPI_VERSION || "v20.0",
  };
}

async function sendMetaEvent(input) {
  const cfg = getMetaConfig();
  if (!cfg) return { ok: false, skipped: true, reason: "missing_meta_config" };

  const url = `https://graph.facebook.com/${cfg.apiVersion}/${cfg.pixelId}/events?access_token=${encodeURIComponent(
    cfg.token
  )}`;

  const eventTime = Math.floor(Date.now() / 1000);
  const userData = {};
  if (input.email) userData.em = [sha256(input.email)];
  if (input.phone) userData.ph = [sha256(String(input.phone).replace(/\D+/g, ""))];
  if (input.fbclid) userData.fbc = buildFbc(input.fbclid, eventTime);
  if (input.fbp) userData.fbp = String(input.fbp).trim();
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.clientUa) userData.client_user_agent = input.clientUa;
  if (input.externalId) userData.external_id = [sha256(input.externalId)];

  const payload = {
    data: [
      {
        event_name: input.eventName || "Lead",
        event_time: eventTime,
        event_id: input.eventId || undefined,
        action_source: input.actionSource || "website",
        event_source_url: input.pageUrl || undefined,
        user_data: userData,
        custom_data: input.customData || {},
      },
    ],
  };

  if (input.testEventCode) {
    payload.test_event_code = String(input.testEventCode).trim();
  }

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const t = await r.text();
    return { ok: false, error: t.slice(0, 500) };
  }
  return { ok: true };
}

module.exports = { sendMetaEvent, buildFbc, getMetaConfig, sha256 };
