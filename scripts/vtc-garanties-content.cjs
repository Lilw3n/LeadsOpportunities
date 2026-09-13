/**
 * Contenu riche — page garanties assurance VTC
 * (structure type « catalogue de garanties », rédaction originale LO)
 */
function buildVtcGarantiesPage(page) {
  var BASE = "/assurance-vtc/";
  var LANDING = "/landings/vtc.html";
  var GUARANTEES = [
    {
      id: "conducteur",
      label: "Assurance conducteur",
      hint: "Vous n'etes pas couvert par la RC auto",
      h2: "Assurance du conducteur VTC",
      paragraphs: [
        "La responsabilite civile auto protege les tiers, pas le chauffeur. En cas d'accident, vos frais medicaux, pertes de revenus et sequelles restent a votre charge sans garantie conducteur adaptee.",
        "Pour un VTC qui enchaine les kilometres, cette couverture est souvent le poste le plus sous-estime — et le plus critique pour proteger votre activite.",
      ],
      list: [
        "Frais medicaux, hospitalisation et reeducation",
        "Indemnisation des pertes de revenus pendant l'incapacite",
        "Prejudices corporels et, selon contrat, prejudice moral",
        "Utile meme en cas de tiers non assure ou sous-assure",
      ],
      details: [
        {
          q: "Que couvre l'assurance conducteur VTC ?",
          a: "Les dommages corporels que vous subissez au volant, que vous soyez responsable ou non, dans les limites et franchises du contrat.",
        },
        {
          q: "Pourquoi est-elle si importante pour un chauffeur ?",
          a: "Sans elle, un accident responsable peut couper vos revenus pendant des semaines. La RC auto ne vous indemnise pas personnellement.",
        },
        {
          q: "Que ne couvre-t-elle pas ?",
          a: "Les degats materiels a votre vehicule. Combinez-la avec dommages / tous accidents selon votre besoin.",
        },
      ],
      callout:
        "Conseil LO : verifiez le plafond conducteur et le delai de carence avant de signer — un plafond trop bas ne protège pas un revenu VTC a temps plein.",
    },
    {
      id: "rc-auto",
      label: "RC automobile",
      hint: "Minimum legal pour rouler",
      h2: "Responsabilite civile automobile VTC",
      paragraphs: [
        "La RC auto est le socle obligatoire : elle indemnise les dommages corporels et materiels causes a autrui lorsque vous etes responsable.",
        "Sans elle, pas de circulation legale, pas d'attestation plateforme, et un risque financier potentiellement ruinueux.",
      ],
      list: [
        "Dommages corporels aux tiers (pietons, cyclistes, passagers d'un autre vehicule…)",
        "Dommages materiels (autres vehicules, biens, infrastructures)",
        "Conformite legale et exigences courantes des plateformes",
      ],
      details: [
        {
          q: "La RC auto suffit-elle pour exercer en VTC ?",
          a: "Non. Elle est necessaire mais incomplete : il faut aussi une couverture adaptee a l'usage professionnel / transport de personnes et, le plus souvent, une RC pro.",
        },
        {
          q: "Que ne couvre pas la RC auto ?",
          a: "Vos propres blessures et les dommages a votre vehicule en cas d'accident responsable.",
        },
      ],
      callout:
        "Conseil LO : exigez une attestation mentionnant clairement l'usage VTC / transport de personnes — une auto particuliere peut etre refusee par Uber, Bolt ou Heetch.",
    },
    {
      id: "recours",
      label: "Recours",
      hint: "Quand un tiers est responsable",
      h2: "Garantie recours assurance VTC",
      paragraphs: [
        "Lorsqu'un tiers est responsable, le recours permet de reclamer l'indemnisation de vos dommages (vehicule, corporel, immobilisation) aupres de son assureur.",
        "Sans accompagnement, les delais s'allongent et les offres d'indemnisation restent souvent en dessous du prejudice reel d'un professionnel.",
      ],
      list: [
        "Recours amiable puis judiciaire si besoin",
        "Reparation ou remplacement du vehicule",
        "Indemnisation corporelle et, selon contrat, prejudice d'immobilisation",
      ],
      details: [
        {
          q: "Quand declencher le recours ?",
          a: "Des qu'un tiers est identifie comme responsable. Declarez vite le sinistre et conservez constat, photos et temoignages.",
        },
        {
          q: "Pourquoi c'est strategique en VTC ?",
          a: "Chaque jour d'immobilisation = courses perdues. Un recours efficace accelere le retour sur la route.",
        },
      ],
      callout:
        "Conseil LO : notez l'heure, le lieu et les contacts des temoins — un dossier propre change souvent le montant final.",
    },
    {
      id: "bris-de-glace",
      label: "Bris de glace",
      hint: "Pare-brise, vitres, optiques",
      h2: "Bris de glace vehicule VTC",
      paragraphs: [
        "Gravier, vandalisme, choc de portiere : le bris de glace est un classique sur les parcours urbains et aeroportuaires.",
        "Un pare-brise fissure, c'est aussi un risque controle technique / securite passagers et une immobilisation avoidable.",
      ],
      list: [
        "Pare-brise, vitres laterales, lunette arriere (selon contrat)",
        "Parfois optiques et toits vitres — a verifier explicitement",
        "Franchise souvent plus basse que sur un sinistre collision",
      ],
      details: [
        {
          q: "Pourquoi la prioriser en VTC ?",
          a: "Le kilometrage eleve multiplie les impacts. Remplacer un pare-brise sans garantie peut manger plusieurs jours de courses.",
        },
        {
          q: "Comment se passe l'indemnisation ?",
          a: "Declaration, photos, puis reparation ou remplacement via reseau agree. Demandez si la franchise est reduite en reparation (vs remplacement).",
        },
      ],
      callout:
        "Conseil LO : comparez franchise reparation vs remplacement — sur un eclat, reparer revient souvent moins cher.",
    },
    {
      id: "vol",
      label: "Vol",
      hint: "Vol total, partiel, tentative",
      h2: "Garantie vol vehicule VTC",
      paragraphs: [
        "Le vehicule est votre outil de production. Un vol (ou une tentative) stoppe net l'activite et peut entrainer des frais lourds.",
        "La garantie vol indemnise sous conditions (effraction, plainte, mesures de prevention prevues au contrat).",
      ],
      list: [
        "Vol total du vehicule",
        "Tentative de vol avec traces d'effraction",
        "Vol partiel (roues, retroviseurs, equipements) selon contrat",
      ],
      details: [
        {
          q: "Quelles conditions pour etre indemnise ?",
          a: "En general : depot de plainte, indices d'effraction, declaration rapide, et respect des mesures de securite exigées (alarme, garage…).",
        },
        {
          q: "Que faire immediatement ?",
          a: "Plainte, puis declaration a l'assureur avec photos et inventaire. Demandez si un vehicule de remplacement est prevu.",
        },
      ],
      callout:
        "Conseil LO : en IDF et grandes villes, le stationnement de nuit pese lourd au tarif — declarez-le honnetement pour eviter un litige.",
    },
    {
      id: "incendie",
      label: "Incendie",
      hint: "Feu, foudre, explosion",
      h2: "Garantie incendie vehicule VTC",
      paragraphs: [
        "Incendie accidentel, malveillance, foudre ou explosion : les dommages peuvent etre totaux et immobiliser le vehicule longtemps.",
        "Cette garantie protege l'outil de travail sur ces evenements majeurs, dans les limites du contrat.",
      ],
      list: [
        "Incendie (accidentel ou criminel selon clauses)",
        "Foudre et dommages electriques associes",
        "Explosion",
      ],
      details: [
        {
          q: "Comment se passe l'expertise ?",
          a: "Un expert evalue le cout des reparations. Au-dela d'un seuil, l'assureur peut proposer une indemnisation pour perte totale.",
        },
        {
          q: "Vehicule de remplacement ?",
          a: "Selon options : verifiez duree, categorie et franchise avant de souscrire.",
        },
      ],
      callout:
        "Conseil LO : conservez les preuves d'entretien — utiles si l'assureur interroge l'origine du sinistre.",
    },
    {
      id: "dommages",
      label: "Dommages / vandalisme",
      hint: "Tous accidents & actes malveillants",
      h2: "Dommages tous accidents et vandalisme",
      paragraphs: [
        "Collision responsable, sortie de route, vandalisme sur parking : ces garanties couvrent les degats a votre propre vehicule au-dela de la seule RC.",
        "Pour un VTC recent ou finance (LOA/LLD), elles sont souvent indispensables pour proteger la valeur residuelle.",
      ],
      list: [
        "Dommages tous accidents (y compris responsable)",
        "Vandalisme et actes de malveillance",
        "Franchise et valeur a neuf / valeur a dire d'expert a comparer",
      ],
      details: [
        {
          q: "Tous risques = zero franchise ?",
          a: "Non. Verifiez toujours le montant de franchise et les exclusions (usure, negligence, courses non declarees…).",
        },
        {
          q: "LOA / LLD : attention",
          a: "Le bailleur exige souvent une formule etendue. Un trou de garantie peut vous laisser redevable du solde.",
        },
      ],
      callout:
        "Conseil LO : sur un vehicule finance, alignez la formule sur les exigences du contrat de location avant de chercher le prix le plus bas.",
    },
    {
      id: "panne",
      label: "Panne / assistance",
      hint: "Depannage et immobilisation",
      h2: "Panne mecanique et assistance VTC",
      paragraphs: [
        "Une panne en pleine journee de courses, c'est du chiffre d'affaires perdu. Assistance et garanties panne limitent le temps d'arret.",
        "Les contrats varient fortement : rayon de depannage, vehicule de pret, exclusions sur usure ou defaut d'entretien.",
      ],
      list: [
        "Depannage / remorquage (seuils kilometriques a verifier)",
        "Assistance 0 km selon formules",
        "Parfois extension panne mecanique (hors usure)",
      ],
      details: [
        {
          q: "Assistance plateforme vs assurance ?",
          a: "Les apps offrent parfois une aide ponctuelle, mais ce n'est pas un substitut a une assistance contrat complete.",
        },
        {
          q: "Point de vigilance",
          a: "Les pannes liees a un defaut d'entretien sont souvent exclues. Gardez le carnet a jour.",
        },
      ],
      callout:
        "Conseil LO : regardez le plafond d'immobilisation et le delai de prise en charge — plus que le seul libelle « assistance ».",
    },
    {
      id: "immobilisation",
      label: "Indemnite immobilisation",
      hint: "Compenser les courses perdues",
      h2: "Indemnite d'immobilisation VTC",
      paragraphs: [
        "Quand le vehicule est immobilise apres sinistre, vos revenus chutent. Une indemnite d'immobilisation (ou perte d'exploitation) vise a compenser une partie de ce manque a gagner.",
        "Montant journalier, duree max et delai de franchise (jours non indemnisés) font toute la difference.",
      ],
      list: [
        "Indemnite journaliere plafonnee",
        "Duree maximale d'indemnisation",
        "Delai de carence / franchise en jours",
      ],
      details: [
        {
          q: "Comment estimer le besoin ?",
          a: "Basez-vous sur votre CA moyen journalier net de charges variables, puis comparez aux plafonds proposes.",
        },
        {
          q: "Avec ou sans vehicule de remplacement ?",
          a: "Les deux se completent : le pret limite l'arret, l'indemnite couvre le manque a gagner residuel.",
        },
      ],
      callout:
        "Conseil LO : une indemnite trop basse (ou avec 7 jours de franchise) peut etre inutile pour un VTC a fort rythme.",
    },
    {
      id: "rc-pro",
      label: "RC professionnelle",
      hint: "Transport de personnes",
      h2: "Responsabilite civile professionnelle VTC",
      paragraphs: [
        "La RC pro couvre les dommages causes a des tiers dans le cadre de votre activite professionnelle, au-dela de la seule circulation.",
        "Elle est au coeur des exigences plateforme et du cadre legal du transport de personnes a titre onereux.",
      ],
      list: [
        "Dommages lies a l'exercice de l'activite VTC",
        "Plafonds de garantie a verifier ligne a ligne",
        "Defense / recours selon contrats",
      ],
      details: [
        {
          q: "RC auto et RC pro : quelle difference ?",
          a: "La RC auto traite l'accident de circulation. La RC pro couvre le risque professionnel du metier (cadre d'activite, obligations specifiques).",
        },
        {
          q: "Que verifier avant de signer ?",
          a: "Plafonds corporels, exclusions, territorialite, et compatibilite explicite avec Uber / Bolt / Heetch.",
        },
      ],
      callout:
        "Conseil LO : demandez une attestation RC pro nominative et a jour avant chaque renouvellement de documents plateforme.",
    },
  ];

  var navGrid = GUARANTEES.map(function (g) {
    return { id: g.id, label: g.label, hint: g.hint };
  });

  var sections = [
    {
      h2: "Les garanties VTC a connaitre avant de signer",
      paragraphs: [
        "Un bon contrat VTC n'est pas seulement « pas cher » : c'est un ensemble de garanties qui protegent votre revenu, vos passagers et votre vehicule. Voici le panorama clair des postes a comparer — obligatoire, fortement recommande, ou optionnel selon votre situation.",
        "Chez Leads Opportunities, un courtier ORIAS vous explique chaque ligne a garanties equivalentes, sans jargon inutile.",
      ],
      navGrid: navGrid,
    },
    {
      h2: "Obligatoire vs utile : ce que dit vraiment le terrain",
      paragraphs: [
        "La loi et les plateformes imposent un socle (RC auto adaptee + couverture professionnelle). Le reste depend de votre vehicule (age, financement), de votre zone (IDF, aeroports) et de votre tolerance au risque.",
        "Mal dimensionne, un contrat bas de gamme peut couter plus cher qu'une bonne formule des le premier sinistre.",
      ],
      list: [
        "Socle : RC auto usage pro / VTC + RC professionnelle",
        "Fortement recommande : conducteur, bris de glace, assistance",
        "Selon profil : vol, incendie, dommages, immobilisation",
      ],
    },
  ];

  GUARANTEES.forEach(function (g) {
    sections.push({
      id: g.id,
      h2: g.h2,
      paragraphs: g.paragraphs,
      list: g.list,
      details: g.details,
      callout: g.callout,
    });
  });

  sections.push({
    h2: "Trois questions qui font basculer un contrat",
    paragraphs: [
      "Avant de signer, posez ces trois points a votre courtier ou a l'assureur. Les reponses evitent la plupart des mauvaises surprises.",
    ],
    list: [
      "L'usage VTC / transport de personnes est-il explicitement garanti ?",
      "Quelles franchises s'appliquent sur bris de glace, collision et vol ?",
      "Que se passe-t-il si le vehicule est immobilise 10 jours (pret, indemnite, plafonds) ?",
    ],
  });

  return page({
    file: "assurance-vtc/garanties/index.html",
    theme: "vtc",
    badge: "Garanties VTC",
    title: "Garanties assurance VTC | Conducteur, RC, vol, bris de glace…",
    description:
      "Toutes les garanties assurance VTC expliquees : conducteur, RC auto, recours, bris de glace, vol, incendie, dommages, panne, immobilisation, RC pro. Devis courtier ORIAS.",
    h1: "Garanties assurance VTC : le detail qui protege votre activite",
    intro:
      "Conducteur, RC, bris de glace, vol, incendie, dommages, panne, immobilisation, RC pro : comprenez chaque garantie avant de comparer les tarifs. Devis gratuit, rappel rapide.",
    cta: { href: LANDING, label: "Obtenir mon devis VTC" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance VTC", url: BASE },
      { name: "Garanties", url: BASE + "garanties/" },
    ],
    benefits: [
      { title: "Lecture claire", text: "Chaque garantie expliquee sans jargon, avec ce qui est couvert et ce qui ne l'est pas." },
      { title: "Comparatif equivalent", text: "Nous confrontons les offres a postes comparables, pas au seul prix affiche." },
      { title: "Courtier ORIAS", text: "Un conseiller VTC pour cadrer franchises, plafonds et exigences plateformes." },
    ],
    steps: [
      { title: "Ciblez vos priorites", text: "Socle legal, vehicule finance, zone IDF / aeroport…" },
      { title: "On compare", text: "Garanties, franchises et exclusions cote a cote." },
      { title: "Vous validez", text: "Devis detaille, sans obligation de souscrire." },
    ],
    sections: sections,
    related: [
      { href: BASE, label: "Guide assurance VTC" },
      { href: BASE + "rc-pro/", label: "RC Pro VTC" },
      { href: BASE + "tarif/", label: "Tarif VTC" },
      { href: BASE + "uber-bolt/", label: "Uber, Bolt, Heetch" },
      { href: BASE + "comparatif-assureurs/", label: "Comparatif assureurs" },
      { href: "/blog/assurance-vtc-rc-pro-garanties.html", label: "Article RC Pro & garanties" },
      { href: "/blog/assurance-vtc-franchise-garanties-2026.html", label: "Franchises & garanties 2026" },
      { href: LANDING, label: "Devis VTC" },
    ],
    faq: [
      {
        q: "Quelles garanties sont obligatoires pour un VTC ?",
        a: "Au minimum une RC auto adaptee a l'activite et une couverture professionnelle (RC pro). Les plateformes exigent des attestations conformes avant activation.",
      },
      {
        q: "Puis-je rouler avec une assurance auto particuliere ?",
        a: "En general non pour une activite VTC declaree. L'usage professionnel / transport de personnes doit etre explicitement garanti.",
      },
      {
        q: "Comment obtenir un devis garanties incluses ?",
        a: "Via notre landing VTC : un conseiller ORIAS vous rappelle pour caler les postes (conducteur, bris de glace, dommages, immobilisation…) selon votre profil.",
      },
      {
        q: "Quelle difference entre RC auto et RC pro ?",
        a: "La RC auto couvre les dommages aux tiers en circulation. La RC pro couvre le risque lie a l'exercice professionnel du transport de personnes.",
      },
    ],
  });
}

