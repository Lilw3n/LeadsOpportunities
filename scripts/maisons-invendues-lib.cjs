/**
 * Contextes « maison qui ne se vend pas » + matching acquéreurs finançables.
 * Utilisé par seo-immo-content-lib et pages hub.
 */
var UNSOLD_CONTEXTS = [
  {
    id: "prix",
    title: "Prix trop élevé vs marché",
    symptom: "Peu ou pas de visites, retours « trop cher »",
    fix: "Repositionner sur les ventes DVF récentes, négocier ou ajuster le mandat",
  },
  {
    id: "mandat",
    title: "Mandat chez un négociateur sans résultat",
    symptom: "En ligne depuis des mois, même agence, aucune offre",
    fix: "Revoir stratégie (prix, photos, diffusion) + activer des acquéreurs pré-qualifiés prêt",
  },
  {
    id: "dpe",
    title: "DPE dégradé / passoire thermique",
    symptom: "Acquéreurs fuient ou banques conditionnent le prêt",
    fix: "Chiffrer travaux, aide rénovation, ou ajuster le prix en conséquence",
  },
  {
    id: "travaux",
    title: "Travaux lourds non valorisés",
    symptom: "Visites mais pas d'offre — « trop de boulot »",
    fix: "Devis travaux + prix net vendeur réaliste",
  },
  {
    id: "financement",
    title: "Pas assez d'acquéreurs finançables",
    symptom: "Visites de curieux sans apport ni prêt validé",
    fix: "Cibler des acquéreurs avec enveloppe prêt / simulation validée (notre rôle courtier)",
  },
  {
    id: "annonce",
    title: "Annonce / photos insuffisantes",
    symptom: "Peu de clics sur les portails",
    fix: "Refonte visuelle, texte orienté bénéfices, prix cohérent",
  },
  {
    id: "localisation",
    title: "Secteur peu liquide",
    symptom: "Demande faible hors grandes villes",
    fix: "Élargir le rayon acquéreur (Nancy ↔ Saint-Nicolas, villages voisins)",
  },
  {
    id: "atypique",
    title: "Bien atypique (surface, division, accès)",
    symptom: "Public cible très étroit",
    fix: "Ciblage fin + financement adapté (rare mais possible)",
  },
];

var ACQUEREUR_MATCHING = {
  pitch:
    "Nous croisons votre bien avec des acquéreurs dont la capacité de financement est calée (simulation prêt, apport, endettement HCSF) — pas seulement des curieux de groupes Facebook.",
  steps: [
    "Vendeur ou négociateur dépose le bien (prix, secteur, DPE, mandat)",
    "Alerte acquéreur sur le même secteur + budget compatible",
    "Courtier valide le prêt côté acheteur avant visite sérieuse",
    "Offre avec financement crédible pour le vendeur",
  ],
};

function unsoldContextListText() {
  return UNSOLD_CONTEXTS.map(function (c) {
    return c.title;
  }).join(", ");
}

function vendeurUnsoldIntro(city) {
  var name = (city && city.name) || "votre commune";
  return (
    "Votre bien à " +
    name +
    " ne part pas ? Souvent ce n'est pas « personne n'achète » — c'est prix, mandat bloqué, DPE, travaux, ou un manque d'acquéreurs avec prêt validé. Nous activons les deux côtés : dépôt vendeur + alerte acquéreur finançable."
  );
}

function vendeurUnsoldSections(city) {
  var name = (city && city.name) || "votre secteur";
  return [
    {
      h2: "Pourquoi les maisons ne se vendent pas à " + name + " ?",
      paragraphs: [
        vendeurUnsoldIntro(city),
        "Les biens restent parfois des mois chez un négociateur sans visite qualifiée. Les causes les plus fréquentes : " +
          unsoldContextListText() +
          ".",
      ],
      list: UNSOLD_CONTEXTS.map(function (c) {
        return c.title + " — " + c.symptom;
      }),
    },
    {
      h2: "Trouver un acquéreur avec prêt validé",
      paragraphs: [
        ACQUEREUR_MATCHING.pitch,
        "Parcours : dépôt du bien → matching acquéreur sur budget réel → dossier crédit si besoin → offre crédible.",
      ],
      list: ACQUEREUR_MATCHING.steps,
    },
  ];
}

function vendeurUnsoldFaq(city) {
  var name = (city && city.name) || "votre commune";
  return [
    {
      q: "Mon bien est en mandat chez une agence et ne se vend pas — pouvez-vous aider ?",
      a: "Oui. Déposez le bien (URL annonce ou fiche) : nous activons des acquéreurs dont le budget et le prêt sont calés, en complément de la diffusion agence.",
    },
    {
      q: "Comment attirez-vous des acheteurs qui ont vraiment le budget ?",
      a: "Alerte recherche + simulation crédit avant visite sérieuse. Les vendeurs reçoivent des contacts avec enveloppe d'emprunt, pas seulement des demandes d'info.",
    },
    {
      q: "Faut-il baisser le prix pour vendre à " + name + " ?",
      a: "Pas toujours. Parfois le blocage est le financement côté acquéreur ou le DPE. On diagnostique le contexte (prix, mandat, travaux) avant de recommander une baisse.",
    },
  ];
}

module.exports = {
  UNSOLD_CONTEXTS: UNSOLD_CONTEXTS,
  ACQUEREUR_MATCHING: ACQUEREUR_MATCHING,
  unsoldContextListText: unsoldContextListText,
  vendeurUnsoldIntro: vendeurUnsoldIntro,
  vendeurUnsoldSections: vendeurUnsoldSections,
  vendeurUnsoldFaq: vendeurUnsoldFaq,
};
