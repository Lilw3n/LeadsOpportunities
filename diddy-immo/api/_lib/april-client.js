/**
 * Client API APRIL (API Store) — OAuth2 client_credentials + appels Bearer.
 * Secrets : PARTNER_APRIL_CLIENT_ID / PARTNER_APRIL_CLIENT_SECRET (jamais exposés au front).
 *
 * Doc préprod (API Store) — deux gateways distinctes :
 *   OAuth : POST {oauthGateway}/apistore/oauth/token?grant_type=client_credentials&…
 *   API   : POST {apiGateway}/apistore-test/firstCall/  Authorization: Bearer <token>
 */
var DEFAULT_OAUTH_GATEWAY = "https://ppr-am-gateway.april.fr";
var DEFAULT_API_GATEWAY = "https://ppr-api-gateway.april.fr";

var tokenCache = {
  accessToken: null,
  expiresAt: 0,
};

function oauthGatewayBase() {
  var raw =
    process.env.PARTNER_APRIL_GATEWAY ||
    process.env.PARTNER_APRIL_OAUTH_GATEWAY ||
    DEFAULT_OAUTH_GATEWAY;
  return String(raw || DEFAULT_OAUTH_GATEWAY)
    .trim()
    .replace(/\/$/, "");
}

function apiGatewayBase() {
  var raw =
    process.env.PARTNER_APRIL_API_GATEWAY ||
    process.env.PARTNER_APRIL_API_BASE ||
    DEFAULT_API_GATEWAY;
  return String(raw || DEFAULT_API_GATEWAY)
    .trim()
    .replace(/\/$/, "");
}

/** @deprecated alias oauth — conservé pour adapters existants */
function gatewayBase() {
  return oauthGatewayBase();
}

function oauthTokenUrl() {
  if (process.env.PARTNER_APRIL_OAUTH_URL) {
    return String(process.env.PARTNER_APRIL_OAUTH_URL).trim();
  }
  return oauthGatewayBase() + "/apistore/oauth/token";
}

function firstCallUrl() {
  if (process.env.PARTNER_APRIL_FIRST_CALL_URL) {
    return String(process.env.PARTNER_APRIL_FIRST_CALL_URL).trim();
  }
  return apiGatewayBase() + "/apistore-test/firstCall/";
}

function clientId() {
  return String(process.env.PARTNER_APRIL_CLIENT_ID || "").trim();
}

function clientSecret() {
  return String(process.env.PARTNER_APRIL_CLIENT_SECRET || "").trim();
}

function isConfigured() {
  return !!(clientId() && clientSecret());
}

function configStatus() {
  var id = clientId();
  return {
    configured: isConfigured(),
    gateway: oauthGatewayBase(),
    oauthGateway: oauthGatewayBase(),
    apiGateway: apiGatewayBase(),
    oauthUrl: oauthTokenUrl().replace(/client_secret=[^&]*/i, "client_secret=***"),
    firstCallUrl: firstCallUrl(),
    clientIdHint: id ? id.slice(0, 5) + "…" + id.slice(-2) : "",
    hasClientId: !!id,
    hasClientSecret: !!clientSecret(),
    env: process.env.PARTNER_APRIL_ENV || "preprod",
    tokenCached: !!(tokenCache.accessToken && Date.now() < tokenCache.expiresAt - 5000),
  };
}

function clearTokenCache() {
  tokenCache.accessToken = null;
  tokenCache.expiresAt = 0;
}

