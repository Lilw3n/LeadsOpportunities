/**
 * Message vendeur : chaque visite compte + lien prêt pour les acquéreurs visiteurs.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.VendeurVisitePretMessaging = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var BUYER_CREDIT_PATH = "/landings/credit-immo.html#demande";
  var BUYER_SEARCH_PATH = "/landings/acheteur-immo.html?mode=client#demande";

  var HEADLINE = "Chaque visite compte — on ne laisse rien au hasard";

  var LEAD =
    "Les personnes qui visitent votre bien ont presque toujours besoin d'un prêt immobilier. Sans financement sérieux, la vente traîne ou échoue. Transmettez-leur le lien ci-dessous pour qu'ils montent leur dossier chez nous — c'est ultra important pour convertir vos visites en offre.";

  var ULTRA_NOTE =
    "Un acquéreur sans prêt avancé = visite « pour rien ». Avec notre lien, on qualifie le budget avant la deuxième visite.";

  var STEPS = [
    {
      title: "Après chaque visite",
      text: "Envoyez le lien par SMS, WhatsApp ou e-mail aux visiteurs intéressés.",
    },
    {
      title: "Dossier prêt en ligne",
      text: "Ils remplissent leur demande sur le site — apport, revenus, projet.",
    },
    {
      title: "On recoupe avec vous",
      text: "Nous savons qui est finançable pour votre bien : rien n'est laissé au hasard.",
    },
  ];

  function buyerCreditUrl(extra) {
    extra = extra || {};
    var origin =
      typeof window !== "undefined" && window.location && window.location.origin
        ? window.location.origin
        : "https://www.leadsopportunities.fr";
    var params = new URLSearchParams();
    params.set("utm_source", "partage_vendeur");
    params.set("utm_medium", "visite");
    params.set("utm_campaign", "pret_visiteur");
    if (extra.city) params.set("ville", extra.city);
    if (extra.postal) params.set("cp", extra.postal);
    if (extra.ref) params.set("ref", extra.ref);
    return origin + "/landings/credit-immo.html?" + params.toString() + "#demande";
  }

  function buyerSearchUrl(extra) {
    extra = extra || {};
    var origin =
      typeof window !== "undefined" && window.location && window.location.origin
        ? window.location.origin
        : "https://www.leadsopportunities.fr";
    var params = new URLSearchParams();
    params.set("mode", "client");
    params.set("utm_source", "partage_vendeur");
    params.set("utm_medium", "visite");
    if (extra.city) params.set("ville", extra.city);
    return origin + "/landings/acheteur-immo.html?" + params.toString() + "#demande";
  }

  return {
    HEADLINE: HEADLINE,
    LEAD: LEAD,
    ULTRA_NOTE: ULTRA_NOTE,
    STEPS: STEPS,
    BUYER_CREDIT_PATH: BUYER_CREDIT_PATH,
    BUYER_SEARCH_PATH: BUYER_SEARCH_PATH,
    buyerCreditUrl: buyerCreditUrl,
    buyerSearchUrl: buyerSearchUrl,
  };
});
