/**
 * Pages SEO longue traine — silo assurance taxi
 */
const {
  buildTaxiGarantiesPage,
  buildTaxiGarantiesObligatoiresAlias,
} = require("./taxi-garanties-content.cjs");

function buildTaxiLongtailPages(page) {
  const BASE = "/assurance-taxi/";
  const LANDING = "/landings/taxi.html";
  const LANDING_EXPRESS = "/landings/devis-rapide.html";

  function lt(data) {
    return page(
      Object.assign(
        {
          theme: "taxi",
          cta: { href: LANDING, label: data.ctaLabel || "Devis assurance taxi" },
          benefits: [
            { title: "Courtier ORIAS", text: "Conseil specialise chauffeurs de taxi." },
            { title: "Partenaires connus", text: "AXA, Generali, Allianz et specialistes taxi…" },
            { title: "Devis gratuit", text: "Comparatif sans engagement." },
          ],
          related: data.related || [
            { href: BASE, label: "Guide assurance taxi" },
            { href: BASE + "garanties/", label: "Garanties taxi" },
            { href: BASE + "tarif/", label: "Tarif taxi" },
            { href: LANDING_EXPRESS + "?need=taxi", label: "Devis express 30 sec" },
          ],
        },
        data
      )
    );
  }

  return [
    buildTaxiGarantiesPage(page),
    buildTaxiGarantiesObligatoiresAlias(page),
    lt({
      file: "assurance-taxi/rc-pro/index.html",
      badge: "RC Pro",
      title: "RC Pro taxi | Responsabilite civile professionnelle",
      description:
        "RC Pro taxi obligatoire : dommages aux clients, defense. Devis chauffeur, courtier ORIAS.",
      h1: "RC Pro taxi : la garantie incontournable",
      intro:
        "Sans RC professionnelle adaptee au transport de personnes, vous exposez votre activite et vos revenus. Nous verifions plafonds et exclusions avant toute recommandation.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance taxi", url: BASE },
        { name: "RC Pro", url: BASE + "rc-pro/" },
      ],
      related: [
        { href: BASE + "garanties/", label: "Toutes les garanties taxi" },
        { href: BASE + "garanties/#rc-pro", label: "Detail RC pro" },
        { href: BASE + "creation-activite/", label: "Creer son activite taxi" },
        { href: LANDING, label: "Devis taxi" },
      ],
      sections: [
        {
          h2: "Pourquoi la RC pro est critique en taxi",
          paragraphs: [
            "Au-dela de la RC auto, la RC pro couvre les dommages causes dans le cadre de l'activite (clients, bagages, incidents hors collision).",
            "Les controles et le cadre legal du TPT exigent des attestations a jour. Un plafond trop bas ou une exclusion mal lue peut couter cher.",
          ],
          list: [
            "Attestation nominative RC pro a conserver a bord",
            "Plafonds corporels et materiels a comparer",
            "Defense / recours selon contrats",
          ],
        },
      ],
      faq: [
        {
          q: "La RC pro taxi est-elle obligatoire ?",
          a: "Oui, dans le cadre du transport de personnes a titre onereux. Elle complete la RC automobile.",
        },
      ],
    }),
    lt({
      file: "assurance-taxi/creation-activite/index.html",
      badge: "Creation",
      title: "Assurance taxi creation d activite | Nouvelle licence ADS",
      description:
        "Assurer son taxi avant la premiere course : ADS, vehicule, RC Pro, TPT. Devis courtier.",
      h1: "Assurance taxi en creation d activite",
      intro:
        "Vous preparez votre ADS ou venez de l obtenir ? Anticiper l assurance des la reservation du vehicule evite les refus de prise en charge.",
      ctaLabel: "Devis taxi creation",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance taxi", url: BASE },
        { name: "Creation activite", url: BASE + "creation-activite/" },
      ],
      related: [
        { href: BASE + "garanties-obligatoires/", label: "Garanties obligatoires" },
        { href: BASE + "rc-pro/", label: "RC Pro taxi" },
        { href: LANDING, label: "Devis taxi" },
      ],
      sections: [
        {
          h2: "Avant la premiere course",
          paragraphs: [
            "Licence / ADS, carte professionnelle, vehicule conforme et attestation TPT : le parcours creation demande d'aligner l'assurance des le premier jour.",
            "Nous vous aidons a monter un dossier assureur complet (usage, kilometrage, stationnement, antecedents).",
          ],
          list: [
            "Attestations TPT + RC pro nominatives",
            "Formule adaptee si vehicule en LOA / LLD",
            "Options vehicule relais et perte d'exploitation",
          ],
        },
      ],
    }),
    lt({
      file: "assurance-taxi/tarif/index.html",
      badge: "Tarif",
      title: "Tarif assurance taxi | Comprendre le prix 2026",
      description:
        "Comprendre le tarif assurance taxi : zone, vehicule, sinistralite, franchises. Devis courtier ORIAS.",
      h1: "Tarif assurance taxi : ce qui fait varier le prix",
      intro:
        "Le prix depend de votre zone, du vehicule, de l'historique et des garanties choisies. Nous expliquons chaque levier avant de comparer.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance taxi", url: BASE },
        { name: "Tarif", url: BASE + "tarif/" },
      ],
      sections: [
        {
          h2: "Les leviers de tarif",
          paragraphs: [
            "Zone urbaine / aeroport, stationnement de nuit, puissance fiscale, bonus-malus et options (relais, tous risques) pèsent sur la prime.",
            "Un tarif bas sans TPT explicite n'est pas un bon deal : comparez a garanties equivalentes.",
          ],
          list: [
            "Usage et zone d'exercice",
            "Vehicule (age, valeur, financement)",
            "Franchises et options (relais, immobilisation)",
          ],
        },
      ],
      related: [
        { href: BASE + "garanties/", label: "Garanties taxi" },
        { href: BASE + "devis-rapide/", label: "Devis rapide" },
        { href: LANDING, label: "Obtenir un devis" },
      ],
    }),
    lt({
      file: "assurance-taxi/devis-rapide/index.html",
      badge: "Devis express",
      title: "Devis assurance taxi rapide | Reponse sous 15 minutes",
      description:
        "Demandez un devis assurance taxi en ligne : formulaire guide, comparatif, rappel conseiller sous 15 minutes. Gratuit et sans engagement.",
      h1: "Devis assurance taxi rapide",
      intro:
        "Decrivez votre activite taxi : nous comparons les offres et un conseiller ORIAS vous rappelle rapidement.",
      ctaLabel: "Lancer mon devis taxi",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance taxi", url: BASE },
        { name: "Devis rapide", url: BASE + "devis-rapide/" },
      ],
      related: [
        { href: LANDING, label: "Formulaire devis taxi" },
        { href: BASE + "tarif/", label: "Comprendre le tarif" },
        { href: BASE + "garanties/", label: "Garanties taxi" },
      ],
      sections: [
        {
          h2: "Comment ca se passe",
          paragraphs: [
            "Vous renseignez vehicule, zone et statut. Nous filtrons les contrats compatibles taxi / TPT puis vous rappelons avec un comparatif clair.",
          ],
          list: [
            "Gratuit et sans engagement",
            "Focus attestations TPT et RC pro",
            "Rappel sous 15 min en heures ouvrables",
          ],
        },
      ],
    }),
    lt({
      file: "assurance-taxi/resiliation/index.html",
      badge: "Resiliation",
      title: "Resiliation assurance taxi | Renouvellement & loi Hamon",
      description:
        "Resilier ou changer d assurance taxi : echeance, loi Hamon, comparatif. Courtier ORIAS.",
      h1: "Changer d assurance taxi au bon moment",
      intro:
        "Renouveler sans comparer peut vous couter des centaines d euros par an. Nous vous aidons a preparer la bascule sans interruption de garanties.",
      crumbs: [
        { name: "Accueil", url: "/" },
        { name: "Assurance taxi", url: BASE },
        { name: "Resiliation", url: BASE + "resiliation/" },
      ],
      related: [
        { href: BASE + "garanties/", label: "Garanties taxi" },
        { href: LANDING, label: "Devis taxi" },
      ],
      sections: [
        {
          h2: "Basculer sans trou de garantie",
          paragraphs: [
            "L'enjeu : nouvelles attestations TPT / RC pro disponibles avant de resilier l'ancien contrat. On cadencie la transition avec vous.",
          ],
          list: [
            "Echeance annuelle ou loi Hamon selon cas",
            "Attestations pretes avant bascule",
            "Comparatif a garanties equivalentes",
          ],
        },
      ],
    }),
  ];
}

