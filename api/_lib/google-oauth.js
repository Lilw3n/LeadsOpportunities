const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { requireJwtSecret } = require("./security");

function getAppUrl() {
  var raw =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.leadsopportunities.fr";
  return String(raw)
    .trim()
    .replace(/[\r\n\t]/g, "")
    .replace(/\/$/, "");
}

function getRedirectUri() {
  return getAppUrl() + "/api/auth/google-callback";
}

function isGoogleConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function signOAuthState(opts) {
  const o = typeof opts === "string" ? { returnTo: opts } : opts || {};
  return jwt.sign(
    {
      purpose: o.purpose || "google_oauth",
      userId: o.userId || "",
      n: crypto.randomBytes(16).toString("hex"),
      returnTo: o.returnTo || "",
    },
    requireJwtSecret(),
    { expiresIn: "15m", algorithm: "HS256" }
  );
}

function verifyOAuthState(state) {
  const decoded = jwt.verify(state, requireJwtSecret(), { algorithms: ["HS256"] });
  if (!decoded || (decoded.purpose !== "google_oauth" && decoded.purpose !== "google_calendar")) {
    throw new Error("Invalid oauth state");
  }
  return decoded;
}

const SCOPES_LOGIN = "openid email profile";
const SCOPES_CALENDAR = SCOPES_LOGIN + " https://www.googleapis.com/auth/calendar.events";

function buildGoogleAuthUrl(state, options) {
  const opts = options || {};
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: opts.calendar ? SCOPES_CALENDAR : SCOPES_LOGIN,
    access_type: opts.calendar ? "offline" : "online",
    prompt: opts.calendar ? "consent" : "select_account",
    state: state,
  });
  if (opts.loginHint) params.set("login_hint", opts.loginHint);
  return "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
}

function buildGoogleCalendarAuthUrl(state, loginHint) {
  return buildGoogleAuthUrl(state, { calendar: true, loginHint: loginHint });
}

async function exchangeCodeForTokens(code) {
  const body = new URLSearchParams({
    code: code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: getRedirectUri(),
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Token exchange failed");
  }
  return data;
}

async function refreshGoogleAccessToken(refreshToken) {
  const body = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Refresh token failed");
  }
  return data;
}

async function fetchGoogleProfile(accessToken) {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: "Bearer " + accessToken },
  });
  const data = await res.json();
  if (!res.ok || !data.email) {
    throw new Error("Profil Google indisponible");
  }
  return data;
}

module.exports = {
  getAppUrl,
  getRedirectUri,
  isGoogleConfigured,
  signOAuthState,
  verifyOAuthState,
  buildGoogleAuthUrl,
  buildGoogleCalendarAuthUrl,
  exchangeCodeForTokens,
  refreshGoogleAccessToken,
  fetchGoogleProfile,
  SCOPES_CALENDAR,
};
