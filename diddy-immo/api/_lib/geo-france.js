/**
 * Détection pays visiteur (Vercel / Cloudflare) et périmètre France + DOM-TOM.
 */
const FRANCE_TERRITORIES = new Set([
  "FR",
  "GP",
  "MQ",
  "GF",
  "RE",
  "YT",
  "PM",
  "WF",
  "PF",
  "NC",
  "BL",
  "MF",
  "TF",
]);

function getVisitorCountry(req) {
  if (!req || !req.headers) return null;
  var h = req.headers;
  var raw =
    h["x-vercel-ip-country"] ||
    h["cf-ipcountry"] ||
    h["x-country-code"] ||
    h["x-appengine-country"] ||
    "";
  var code = String(raw || "")
    .trim()
    .toUpperCase();
  if (!code || code === "XX" || code === "T1") return null;
  return code.slice(0, 2);
}

function isFranceAudience(country) {
  if (!country) return true;
  return FRANCE_TERRITORIES.has(String(country).toUpperCase());
}

function looksLikeFrenchPhone(phone) {
  var p = String(phone || "").replace(/[\s.\-()]/g, "");
  if (!p) return false;
  if (/^(\+33|0033)0?[1-9]\d{8}$/.test(p)) return true;
  if (/^0[1-9]\d{8}$/.test(p)) return true;
  return false;
}

function looksLikeFrenchPostalCode(postal) {
  var pc = String(postal || "").trim();
  return /^[0-9]{5}$/.test(pc);
}

module.exports = {
  FRANCE_TERRITORIES,
  getVisitorCountry,
  isFranceAudience,
  looksLikeFrenchPhone,
  looksLikeFrenchPostalCode,
};
