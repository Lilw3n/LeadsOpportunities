/**
 * Information sur les risques du crédit — endettement, vie personnelle, accompagnement.
 * Utilisable navigateur + Node.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PretRisksMessaging = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var RISK_HEADLINE = "Emprunter, c'est s'endetter — un engagement sur des années.";

  var RISK_LEAD =
    "Un crédit immobilier engage vos revenus, votre patrimoine et parfois votre couple. En cas de divorce ou de séparation, les mensualités, le bien et le co-emprunt peuvent compliquer la situation. Ce n'est pas pour vous faire peur : c'est pour avancer les yeux ouverts, sans mauvaise surprise.";

  var RISK_POINTS = [
    {
      id: "endettement",
      title: "Endettement durable",
      text: "Taux d'endettement, reste à vivre, épargne de secours — on ne pousse pas à emprunter au maximum.",
    },
    {
      id: "vie_perso",
      title: "Vie personnelle",
      text: "Couple, co-emprunt, séparation : anticiper qui porte quoi si la situation change.",
    },
    {
      id: "protection",
      title: "Assurance & prévoyance",
      text: "Emprunteur, décès, invalidité : protéger le foyer, pas seulement « obtenir le prêt ».",
    },
  ];

  var REASSURANCE_HEADLINE = "Notre rôle : vous aider à atteindre votre objectif sans vous mettre en danger";

  var REASSURANCE_BODY =
    "On recalcule la capacité réelle, on parle des scénarios difficiles sans tabou, et on structure le dossier (apport, durée, assurance) pour que le projet tienne dans la durée — pas seulement pour qu'il passe en banque aujourd'hui.";

  var RISK_TAGLINE = "Un prêt réussi, c'est un prêt que vous pouvez assumer demain — même si la vie change.";

  return {
    RISK_HEADLINE: RISK_HEADLINE,
    RISK_LEAD: RISK_LEAD,
    RISK_POINTS: RISK_POINTS,
    REASSURANCE_HEADLINE: REASSURANCE_HEADLINE,
    REASSURANCE_BODY: REASSURANCE_BODY,
    RISK_TAGLINE: RISK_TAGLINE,
  };
});
