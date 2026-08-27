/**
 * Pages SEO — assurance santé collective (mutuelle entreprise / ANI)
 */
var LT = require("./seo-long-term-related.cjs");

function buildCollectivePages(page) {
  var BASE = "/assurance-sante-collective/";
  var LANDING = "/landings/sante-collective.html";
  var relatedExtra =
    typeof LT.mergeUnique === "function"
      ? function (arr) {
          return LT.mergeUnique(arr, LT.NICHES_SANTE || LT.NICHES_COLLECTIVE || []);
        }
      : function (arr) {
          return arr;
        };

  return [
    page({
      file: "assurance-sante-collective/index.html",
      theme: "niche",
      badge: "Santé collective",
      title: "Assurance santé collective | Mutuelle entreprise ANI — devis 2026",
      description:
        "Mutuelle / assurance santé collective pour TPE et PME : obligations ANI, panier de soins, budget employeur, DUE. Devis gratuit, courtier ORIAS.",
      keywords:
        "assurance santé collective, mutuelle collective entreprise, mutuelle PME, ANI mutuelle, complémentaire santé entreprise, devis mutuelle collective",
      h1: "Assurance santé collective : mutuelle d’entreprise conforme ANI",
      intro:
        "Toute entreprise privée doit proposer une complémentaire santé à ses salariés. Nous comparons les contrats collectifs (socle ANI, renforcé, cadres / non-cadres) avec un conseiller ORIAS — pour rester conforme sans surpayer.",
      cta: { href: LANDING, label: "Devis mutuelle collective" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurances", url: "/assurances/" },
        { name: "Santé collective", url: BASE },
      ],
      benefits: [
        { title: "Conformité ANI", text: "Panier de soins et financement employeur ≥ 50 %." },
        { title: "TPE & PME", text: "Cahier des charges adapté à l’effectif et à la CCN." },
        { title: "Mise en place", text: "DUE, information salariés, portabilité." },
      ],
      steps: [
        { title: "Profil entreprise", text: "Effectif, cadres, convention collective, budget." },
        { title: "Comparatif", text: "Socle ANI vs formules renforcées." },
        { title: "Souscription", text: "DUE, affiliation, suivi conseiller." },
      ],
      sections: [
        {
          h2: "Pourquoi une page dédiée santé collective ?",
          paragraphs: [
            "La mutuelle individuelle et la mutuelle d’entreprise ne se comparent pas de la même façon. Ici, l’acheteur est l’employeur : obligation légale, DUE, cotisations partagées, portabilité.",
            "Nous ciblons les recherches longue traîne (ANI, panier de soins, mutuelle PME) plutôt que le mot générique « mutuelle santé » saturé par les comparateurs.",
          ],
          list: [
            "Obligations ANI et panier minimum",
            "Budget employeur et part salarié",
            "Cadres / non-cadres selon CCN",
            "Changement de contrat sans rupture",
          ],
        },
        {
          h2: "Landing et questionnaire",
          paragraphs: [
            "Le parcours conversion reste /landings/sante-collective.html (need=collective) : devis, express 2 min ou questionnaire entreprise (SIRET, effectif, budget).",
          ],
        },
      ],
      related: relatedExtra([
        { href: BASE + "ani/", label: "Obligations ANI" },
        { href: BASE + "pme/", label: "PME / TPE" },
        { href: BASE + "due/", label: "DUE & portabilité" },
        { href: BASE + "panier-de-soins/", label: "Panier de soins" },
        { href: LANDING, label: "Devis collective" },
        { href: "/blog/mutuelle-collective-entreprise-guide-2026.html", label: "Guide blog 2026" },
        { href: "/assurance-sante/", label: "Mutuelle individuelle" },
      ]),
      faq: [
        {
          q: "La mutuelle collective est-elle obligatoire ?",
          a: "Oui pour les entreprises du secteur privé : complémentaire santé collective depuis l’ANI, avec un panier de soins minimum et un financement employeur d’au moins 50 %.",
        },
        {
          q: "Puis-je garder ma mutuelle individuelle ?",
          a: "Dans certains cas de dispense prévus, oui — avec justificatifs. Sinon l’adhésion au contrat collectif est la règle.",
        },
        {
          q: "Combien coûte une mutuelle collective PME ?",
          a: "Cela dépend de l’effectif, des garanties et de la part employeur. Nous chiffrons sur devis après questionnaire.",
        },
      ],
    }),
    page({
      file: "assurance-sante-collective/ani/index.html",
      theme: "niche",
      badge: "ANI",
      title: "ANI mutuelle collective | Obligations employeur 2026",
      description:
        "ANI et mutuelle collective obligatoire : panier de soins, financement 50 %, cadres. Devis entreprise, courtier ORIAS.",
      keywords: "ANI mutuelle, mutuelle collective obligatoire, obligations employeur santé",
      h1: "ANI : obligations mutuelle collective pour l’employeur",
      intro:
        "L’Accord National Interprofessionnel fixe le cadre de la complémentaire santé d’entreprise. Voici ce que vous devez respecter — et comment comparer sans risque.",
      cta: { href: LANDING, label: "Vérifier ma conformité" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Santé collective", url: BASE },
        { name: "ANI", url: BASE + "ani/" },
      ],
      sections: [
        {
          h2: "Socle à respecter",
          paragraphs: [
            "Panier de soins minimum, affiliation des salariés, financement employeur. Les détails pratiques sont dans notre article blog ANI.",
          ],
        },
      ],
      related: relatedExtra([
        { href: BASE, label: "Hub santé collective" },
        { href: "/blog/mutuelle-collective-obligations-employeur-ani.html", label: "Article ANI" },
        { href: LANDING, label: "Devis" },
      ]),
      faq: [
        {
          q: "L’ANI s’applique-t-il aux TPE ?",
          a: "Oui : dès qu’il y a des salariés dans le secteur privé, y compris les très petites entreprises.",
        },
      ],
    }),
    page({
      file: "assurance-sante-collective/pme/index.html",
      theme: "niche",
      badge: "PME / TPE",
      title: "Mutuelle collective PME et TPE | Budget et devis",
      description:
        "Mutuelle collective pour PME et TPE : tarifs, part employeur, effectif. Devis gratuit courtier ORIAS.",
      keywords: "mutuelle collective PME, mutuelle TPE, devis mutuelle entreprise",
      h1: "Mutuelle collective pour PME et TPE",
      intro:
        "Budget maîtrisé, conformité ANI, simplicité administrative : le cahier des charges d’une petite structure n’est pas celui d’un grand groupe.",
      cta: { href: LANDING, label: "Devis PME / TPE" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Santé collective", url: BASE },
        { name: "PME / TPE", url: BASE + "pme/" },
      ],
      related: relatedExtra([
        { href: BASE, label: "Hub" },
        { href: "/blog/mutuelle-collective-pme-tpe-budget-2026.html", label: "Budget 2026" },
        { href: LANDING, label: "Devis" },
      ]),
      faq: [],
    }),
    page({
      file: "assurance-sante-collective/due/index.html",
      theme: "niche",
      badge: "DUE",
      title: "DUE mutuelle collective et portabilité | Mise en place",
      description:
        "DUE (décision unilatérale de l’employeur), portabilité, information des salariés. Accompagnement mise en place mutuelle collective.",
      keywords: "DUE mutuelle, portabilité mutuelle collective, mise en place mutuelle entreprise",
      h1: "DUE et portabilité : mettre en place la mutuelle collective",
      intro:
        "Formaliser le régime, informer les salariés, anticiper la portabilité : les étapes pour une bascule propre.",
      cta: { href: LANDING, label: "Accompagnement DUE" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Santé collective", url: BASE },
        { name: "DUE", url: BASE + "due/" },
      ],
      related: relatedExtra([
        { href: BASE, label: "Hub" },
        { href: "/blog/mutuelle-collective-mise-en-place-due-portabilite.html", label: "Guide DUE" },
        { href: LANDING, label: "Devis" },
      ]),
      faq: [],
    }),
    page({
      file: "assurance-sante-collective/panier-de-soins/index.html",
      theme: "niche",
      badge: "Panier de soins",
      title: "Panier de soins ANI | Mutuelle collective minimum",
      description:
        "Panier de soins minimum ANI : hospitalisation, optique, dentaire. Lire une grille de garanties mutuelle collective.",
      keywords: "panier de soins ANI, garanties mutuelle collective, socle complémentaire santé",
      h1: "Panier de soins : le minimum d’une mutuelle collective",
      intro:
        "Avant de comparer les prix, vérifiez que chaque offre respecte le socle ANI applicable à votre entreprise.",
      cta: { href: LANDING, label: "Comparer les paniers" },
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Santé collective", url: BASE },
        { name: "Panier de soins", url: BASE + "panier-de-soins/" },
      ],
      related: relatedExtra([
        { href: BASE, label: "Hub" },
        { href: "/blog/mutuelle-collective-panier-de-soins-minimum-2026.html", label: "Article panier" },
        { href: LANDING, label: "Devis" },
      ]),
      faq: [],
    }),
  ];
}

module.exports = { buildCollectivePages };
