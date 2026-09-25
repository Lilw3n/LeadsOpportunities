/**
 * Attache le cookie de porte site après login réussi (admin / vérificateur).
 */
var {
  siteAccessForEmail,
  isAllowedLoginEmail,
  isSiteLockEnvForcedOpen,
  isSiteLockMechanismEnabled,
} = require("./site-lock");
var {
  createGateToken,
  gateCookieHeader,
  clearGateCookieHeader,
  appendSetCookie,
} = require("./site-gate-cookie");
var { getSiteLockState } = require("./site-lock-store");
var { isSiteLegalLockEnabled } = require("./verifier-access");

async function isSiteCurrentlyLocked(req) {
  if (isSiteLockEnvForcedOpen()) return false;
  // Mecanisme Buchet (middleware + DB) si hôte / SITE_LOCK=1
  if (isSiteLockMechanismEnabled(req)) {
    try {
      var state = await getSiteLockState();
      return !state.unlocked;
    } catch (e) {
      return true;
    }
  }
  // LO / autres : verrou auth via SITE_LEGAL_LOCK (sans middleware pages)
  return isSiteLegalLockEnabled();
}

function setGateCookieForEmail(res, email) {
  var access = siteAccessForEmail(email);
  if (!access) {
    appendSetCookie(res, clearGateCookieHeader());
    return null;
  }
  var token = createGateToken(email, access);
  appendSetCookie(res, gateCookieHeader(token));
  return access;
}

function clearGateCookie(res) {
  appendSetCookie(res, clearGateCookieHeader());
}

module.exports = {
  isSiteCurrentlyLocked,
  setGateCookieForEmail,
  clearGateCookie,
  isAllowedLoginEmail,
  siteAccessForEmail,
};
