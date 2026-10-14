/**
 * Liste des e-mails administrateurs site (plusieurs comptes sur le même CRM).
 * Inclut par défaut le compte Google / Matterport Wendy + le compte historique.
 *
 * Surcharge Vercel / .env :
 *   ADMIN_EMAILS=courtier972@gmail.com,wendy.buchet.pro@gmail.com
 *   MATTERPORT_ADMIN_EMAILS=wendy.buchet.pro@gmail.com
 */

var DEFAULT_ADMIN_EMAILS = ["courtier972@gmail.com", "wendy.buchet.pro@gmail.com"];
var DEFAULT_MATTERPORT_ADMIN_EMAILS = ["wendy.buchet.pro@gmail.com"];

function parseEmailList(raw, fallback) {
  var source = raw != null && String(raw).trim() ? String(raw) : "";
  var list = (source || (fallback || []).join(","))
    .split(/[,;\s]+/)
    .map(function (e) {
      return String(e || "")
        .trim()
        .toLowerCase();
    })
    .filter(function (e) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    });
  var out = [];
  list.forEach(function (e) {
    if (out.indexOf(e) === -1) out.push(e);
  });
  return out;
}

function getAdminEmails() {
  return parseEmailList(process.env.ADMIN_EMAILS, DEFAULT_ADMIN_EMAILS);
}

function isAdminEmail(email) {
  var e = String(email || "")
    .trim()
    .toLowerCase();
  if (!e) return false;
  return getAdminEmails().indexOf(e) !== -1;
}

function getMatterportAdminEmails() {
  var fromEnv = parseEmailList(process.env.MATTERPORT_ADMIN_EMAILS, []);
  if (fromEnv.length) return fromEnv;
  return parseEmailList("", DEFAULT_MATTERPORT_ADMIN_EMAILS);
}

function primaryMatterportAdminEmail() {
  return getMatterportAdminEmails()[0] || "wendy.buchet.pro@gmail.com";
}

module.exports = {
  DEFAULT_ADMIN_EMAILS,
  DEFAULT_MATTERPORT_ADMIN_EMAILS,
  parseEmailList,
  getAdminEmails,
  isAdminEmail,
  getMatterportAdminEmails,
  primaryMatterportAdminEmail,
};
