/**
 * Challenge de connexion par code e-mail — sans Neon.
 * Token HMAC (base64url) : email + hash(code) + profil + expiry.
 */
const crypto = require("crypto");
const { requireJwtSecret, safeEqual } = require("./security");
const { generateResetCode } = require("./auth");

var TTL_MS = 15 * 60 * 1000;

function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromB64url(str) {
  var s = String(str || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

function codeHash(email, code) {
  return crypto
    .createHmac("sha256", requireJwtSecret())
    .update("login-code:" + String(email || "").toLowerCase() + ":" + String(code || ""))
    .digest("hex");
}

function signPayload(payload) {
  var body = b64url(JSON.stringify(payload));
  var sig = b64url(
    crypto.createHmac("sha256", requireJwtSecret()).update("login-challenge:" + body).digest()
  );
  return body + "." + sig;
}

function verifySigned(token) {
  var parts = String(token || "").split(".");
  if (parts.length !== 2) return null;
  var body = parts[0];
  var sig = parts[1];
  var expected = b64url(
    crypto.createHmac("sha256", requireJwtSecret()).update("login-challenge:" + body).digest()
  );
  if (!safeEqual(sig, expected)) return null;
  try {
    var payload = JSON.parse(fromB64url(body).toString("utf8"));
    if (!payload || !payload.email || !payload.ch || !payload.exp) return null;
    if (Date.now() > Number(payload.exp)) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

/** Profil minimal porté dans le challenge (session sans DB). */
function buildProfile(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role || "user",
    crm_role: user.crm_role || user.crmRole || null,
    full_name: user.full_name || user.fullName || null,
    phone: user.phone || null,
    status: user.status || "active",
    offline: !!user.offline,
  };
}

function createLoginChallenge(user) {
  var code = generateResetCode();
  var email = String(user.email || "")
    .trim()
    .toLowerCase();
  var profile = buildProfile(Object.assign({}, user, { email: email }));
  var payload = {
    v: 1,
    email: email,
    ch: codeHash(email, code),
    exp: Date.now() + TTL_MS,
    profile: profile,
  };
  return {
    code: code,
    challengeToken: signPayload(payload),
    email: email,
    expiresAt: new Date(payload.exp).toISOString(),
  };
}

function verifyLoginChallenge(challengeToken, email, code) {
  var payload = verifySigned(challengeToken);
  if (!payload) return { ok: false, error: "Session de code expirée — recommencez" };
  var e = String(email || "")
    .trim()
    .toLowerCase();
  if (payload.email !== e) return { ok: false, error: "E-mail ne correspond pas au code" };
  var expect = codeHash(e, String(code || "").trim());
  if (!safeEqual(payload.ch, expect)) return { ok: false, error: "Code invalide ou expiré" };
  return { ok: true, profile: payload.profile || { email: e, role: "user", id: null } };
}

/** Renouveler le code en gardant le même profil (resend). */
function refreshLoginChallenge(challengeToken, email) {
  var payload = verifySigned(challengeToken);
  if (!payload) return null;
  var e = String(email || "")
    .trim()
    .toLowerCase();
  if (payload.email !== e) return null;
  return createLoginChallenge(payload.profile || { email: e, role: "user", id: payload.profile && payload.profile.id });
}

function offlineUserId(email) {
  var h = crypto
    .createHash("sha256")
    .update("lo-offline-user:" + String(email || "").toLowerCase())
    .digest("hex");
  return (
    h.slice(0, 8) +
    "-" +
    h.slice(8, 12) +
    "-4" +
    h.slice(13, 16) +
    "-" +
    ((parseInt(h.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) +
    h.slice(18, 20) +
    "-" +
    h.slice(20, 32)
  );
}

module.exports = {
  createLoginChallenge,
  verifyLoginChallenge,
  refreshLoginChallenge,
  offlineUserId,
  TTL_MS,
};
