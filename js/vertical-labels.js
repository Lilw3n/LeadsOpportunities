/**
 * Libellés produits (verticaux) partagés client (dashboard) et serveur (api/_lib).
 * Une seule source de vérité pour « quel questionnaire va avec quel produit ».
 */
(function (global) {
  var LABELS = {
    vtc: "Assurance VTC",
    taxi: "Assurance taxi",
    sante: "Mutuelle santé",
    "sante-collective": "Santé collective",
    sante_collective: "Santé collective",
    "credit-immo": "Crédit immobilier",
    credit_immo: "Crédit immobilier",
    acheteur_immo: "Acheteur immobilier",
    "acheteur-immo": "Acheteur immobilier",
    animaux: "Assurance animaux",
    "animaux-express": "Assurance animaux",
    chasse: "Assurance chasse",
    equitation: "Assurance équitation",
    auto: "Assurance auto",
    habitation: "Assurance habitation",
    emprunteur: "Assurance emprunteur",
    pno: "Assurance PNO",
    devis: "Devis général",
    rappel: "Rappel",
    callback: "Rappel",
    "default": "Devis général",
  };

  function normalize(v) {
    return String(v == null ? "" : v)
      .trim()
      .toLowerCase();
  }

  function humanize(v) {
    var s = normalize(v).replace(/[_-]+/g, " ").trim();
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /** Libellé lisible d'un vertical (fallback : slug humanisé). */
  function label(v) {
    var key = normalize(v);
    if (!key || key === "—") return "Autre demande";
    return LABELS[key] || humanize(key);
  }

  var api = { LABELS: LABELS, label: label, normalize: normalize, humanize: humanize };

  global.VerticalLabels = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : global);