function buildVtcGarantiesObligatoiresAlias(page) {
  var BASE = "/assurance-vtc/";
  var LANDING = "/landings/vtc.html";
  return page({
    file: "assurance-vtc/garanties-obligatoires/index.html",
    theme: "vtc",
    badge: "Socle legal",
    title: "Garanties obligatoires assurance VTC | RC auto & RC pro",
    description:
      "Garanties obligatoires VTC : RC automobile et RC professionnelle. Complements recommandes pour chauffeurs Uber Bolt Heetch. Devis courtier ORIAS.",
    h1: "Garanties obligatoires VTC : le socle avant la premiere course",
    intro:
      "Avant Uber, Bolt ou Heetch, verifiez le minimum legal et professionnel. Puis completez conducteur, bris de glace et immobilisation selon votre risque.",
    cta: { href: LANDING, label: "Obtenir mon devis VTC" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance VTC", url: BASE },
      { name: "Garanties obligatoires", url: BASE + "garanties-obligatoires/" },
    ],
    benefits: [
      { title: "Conformite", text: "RC auto usage pro + RC pro : le duo exige par le cadre legal et les plateformes." },
      { title: "Sans mauvaise surprise", text: "On verifie que l'attestation mentionne bien l'activite VTC." },
      { title: "Complements utiles", text: "Conducteur, bris de glace, vol, dommages : on les dimensionne ensuite." },
    ],
    sections: [
      {
        h2: "Le minimum pour exercer",
        paragraphs: [
          "Sans attestation conforme, les plateformes bloquent l'acces aux courses. Le socle combine responsabilite civile automobile adaptee et responsabilite civile professionnelle.",
        ],
        list: [
          "RC automobile avec usage transport de personnes / VTC",
          "RC professionnelle a plafonds adaptes",
          "Attestations nominatives a jour",
        ],
      },
      {
        h2: "Completer le socle",
        paragraphs: [
          "Le detail de chaque garantie (conducteur, recours, bris de glace, vol, incendie, dommages, panne, immobilisation) est sur notre page catalogue.",
        ],
        list: [
          "Voir le detail : /assurance-vtc/garanties/",
          "RC Pro dediee : /assurance-vtc/rc-pro/",
          "Devis : /landings/vtc.html",
        ],
      },
    ],
    related: [
      { href: BASE + "garanties/", label: "Toutes les garanties VTC" },
      { href: BASE + "rc-pro/", label: "RC Pro VTC" },
      { href: BASE, label: "Guide assurance VTC" },
      { href: LANDING, label: "Devis VTC" },
    ],
    faq: [
      {
        q: "Quelles sont les garanties obligatoires VTC ?",
        a: "RC auto adaptee a l'activite et RC professionnelle. Le reste depend de votre vehicule, financement et zone.",
      },
      {
        q: "Ou voir le detail de chaque garantie ?",
        a: "Sur la page Garanties assurance VTC : conducteur, recours, bris de glace, vol, incendie, dommages, panne, immobilisation, RC pro.",
      },
    ],
  });
}

module.exports = {
  buildVtcGarantiesPage: buildVtcGarantiesPage,
  buildVtcGarantiesObligatoiresAlias: buildVtcGarantiesObligatoiresAlias,
};
