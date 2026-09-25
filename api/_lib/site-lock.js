/**
 * Verrouillage temporaire du site (conformité / revue juridique) — Buchet.
 *
 * Activé si :
 *   SITE_LOCK=1 / true / on / yes
 *   ou hôte buchetimmobilier.com (défaut) et SITE_LOCK non forcé à 0
 *
 * Désactivé si SITE_LOCK=0 / false / off / no (ex. leadsopportunities.fr).
 *
 * Admins (ADMIN_EMAILS) : accès complet.
 * Vérificateurs publics (verifier-access) : pages publiques uniquement.
 *
 * LEGAL_REVIEWER_EMAILS est un alias de LEGAL_VERIFIER_EMAILS (union).
 */
var { parseEmailList, getAdminEmails, isAdminEmail } = require("./admin-emails");
var {
  getPublicVerifierEmails,
  isPublicVerifierEmail,
  isVerifierEmail,
} = require("./verifier-access");

var GATE_COOKIE = "buchet_site_gate_v2";

function hostLooksLikeBuchet(host) {
  var h = String(host || "")
    .split(":")[0]
    .trim()
    .toLowerCase();
  return h === "buchetimmobilier.com" || h === "www.buchetimmobilier.com" || /\.buchetimmobilier\.com$/.test(h);
}

function getLegalReviewerEmails() {
  var list = getPublicVerifierEmails().slice();
  var fromEnv = parseEmailList(process.env.LEGAL_REVIEWER_EMAILS, []);
  fromEnv.forEach(function (e) {
    if (list.indexOf(e) === -1) list.push(e);
  });
  return list;
}

function isLegalReviewerEmail(email) {
  if (isPublicVerifierEmail(email)) return true;
  var e = String(email || "")
    .trim()
    .toLowerCase();
  if (!e) return false;
  return getLegalReviewerEmails().indexOf(e) !== -1;
}

function isAllowedLoginEmail(email) {
  return isVerifierEmail(email) || isLegalReviewerEmail(email);
}

/** Accès JWT / cookie : full = tout le site, public = pages publiques seulement */
function siteAccessForEmail(email) {
  if (isAdminEmail(email)) return "full";
  if (isLegalReviewerEmail(email)) return "public";
  return null;
}

function isSiteLockEnvForcedOpen() {
  var raw = process.env.SITE_LOCK;
  if (raw == null || String(raw).trim() === "") return false;
  var v = String(raw).trim().toLowerCase();
  return v === "0" || v === "false" || v === "off" || v === "no";
}

function isSiteLockEnvForcedClosed() {
  var raw = process.env.SITE_LOCK;
  if (raw == null || String(raw).trim() === "") return false;
  var v = String(raw).trim().toLowerCase();
  return v === "1" || v === "true" || v === "on" || v === "yes";
}

/** Site-lock middleware / gate actif pour cette requête (ou env). */
function isSiteLockMechanismEnabled(hostOrReq) {
  if (isSiteLockEnvForcedOpen()) return false;
  if (isSiteLockEnvForcedClosed()) return true;
  var host = "";
  if (typeof hostOrReq === "string") {
    host = hostOrReq;
  } else if (hostOrReq && hostOrReq.headers) {
    var h = hostOrReq.headers;
    host = typeof h.get === "function" ? h.get("host") || "" : h.host || "";
  }
  return hostLooksLikeBuchet(host);
}

function adminPathsBlockedForPublic() {
  return [
    "/dashboard.html",
    "/admin.html",
    "/admin-sync-sites.html",
    "/crm.html",
    "/crm-",
    "/api/dashboard",
    "/api/crm",
    "/api/drive",
    "/espace-client.html",
  ];
}

function isAdminOnlyPath(pathname) {
  var p = String(pathname || "").split("?")[0];
  if (!p) return false;
  var blocked = adminPathsBlockedForPublic();
  for (var i = 0; i < blocked.length; i++) {
    var b = blocked[i];
    if (b.endsWith("-")) {
      if (p.indexOf(b) === 0) return true;
    } else if (p === b || p.indexOf(b + "/") === 0) {
      return true;
    }
  }
  if (/^\/crm[a-z0-9_-]*\.html$/i.test(p)) return true;
  return false;
}

function isAlwaysAllowedPath(pathname) {
  var p = String(pathname || "").split("?")[0] || "/";
  if (p === "/site-lock.html" || p === "/auth.html") return true;
  if (p.indexOf("/api/auth/") === 0) return true;
  if (p === "/api/site-lock" || p.indexOf("/api/site-lock") === 0) return true;
  if (p === "/api/health" || p === "/api/google-config-env") return true;
  if (p.indexOf("/api/auth") === 0) return true;
  if (/\.(css|js|mjs|map|png|jpe?g|webp|gif|svg|ico|woff2?|ttf|txt|xml|json)$/i.test(p)) return true;
  if (p.indexOf("/assets/") === 0 || p.indexOf("/css/") === 0 || p.indexOf("/js/") === 0) return true;
  if (p.indexOf("/favicon") === 0) return true;
  return false;
}

module.exports = {
  GATE_COOKIE,
  DEFAULT_LEGAL_REVIEWER_EMAILS: getPublicVerifierEmails(),
  getLegalReviewerEmails,
  isLegalReviewerEmail,
  isAllowedLoginEmail,
  siteAccessForEmail,
  isSiteLockEnvForcedOpen,
  isSiteLockEnvForcedClosed,
  isSiteLockMechanismEnabled,
  hostLooksLikeBuchet,
  isAdminOnlyPath,
  isAlwaysAllowedPath,
  isAdminEmail,
  getAdminEmails,
};
