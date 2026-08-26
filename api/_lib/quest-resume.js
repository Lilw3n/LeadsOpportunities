/**
 * Liens personnalisés de reprise questionnaire + e-mails vendeur / client.
 */
const jwt = require("jsonwebtoken");
const { requireJwtSecret } = require("./security");
const { getAppUrl, sendClientEmail } = require("./external-client-auth");

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normPhone(v) {
  var d = String(v || "").replace(/\D/g, "");
  if (d.length === 11 && d.indexOf("33") === 0) d = "0" + d.slice(2);
  if (d.length === 12 && d.indexOf("33") === 0) d = "0" + d.slice(2);
  return d.slice(-10);
}

function emailsMatch(a, b) {
  var x = String(a || "").trim().toLowerCase();
  var y = String(b || "").trim().toLowerCase();
  return !!(x && y && x === y);
}

function phonesMatch(a, b) {
  var x = normPhone(a);
  var y = normPhone(b);
  return x.length >= 10 && x === y;
}

function identityOnFile(lead) {
  lead = lead || {};
  var email = String(lead.email || "").trim();
  var phone = String(lead.phone || "").trim();
  return !!(email || (normPhone(phone).length >= 10));
}

/**
 * Si le dossier a un e-mail ou un tél, le visiteur doit coller la même valeur.
 * Sans identité en fiche (dossier provisoire) : le jeton JWT suffit.
 */
function identityMatches(lead, provided) {
  provided = provided || {};
  if (!identityOnFile(lead)) return true;
  var emailOk = emailsMatch(provided.email, lead.email);
  var phoneOk = phonesMatch(provided.phone, lead.phone);
  return !!(emailOk || phoneOk);
}

function signResumeToken(opts) {
  opts = opts || {};
  return jwt.sign(
    {
      purpose: "quest_resume",
      leadId: opts.leadId || null,
      contactId: opts.contactId || null,
      vertical: opts.vertical || "",
    },
    requireJwtSecret(),
    { expiresIn: "14d", algorithm: "HS256", issuer: "leads-opportunities" }
  );
}

function verifyResumeToken(token) {
  try {
    var decoded = jwt.verify(String(token || ""), requireJwtSecret(), {
      algorithms: ["HS256"],
      issuer: "leads-opportunities",
    });
    if (!decoded || decoded.purpose !== "quest_resume" || !decoded.leadId) return null;
    return decoded;
  } catch (e) {
    return null;
  }
}

function normalizeVertical(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
}

function resumePathFor(opts) {
  opts = opts || {};
  var token = opts.token || "";
  var vertical = normalizeVertical(opts.vertical);
  var q = "qr=" + encodeURIComponent(token);
  if (vertical.indexOf("vendeur") >= 0 && vertical.indexOf("acheteur") >= 0) {
    return "/landings/acheteur-immo.html?hat=les_deux&" + q + "#deposer-bien";
  }
  if (vertical.indexOf("vendeur") >= 0 && vertical.indexOf("immo") >= 0) {
    return "/landings/acheteur-immo.html?hat=vendeur&" + q + "#deposer-bien";
  }
  if (vertical.indexOf("acheteur") >= 0 || vertical.indexOf("chasseur") >= 0) {
    return "/landings/acheteur-immo.html?hat=acheteur&" + q + "#recherche";
  }
  var landingByNeed = {
    vtc: "/landings/vtc.html",
    sante: "/landings/sante.html",
    "sante-collective": "/landings/sante-collective.html",
    collective: "/landings/sante-collective.html",
    "credit-immo": "/landings/credit-immo.html",
    pret: "/landings/credit-immo.html",
    auto: "/landings/devis.html",
    habitation: "/landings/devis.html",
  };
  var page = landingByNeed[vertical];
  if (page) return page + "?" + q;
  var need = (vertical || "questionnaire").replace(/^-+|-+$/g, "") || "questionnaire";
  return "/landings/questionnaire.html?need=" + encodeURIComponent(need) + "&" + q;
}

function publicResumeUrl(opts) {
  return getAppUrl() + resumePathFor(opts);
}

function wrapEmail(title, inner) {
  return (
    '<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;line-height:1.55;color:#334155">' +
    '<h2 style="color:#0f766e">' +
    escapeHtml(title) +
    "</h2>" +
    inner +
    '<p style="font-size:0.82rem;color:#94a3b8">Leads Opportunities — courtage & immobilier. Si vous n\'êtes pas à l\'origine de ce message, ignorez-le.</p>' +
    "</div>"
  );
}

async function sendQuestionnaireResumeEmail(opts) {
  opts = opts || {};
  var to = opts.email;
  if (!to) return { ok: false, reason: "no_email" };
  var url = opts.url || publicResumeUrl(opts);
  var name = opts.firstName || "Bonjour";
  var html = wrapEmail(
    "Reprenez votre questionnaire",
    "<p>" +
      escapeHtml(name) +
      ",</p>" +
      "<p>Votre conseiller vous a envoyé un <strong>lien personnel</strong> pour continuer votre dossier. Pour éviter toute confusion, le formulaire vous demandera de confirmer <strong>votre e-mail ou votre téléphone</strong>.</p>" +
      '<p><a href="' +
      escapeHtml(url) +
      '" style="display:inline-block;background:#0d9488;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">Ouvrir mon questionnaire</a></p>' +
      '<p style="font-size:0.9rem;color:#64748b">Lien valable 14 jours. Ne le transmettez pas à un tiers.</p>'
  );
  return sendClientEmail({
    to: to,
    subject: "Votre lien pour continuer le questionnaire — Leads Opportunities",
    html: html,
  });
}

async function sendMandateRequestNotice(opts) {
  opts = opts || {};
  var to = opts.email;
  if (!to) return { ok: false, reason: "no_email" };
  var url = opts.url || (opts.token ? publicResumeUrl(opts) : getAppUrl() + "/landings/acheteur-immo.html?hat=vendeur#deposer-bien");
  var name = opts.firstName || "Bonjour";
  var pref = opts.preference === "simple" ? "mandat simple" : opts.preference === "indifferent" ? "à discuter" : "mandat exclusif";
  var html = wrapEmail(
    "Votre demande de mandat de vente",
    "<p>" +
      escapeHtml(name) +
      ",</p>" +
      "<p>Nous avons bien reçu votre <strong>demande de mandat de vente</strong> (" +
      escapeHtml(pref) +
      "). Votre conseiller va analyser le bien et les pièces jointes, puis vous proposer le mandat officiel.</p>" +
      "<p>Les reconnaissances (formulaire de rétractation, informations précontractuelles, début des prestations) sont enregistrées avec votre dossier.</p>" +
      '<p><a href="' +
      escapeHtml(url) +
      '" style="display:inline-block;background:#0d9488;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700">Reprendre mon dossier</a></p>' +
      '<p style="font-size:0.9rem;color:#64748b">Pour ouvrir le lien, confirmez l\'e-mail ou le téléphone utilisé lors du dépôt.</p>'
  );
  return sendClientEmail({
    to: to,
    subject: "Demande de mandat de vente — Leads Opportunities",
    html: html,
  });
}

module.exports = {
  normPhone,
  emailsMatch,
  phonesMatch,
  identityOnFile,
  identityMatches,
  signResumeToken,
  verifyResumeToken,
  resumePathFor,
  publicResumeUrl,
  sendQuestionnaireResumeEmail,
  sendMandateRequestNotice,
};
