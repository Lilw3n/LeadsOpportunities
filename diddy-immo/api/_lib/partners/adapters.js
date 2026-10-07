/**
 * Adaptateurs d'envoi vers les partenaires.
 * Types: webhook | api | extranet | manual
 */
function buildPayload(lead, score, leadId) {
  return {
    leadId: leadId,
    leadScore: score,
    source: lead.source || "leads-opportunities",
    vertical: lead.vertical || lead.need || "",
    email: lead.email || null,
    phone: lead.phone || null,
    fullName: lead.fullName || lead.full_name || null,
    utm: {
      source: lead.utm_source || lead.attr_last_utm_source || null,
      medium: lead.utm_medium || lead.attr_last_utm_medium || null,
      campaign: lead.utm_campaign || null,
    },
    gclid: lead.gclid || lead.attr_last_gclid || null,
    receivedAt: lead.serverReceivedAt || new Date().toISOString(),
    data: lead,
  };
}

async function sendWebhook(partner, payload) {
  const envKey = partner.integration?.credentialEnv;
  const url = envKey ? process.env[envKey] : null;
  if (!url) {
    return {
      ok: false,
      status: "skipped",
      httpStatus: null,
      error: "Webhook non configure (" + (envKey || "?") + ")",
    };
  }
  const headers = { "Content-Type": "application/json" };
  const authEnv = partner.integration?.authHeaderEnv;
  if (authEnv && process.env[authEnv]) {
    headers.Authorization = "Bearer " + process.env[authEnv];
  }
  const secretEnv = partner.integration?.secretEnv;
  if (secretEnv && process.env[secretEnv]) {
    headers["X-Partner-Secret"] = process.env[secretEnv];
  }

  const controller = new AbortController();
  const timeout = setTimeout(function () {
    controller.abort();
  }, 8000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const text = await res.text();
    return {
      ok: res.ok,
      status: res.ok ? "sent" : "error",
      httpStatus: res.status,
      error: res.ok ? null : text.slice(0, 500),
      responseSnippet: text.slice(0, 300),
    };
  } catch (e) {
    clearTimeout(timeout);
    return {
      ok: false,
      status: "error",
      httpStatus: null,
      error: e.message || "Erreur reseau",
    };
  }
}

async function sendApi(partner, payload) {
  const integration = partner.integration || {};
  const mode = String(integration.mode || "").toLowerCase();

  // APRIL API Store — OAuth2 client_credentials
  if (partner.id === "april" || mode === "oauth_client_credentials") {
    try {
      const April = require("../april-client");
      if (April.isConfigured()) {
        const pathSuffix = integration.path || "/leads";
        const base = April.apiGatewayBase ? April.apiGatewayBase() : April.gatewayBase();
        const url = base.replace(/\/$/, "") + pathSuffix;
        const result = await April.request("POST", url, { body: payload, timeoutMs: 12000 });
        return {
          ok: result.ok,
          status: result.ok ? "sent" : "error",
          httpStatus: result.status,
          error: result.ok ? null : (result.text || "APRIL API error").slice(0, 500),
          responseSnippet: (result.text || "").slice(0, 300),
        };
      }
      // fallback legacy key if OAuth absent
    } catch (e) {
      return {
        ok: false,
        status: "error",
        httpStatus: e.httpStatus || null,
        error: e.message || "APRIL OAuth error",
      };
    }
  }

  const baseEnv = integration.baseUrlEnv;
  const keyEnv = integration.legacyApiKeyEnv || integration.credentialEnv;
  const baseUrl =
    (baseEnv && process.env[baseEnv]) ||
    (partner.id === "april" ? process.env.PARTNER_APRIL_API_BASE : null);
  const apiKey =
    (keyEnv && process.env[keyEnv]) ||
    (partner.id === "april" ? process.env.PARTNER_APRIL_API_KEY : null);

  if (!baseUrl || !apiKey) {
    return {
      ok: false,
      status: "skipped",
      httpStatus: null,
      error: "API non configuree (baseUrl ou cle manquante)",
    };
  }

  const pathSuffix = integration.path || "/leads";
  const url = baseUrl.replace(/\/$/, "") + pathSuffix;

  const controller = new AbortController();
  const timeout = setTimeout(function () {
    controller.abort();
  }, 8000);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const text = await res.text();
    return {
      ok: res.ok,
      status: res.ok ? "sent" : "error",
      httpStatus: res.status,
      error: res.ok ? null : text.slice(0, 500),
      responseSnippet: text.slice(0, 300),
    };
  } catch (e) {
    clearTimeout(timeout);
    return {
      ok: false,
      status: "error",
      httpStatus: null,
      error: e.message || "Erreur reseau",
    };
  }
}

async function dispatchToPartner(partner, lead, score, leadId) {
  const payload = buildPayload(lead, score, leadId);
  const type = (partner.integration?.type || "manual").toLowerCase();

  if (type === "webhook") {
    return sendWebhook(partner, payload);
  }
  if (type === "api") {
    return sendApi(partner, payload);
  }
  if (type === "extranet") {
    const webhook = await sendWebhook(partner, payload);
    if (webhook.status !== "skipped") return webhook;
    return {
      ok: false,
      status: "manual",
      httpStatus: null,
      error: "Extranet sans API — saisie manuelle ou passerelle a configurer",
    };
  }
  return {
    ok: false,
    status: "manual",
    httpStatus: null,
    error: "Type manual — pas d envoi automatique",
  };
}

module.exports = {
  buildPayload,
  dispatchToPartner,
};
