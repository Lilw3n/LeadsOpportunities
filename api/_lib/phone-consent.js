/**
 * Normalisation consentement appel (serveur) — miroir de js/phone-consent.js.
 */
const PhoneConsent = require("../../js/phone-consent.js");

function applyPhoneConsent(enriched, clientIp) {
  const proof = PhoneConsent.normalizeServer(enriched, {
    serverReceivedAt: enriched.serverReceivedAt,
    clientIp: clientIp || enriched.clientIp,
  });
  Object.assign(enriched, proof);
  // Nettoyage alias legacy (la preuve reste dans phone_consent_*)
  if (enriched.consent != null && proof.phone_consent) {
    enriched.legacy_consent_mapped = true;
  }
  return enriched;
}

module.exports = {
  applyPhoneConsent,
  PhoneConsent,
};
