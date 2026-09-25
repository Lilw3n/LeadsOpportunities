/**
 * Accès vérificateurs juridiques / revue site.
 * Mot de passe partagé indépendant de Google (défaut MrRollin).
 *
 * Env Vercel :
 *   VERIFIER_SHARED_PASSWORD=MrRollin
 *   LEGAL_VERIFIER_EMAILS=wendy.buchet@gmail.com,autre@exemple.fr
 *   SITE_LEGAL_LOCK=1   → bannière « accès restreint » sur auth.html
 */
const { parseEmailList, isAdminEmail } = require("./admin-emails");
const { safeEqual } = require("./security");

var DEFAULT_VERIFIER_EMAILS = ["wendy.buchet@gmail.com"];

function getVerifierEmails() {
  return parseEmailList(process.env.LEGAL_VERIFIER_EMAILS, DEFAULT_VERIFIER_EMAILS);
}

function isVerifierEmail(email) {
  var e = String(email || "")
    .trim()
    .toLowerCase();
  if (!e) return false;
  if (getVerifierEmails().indexOf(e) !== -1) return true;
  // Admins = aussi autorisés pendant la revue (Google ou mdp partagé)
  if (isAdminEmail(e)) return true;
  return false;
}

function getVerifierSharedPassword() {
  return String(
    process.env.VERIFIER_SHARED_PASSWORD ||
      process.env.FORUM_SHARED_PASSWORD ||
      "MrRollin"
  );
}

function isVerifierSharedPassword(password) {
  return safeEqual(String(password || ""), getVerifierSharedPassword());
}

function isSiteLegalLockEnabled() {
  var v = String(process.env.SITE_LEGAL_LOCK || "1")
    .trim()
    .toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

module.exports = {
  DEFAULT_VERIFIER_EMAILS,
  getVerifierEmails,
  isVerifierEmail,
  getVerifierSharedPassword,
  isVerifierSharedPassword,
  isSiteLegalLockEnabled,
};
