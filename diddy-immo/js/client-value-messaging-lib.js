/**
 * Positionnement valeur client — honoraires justifiés, travail centralisé sur le besoin.
 * Utilisable navigateur + Node.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ClientValueMessaging = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var VALUE_HEADLINE =
    "Ce n'est pas un simple conseil : tout mon travail est centralisé sur votre besoin.";

  var VALUE_LEAD =
    "Mise en relation acquéreur et vendeur, recherche du meilleur prix, déblocage du financement quand la banque freine — j'enquête, je relie, je négocie et je suis le dossier jusqu'au bout. Ça demande du temps et de la méthode. Ça a un prix. Mon prix.";

  var VALUE_PILLARS = [
    {
      id: "liaison",
      title: "Liaison réelle",
      text: "Acquéreur ↔ vendeur : veille terrain, signalements, visites, calendrier — pas un simple envoi de lien.",
    },
    {
      id: "prix",
      title: "Prix & financement",
      text: "Négocier le bien, structurer le prêt, débloquer le budget dont vous aviez besoin — pas seulement « conseiller ».",
    },
    {
      id: "centralise",
      title: "Un seul fil conducteur",
      text: "Bien, crédit, assurance emprunteur : un interlocuteur qui optimise l'ensemble autour de votre objectif.",
    },
  ];

  var HONORAIRES_HEADLINE = "Pourquoi parle-t-on parfois d'honoraires élevés ?";

  var HONORAIRES_BODY =
    "Parce que certains voient une commission sans voir le travail derrière : enquête, relances, banques, notaire, vendeurs, acquéreurs. Je ne vends pas un formulaire — je mène le dossier. Les honoraires immo et finance sont annoncés et expliqués avant de démarrer. Assurances : devis gratuit (rémunération par l'assureur si vous souscrivez).";

  var HONORAIRES_TAGLINE = "Mon travail a un prix — transparent, justifié, centré sur vous.";

  return {
    VALUE_HEADLINE: VALUE_HEADLINE,
    VALUE_LEAD: VALUE_LEAD,
    VALUE_PILLARS: VALUE_PILLARS,
    HONORAIRES_HEADLINE: HONORAIRES_HEADLINE,
    HONORAIRES_BODY: HONORAIRES_BODY,
    HONORAIRES_TAGLINE: HONORAIRES_TAGLINE,
  };
});
