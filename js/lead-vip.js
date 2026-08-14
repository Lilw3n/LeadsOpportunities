/**
 * Détection des proches / VIP dans les leads.
 *
 * Si un lead porte le nom de famille BUCHET, le CRM le signale
 * (« passez-lui le bonjour ») dans la messagerie, le sujet du message
 * et l'email de notification. Les prénoms listés dans SPECIAL_FIRST_NAMES
 * reçoivent une mention spéciale.
 *
 * Liste modifiable ci-dessous. Utilisé côté serveur (api/_lib) ET dashboard.
 */
(function (global) {
  var FAMILY_NAME = "buchet";
  var SPECIAL_FIRST_NAMES = ["osman", "alexandra", "anderson", "sara", "magali"];

  function normalize(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function capitalize(s) {
    var t = String(s || "").trim();
    if (!t) return "";
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  function hasFamilyWord(s) {
    return new RegExp("(^|[^a-z])" + FAMILY_NAME + "($|[^a-z])").test(normalize(s));
  }

  /**
   * Détecte un membre de la famille dans un payload de lead.
   * @returns {null | { firstName: string, special: boolean, greeting: string }}
   */
  function detectFamilyLead(payload) {
    var p = payload || {};
    var lastName = normalize(p.lastName || p.last_name);
    var fullName = String(p.fullName || p.name || "");
    var emailLocal = normalize(String(p.email || "").split("@")[0]);

    var isFamily =
      lastName === FAMILY_NAME ||
      hasFamilyWord(fullName) ||
      new RegExp("(^|[._-])" + FAMILY_NAME + "($|[._-]|\\d)").test(emailLocal);
    if (!isFamily) return null;

    var firstName = String(p.firstName || p.first_name || "").trim();
    if (!firstName && fullName) {
      // Prénom = les mots du nom complet qui ne sont pas le nom de famille
      firstName = fullName
        .split(/\s+/)
        .filter(function (w) {
          return normalize(w) !== FAMILY_NAME && w.trim();
        })
        .join(" ")
        .trim();
    }

    var special = SPECIAL_FIRST_NAMES.indexOf(normalize(firstName)) >= 0;
    var who = firstName ? capitalize(firstName) + " BUCHET" : "un BUCHET";
    var greeting = special
      ? "C'est " + who + " — passez-lui le bonjour de votre part !"
      : "C'est " + who + " — pensez à lui passer le bonjour.";

    return { firstName: capitalize(firstName), special: special, greeting: greeting };
  }

  var api = {
    FAMILY_NAME: FAMILY_NAME,
    SPECIAL_FIRST_NAMES: SPECIAL_FIRST_NAMES,
    detectFamilyLead: detectFamilyLead,
  };

  global.LeadVip = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : global);
