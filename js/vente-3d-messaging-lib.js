/**
 * Vente immobilière — les 3D : Divorce, Décès, Déménagement.
 * Utilisable navigateur + Node.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Vente3DMessaging = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var BLOG_SLUG = "vente-immobiliere-3d-divorce-deces-demenagement.html";

  var HEADLINE = "Vendre un bien, c'est souvent une étape de vie difficile — on vous accompagne.";

  var LEAD =
    "Dans l'immobilier, on parle parfois des « 3D » : divorce, décès, déménagement. Ce ne sont pas des cases à cocher — ce sont des moments où la vente devient sensible. Nous en parlons franchement, avec le notaire, l'avocat si besoin, et un suivi humain.";

  var ITEMS = [
    {
      id: "divorce",
      letter: "D",
      title: "Divorce & séparation",
      text: "Partage du bien, crédit en cours, calendrier de vente : on coordonne avec vos conseils (avocat, notaire) pour avancer sans aggraver la situation.",
    },
    {
      id: "deces",
      letter: "D",
      title: "Décès & succession",
      text: "Vente après décès, indivision, héritiers : délais, mandat, estimation — nous respectons le rythme familial et les obligations légales.",
    },
    {
      id: "demenagement",
      letter: "D",
      title: "Déménagement & relogement",
      text: "Vente en chaîne, départ à la retraite, mutation : organiser la vente et le prochain logement sans vous laisser seul face aux démarches.",
    },
  ];

  var REASSURANCE_HEADLINE = "Vous n'êtes pas seul face au notaire, à la banque et aux papiers";

  var REASSURANCE_BODY =
    "Notre rôle : clarifier les étapes, recouper acquéreur et vendeur quand c'est possible, et ne pas vous pousser à vendre dans la précipitation. Chaque situation mérite d'être entendue — pas traitée comme une annonce standard.";

  var TAGLINE = "Si vous traversez l'une de ces étapes, vous êtes au bon endroit.";

  return {
    BLOG_SLUG: BLOG_SLUG,
    HEADLINE: HEADLINE,
    LEAD: LEAD,
    ITEMS: ITEMS,
    REASSURANCE_HEADLINE: REASSURANCE_HEADLINE,
    REASSURANCE_BODY: REASSURANCE_BODY,
    TAGLINE: TAGLINE,
  };
});
