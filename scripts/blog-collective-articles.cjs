/**
 * Blog — mutuelle / assurance santé collective (ANI, PME, DUE).
 * Chargé par blog-articles-manifest.cjs.
 */
var LANDING =
  "../landings/sante-collective.html?utm_source=blog&utm_medium=article&utm_campaign=collective";
var QUEST =
  "../landings/questionnaire.html?need=collective&journey=standard&utm_source=blog&utm_medium=article&utm_campaign=collective";
var EXPRESS =
  "../landings/devis-express.html?need=collective&utm_source=blog&utm_medium=article&utm_campaign=collective";
var CTA = { href: LANDING, label: "Devis mutuelle collective" };

var RELATED_CORE = [
  { href: "./mutuelle-collective-obligations-employeur-ani.html", label: "Obligations ANI employeur" },
  { href: "./mutuelle-collective-pme-tpe-budget-2026.html", label: "Budget PME / TPE 2026" },
  { href: "./mutuelle-collective-mise-en-place-due-portabilite.html", label: "DUE et portabilité" },
  { href: "./mutuelle-collective-panier-de-soins-minimum-2026.html", label: "Panier de soins" },
  { href: "./mutuelle-collective-cadres-non-cadres-conventions.html", label: "Cadres / non-cadres" },
  { href: "./mutuelle-collective-dispenses-adhesion-salaries.html", label: "Dispenses d’adhésion" },
  { href: "../assurance-sante-collective/", label: "Hub santé collective" },
  { href: "../landings/sante-collective.html", label: "Landing devis collective" },
];

function related() {
  var extra = Array.prototype.slice.call(arguments);
  var seen = {};
  return extra.concat(RELATED_CORE).filter(function (l) {
    if (seen[l.href]) return false;
    seen[l.href] = true;
    return true;
  });
}

