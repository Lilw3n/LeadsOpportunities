/**
 * Accès vérificateurs juridiques / revue site.
 *
 * Vérificateurs publics (accès site public uniquement, MrRollin + code e-mail) :
 *   servicejuridique@immobilier.email
 *   contact@immobilier.email
 *   lilwen.song@gmail.com
 *
 * Admins (= aussi vérificateurs, Google OU MrRollin + code) :
 *   wendy.buchet@gmail.com
 *   wendy.buchet.pro@gmail.com
 *   courtier972@gmail.com
 *
 * Env :
 *   VERIFIER_SHARED_PASSWORD=MrRollin
 *   LEGAL_VERIFIER_EMAILS=...
 *   SITE_LEGAL_LOCK=1  — opt-in uniquement (défaut OFF : site ouvert)
 */
const { parseEmailList, isAdminEmail, getAdminEmails } = require("./admin-emails");
const { safeEqual } = require("./security");

/** Vérificateurs juridiques — accès public seulement. */
var DEFAULT_PUBLIC_VERIFIER_EMAILS = [
  "servicejuridique@immobilier.email",
  "contact@immobilier.email",
  "lilwen.song@gmail.com",
];

function getPublicVerifierEmails() {
  var fromEnv = parseEmailList(process.env.LEGAL_VERIFIER_EMAILS, []);
  // Alias Buchet (historique) — toujours en union avec les défauts
  var fromEnvAlias = parseEmailList(process.env.LEGAL_REVIEWER_EMAILS, []);
  var list = DEFAULT_PUBLIC_VERIFIER_EMAILS.slice();
  fromEnv.concat(fromEnvAlias).forEach(function (e) {
    if (list.indexOf(e) === -1) list.push(e);
  });
  return list;
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
  // Défaut OFF : ne jamais verrouiller l'auth LO sans SITE_LEGAL_LOCK=1 explicite.
  var raw = process.env.SITE_LEGAL_LOCK;
  if (raw == null || String(raw).trim() === "") return false;
  var v = String(raw).trim().toLowerCase();
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
