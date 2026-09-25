/**
 * Conseil achat durable — bonne décision, besoin réel, pérennité.
 * Utilisable navigateur + Node.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.AchatPerenniteMessaging = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var HEADLINE = "Acheter une maison, c'est prendre la bonne décision — pas seulement le bien qu'on veut.";

  var LEAD =
    "Vous avez un coup de cœur ? C'est normal. Notre rôle n'est pas de vous pousser vers ce bien à tout prix : c'est de vérifier qu'il correspond à votre besoin réel, à vos capacités d'achat et à votre vie dans dix ou vingt ans. Parfois, un autre bien conviendrait mieux — et on vous le dit franchement.";

  var PILLARS = [
    {
      id: "besoin",
      title: "Besoin réel",
      text: "Surface, quartier, énergie, famille : on recoupe le bien avec votre projet de vie, pas seulement votre envie du moment.",
    },
    {
      id: "capacite",
      title: "Capacités d'achat",
      text: "Prêt, apport, reste à vivre : on refuse de vous orienter vers un bien qui vous mettrait au bord du gouffre chaque mois.",
    },
    {
      id: "travaux",
      title: "Travaux & gestion",
      text: "Passoire thermique, gros chantier, charges lourdes : un bien trop difficile à gérer peut vous pénaliser toute une vie.",
    },
    {
      id: "perennite",
      title: "Pérennité",
      text: "La durabilité du choix compte autant que l'achat : revente, situation personnelle, charges — on conseille pour votre avenir.",
    },
  ];

  var REASSURANCE_HEADLINE = "On conseille pour votre vie future, pas pour la vente";

  var REASSURANCE_BODY =
    "Si un autre bien répond mieux à votre besoin et à votre budget — moins de travaux, mensualité tenable, charges maîtrisées — nous vous le proposons. L'objectif n'est pas de conclure vite : c'est que vous viviez bien dans ce logement, longtemps.";

  var TAGLINE = "Un bon achat, c'est un achat que vous assumez encore dans vingt ans.";

  return {
    HEADLINE: HEADLINE,
    LEAD: LEAD,
    PILLARS: PILLARS,
    REASSURANCE_HEADLINE: REASSURANCE_HEADLINE,
    REASSURANCE_BODY: REASSURANCE_BODY,
    TAGLINE: TAGLINE,
  };
});