module.exports = [
  {
    file: "mutuelle-collective-obligations-employeur-ani.html",
    section: "collective",
    tag: "Santé collective",
    tagClass: "tag-sante",
    themes: ["collective", "sante", "pro"],
    title: "Mutuelle collective obligatoire : ANI, employeur et panier de soins 2026",
    description:
      "Obligations mutuelle collective entreprise : ANI, financement employeur 50 %, panier de soins minimum, cadres et non-cadres. Devis mutuelle collective PME et TPE.",
    meta: "9 min · Août 2026",
    cardExcerpt: "ANI : ce que doit vraiment financer l’employeur en 2026.",
    keywords: [
      "mutuelle collective entreprise",
      "ANI mutuelle obligatoire",
      "complémentaire santé entreprise",
      "obligations employeur santé",
      "panier de soins",
      "devis mutuelle collective",
    ],
    cta: CTA,
    blocks: [
      {
        type: "p",
        text:
          "Depuis l’<strong>Accord National Interprofessionnel (ANI)</strong>, toute entreprise du secteur privé doit proposer une <strong>complémentaire santé collective</strong> à ses salariés. Pour un dirigeant de TPE ou PME, la question n’est plus « faut-il une mutuelle ? » mais <strong>quel niveau de garanties</strong>, <strong>quel budget</strong> et <strong>comment rester conforme</strong> sans surpayer. <a href=\"" +
          LANDING +
          "\"><strong>Comparer ma mutuelle collective</strong></a> · <a href=\"" +
          EXPRESS +
          "\">rappel 2 min</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Qui est concerné ?" },
      {
        type: "ul",
        items: [
          "Entreprises du secteur privé avec salariés (y compris TPE)",
          "CDI et CDD : couverture dès l’embauche (sauf dispenses prévues)",
          "Cadres / non-cadres : parfois deux contrats selon la convention",
          "Dirigeants non salariés : souvent hors collectif — prévoyance TNS à part",
        ],
      },
      { type: "h2", text: "Le panier de soins ANI" },
      {
        type: "p",
        text: "Le contrat doit couvrir un <strong>socle minimum</strong> (hospitalisation, soins courants, pharmacie, optique, dentaire). Un contrat « pas cher » hors socle expose à un risque de non-conformité. Vérifiez d’abord le panier, ensuite le tarif.",
      },
      { type: "h2", text: "Qui paie quoi ?" },
      {
        type: "p",
        text: "L’employeur finance au minimum <strong>50 % de la cotisation de base</strong>. Beaucoup financent davantage pour fidéliser. Les options facultatives (surcomplémentaire) restent souvent à charge du salarié.",
      },
      { type: "h2", text: "Erreurs fréquentes" },
      {
        type: "ul",
        items: [
          "Choisir uniquement sur le prix sans lire le panier",
          "Oublier la DUE (décision unilatérale de l’employeur)",
          "Ignorer la convention collective",
          "Négliger portabilité et ayants droit",
        ],
      },
      {
        type: "p",
        text:
          "Prochaine étape : <a href=\"" +
          QUEST +
          "\">questionnaire entreprise</a> (effectif, cadres, budget) ou <a href=\"" +
          LANDING +
          "\">devis mutuelle collective</a>.",
      },
    ],
    related: related(),
  },
  {
    file: "mutuelle-collective-pme-tpe-budget-2026.html",
    section: "collective",
    tag: "Santé collective",
    tagClass: "tag-sante",
    themes: ["collective", "sante", "pro"],
    title: "Mutuelle collective PME / TPE : budget et tarifs 2026",
    description:
      "Combien coûte une mutuelle collective pour une PME ou TPE en 2026 ? Part employeur, options, effectif, devis courtier ORIAS.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Budget mutuelle entreprise : ce qui fait vraiment varier le prix.",
    keywords: [
      "mutuelle collective PME",
      "mutuelle collective TPE",
      "tarif mutuelle entreprise",
      "budget mutuelle collective 2026",
      "devis mutuelle PME",
    ],
    cta: CTA,
    blocks: [
      {
        type: "p",
        text:
          "Pour une <strong>TPE ou PME</strong>, la mutuelle collective est une charge fixe — mais aussi un levier RH. En 2026, les cotisations évoluent avec l’inflation médicale. Voici comment cadrer le <strong>budget</strong> avant de comparer. <a href=\"" +
          LANDING +
          "\"><strong>Obtenir un devis PME</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Ce qui fait varier le prix" },
      {
        type: "ul",
        items: [
          "Effectif et pyramide des âges",
          "Niveau de garanties (socle ANI vs renforcé)",
          "Part employeur (50 %, 60 %, 100 %)",
          "Cadres / non-cadres et convention collective",
          "Couverture ayants droit (conjoint, enfants)",
        ],
      },
      { type: "h2", text: "Ordres de grandeur" },
      {
        type: "p",
        text: "Un socle conforme ANI coûte nettement moins qu’une formule confort optique/dentaire. Le bon dosage dépend de votre secteur et de vos engagements conventionnels — pas d’un comparateur grand public pensé pour les particuliers.",
      },
      { type: "h2", text: "Comment chiffrer sans se tromper" },
      {
        type: "ol",
        items: [
          "Lister effectif CDI/CDD et cadres",
          "Identifier la convention collective",
          "Fixer la part employeur cible",
          "Demander 2–3 devis sur le même cahier des charges",
        ],
      },
      {
        type: "p",
        text:
          "<a href=\"" +
          EXPRESS +
          "\">Rappel express</a> ou <a href=\"" +
          QUEST +
          "\">questionnaire complet</a> — un conseiller ORIAS vous rappelle.",
      },
    ],
    related: related(),
  },
  {
    file: "mutuelle-collective-mise-en-place-due-portabilite.html",
    section: "collective",
    tag: "Santé collective",
    tagClass: "tag-sante",
    themes: ["collective", "sante", "pro"],
    title: "Mettre en place une mutuelle collective : DUE, portabilité, étapes",
    description:
      "Guide pratique : DUE, information des salariés, portabilité après rupture du contrat de travail, calendrier de mise en place mutuelle collective.",
    meta: "9 min · Août 2026",
    cardExcerpt: "DUE, portabilité, information salariés : le mode d’emploi.",
    keywords: [
      "DUE mutuelle collective",
      "portabilité mutuelle",
      "mise en place mutuelle entreprise",
      "décision unilatérale employeur",
    ],
    cta: CTA,
    blocks: [
      {
        type: "p",
        text:
          "Créer ou changer de <strong>mutuelle collective</strong> ne se résume pas à signer un devis. Il faut formaliser la <strong>DUE</strong> (ou un accord), informer les salariés et anticiper la <strong>portabilité</strong>. <a href=\"" +
          LANDING +
          "\"><strong>Accompagnement mise en place</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "DUE : formaliser l’obligation" },
      {
        type: "p",
        text: "La <strong>décision unilatérale de l’employeur</strong> décrit le régime (garanties, financement, ayants droit, date d’effet). Sans document clair, vous exposez l’entreprise en cas de contrôle ou de litige.",
      },
      { type: "h2", text: "Portabilité" },
      {
        type: "p",
        text: "Après une rupture ouvrant droit à l’assurance chômage, l’ex-salarié peut conserver la couverture pendant une durée limitée. Prévoyez la mécanique avec l’organisme assureur dès la souscription.",
      },
      { type: "h2", text: "Calendrier type" },
      {
        type: "ol",
        items: [
          "Cahier des charges (ANI + convention)",
          "Comparaison des offres",
          "Rédaction DUE / accord",
          "Information des salariés + dispenses",
          "Affiliation et premier prélèvement",
        ],
      },
    ],
    related: related(),
  },
  {
    file: "mutuelle-collective-panier-de-soins-minimum-2026.html",
    section: "collective",
    tag: "Santé collective",
    tagClass: "tag-sante",
    themes: ["collective", "sante"],
    title: "Panier de soins mutuelle collective : le minimum ANI 2026",
    description:
      "Panier de soins minimum ANI : hospitalisation, optique, dentaire, soins courants. Comment lire une grille de garanties mutuelle collective.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Socle ANI : ce que doit couvrir le contrat collectif.",
    keywords: [
      "panier de soins ANI",
      "garanties mutuelle collective",
      "socle complémentaire santé entreprise",
    ],
    cta: CTA,
    blocks: [
      {
        type: "p",
        text:
          "Le <strong>panier de soins</strong> fixe le plancher légal d’une complémentaire santé d’entreprise. En dessous : non-conformité. Au-dessus : confort pour les salariés, coût pour l’employeur. <a href=\"" +
          LANDING +
          "\">Vérifier mon panier</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Postes couverts au minimum" },
      {
        type: "ul",
        items: [
          "Hospitalisation (ticket modérateur, forfait journalier…)",
          "Soins courants et pharmacie",
          "Dentaire (prothèses selon plafonds)",
          "Optique (monture + verres selon panier)",
        ],
      },
      { type: "h2", text: "Lire une grille sans se faire avoir" },
      {
        type: "p",
        text: "Comparez toujours <strong>les mêmes postes</strong> (optique, dentaire, chambre particulière). Un tarif bas avec des plafonds bas revient cher au premier devis dentiste.",
      },
    ],
    related: related(),
  },
  {
    file: "mutuelle-collective-cadres-non-cadres-conventions.html",
    section: "collective",
    tag: "Santé collective",
    tagClass: "tag-sante",
    themes: ["collective", "sante", "pro"],
    title: "Mutuelle collective cadres et non-cadres : conventions collectives",
    description:
      "Cadres / non-cadres, CCN : comment structurer la mutuelle collective selon votre convention. Devis entreprise ORIAS.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Deux populations, parfois deux contrats : mode d’emploi.",
    keywords: [
      "mutuelle cadres entreprise",
      "mutuelle non cadres",
      "convention collective mutuelle",
      "CCN complémentaire santé",
    ],
    cta: CTA,
    blocks: [
      {
        type: "p",
        text:
          "Selon votre <strong>convention collective</strong>, cadres et non-cadres peuvent avoir des <strong>niveaux de cotisation ou de garanties</strong> différents. Anticiper évite les refus à l’affiliation. <a href=\"" +
          LANDING +
          "\">Comparer selon ma CCN</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Pourquoi séparer (ou non) ?" },
      {
        type: "p",
        text: "Certaines CCN imposent un régime distinct. D’autres autorisent un contrat unique. L’objectif : rester conforme tout en limitant la charge administrative.",
      },
      { type: "h2", text: "Ce que nous vérifions" },
      {
        type: "ul",
        items: [
          "Code IDCC / convention applicable",
          "Cotisation minimale employeur",
          "Extensions ayants droit",
          "Articulation avec la prévoyance",
        ],
      },
    ],
    related: related(),
  },
  {
    file: "mutuelle-collective-dispenses-adhesion-salaries.html",
    section: "collective",
    tag: "Santé collective",
    tagClass: "tag-sante",
    themes: ["collective", "sante"],
    title: "Dispenses d’adhésion mutuelle collective : cas autorisés",
    description:
      "Quels salariés peuvent être dispensés de la mutuelle d’entreprise ? Couverture déjà existante, CDD courts, ayants droit. Guide employeur.",
    meta: "6 min · Août 2026",
    cardExcerpt: "Dispenses : les cas prévus et les preuves à conserver.",
    keywords: [
      "dispense mutuelle collective",
      "dispense adhésion mutuelle entreprise",
      "salarié dispense complémentaire santé",
    ],
    cta: CTA,
    blocks: [
      {
        type: "p",
        text:
          "L’adhésion est la règle, mais des <strong>dispenses</strong> existent (couverture ailleurs, CDD courts, etc.). Mal gérées, elles créent un contentieux. <a href=\"" +
          QUEST +
          "\">Clarifier mon régime</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Cas fréquents" },
      {
        type: "ul",
        items: [
          "Salarié déjà couvert en tant qu’ayant droit",
          "CDD / missions courtes selon conditions",
          "Couverture individuelle souscrite avant (selon règles)",
          "Demande écrite et renouvellement périodique",
        ],
      },
      { type: "h2", text: "Bonnes pratiques RH" },
      {
        type: "p",
        text: "Conservez les <strong>attestations</strong>, datez les demandes, et alignez le process avec l’organisme assureur. Un conseiller vous aide à cadrer le document type.",
      },
    ],
    related: related(),
  },
  {
    file: "mutuelle-collective-entreprise-guide-2026.html",
    section: "collective",
    tag: "Santé collective",
    tagClass: "tag-sante",
    themes: ["collective", "sante", "pro"],
    title: "Assurance santé collective entreprise : guide complet 2026",
    description:
      "Guide mutuelle / assurance santé collective 2026 : ANI, budget, DUE, panier de soins, devis PME. Courtier ORIAS Leads Opportunities.",
    meta: "10 min · Août 2026",
    cardExcerpt: "Tout le parcours employeur : conforme, budgété, souscrit.",
    keywords: [
      "assurance santé collective",
      "mutuelle santé collective",
      "complémentaire santé collective",
      "devis mutuelle entreprise 2026",
    ],
    cta: CTA,
    blocks: [
      {
        type: "p",
        text:
          "L’<strong>assurance santé collective</strong> (mutuelle d’entreprise) protège vos salariés et sécurise l’employeur face à l’obligation ANI. Ce guide relie conformité, budget et mise en place. <a href=\"" +
          LANDING +
          "\"><strong>Devis santé collective</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Cadre légal" },
      {
        type: "p",
        text: "ANI, panier de soins, financement employeur ≥ 50 %, formalisation (DUE ou accord). Détails : <a href=\"./mutuelle-collective-obligations-employeur-ani.html\">obligations ANI</a>.",
      },
      { type: "h2", text: "2. Budget" },
      {
        type: "p",
        text: "Effectif, garanties, part employeur : <a href=\"./mutuelle-collective-pme-tpe-budget-2026.html\">budget PME/TPE</a>.",
      },
      { type: "h2", text: "3. Mise en place" },
      {
        type: "p",
        text: "DUE, information, portabilité : <a href=\"./mutuelle-collective-mise-en-place-due-portabilite.html\">guide DUE</a>.",
      },
      { type: "h2", text: "4. Passer à l’action" },
      {
        type: "p",
        text:
          "Hub SEO : <a href=\"../assurance-sante-collective/\">assurance santé collective</a> · Landing : <a href=\"" +
          LANDING +
          "\">devis</a> · <a href=\"" +
          EXPRESS +
          "\">express 2 min</a>.",
      },
    ],
    related: related(),
  },
  {
    file: "mutuelle-collective-changer-contrat-entreprise.html",
    section: "collective",
    tag: "Santé collective",
    tagClass: "tag-sante",
    themes: ["collective", "sante", "pro"],
    title: "Changer de mutuelle collective : résiliation et bascule",
    description:
      "Comment changer de mutuelle d’entreprise sans rupture de couverture : préavis, DUE, information salariés, bascule assureur.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Changer d’organisme : calendrier et pièges à éviter.",
    keywords: [
      "changer mutuelle collective",
      "résiliation mutuelle entreprise",
      "bascule complémentaire santé",
    ],
    cta: CTA,
    blocks: [
      {
        type: "p",
        text:
          "Hausse de cotisation, garanties insuffisantes, service médiocre : beaucoup d’employeurs veulent <strong>changer de mutuelle collective</strong>. La bascule se prépare plusieurs semaines à l’avance. <a href=\"" +
          LANDING +
          "\">Comparer avant de résilier</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "Étapes clés" },
      {
        type: "ol",
        items: [
          "Audit des garanties et du coût actuel",
          "Nouveaux devis sur le même cahier des charges",
          "Mise à jour DUE / information du personnel",
          "Résiliation selon préavis du contrat",
          "Affiliation au nouvel organisme sans trou de garantie",
        ],
      },
      { type: "h2", text: "Piège classique" },
      {
        type: "p",
        text: "Résilier trop tôt sans date d’effet alignée = salariés non couverts. On calcule le calendrier avec vous.",
      },
    ],
    related: related(),
  },
];
