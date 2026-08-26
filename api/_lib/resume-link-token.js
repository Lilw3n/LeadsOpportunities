/**
 * Jeton de reprise questionnaire (CRM → landing).
 * L’URL ne contient pas d’e-mail / téléphone : seulement `rt`.
 */
const jwt = require("jsonwebtoken");
const { requireJwtSecret } = require("./security");

var TYP = "immo_resume";
var TTL = { conseiller: "12h", client: "7d" };

function getAppUrl() {
  var raw = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  return String(raw || "").trim().replace(/\/$/, "");
}

function normalizeVertical(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
}

function resumeLandingFromVertical(vertical, hatOverride) {
  var v = normalizeVertical(vertical);
  var hat = String(hatOverride || "").trim().toLowerCase();
  if (hat === "seller") hat = "vendeur";
  if (hat === "both") hat = "les_deux";
  if (hat === "chasseur") hat = "signalement";

  if (hat === "vendeur" || hat === "les_deux" || hat === "acheteur" || hat === "signalement") {
    var hashKnown =
      hat === "acheteur" ? "#recherche" : "#deposer-bien";
    return { path: "/landings/acheteur-immo.html", hat: hat, hash: hashKnown, need: "" };
  }

  if (v.indexOf("vendeur") >= 0 && v.indexOf("acheteur") >= 0) {
    return { path: "/landings/acheteur-immo.html", hat: "les_deux", hash: "#deposer-bien", need: "" };
  }
  if ((v.indexOf("vendeur") >= 0 && v.indexOf("immo") >= 0) || v === "vendeur-immo") {
    return { path: "/landings/acheteur-immo.html", hat: "vendeur", hash: "#deposer-bien", need: "" };
  }
  if (v.indexOf("acheteur") >= 0 || v.indexOf("recherche") >= 0) {
    return { path: "/landings/acheteur-immo.html", hat: "acheteur", hash: "#recherche", need: "" };
  }
  var need = v.replace(/^-+|-+$/g, "") || "questionnaire";
  return { path: "/landings/questionnaire.html", hat: "", hash: "", need: need };
}

function signResumeToken(opts) {
  opts = opts || {};
  var leadId = String(opts.leadId || "").trim();
  if (!leadId) throw new Error("leadId requis");
  var purpose = opts.purpose === "client" ? "client" : "conseiller";
  var payload = {
    typ: TYP,
    purpose: purpose,
    leadId: leadId,
  };
  if (opts.contactId) payload.contactId = String(opts.contactId);
  if (opts.hat) payload.hat = String(opts.hat);
  return jwt.sign(payload, requireJwtSecret(), {
    expiresIn: TTL[purpose] || TTL.conseiller,
    algorithm: "HS256",
    issuer: "leads-opportunities",
  });
}

function verifyResumeToken(token) {
  if (!token) return null;
  try {
    var decoded = jwt.verify(String(token), requireJwtSecret(), {
      algorithms: ["HS256"],
      issuer: "leads-opportunities",
    });
    if (!decoded || decoded.typ !== TYP || !decoded.leadId) return null;
    if (decoded.purpose !== "conseiller" && decoded.purpose !== "client") return null;
    return decoded;
  } catch (e) {
    return null;
  }
}

function tokenExpiresAt(token) {
  try {
    var decoded = jwt.decode(String(token));
    if (!decoded || !decoded.exp) return null;
    return new Date(decoded.exp * 1000).toISOString();
  } catch (e) {
    return null;
  }
}

function buildPublicResumeUrl(token, opts) {
  opts = opts || {};
  var landing = resumeLandingFromVertical(opts.vertical, opts.hat);
  var params = new URLSearchParams();
  params.set("rt", token);
  params.set("source", "crm_resume");
  params.set("reprise", "1");
  var purpose = opts.purpose === "client" ? "client" : "conseiller";
  if (purpose === "conseiller") params.set("mode", "conseiller");
  if (landing.hat) params.set("hat", landing.hat);
  if (landing.need) params.set("need", landing.need);
  var q = params.toString();
  var path = landing.path + "?" + q + (landing.hash || "");
  var origin = getAppUrl();
  return origin ? origin + path : path;
}

module.exports = {
  TYP: TYP,
  TTL: TTL,
  getAppUrl: getAppUrl,
  resumeLandingFromVertical: resumeLandingFromVertical,
  signResumeToken: signResumeToken,
  verifyResumeToken: verifyResumeToken,
  tokenExpiresAt: tokenExpiresAt,
  buildPublicResumeUrl: buildPublicResumeUrl,
};