async function fetchAccessToken(forceRefresh) {
  if (!isConfigured()) {
    var err = new Error("APRIL non configuré (PARTNER_APRIL_CLIENT_ID / PARTNER_APRIL_CLIENT_SECRET)");
    err.code = "APRIL_NOT_CONFIGURED";
    throw err;
  }

  if (
    !forceRefresh &&
    tokenCache.accessToken &&
    Date.now() < tokenCache.expiresAt - 30000
  ) {
    return tokenCache.accessToken;
  }

  var url = new URL(oauthTokenUrl());
  url.searchParams.set("grant_type", "client_credentials");
  url.searchParams.set("client_id", clientId());
  url.searchParams.set("client_secret", clientSecret());

  var controller = new AbortController();
  var timeout = setTimeout(function () {
    controller.abort();
  }, 12000);

  var res;
  try {
    res = await fetch(url.toString(), {
      method: "POST",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  var data = await res.json().catch(function () {
    return {};
  });

  if (!res.ok || !data.access_token) {
    clearTokenCache();
    var msg =
      data.error_description ||
      data.error ||
      data.message ||
      "Échange jeton APRIL impossible (HTTP " + res.status + ")";
    var e = new Error(msg);
    e.code = "APRIL_TOKEN_ERROR";
    e.httpStatus = res.status;
    e.details = {
      error: data.error || null,
      status: res.status,
    };
    throw e;
  }

  var expiresIn = Number(data.expires_in) || 3600;
  tokenCache.accessToken = data.access_token;
  tokenCache.expiresAt = Date.now() + expiresIn * 1000;

  return data.access_token;
}

async function request(method, url, opts) {
  opts = opts || {};
  var token = await fetchAccessToken(!!opts.forceRefresh);
  var headers = Object.assign(
    {
      Accept: "application/json",
      Authorization: "Bearer " + token,
    },
    opts.headers || {}
  );
  if (opts.body != null && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  var controller = new AbortController();
  var timeout = setTimeout(function () {
    controller.abort();
  }, opts.timeoutMs || 15000);

  var res;
  try {
    res = await fetch(url, {
      method: method || "GET",
      headers: headers,
      body:
        opts.body == null
          ? undefined
          : typeof opts.body === "string"
            ? opts.body
            : JSON.stringify(opts.body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  // Un retry si jeton expiré côté APRIL
  if (res.status === 401 && !opts._retried) {
    clearTokenCache();
    return request(method, url, Object.assign({}, opts, { forceRefresh: true, _retried: true }));
  }

  var text = await res.text();
  var json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    json = null;
  }

  return {
    ok: res.ok,
    status: res.status,
    data: json,
    text: text.slice(0, 2000),
  };
}

/**
 * Appel de smoke-test documenté par APRIL API Store.
 */
async function firstCall() {
  var result = await request("POST", firstCallUrl(), { body: {} });
  return {
    ok: result.ok && (result.data && result.data.status === "success" ? true : result.ok),
    httpStatus: result.status,
    data: result.data,
    raw: result.text,
    url: firstCallUrl(),
  };
}

async function testConnection() {
  var started = Date.now();
  try {
    await fetchAccessToken(true);
    var call = await firstCall();
    return {
      ok: !!call.ok,
      step: call.ok ? "firstCall" : "firstCall_failed",
      durationMs: Date.now() - started,
      tokenOk: true,
      firstCall: call,
      config: configStatus(),
    };
  } catch (e) {
    return {
      ok: false,
      step: e.code === "APRIL_TOKEN_ERROR" ? "oauth_token" : "error",
      durationMs: Date.now() - started,
      tokenOk: false,
      error: e.message || String(e),
      code: e.code || null,
      httpStatus: e.httpStatus || null,
      config: configStatus(),
    };
  }
}

module.exports = {
  DEFAULT_OAUTH_GATEWAY: DEFAULT_OAUTH_GATEWAY,
  DEFAULT_API_GATEWAY: DEFAULT_API_GATEWAY,
  DEFAULT_GATEWAY: DEFAULT_OAUTH_GATEWAY,
  oauthGatewayBase: oauthGatewayBase,
  apiGatewayBase: apiGatewayBase,
  gatewayBase: gatewayBase,
  oauthTokenUrl: oauthTokenUrl,
  firstCallUrl: firstCallUrl,
  isConfigured: isConfigured,
  configStatus: configStatus,
  clearTokenCache: clearTokenCache,
  fetchAccessToken: fetchAccessToken,
  request: request,
  firstCall: firstCall,
  testConnection: testConnection,
};
