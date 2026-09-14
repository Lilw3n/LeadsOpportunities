/**
 * Partenaire Leonida Vice (leonida-vice.com) — articles evergreen → leads.
 * Hub GTA VI (compte à rebours, communauté, boutique) vers questionnaires
 * crédit conso, habitation et prêt immobilier (bassin Nancy / 54).
 */
var PARTNER =
  "https://leonida-vice.com/?utm_source=leadsopportunities&utm_medium=article&utm_campaign=leonida_vice";
var LANDING_CONSO =
  "../landings/questionnaire.html?need=conso&journey=standard&utm_source=blog&utm_medium=article&utm_campaign=leonida_vice";
var LANDING_HAB =
  "../landings/questionnaire.html?need=habitation&journey=standard&utm_source=blog&utm_medium=article&utm_campaign=leonida_vice";
var LANDING_CREDIT =
  "../landings/credit-immo.html?utm_source=blog&utm_medium=article&utm_campaign=leonida_vice";
var LANDING_IMMO =
  "../landings/acheteur-immo.html?utm_source=blog&utm_medium=article&utm_campaign=leonida_vice";
var HUB_NANCY = "../pret-immobilier/nancy-metropole/";

module.exports = [
  {
    file: "leonida-vice-gta-6-compte-a-rebours-budget-france.html",
    section: "actu",
    audience: "france",
    tag: "GTA 6 & budget",
    tagClass: "tag-actu",
    themes: ["gta6", "leonida", "conso", "habitation", "actu"],
    title: "Leonida Vice : compte à rebours GTA 6, budget et crédit conso en France",
    description:
      "Le hub Leonida Vice suit la sortie GTA VI. En France : séparez hype, précommande et crédit consommation — TAEG, mensualités, impact sur un futur prêt immobilier.",
    meta: "9 min · Sept 2026",
    cardExcerpt: "Compte à rebours GTA 6 : calculez le vrai budget avant de signer un crédit conso.",
    keywords: [
      "Leonida Vice",
      "GTA 6 compte à rebours",
      "GTA VI budget France",
      "crédit conso gaming",
      "précommande GTA 6",
      "PS5 Pro crédit",
    ],
    heroImage: "./images/gta6/gta6-vice-city-01.jpg",
    ogImage: "https://www.leadsopportunities.fr/blog/images/gta6/gta6-vice-city-01.jpg",
    cta: { href: LANDING_CONSO, label: "Simuler un crédit conso (3 min)" },
    blocks: [
      {
        type: "p",
        text:
          "Le site partenaire <a href=\"" +
          PARTNER +
          "\" rel=\"noopener\"><strong>Leonida Vice</strong></a> rassemble compte à rebours, actu et boutique autour de <strong>GTA VI</strong> (sortie annoncée le 19 novembre 2026). La hype est réelle. Le risque, en France, n’est pas de rater le day-one : c’est de <strong>financer console + jeu + accessoires à crédit</strong> sans regarder le TAEG, ni l’effet sur un <strong>prêt immobilier</strong> dans l’année. <a href=\"" +
          LANDING_CONSO +
          "\"><strong>Questionnaire crédit conso</strong></a> · <a href=\"./gta-6-ps5-pro-budget-1000-euros-pret-conso.html\">budget 1 000 €</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que Leonida Vice apporte — et ce qu’il ne remplace pas" },
      {
        type: "ul",
        items: [
          "Un hub FR / EN / ES : dates, trailers, communauté, boutique fans",
          "Un compte à rebours utile pour <strong>planifier l’épargne</strong>, pas pour justifier un crédit express",
          "Aucune offre de prêt : le financement se compare chez un courtier ORIAS, pas sur un site média",
        ],
      },
      {
        type: "p",
        text:
          "Consultez <a href=\"" +
          PARTNER +
          "\" rel=\"noopener\">leonida-vice.com</a> pour l’actu jeu. Pour l’argent : <a href=\"./gta-6-precommande-ps5-pro-credit-conso-france.html\">cadre légal du crédit conso</a> et <a href=\"./pret-conso-gaming-ps5-pro-gta6-comparatif-2026.html\">comparatif prêt perso / magasin / 3×</a>.",
      },
      { type: "h2", text: "2. Trois enveloppes à séparer avant le 19 novembre" },
      {
        type: "ol",
        items: [
          "<strong>Loisirs</strong> — jeu + console + manette : cash ou petit crédit, durée courte",
          "<strong>Protection</strong> — plafonds mobilier de la MRH (vol, dégât des eaux) une fois le colis livré",
          "<strong>Projet immo</strong> — si un achat est prévu à Nancy, Jarville ou Varangéville, zéro nouveau crédit conso",
        ],
      },
      {
        type: "p",
        text:
          "Un vendeur peut afficher « à partir de 30 €/mois ». Ce qui compte : le <strong>TAEG</strong>, la durée et le <strong>coût total</strong>. Rétractation 14 jours à distance (Code de la consommation). <a href=\"" +
          LANDING_CONSO +
          "\">Simuler mon crédit</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "3. Pourquoi un petit crédit peut bloquer un dossier immo" },
      {
        type: "p",
        text:
          "La banque additionne toutes les mensualités dans le taux d’effort (cible HCSF ~35 %). Un prêt gaming de 1 000 € sur 12 ou 24 mois peut faire basculer un dossier juste. Si vous visez un achat dans le <a href=\"" +
          HUB_NANCY +
          "\">bassin Nancy métropole</a> (Nancy, Jarville-la-Malgrange, <strong>Varangéville</strong>, Dombasle), épargnez plutôt que de signer. <a href=\"./gta-6-pret-immobilier-budget-gaming.html\">GTA 6 et prêt immobilier</a> · <a href=\"" +
          LANDING_CREDIT +
          "\">étude prêt immo</a>.",
      },
      { type: "h2", text: "4. Après la livraison : habitation, pas seulement la facture" },
      {
        type: "p",
        text:
          "PS5 Pro + écran + setup : souvent 800 à 2 000 € dans le salon. Vérifiez les <strong>plafonds high-tech</strong> et la franchise vol. Un cambriolage ou un dégât des eaux sans capital à jour, c’est un second crédit d’urgence. <a href=\"./gta-6-sortie-assurance-gaming-materiel.html\">Assurer son matériel GTA 6</a> · <a href=\"" +
          LANDING_HAB +
          "\">questionnaire habitation</a>.",
      },
      { type: "h2", text: "5. Checklist compte à rebours (15 minutes)" },
      {
        type: "ul",
        items: [
          "Noter le prix réel (jeu + console + livraison), pas le teaser boutique",
          "Décider cash / épargne / crédit — et refuser tout 3× sans TAEG lisible",
          "Si prêt immo dans l’année : reporter l’achat gaming ou réduire le panier",
          "Mettre à jour la MRH le jour de la livraison",
          "Ignorer memecoins et « fuites payantes » — voir <a href=\"./gta-6-fuites-cyberleek-memecoin-arnaque-france.html\">arnaques fuites</a>",
        ],
      },
      {
        type: "p",
        text:
          "Courtier ORIAS : on compare le <strong>crédit conso</strong> et, si besoin, le <strong>prêt immobilier</strong> sans jugoter votre passion GTA. Actu jeu : <a href=\"" +
          PARTNER +
          "\" rel=\"noopener\">Leonida Vice</a>. Financement : <a href=\"" +
          LANDING_CONSO +
          "\"><strong>questionnaire crédit conso</strong></a> · <a href=\"" +
          LANDING_CREDIT +
          "\">prêt immo</a>.",
      },
    ],
    related: [
      { href: "./gta-6-ps5-pro-budget-1000-euros-pret-conso.html", label: "Budget 1 000 € PS5 Pro + GTA" },
      { href: "./pret-conso-gaming-ps5-pro-gta6-comparatif-2026.html", label: "Comparatif crédits gaming" },
      { href: "./gta-6-pret-immobilier-budget-gaming.html", label: "GTA 6 et prêt immo" },
      { href: "./leonida-vice-communaute-gta-6-assurance-setup-france.html", label: "Communauté &amp; assurance setup" },
      { href: "../pret-immobilier/nancy-metropole/", label: "Prêt Nancy métropole" },
    ],
    faq: [
      {
        q: "C’est quoi Leonida Vice ?",
        a: "Un hub média / communauté autour de GTA VI (compte à rebours, actu, blog, boutique). Ce n’est pas un prêteur ni un assureur.",
      },
      {
        q: "Faut-il un crédit pour précommander GTA 6 ?",
        a: "Non. L’épargne ou un paiement comptant évite le TAEG. Un crédit n’a de sens que si la mensualité reste compatible avec vos charges et un éventuel projet immo.",
      },
      {
        q: "Un crédit conso bloque-t-il un prêt immobilier ?",
        a: "Il entre dans l’endettement. Sur un dossier proche de 35 %, même 40–80 €/mois peuvent suffire à un refus. Mieux vaut en parler avant de signer.",
      },
    ],
  },
  {
    file: "leonida-vice-communaute-gta-6-assurance-setup-france.html",
    section: "habitat",
    audience: "france",
    tag: "Gaming & habitation",
    tagClass: "tag-habitation",
    themes: ["gta6", "leonida", "habitation", "gaming", "rc-pro"],
    title: "Communauté Leonida Vice : assurer son setup GTA 6, sa coloc et sa RC",
    description:
      "Fans, streamers et boutique GTA VI : ce que l’assurance habitation et la RC pro doivent couvrir en France — vol, dégât des eaux, matos, revenus créateurs.",
    meta: "8 min · Sept 2026",
    cardExcerpt: "Setup GTA 6, coloc, stream : calibrez MRH et RC avant le day-one.",
    keywords: [
      "assurance setup gaming",
      "Leonida Vice communauté",
      "assurance habitation console",
      "RC pro streamer GTA",
      "vol PS5 assurance",
    ],
    heroImage: "./images/gta6/gta6-lucia-01.jpg",
    ogImage: "https://www.leadsopportunities.fr/blog/images/gta6/gta6-lucia-01.jpg",
    cta: { href: LANDING_HAB, label: "Questionnaire habitation (3 min)" },
    blocks: [
      {
        type: "p",
        text:
          "Autour de <a href=\"" +
          PARTNER +
          "\" rel=\"noopener\"><strong>Leonida Vice</strong></a>, la communauté GTA VI s’organise : fans, créateurs, boutique. En France, le point aveugle n’est pas le trailer : c’est le <strong>salon</strong>. Console, PC, écran, capture card — souvent plusieurs milliers d’euros — restent sous le forfait « informatique » d’une MRH d’étudiant ou de coloc. <a href=\"" +
          LANDING_HAB +
          "\"><strong>Calibrer mon habitation</strong></a> · <a href=\"./gta-6-sortie-assurance-gaming-materiel.html\">guide matériel GTA 6</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que la plupart des contrats omettent" },
      {
        type: "ul",
        items: [
          "Plafond appareils nomades trop bas (500–1 000 €) vs un setup 2 500 €+",
          "Vol hors domicile (LAN, campus, voiture) souvent exclu ou sous-limité",
          "Colocation : qui est assuré ? Le bail, le propriétaire, ou personne",
          "Livraison day-one : vol de colis, casse transporteur — preuve d’achat à garder",
        ],
      },
      {
        type: "p",
        text:
          "Faites l’inventaire (photos, factures, numéros de série) avant le 19 novembre. Puis ajustez le <strong>capital mobilier</strong>. <a href=\"" +
          LANDING_HAB +
          "\">Questionnaire habitation</a>.",
      },
      { type: "h2", text: "2. Coloc, parents, premier appartement" },
      {
        type: "p",
        text:
          "En résidence étudiante ou chez les parents, le contrat du foyer ne couvre pas toujours <strong>vos</strong> appareils à leur valeur. Un avenant ou une assurance « objets nomades » évite le conflit le jour du sinistre. Si vous emménagez à Nancy, Jarville ou <strong>Varangéville</strong>, déclarez l’adresse réelle — une fausse déclaration peut annuler la garantie. <a href=\"./assurance-habitation-locataire-proprietaire-2026.html\">Guide locataire / propriétaire</a>.",
      },
      { type: "h2", text: "3. Streamers et boutique : la RC ne s’improvise pas" },
      {
        type: "p",
        text:
          "Monétiser des lives, vendre du merch ou animer une communauté n’est plus un hobby aux yeux d’un assureur. Une <strong>RC pro</strong> (diffamation, litige client, matériel pro) et parfois une mutuelle TNS deviennent pertinentes. Angle cyber : <a href=\"./gta-6-fuites-rockstar-cybersecurite-assurance.html\">fuites Rockstar &amp; cyber</a> · <a href=\"../landings/questionnaire.html?need=rc-pro&journey=standard&utm_source=blog&utm_medium=article&utm_campaign=leonida_vice\">questionnaire RC Pro</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "4. Ne pas racheter le setup à crédit après sinistre" },
      {
        type: "p",
        text:
          "Sans MRH à jour, le réflexe est un <strong>crédit conso</strong> d’urgence — plus cher qu’une franchise et un capital correct. Si un prêt immo se prépare, ce second crédit pèse sur l’endettement. <a href=\"./leonida-vice-gta-6-compte-a-rebours-budget-france.html\">Budget et crédit conso</a> · <a href=\"" +
          LANDING_CONSO +
          "\">simuler un crédit</a> seulement si le sinistre l’impose.",
      },
      { type: "h2", text: "5. Checklist communauté (avant le day-one)" },
      {
        type: "ol",
        items: [
          "Lister le matériel et sa valeur de remplacement",
          "Relire plafonds, franchise vol, exclusions coloc",
          "Créateurs : séparer usage perso / pro (RC, local, matériel)",
          "Ignorer les builds pirates et les « leaks » payants (malware + 0 recours)",
          "Suivre l’actu jeu sur <a href=\"" + PARTNER + "\" rel=\"noopener\">Leonida Vice</a>, le contrat chez un courtier",
        ],
      },
      {
        type: "p",
        text:
          "Leads Opportunities — courtier ORIAS. On relie <strong>habitation</strong>, <strong>RC pro</strong> et éventuellement <strong>crédit</strong> sans vous demander d’abandonner GTA. <a href=\"" +
          LANDING_HAB +
          "\"><strong>Questionnaire habitation</strong></a> · <a href=\"./assurance-streamer-gaming-setup-materiel.html\">guide streamer</a>.",
      },
    ],
    related: [
      { href: "./gta-6-sortie-assurance-gaming-materiel.html", label: "Assurer son matériel GTA 6" },
      { href: "./assurance-streamer-gaming-setup-materiel.html", label: "Streamer &amp; setup" },
      { href: "./leonida-vice-gta-6-compte-a-rebours-budget-france.html", label: "Compte à rebours &amp; budget" },
      { href: "./gta-6-fuites-rockstar-cybersecurite-assurance.html", label: "Cyber &amp; fuites" },
    ],
    faq: [
      {
        q: "Ma MRH étudiante couvre-t-elle une PS5 Pro ?",
        a: "Souvent partiellement. Vérifiez le plafond appareils et le vol. Un avenant vaut mieux qu’un refus au sinistre.",
      },
      {
        q: "Faut-il une RC pro pour streamer GTA 6 ?",
        a: "Dès qu’il y a revenus, merch ou prestas, une RC vie privée ne suffit plus. Un questionnaire RC Pro clarifie l’activité.",
      },
      {
        q: "Le vol de colis day-one est-il couvert ?",
        a: "Cela dépend du contrat, du transporteur et de la preuve d’achat. Photographiez le colis et gardez la facture.",
      },
    ],
  },
  {
    file: "leonida-vice-vice-city-immobilier-pret-nancy-metropole.html",
    section: "finance",
    audience: "france",
    tag: "GTA 6 & immobilier",
    tagClass: "tag-immo",
    themes: ["gta6", "leonida", "immobilier", "credit", "nancy"],
    title: "Vice City vs vrai toit : prêt immobilier Nancy, Jarville, Varangéville",
    description:
      "Leonida, villas Vice City : le fantasme GTA VI n’est pas un compromis. À Nancy, Jarville et Varangéville, calculez apport, mensualité et assurance emprunteur.",
    meta: "9 min · Sept 2026",
    cardExcerpt: "Après Leonida Vice : passez de la skyline GTA à un vrai prêt dans le 54.",
    keywords: [
      "prêt immobilier Nancy",
      "prêt Varangéville",
      "GTA 6 immobilier France",
      "Vice City prêt immobilier",
      "Leonida Vice immobilier",
      "Jarville crédit immo",
    ],
    heroImage: "./images/gta6/gta6-vice-city-02.jpg",
    ogImage: "https://www.leadsopportunities.fr/blog/images/gta6/gta6-vice-city-02.jpg",
    cta: { href: LANDING_CREDIT, label: "Étude prêt immobilier" },
    blocks: [
      {
        type: "p",
        text:
          "Sur <a href=\"" +
          PARTNER +
          "\" rel=\"noopener\"><strong>Leonida Vice</strong></a>, Léonida et Vice City donnent envie d’une villa, d’un loft, d’une skyline. Dans le jeu, on « achète » en quelques clics. Dans le <strong>54</strong>, c’est un <strong>compromis</strong>, un notaire, un <strong>prêt immobilier</strong> et souvent un DPE. Courtier basé à <strong>Varangéville</strong>, on ramène la hype à un dossier : Nancy, Jarville-la-Malgrange, Dombasle, Houdemont. <a href=\"" +
          HUB_NANCY +
          "\"><strong>Hub prêt Nancy métropole</strong></a> · <a href=\"" +
          LANDING_CREDIT +
          "\">étude de faisabilité</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Fantasy Vice City vs marché nancéien" },
      {
        type: "ul",
        items: [
          "GTA : prix affiché, achat instantané, pas de frais de notaire",
          "France : apport, taux, assurance emprunteur (loi Lemoine), diagnostics",
          "Bassin 54 : maisons, T3/T4, passoires à rénover — pas des mansions Floride",
        ],
      },
      {
        type: "p",
        text:
          "Si le trailer donne envie de « passer à l’achat », commencez par une <strong>capacité d’emprunt</strong>, pas par une visite impulsive. <a href=\"./gta-6-netflix-extended-look-immobilier-france-2026.html\">Extended Look &amp; immobilier</a> · <a href=\"" +
          LANDING_IMMO +
          "\">projet acheteur / vendeur</a>.",
      },
      { type: "h2", text: "2. Le crédit gaming ne doit pas précéder le crédit immo" },
      {
        type: "p",
        text:
          "Précommande PS5 Pro + GTA financée sur 24 mois = mensualité dans le taux d’effort. Sur un primo-accédant à Nancy ou Jarville, c’est souvent le détail qui fait reculer la banque. <a href=\"./leonida-vice-gta-6-compte-a-rebours-budget-france.html\">Compte à rebours et budget</a> · <a href=\"./gta-6-pret-immobilier-budget-gaming.html\">GTA 6 et prêt immo</a>.",
      },
      { type: "h2", text: "3. Habitation : le vrai « save game »" },
      {
        type: "p",
        text:
          "Locataire : MRH obligatoire. Propriétaire occupant : indispensable. Bailleur : PNO. Un setup gaming dans le salon change le capital mobilier — voyez <a href=\"./leonida-vice-communaute-gta-6-assurance-setup-france.html\">assurance setup communauté</a>. <a href=\"" +
          LANDING_HAB +
          "\">Questionnaire habitation</a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "4. Où on accompagne (54)" },
      {
        type: "p",
        text:
          "Une seule étude couvre le bassin : <strong>Nancy</strong>, <strong>Jarville-la-Malgrange</strong>, <strong>Varangéville</strong>, Dombasle-sur-Meurthe, Houdemont, Ludres, Saint-Max, Maxéville, Vandœuvre, Laxou, Saint-Nicolas-de-Port. Cabinet à Varangéville, même faisabilité pour tout le 54. <a href=\"" +
          HUB_NANCY +
          "\">Toutes les communes du hub</a> · <a href=\"../pret-immobilier/varangeville/\">prêt à Varangéville</a> · <a href=\"../pret-immobilier/jarville-la-malgrange/\">prêt à Jarville</a>.",
      },
      { type: "h2", text: "5. Checklist après une soirée Leonida Vice" },
      {
        type: "ol",
        items: [
          "Noter si l’envie est un jeu, un déménagement, ou un achat",
          "Si achat : simulation mensualité + assurance emprunteur, sans nouveau crédit conso",
          "Si location / coloc : MRH à jour (vol high-tech)",
          "Investissement locatif « vibe Florida » : cash-flow réel en France, pas un screenshot",
        ],
      },
      {
        type: "p",
        text:
          "Courtier ORIAS à Varangéville : on relie <strong>prêt</strong>, <strong>emprunteur</strong> et <strong>habitation</strong>. L’actu GTA reste sur <a href=\"" +
          PARTNER +
          "\" rel=\"noopener\">Leonida Vice</a>. Le dossier, lui, se construit ici. <a href=\"" +
          LANDING_CREDIT +
          "\"><strong>Étude prêt gratuite</strong></a> · <a href=\"" +
          HUB_NANCY +
          "\">Nancy métropole</a>.",
      },
    ],
    related: [
      { href: "../pret-immobilier/nancy-metropole/", label: "Prêt Nancy métropole" },
      { href: "./gta-6-pret-immobilier-budget-gaming.html", label: "GTA 6 et prêt immo" },
      { href: "./gta-6-netflix-extended-look-immobilier-france-2026.html", label: "Trailer Netflix &amp; immo" },
      { href: "./taux-pret-immobilier-aout-2026-rentree.html", label: "Taux prêt 2026" },
      { href: "./acheter-terrain-nancy-metropole-54-2026.html", label: "Terrain Nancy métropole" },
    ],
    faq: [
      {
        q: "GTA 6 a-t-il un lien avec un prêt immobilier ?",
        a: "Aucun lien juridique. Le lien utile : la hype pousse à dépenser, alors que la banque regarde l’endettement. On sépare loisirs et projet d’achat.",
      },
      {
        q: "Vous accompagnez quels secteurs autour de Nancy ?",
        a: "Nancy, Jarville, Varangéville, Dombasle, Houdemont et les communes du hub Nancy métropole. Cabinet à Varangéville.",
      },
      {
        q: "Un crédit conso GTA 6 empêche-t-il un prêt à Jarville ?",
        a: "Pas automatiquement, mais il réduit la capacité. Sur un dossier juste, mieux vaut le soldé ou l’éviter avant l’offre de prêt.",
      },
    ],
  },
];
