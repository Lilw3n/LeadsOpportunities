/**
 * Accès vérificateurs juridiques / revue site.
 *
 * Vérificateurs publics (accès site public uniquement, MrRollin + code e-mail) :
 *   servicejuridique@immobilier.email
 *   contact@immobilier.email
 *
 * Admins (= aussi vérificateurs, Google OU MrRollin + code) :
 *   wendy.buchet@gmail.com
 *   wendy.buchet.pro@gmail.com
 *   courtier972@gmail.com
 *
 * Env :
 *   VERIFIER_SHARED_PASSWORD=MrRollin
 *   LEGAL_VERIFIER_EMAILS=...
 *   SITE_LEGAL_LOCK=1
 */
const { parseEmailList, isAdminEmail, getAdminEmails } = require("./admin-emails");
const { safeEqual } = require("./security");

/** Vérificateurs juridiques — accès public seulement. */
var DEFAULT_PUBLIC_VERIFIER_EMAILS = [
  "servicejuridique@immobilier.email",
  "contact@immobilier.email",
];

function getPublicVerifierEmails() {
  var fromEnv = parseEmailList(process.env.LEGAL_VERIFIER_EMAILS, []);
  if (fromEnv.length) return fromEnv;
  return DEFAULT_PUBLIC_VERIFIER_EMAILS.slice();
}

function isPublicVerifierEmail(email) {
  var e = String(email || "")
    .trim()
    .toLowerCase();
  if (!e) return false;
  return getPublicVerifierEmails().indexOf(e) !== -1;
}

/** Tous les e-mails autorisés pendant la revue (publics + admins). */
function getVerifierEmails() {
  var list = getPublicVerifierEmails().slice();
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
  if (isPublicVerifierEmail(e)) return true;
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
  DEFAULT_PUBLIC_VERIFIER_EMAILS,
  DEFAULT_VERIFIER_EMAILS: DEFAULT_PUBLIC_VERIFIER_EMAILS,
  getPublicVerifierEmails,
  isPublicVerifierEmail,
  getVerifierEmails,
  isVerifierEmail,
  getVerifierSharedPassword,
  isVerifierSharedPassword,
  isSiteLegalLockEnabled,
};
