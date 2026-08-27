/**
 * Blog — facturation électronique 2026 (Chorus Pro, plateformes agréées, TPE).
 * CTA : RC Pro / TNS (leads indépendants). Chargé par le manifeste.
 */
var LANDING =
  "../landings/facturation-electronique.html?utm_source=blog&utm_medium=article&utm_campaign=facturation-electronique";
var QPRO =
  "../landings/questionnaire.html?need=rc-pro&journey=standard&utm_source=blog&utm_medium=article&utm_campaign=facturation-electronique";
var QSANT =
  "../landings/questionnaire.html?need=sante&journey=standard&utm_source=blog&utm_medium=article&utm_campaign=facturation-electronique";

var CORE = [
  { href: "./facturation-electronique-obligatoire-2026.html", label: "Guide 2026" },
  { href: "./facturation-electronique-tpe-auto-entrepreneur-2026.html", label: "TPE / auto-entrepreneur" },
  { href: "./chorus-pro-vs-plateforme-agreee-pdp-2026.html", label: "Chorus Pro vs plateforme agréée" },
  { href: "../facturation-electronique/", label: "Hub facturation électronique" },
  { href: "../landings/facturation-electronique.html", label: "Landing + devis RC Pro" },
  { href: "https://www.impots.gouv.fr/professionnel/je-passe-la-facturation-electronique", label: "DGFiP — je passe à la FE" },
  { href: "https://www.impots.gouv.fr/je-consulte-la-liste-des-plateformes-agreees", label: "Liste plateformes agréées" },
  { href: "https://portail.chorus-pro.gouv.fr/", label: "Portail Chorus Pro" },
];

