/**
 * Accès vérificateurs juridiques / revue site.
 * Mot de passe partagé indépendant de Google (défaut MrRollin).
 * Les 3 e-mails de vérification + admins.
 *
 * Env Vercel :
 *   VERIFIER_SHARED_PASSWORD=MrRollin
 *   LEGAL_VERIFIER_EMAILS=a@x,b@y,c@z
 *   SITE_LEGAL_LOCK=1
 */
const { parseEmailList, isAdminEmail, getAdminEmails } = require("./admin-emails");
const { safeEqual } = require("./security");

/** Les 3 adresses de vérification juridique (défaut). */
var DEFAULT_VERIFIER_EMAILS = [
  "wendy.buchet@gmail.com",
  "wendy.buchet.pro@gmail.com",
  "courtier972@gmail.com",
];

function getVerifierEmails() {
  var fromEnv = parseEmailList(process.env.LEGAL_VERIFIER_EMAILS, []);
  if (fromEnv.length) return fromEnv;
  // Union défauts + admins (sans doublon)
  var list = DEFAULT_VERIFIER_EMAILS.slice();
  getAdminEmails().forEach(function (e) {
    if (list.indexOf(e) === -1) list.push(e);
  });
  return list;
}

function isVerifierEmail(email) {
  var e = String(email || "")
    .trim()
    .toLowerCase();
  if (!e) return false;
  if (getVerifierEmails().indexOf(e) !== -1) return true;
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
