const crypto = require("crypto");

function sha256(v) {
  return crypto.createHash("sha256").update(String(v || "").trim().toLowerCase()).digest("hex");
}

function getMetaConfig() {
  const pixelId = process.env.META_PIXEL_ID;
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

  const userData = {};
  if (input.email) userData.em = [sha256(input.email)];
  if (input.phone) userData.ph = [sha256(String(input.phone).replace(/\D+/g, ""))];
  if (input.fbclid) userData.fbc = input.fbclid;
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.clientUa) userData.client_user_agent = input.clientUa;

  const payload = {
    data: [
      {
        event_name: input.eventName || "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId || undefined,
        action_source: "website",
        event_source_url: input.pageUrl || undefined,
        user_data: userData,
        custom_data: input.customData || {},
      },
    ],
  };

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

module.exports = { sendMetaEvent };