module.exports = [
  {
    file: "facturation-electronique-obligatoire-2026.html",
    audience: "france",
    section: "pro",
    tag: "Facturation électronique",
    tagClass: "tag-pro",
    themes: ["pro", "tns"],
    title: "Facturation électronique obligatoire 2026 : calendrier, PDP, e-reporting",
    description:
      "Réforme facturation électronique 1er septembre 2026 : réception pour toutes les entreprises, émission grandes entreprises et ETI. Chorus Pro, plateformes agréées, e-reporting. Courtier ORIAS.",
    meta: "9 min · Août 2026",
    cardExcerpt: "1er septembre 2026 : toutes les entreprises doivent pouvoir recevoir une facture électronique.",
    keywords: [
      "facturation électronique 2026",
      "facturation électronique obligatoire",
      "e-invoicing france",
      "plateforme agréée pdp",
      "e-reporting dgfip",
    ],
    cta: { href: LANDING, label: "Vérifier mon dossier TPE / RC Pro" },
    blocks: [
      {
        type: "p",
        text: "La <strong>facturation électronique</strong> entre entreprises assujetties à la TVA démarre le <strong>1er septembre 2026</strong>. Ce n’est pas « un PDF par e-mail » : formats structurés (Factur-X, UBL, CII), plateforme agréée, e-reporting. Sources : <a href=\"https://www.impots.gouv.fr/professionnel/je-passe-la-facturation-electronique\" rel=\"noopener\">impots.gouv.fr</a> · <a href=\"https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises\" rel=\"noopener\">economie.gouv.fr</a>. <a href=\"" +
          LANDING +
          "\"><strong>Page pratique + devis RC Pro</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Calendrier officiel" },
      {
        type: "ul",
        items: [
          "<strong>1er septembre 2026</strong> : toutes les entreprises doivent <strong>recevoir</strong> des factures électroniques",
          "<strong>1er septembre 2026</strong> : <strong>émettre</strong> + e-reporting pour les <strong>grandes entreprises et ETI</strong>",
          "<strong>1er septembre 2027</strong> : émission pour PME, TPE, micro-entreprises / auto-entrepreneurs",
        ],
      },
      {
        type: "p",
        text: "Détail TPE : <a href=\"./facturation-electronique-tpe-auto-entrepreneur-2026.html\">article auto-entrepreneur</a> · silo <a href=\"../facturation-electronique/calendrier-2026/\">calendrier</a>.",
      },
      { type: "h2", text: "2. Chorus Pro n’est pas toute la réforme" },
      {
        type: "p",
        text: "Facturer l’État / une collectivité : <strong>Chorus Pro</strong> (déjà obligatoire côté B2G). Facturer une autre entreprise (B2B) : <strong>plateforme agréée</strong> (ex-PDP) listée par la DGFiP. <a href=\"./chorus-pro-vs-plateforme-agreee-pdp-2026.html\">Chorus Pro vs plateforme agréée</a>.",
      },
      { type: "h2", text: "3. Un PDF par mail n’est pas une facture électronique" },
      {
        type: "p",
        text: "La FAQ DGFiP le dit clairement. Il faut un format structuré et un canal agréé. Liste : <a href=\"https://www.impots.gouv.fr/je-consulte-la-liste-des-plateformes-agreees\" rel=\"noopener\">plateformes agréées</a>.",
      },
      { type: "h2", text: "4. Et l’assurance dans tout ça ?" },
      {
        type: "p",
        text: "La réforme ne remplace pas la <strong>RC professionnelle</strong>, la mutuelle TNS ni la prévoyance. Un indépendant qui se met à jour côté factures doit aussi relire ses contrats. <a href=\"" +
          QPRO +
          "\">Questionnaire RC Pro</a> · <a href=\"" +
          QSANT +
          "\">mutuelle TNS</a> · local : <a href=\"./facturation-electronique-nancy-varangeville-54.html\">Nancy / Varangéville</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Toutes les entreprises sont-elles concernées dès 2026 ?",
        a: "Oui pour la réception. L’émission est 2026 pour grandes entreprises et ETI, 2027 pour PME / TPE / micro.",
      },
      {
        q: "Faut-il encore déclarer la TVA ?",
        a: "Oui. L’e-reporting alimente l’administration ; il ne supprime pas vos obligations déclaratives. Voir la FAQ impots.gouv.fr.",
      },
    ],
    related: CORE,
  },
  {
    file: "facturation-electronique-tpe-auto-entrepreneur-2026.html",
    audience: "france",
    section: "pro",
    tag: "TPE / AE",
    tagClass: "tag-pro",
    themes: ["pro", "tns"],
    title: "Facturation électronique TPE et auto-entrepreneur 2026 : ce qui change",
    description:
      "Micro-entrepreneur, TPE : réception obligatoire au 1er septembre 2026, émission en 2027. Franchise en base, B2C, plateforme agréée. Devis RC Pro.",
    meta: "8 min · Août 2026",
    cardExcerpt: "AE / TPE : vous devez déjà pouvoir recevoir une e-facture en septembre 2026.",
    keywords: [
      "facturation électronique auto-entrepreneur",
      "facturation électronique tpe 2026",
      "facturation électronique micro-entreprise",
      "franchise en base facture électronique",
    ],
    cta: { href: LANDING, label: "Checklist TPE + devis RC Pro" },
    blocks: [
      {
        type: "p",
        text: "Même en <strong>micro-entreprise</strong> ou <strong>franchise en base</strong>, vous êtes dans la réforme : au <strong>1er septembre 2026</strong> il faut pouvoir <strong>recevoir</strong> une facture électronique. L’émission suit en <strong>2027</strong> pour les TPE. FAQ DGFiP : <a href=\"https://www.impots.gouv.fr/professionnel/je-passe-la-facturation-electronique\" rel=\"noopener\">Je passe à la facturation électronique</a>. <a href=\"" +
          LANDING +
          "\"><strong>Landing + questionnaire</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. B2B vs B2C" },
      {
        type: "p",
        text: "Clients entreprises (assujettis) : e-invoicing. Clients particuliers : plutôt e-reporting selon les cas. Un mix (coach + entreprises + particuliers) se déclare clairement à la plateforme. Guide : <a href=\"./facturation-electronique-obligatoire-2026.html\">réforme 2026</a>.",
      },
      { type: "h2", text: "2. Logiciel + plateforme agréée" },
      {
        type: "ul",
        items: [
          "Vérifier que l’éditeur (Indy, Pennylane, Tiime, Sellsy…) est <strong>immatriculé</strong> ou raccordé",
          "Ne pas se fier au seul badge marketing : <a href=\"https://www.impots.gouv.fr/je-consulte-la-liste-des-plateformes-agreees\" rel=\"noopener\">liste DGFiP</a>",
          "Chorus Pro si vous facturez le public : <a href=\"./chorus-pro-vs-plateforme-agreee-pdp-2026.html\">article Chorus</a>",
        ],
      },
      { type: "h2", text: "3. RC Pro, mutuelle, prévoyance" },
      {
        type: "p",
        text: "Se mettre en règle sur les factures ne couvre pas un litige client ni un arrêt de travail. <a href=\"" +
          QPRO +
          "\">RC Pro</a> · <a href=\"./prevoyance-independants-guide.html\">prévoyance TNS</a> · <a href=\"./rc-pro-freelance-artisan-guide.html\">guide RC freelance</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Je ne facture pas de TVA : suis-je concerné ?",
        a: "Souvent oui pour la réception. La FAQ DGFiP traite franchise en base et absence de facture : lisez-la avant de conclure que « ça ne me concerne pas ».",
      },
    ],
    related: CORE.concat([{ href: "./rc-pro-freelance-artisan-guide.html", label: "RC Pro freelance" }]),
  },
  {
    file: "chorus-pro-vs-plateforme-agreee-pdp-2026.html",
    audience: "france",
    section: "pro",
    tag: "Chorus Pro",
    tagClass: "tag-pro",
    themes: ["pro"],
    title: "Chorus Pro vs plateforme agréée (PDP) : qui fait quoi en 2026",
    description:
      "Chorus Pro reste le canal B2G. Pour le B2B, une plateforme agréée DGFiP (ex-PDP) est obligatoire. Portail, liste officielle, e-reporting.",
    meta: "8 min · Août 2026",
    cardExcerpt: "Chorus Pro = sphère publique. B2B = plateforme agréée listée par les impôts.",
    keywords: [
      "chorus pro 2026",
      "plateforme agréée facturation électronique",
      "pdp facturation électronique",
      "portail chorus pro",
    ],
    cta: { href: LANDING, label: "Y voir clair + devis pro" },
    blocks: [
      {
        type: "p",
        text: "<strong>Chorus Pro</strong> reste la plateforme de référence pour facturer le <strong>secteur public</strong> (État, collectivités, hôpitaux). Pour facturer une autre <strong>entreprise</strong>, il faut une <strong>plateforme agréée</strong> immatriculée. <a href=\"https://www.impots.gouv.fr/actualite/chorus-pro-restera-la-plateforme-de-reference-pour-la-facturation-electronique-du-secteur\" rel=\"noopener\">Actualité DGFiP Chorus Pro</a>. <a href=\"" +
          LANDING +
          "\"><strong>Landing réforme</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Portail Chorus Pro" },
      {
        type: "p",
        text: "Connexion : <a href=\"https://portail.chorus-pro.gouv.fr/\" rel=\"noopener\">portail.chorus-pro.gouv.fr</a>. Déjà obligatoire pour beaucoup de fournisseurs du public depuis 2017–2020. Silo : <a href=\"../facturation-electronique/chorus-pro/\">page Chorus Pro</a>.",
      },
      { type: "h2", text: "2. Plateformes agréées" },
      {
        type: "p",
        text: "Ancien nom : PDP. La DGFiP publie deux listes (immatriculées après tests / dossiers en attente). <a href=\"https://www.impots.gouv.fr/je-consulte-la-liste-des-plateformes-agreees\" rel=\"noopener\">Liste officielle</a> · <a href=\"../facturation-electronique/plateformes-agreees/\">page silo</a>.",
      },
      { type: "h2", text: "3. Ne pas confondre logiciel et immatriculation" },
      {
        type: "p",
        text: "Un outil de devis peut être « compatible » sans être la plateforme agréée. Vérifiez le nom exact dans le fichier DGFiP (date d’immatriculation). Guide : <a href=\"./facturation-electronique-obligatoire-2026.html\">réforme 2026</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Le PPF de l’État remplace-t-il Chorus Pro pour le B2B ?",
        a: "Non : le B2B privé passe par une plateforme agréée. Chorus Pro reste le canal de la sphère publique. Suivez impots.gouv.fr, pas un résumé LinkedIn.",
      },
    ],
    related: CORE,
  },
  {
    file: "facturation-electronique-nancy-varangeville-54.html",
    audience: "france",
    section: "pro",
    tag: "Meurthe-et-Moselle",
    tagClass: "tag-pro",
    themes: ["pro", "nancy"],
    title: "Facturation électronique à Nancy, Varangéville et en Meurthe-et-Moselle",
    description:
      "TPE et auto-entrepreneurs 54 (Nancy, Varangéville) : réforme 2026, Chorus Pro, plateforme agréée. Courtier ORIAS bassin nancéien, devis RC Pro.",
    meta: "7 min · Août 2026",
    cardExcerpt: "Réforme 2026 dans le 54 : mêmes dates nationales, devis ancré Nancy / Varangéville.",
    keywords: [
      "facturation électronique nancy",
      "facturation électronique varangéville",
      "chorus pro meurthe-et-moselle",
      "plateforme agréée 54",
    ],
    cta: { href: LANDING, label: "Devis TPE Nancy / 54" },
    blocks: [
      {
        type: "p",
        text: "Artisan, AE, profession libérale à <strong>Nancy</strong>, <strong>Varangéville</strong> ou Jarville : le calendrier est <strong>national</strong> (1er septembre 2026 pour la réception). Le conseil, lui, peut être <strong>local</strong>. Orthographe : <strong>Varangéville</strong> (54). <a href=\"" +
          LANDING +
          "\"><strong>Landing + rappel</strong></a>.",
      },
      { type: "bridge" },
      { type: "h2", text: "1. Ce que vous faites concrètement" },
      {
        type: "ul",
        items: [
          "Lire <a href=\"./facturation-electronique-obligatoire-2026.html\">le guide 2026</a>",
          "Vérifier votre logiciel vs <a href=\"https://www.impots.gouv.fr/je-consulte-la-liste-des-plateformes-agreees\" rel=\"noopener\">liste DGFiP</a>",
          "Chorus Pro si marchés publics / collectivités du 54",
        ],
      },
      { type: "h2", text: "2. Contrats pro du même dossier" },
      {
        type: "p",
        text: "<a href=\"./rc-pro-freelance-artisan-guide.html\">RC Pro</a> · <a href=\"./prevoyance-independants-guide.html\">prévoyance TNS</a> · agence <a href=\"../agence-varangeville/\">Varangéville</a>.",
      },
      { type: "bridge" },
    ],
    faq: [
      {
        q: "Y a-t-il un calendrier différent en Meurthe-et-Moselle ?",
        a: "Non. La réforme est nationale. Seuls le logiciel, Chorus Pro (si vous facturez le public) et vos contrats RC / mutuelle se montent avec un conseiller local.",
      },
    ],
    related: CORE.concat([{ href: "../agence-varangeville/", label: "Agence Varangéville" }]),
  },
];
