/**
 * Vente immobilière — les 3D et situations complexes (héritage, viager, SCI, pro…).
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
    "Dans l'immobilier, on parle des « 3D » : divorce, décès, déménagement. Derrière, il y a souvent plus : héritiers qui ne s'accordent pas, ex-conjoints en désaccord, viager, SCI familiale, locaux professionnels… Nous en parlons franchement, avec le notaire, l'avocat si besoin, et un suivi humain.";

  var ITEMS = [
    {
      id: "divorce",
      letter: "D",
      title: "Divorce & séparation",
      text: "Partage du bien, crédit en cours, désaccord sur le prix ou le calendrier : on coordonne avec vos conseils (avocat, notaire) pour avancer sans aggraver la situation.",
    },
    {
      id: "deces",
      letter: "D",
      title: "Décès & succession",
      text: "Héritage, indivision, nombreux bénéficiaires qui ne tombent pas d'accord sur l'estimation : délais, mandat, médiation — nous respectons le rythme familial et le cadre légal.",
    },
    {
      id: "demenagement",
      letter: "D",
      title: "Déménagement & relogement",
      text: "Vente en chaîne, départ à la retraite, mutation : organiser la vente et le prochain logement sans vous laisser seul face aux démarches.",
    },
  ];

  var COMPLEX_HEADLINE = "Et aussi : viager, SCI, locaux pro, entreprise…";

  var COMPLEX_LEAD =
    "Chaque dossier a sa logique. Voici des situations que nous croisons souvent — avec la même exigence : comprendre avant de vendre.";

  var COMPLEX_CASES = [
    {
      id: "heritiers",
      label: "Héritage & nombreux bénéficiaires",
      text: "Plusieurs héritiers, avis divergents sur le prix ou le moment de vendre : estimation neutre, calendrier partagé, recoupement acquéreur — sans forcer un accord artificiel.",
    },
    {
      id: "divorce_conflit",
      label: "Divorce sans accord",
      text: "Ex-conjoints qui ne veulent pas vendre au même prix, qui habitent encore le bien ou contestent le mandat : on avance dans le respect du cadre juridique, pas dans la précipitation.",
    },
    {
      id: "viager",
      label: "Vente en viager",
      text: "Occupé ou libre, bouquet et rente : montage sensible pour vendeur comme acquéreur. On clarifie les options avec le notaire avant de s'engager.",
    },
    {
      id: "sci",
      label: "SCI & transmission",
      text: "SCI familiale montée pour la succession, parts à céder, associés multiples : vente du bien ou des parts — chaque structure mérite une lecture attentive.",
    },
    {
      id: "pro",
      label: "Locaux pro & entreprise",
      text: "Boutique, bureau, entrepôt, fonds de commerce lié aux murs : autre logique que l'habitation. Estimation, bail, clientèle — on recoupe avec votre expert-comptable ou avocat si besoin.",
    },
  ];

  var REASSURANCE_HEADLINE = "Vous n'êtes pas seul face au notaire, à la banque et aux papiers";

  var REASSURANCE_BODY =
    "Notre rôle : clarifier les étapes, proposer une estimation argumentée quand les avis divergent, recouper acquéreur et vendeur quand c'est possible, et ne pas vous pousser à vendre dans la précipitation. Chaque situation mérite d'être entendue — pas traitée comme une annonce standard.";

  var TAGLINE = "Héritage compliqué, divorce tendu, viager ou local pro : si c'est votre cas, vous êtes au bon endroit.";

  return {
    BLOG_SLUG: BLOG_SLUG,
    HEADLINE: HEADLINE,
    LEAD: LEAD,
    ITEMS: ITEMS,
    COMPLEX_HEADLINE: COMPLEX_HEADLINE,
    COMPLEX_LEAD: COMPLEX_LEAD,
    COMPLEX_CASES: COMPLEX_CASES,
    REASSURANCE_HEADLINE: REASSURANCE_HEADLINE,
    REASSURANCE_BODY: REASSURANCE_BODY,
    TAGLINE: TAGLINE,
  };
});
