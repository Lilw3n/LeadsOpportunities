/**
 * Cookie HMAC pour le middleware Edge (hors JWT jsonwebtoken).
 * Format: base64url(payloadJson).base64url(hmacSha256)
 */
var crypto = require("crypto");
var { GATE_COOKIE } = require("./site-lock");

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(str) {
  var s = String(str || "").replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

function gateSecret() {
  return (
    process.env.SITE_GATE_SECRET ||
    process.env.JWT_SECRET ||
    process.env.ADMIN_JWT_SECRET ||
    "buchet-site-gate-dev-only"
  );
}

function signGatePayload(payload) {
  var body = b64url(JSON.stringify(payload));
  var sig = crypto.createHmac("sha256", gateSecret()).update(body).digest();
  return body + "." + b64url(sig);
}

function verifyGateToken(token) {
  try {
    var parts = String(token || "").split(".");
    if (parts.length !== 2) return null;
    var body = parts[0];
    var sig = parts[1];
    var expected = crypto.createHmac("sha256", gateSecret()).update(body).digest();
    var got = fromB64url(sig);
    if (got.length !== expected.length || !crypto.timingSafeEqual(got, expected)) return null;
    var payload = JSON.parse(fromB64url(body).toString("utf8"));
    if (!payload || !payload.email || !payload.access) return null;
    if (payload.exp && Date.now() > Number(payload.exp)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function createGateToken(email, access, ttlSeconds) {
  var ttl = ttlSeconds || 60 * 60 * 24 * 7;
  return signGatePayload({
    email: String(email || "")
      .trim()
      .toLowerCase(),
    access: access === "full" ? "full" : "public",
    exp: Date.now() + ttl * 1000,
  });
}

function gateCookieHeader(token, maxAgeSec) {
  var maxAge = maxAgeSec == null ? 60 * 60 * 24 * 7 : maxAgeSec;
  // Ne pas encoder le token (base64url déjà cookie-safe) — évite les écarts Edge/Node
  var parts = [
    GATE_COOKIE + "=" + String(token),
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=" + String(maxAge),
  ];
  return parts.join("; ");
}

function clearGateCookieHeader() {
  return GATE_COOKIE + "=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}

function appendSetCookie(res, cookieStr) {
  var prev = res.getHeader && res.getHeader("Set-Cookie");
  if (!prev) {
    res.setHeader("Set-Cookie", cookieStr);
    return;
  }
  if (Array.isArray(prev)) {
    res.setHeader("Set-Cookie", prev.concat([cookieStr]));
  } else {
    res.setHeader("Set-Cookie", [prev, cookieStr]);
  }
}

module.exports = {
  GATE_COOKIE,
  createGateToken,
  verifyGateToken,
  gateCookieHeader,
  clearGateCookieHeader,
  appendSetCookie,
};