function buildTaxiHubPage(page) {
  const BASE = "/assurance-taxi/";
  const LANDING = "/landings/taxi.html";
  return page({
    file: "assurance-taxi/index.html",
    theme: "taxi",
    badge: "Mobilite pro",
    title: "Assurance taxi | Devis, garanties TPT et RC pro 2026",
    description:
      "Assurance taxi pour chauffeurs et creation d activite : TPT, RC pro, garanties, franchises. Devis rapide avec courtier ORIAS, sans engagement.",
    h1: "Assurance taxi : la bonne couverture pour rouler sereinement",
    intro:
      "Que vous soyez chauffeur de taxi confirme ou en creation d activite (ADS), nous comparons les offres du marche a garanties equivalentes. Un conseiller specialise vous explique chaque poste avant de signer.",
    cta: { href: LANDING, label: "Obtenir mon devis taxi" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance taxi", url: BASE },
    ],
    benefits: [
      { title: "Conseil humain", text: "Pas de comparateur aveugle : un courtier analyse votre profil taxi." },
      { title: "Garanties clarifiees", text: "TPT, RC pro, vehicule relais, perte d'exploitation : tout est explique." },
      { title: "Reponse rapide", text: "Rappel sous 15 min en heures ouvrables apres votre demande." },
    ],
    steps: [
      { title: "Decrivez votre activite", text: "Vehicule, zone, ADS / licence, antecedents." },
      { title: "Nous comparons", text: "Selection d offres adaptees a l usage taxi / TPT." },
      { title: "Vous decidez", text: "Devis detaille, sans obligation de souscription." },
    ],
    sections: [
      {
        h2: "Pourquoi une assurance dediee taxi ?",
        paragraphs: [
          "L assurance auto classique ne couvre en general pas l activite de transport de personnes a titre onereux. Une police taxi aligne vos garanties sur le cadre legal et les controles d activite.",
          "Mal assure, vous exposez votre activite a des refus de prise en charge et a des sanctions. Bien assure, vous roulez en conformite avec un budget maitrise.",
        ],
      },
      {
        h2: "Nos services d assurances pour taxi",
        paragraphs: [
          "Nous concentrons le devis sur l essentiel du metier : vehicule, activite et revenus. D autres contrats (sante independant, habitation) peuvent completer selon votre situation — sans diluer le sujet taxi.",
        ],
        list: [
          "Assurance auto taxi (RC, dommages, bris de glace, vol, incendie)",
          "Assurance activite : RC pro + usage TPT",
          "Options vehicule relais et perte d exploitation",
          "Complement possible : sante independant / habitation (parcours separe)",
        ],
      },
      {
        h2: "Panorama des garanties taxi",
        paragraphs: [
          "Avant de comparer un tarif, alignez les postes : conducteur, RC auto, TPT, RC pro, bris de glace, vol, incendie, dommages, vehicule relais et perte d exploitation.",
          "Notre page dediee detaille chaque garantie, ce qu elle couvre, et les pieges frequents — puis un courtier ORIAS vous propose un devis a garanties equivalentes.",
        ],
        navGrid: [
          { id: "conducteur", href: "/assurance-taxi/garanties/#conducteur", label: "Conducteur", hint: "Detail des garanties" },
          { id: "rc-auto", href: "/assurance-taxi/garanties/#rc-auto", label: "RC auto", hint: "Socle legal" },
          { id: "tpt", href: "/assurance-taxi/garanties/#tpt", label: "Usage TPT", hint: "Titre onereux" },
          { id: "rc-pro", href: "/assurance-taxi/garanties/#rc-pro", label: "RC pro", hint: "Activite pro" },
          { id: "bris-de-glace", href: "/assurance-taxi/garanties/#bris-de-glace", label: "Bris de glace", hint: "Pare-brise & vitres" },
          { id: "vol", href: "/assurance-taxi/garanties/#vol", label: "Vol", hint: "Total / partiel" },
          { id: "incendie", href: "/assurance-taxi/garanties/#incendie", label: "Incendie", hint: "Feu & explosion" },
          { id: "dommages", href: "/assurance-taxi/garanties/#dommages", label: "Dommages", hint: "Tous accidents" },
          { id: "vehicule-relais", href: "/assurance-taxi/garanties/#vehicule-relais", label: "Vehicule relais", hint: "Continuer a rouler" },
          { id: "perte-exploitation", href: "/assurance-taxi/garanties/#perte-exploitation", label: "Perte d exploitation", hint: "Courses perdues" },
        ],
        list: [
          "Guide complet : /assurance-taxi/garanties/",
          "Socle obligatoire : /assurance-taxi/garanties-obligatoires/",
          "Devis chauffeur : /landings/taxi.html",
        ],
      },
      {
        h2: "Pourquoi passer par un courtier ?",
        paragraphs: [
          "Un courtier compare plusieurs compagnies, negocie les conditions et vous accompagne au sinistre. Pour un taxi, l enjeu principal reste la conformite TPT et la continuite d activite apres immobilisation.",
          "Leads Opportunities vous garantit une lecture claire des franchises et des attestations avant de signer.",
        ],
        callout:
          "Conseil LO : un devis « pas cher » sans mention TPT explicite n est pas un devis taxi — exigez l attestation des le premier echange.",
      },
    ],
    related: [
      { href: BASE + "garanties/", label: "Garanties assurance taxi" },
      { href: BASE + "garanties-obligatoires/", label: "Garanties obligatoires" },
      { href: BASE + "devis-rapide/", label: "Devis assurance taxi rapide" },
      { href: BASE + "tarif/", label: "Comprendre le tarif taxi" },
      { href: BASE + "rc-pro/", label: "RC Pro taxi" },
      { href: BASE + "creation-activite/", label: "Creation d activite" },
      { href: BASE + "resiliation/", label: "Resiliation / changement" },
      { href: "/assurance-vtc/", label: "Aussi en VTC ?" },
      { href: LANDING, label: "Devis taxi" },
    ],
    faq: [
      {
        q: "Quelle assurance est obligatoire pour un chauffeur de taxi ?",
        a: "La responsabilite civile professionnelle et une assurance vehicule adaptee a l activite taxi avec usage TPT sont indispensables avant de prendre des courses.",
      },
      {
        q: "Combien de temps pour obtenir un devis ?",
        a: "En moyenne sous 15 minutes en heures ouvrables apres envoi du formulaire.",
      },
      {
        q: "Proposez-vous aussi sante ou habitation ?",
        a: "Oui en complement, via des parcours dedies. Le devis taxi reste centre sur le vehicule et l activite professionnelle.",
      },
    ],
  });
}

function getTaxiLongtailSitemapEntries(base) {
  const today = new Date().toISOString().slice(0, 10);
  const paths = [
    "/assurance-taxi/",
    "/assurance-taxi/garanties/",
    "/assurance-taxi/garanties-obligatoires/",
    "/assurance-taxi/rc-pro/",
    "/assurance-taxi/creation-activite/",
    "/assurance-taxi/tarif/",
    "/assurance-taxi/devis-rapide/",
    "/assurance-taxi/resiliation/",
  ];
  return paths.map(function (p) {
    return { loc: base + p, lastmod: today, changefreq: "weekly", priority: "0.87" };
  });
}

module.exports = {
  buildTaxiHubPage: buildTaxiHubPage,
  buildTaxiLongtailPages: buildTaxiLongtailPages,
  getTaxiLongtailSitemapEntries: getTaxiLongtailSitemapEntries,
};
