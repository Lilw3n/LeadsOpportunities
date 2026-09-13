/**
 * Contenu riche — page garanties assurance taxi
 * (catalogue de garanties, rédaction originale LO — angle taxi / ADS / TPT)
 */
function buildTaxiGarantiesPage(page) {
  var BASE = "/assurance-taxi/";
  var LANDING = "/landings/taxi.html";
  var GUARANTEES = [
    {
      id: "conducteur",
      label: "Assurance conducteur",
      hint: "Vous n'etes pas couvert par la RC auto",
      h2: "Assurance du conducteur taxi",
      paragraphs: [
        "La responsabilite civile auto protege les tiers, pas le chauffeur. En cas d'accident, vos frais medicaux, pertes de revenus et sequelles restent a votre charge sans garantie conducteur adaptee.",
        "Pour un taxi qui enchaine les stations, aeroports et nuits, cette couverture est souvent le poste le plus sous-estime — et le plus critique pour proteger votre activite.",
      ],
      list: [
        "Frais medicaux, hospitalisation et reeducation",
        "Indemnisation des pertes de revenus pendant l'incapacite",
        "Prejudices corporels et, selon contrat, prejudice moral",
        "Utile meme en cas de tiers non assure ou sous-assure",
      ],
      details: [
        {
          q: "Que couvre l'assurance conducteur taxi ?",
          a: "Les dommages corporels que vous subissez au volant, que vous soyez responsable ou non, dans les limites et franchises du contrat.",
        },
        {
          q: "Pourquoi est-elle si importante pour un taxi ?",
          a: "Sans elle, un accident responsable peut couper vos revenus pendant des semaines. La RC auto ne vous indemnise pas personnellement.",
        },
        {
          q: "Que ne couvre-t-elle pas ?",
          a: "Les degats materiels a votre vehicule. Combinez-la avec dommages / tous accidents selon votre besoin.",
        },
      ],
      callout:
        "Conseil LO : verifiez le plafond conducteur et le delai de carence avant de signer — un plafond trop bas ne protege pas un revenu taxi a temps plein.",
    },
    {
      id: "rc-auto",
      label: "RC automobile",
      hint: "Minimum legal pour rouler",
      h2: "Responsabilite civile automobile taxi",
      paragraphs: [
        "La RC auto est le socle obligatoire : elle indemnise les dommages corporels et materiels causes a autrui lorsque vous etes responsable.",
        "Sans elle, pas de circulation legale, pas d'attestation pour les controles, et un risque financier potentiellement ruineux.",
      ],
      list: [
        "Dommages corporels aux tiers (pietons, cyclistes, passagers d'un autre vehicule…)",
        "Dommages materiels (autres vehicules, biens, infrastructures)",
        "Conformite legale et exigences de la police des taxis",
      ],
      details: [
        {
          q: "La RC auto suffit-elle pour exercer en taxi ?",
          a: "Non. Elle est necessaire mais incomplete : il faut une couverture explicite transport de personnes a titre onereux (TPT) et, le plus souvent, une RC pro.",
        },
        {
          q: "Que ne couvre pas la RC auto ?",
          a: "Vos propres blessures et les dommages a votre vehicule en cas d'accident responsable.",
        },
      ],
      callout:
        "Conseil LO : exigez une attestation mentionnant clairement l'usage taxi / TPT — une auto particuliere est refusee en controle.",
    },
    {
      id: "tpt",
      label: "Usage TPT",
      hint: "Transport de personnes a titre onereux",
      h2: "Transport de personnes a titre onereux (TPT)",
      paragraphs: [
        "L'assurance taxi doit obligatoirement couvrir l'usage du vehicule en transport de personnes a titre onereux. Sans cette mention, le contrat peut etre inopposable en sinistre.",
        "En controle (police des taxis), l'attestation TPT et la RC pro doivent etre presentables. C'est un point non negociable avant de prendre la route.",
      ],
      list: [
        "Mention explicite TPT / usage taxi sur le contrat",
        "Attestation nominative a jour a conserver a bord",
        "Compatibilite avec ADS / licence et zone d'exercice",
      ],
      details: [
        {
          q: "Pourquoi le TPT change tout ?",
          a: "Une auto « particulier » ne couvre pas les courses remunerees. En sinistre, l'assureur peut refuser la prise en charge si l'usage pro n'est pas declare.",
        },
        {
          q: "Que presenter en controle ?",
          a: "Attestation TPT et attestation RC pro, a jour et nominatives. Demandez-les systematiquement a chaque avenant.",
        },
      ],
      callout:
        "Conseil LO : verifiez que l'attestation cite bien taxi / TPT et non seulement « usage professionnel » generique.",
    },
    {
      id: "rc-pro",
      label: "RC professionnelle",
      hint: "Activite et clients",
      h2: "Responsabilite civile professionnelle taxi",
      paragraphs: [
        "La RC pro couvre les dommages causes a des tiers dans le cadre de votre activite professionnelle, au-dela de la seule circulation (ex. bagage tombe sur un client).",
        "Elle est au coeur du cadre legal du transport de personnes a titre onereux et des controles d'activite.",
      ],
      list: [
        "Dommages lies a l'exercice de l'activite taxi",
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
          a: "Plafonds corporels, exclusions, territorialite, et compatibilite explicite avec l'activite taxi.",
        },
      ],
      callout:
        "Conseil LO : demandez une attestation RC pro nominative et a jour — utile pour les controles et les renouvellements de documents.",
    },
    {
      id: "bris-de-glace",
      label: "Bris de glace",
      hint: "Pare-brise, vitres, optiques",
      h2: "Bris de glace vehicule taxi",
      paragraphs: [
        "Gravier, vandalisme, choc de portiere : le bris de glace est un classique sur les parcours urbains, gares et aeroportuaires.",
        "Un pare-brise fissure, c'est aussi un risque controle technique / securite passagers et une immobilisation evitable.",
      ],
      list: [
        "Pare-brise, vitres laterales, lunette arriere (selon contrat)",
        "Parfois optiques et toits vitres — a verifier explicitement",
        "Franchise souvent plus basse que sur un sinistre collision",
      ],
      details: [
        {
          q: "Pourquoi la prioriser en taxi ?",
          a: "Le kilometrage eleve et le stationnement urbain multiplient les impacts. Remplacer un pare-brise sans garantie peut manger plusieurs jours de courses.",
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
      h2: "Garantie vol vehicule taxi",
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
          a: "En general : depot de plainte, indices d'effraction, declaration rapide, et respect des mesures de securite exigees (alarme, garage…).",
        },
        {
          q: "Que faire immediatement ?",
          a: "Plainte, puis declaration a l'assureur avec photos et inventaire. Demandez si un vehicule relais est prevu.",
        },
      ],
      callout:
        "Conseil LO : en grandes villes, le stationnement de nuit pese lourd au tarif — declarez-le honnetement pour eviter un litige.",
    },
    {
      id: "incendie",
      label: "Incendie",
      hint: "Feu, foudre, explosion",
      h2: "Garantie incendie vehicule taxi",
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
          q: "Vehicule relais ?",
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
        "Collision responsable, sortie de route, vandalisme sur parking ou en station : ces garanties couvrent les degats a votre propre vehicule au-dela de la seule RC.",
        "Pour un taxi recent ou finance (LOA/LLD), elles sont souvent indispensables pour proteger la valeur residuelle.",
      ],
      list: [
        "Dommages tous accidents (y compris responsable)",
        "Vandalisme et actes de malveillance",
        "Franchise et valeur a neuf / valeur a dire d'expert a comparer",
      ],
      details: [
        {
          q: "Tous risques = zero franchise ?",
          a: "Non. Verifiez toujours le montant de franchise et les exclusions (usure, negligence, usage non declare…).",
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
      id: "vehicule-relais",
      label: "Vehicule relais",
      hint: "Continuer a rouler apres sinistre",
      h2: "Vehicule relais pour taxi",
      paragraphs: [
        "Quand le taxi est immobilise apres sinistre ou panne, un vehicule relais permet de poursuivre l'activite sans interruption totale de chiffre d'affaires.",
        "Duree, categorie de vehicule et conditions d'attribution varient fortement d'un contrat a l'autre — a comparer avant de signer.",
      ],
      list: [
        "Vehicule de remplacement pendant reparations",
        "Duree maximale et delai de mise a disposition",
        "Categorie / cylindree adaptees a l'usage taxi (selon offres)",
      ],
      details: [
        {
          q: "Vehicule relais vs indemnite d'immobilisation ?",
          a: "Le relais limite l'arret d'activite. L'indemnite compense le manque a gagner si aucun pret n'est possible ou insuffisant.",
        },
        {
          q: "Point de vigilance",
          a: "Certains contrats excluent les vehicules utilises en TPT du pool de remplacement. Exigez une clause compatible taxi.",
        },
      ],
      callout:
        "Conseil LO : demandez par ecrit si le vehicule relais est autorise en usage taxi / TPT — c'est le piege le plus frequent.",
    },
    {
      id: "perte-exploitation",
      label: "Perte d'exploitation",
      hint: "Compenser les courses perdues",
      h2: "Indemnite d'immobilisation / perte d'exploitation",
      paragraphs: [
        "Quand le vehicule est immobilise apres sinistre, vos revenus chutent. Une indemnite d'immobilisation (ou perte d'exploitation) vise a compenser une partie de ce manque a gagner.",
        "Montant journalier, duree max et delai de franchise (jours non indemnises) font toute la difference.",
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
          q: "Avec ou sans vehicule relais ?",
          a: "Les deux se completent : le pret limite l'arret, l'indemnite couvre le manque a gagner residuel.",
        },
      ],
      callout:
        "Conseil LO : une indemnite trop basse (ou avec 7 jours de franchise) peut etre inutile pour un taxi a fort rythme.",
    },
  ];

  var navGrid = GUARANTEES.map(function (g) {
    return { id: g.id, label: g.label, hint: g.hint };
  });

  var sections = [
    {
      h2: "Les garanties taxi a connaitre avant de signer",
      paragraphs: [
        "Un bon contrat taxi n'est pas seulement « pas cher » : c'est un ensemble de garanties qui protegent votre revenu, vos clients et votre vehicule. Voici le panorama clair des postes a comparer — obligatoire, fortement recommande, ou optionnel selon votre situation.",
        "Chez Leads Opportunities, un courtier ORIAS vous explique chaque ligne a garanties equivalentes, sans jargon inutile.",
      ],
      navGrid: navGrid,
    },
    {
      h2: "Obligatoire vs utile : ce que dit vraiment le terrain",
      paragraphs: [
        "La loi impose un socle (RC auto adaptee + usage TPT + couverture professionnelle). Le reste depend de votre vehicule (age, financement), de votre zone (IDF, aeroports, stations) et de votre tolerance au risque.",
        "Mal dimensionne, un contrat bas de gamme peut couter plus cher qu'une bonne formule des le premier sinistre.",
      ],
      list: [
        "Socle : RC auto usage taxi / TPT + RC professionnelle",
        "Fortement recommande : conducteur, bris de glace, vehicule relais",
        "Selon profil : vol, incendie, dommages, perte d'exploitation",
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
    h2: "Trois questions qui font basculer un contrat taxi",
    paragraphs: [
      "Avant de signer, posez ces trois points a votre courtier ou a l'assureur. Les reponses evitent la plupart des mauvaises surprises.",
    ],
    list: [
      "L'usage taxi / TPT est-il explicitement garanti sur l'attestation ?",
      "Quelles franchises s'appliquent sur bris de glace, collision et vol ?",
      "Que se passe-t-il si le vehicule est immobilise 10 jours (relais, indemnite, plafonds) ?",
    ],
  });

  sections.push({
    h2: "Erreurs frequentes a eviter a la souscription",
    paragraphs: [
      "Sous-estimer ses besoins (formule economique sans vol, incendie ou bris de glace) et oublier de declarer l'historique ou l'usage exact sont les deux pieges les plus coutueux.",
      "Tout oubli peut entrainer une nullite ou une reduction de garantie en cas de sinistre. Un courtier ORIAS aide a monter un dossier complet des le devis.",
    ],
    list: [
      "Declarer honnetement sinistres, bonus/malus et stationnement",
      "Exiger la mention TPT / taxi sur chaque attestation",
      "Comparer a garanties equivalentes, pas au seul prix affiche",
    ],
  });

  return page({
    file: "assurance-taxi/garanties/index.html",
    theme: "taxi",
    badge: "Garanties taxi",
    title: "Garanties assurance taxi | Conducteur, RC, TPT, vehicule relais…",
    description:
      "Toutes les garanties assurance taxi expliquees : conducteur, RC auto, TPT, RC pro, bris de glace, vol, incendie, dommages, vehicule relais, perte d'exploitation. Devis courtier ORIAS.",
    h1: "Garanties assurance taxi : le detail qui protege votre activite",
    intro:
      "Conducteur, RC, TPT, bris de glace, vol, incendie, dommages, vehicule relais, perte d'exploitation, RC pro : comprenez chaque garantie avant de comparer les tarifs. Devis gratuit, rappel rapide.",
    cta: { href: LANDING, label: "Obtenir mon devis taxi" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance taxi", url: BASE },
      { name: "Garanties", url: BASE + "garanties/" },
    ],
    benefits: [
      { title: "Lecture claire", text: "Chaque garantie expliquee sans jargon, avec ce qui est couvert et ce qui ne l'est pas." },
      { title: "Comparatif equivalent", text: "Nous confrontons les offres a postes comparables, pas au seul prix affiche." },
      { title: "Courtier ORIAS", text: "Un conseiller mobilite pro pour cadrer franchises, plafonds et attestations TPT." },
    ],
    steps: [
      { title: "Ciblez vos priorites", text: "Socle legal TPT, vehicule finance, zone urbaine / aeroport…" },
      { title: "On compare", text: "Garanties, franchises et exclusions cote a cote." },
      { title: "Vous validez", text: "Devis detaille, sans obligation de souscrire." },
    ],
    sections: sections,
    related: [
      { href: BASE, label: "Guide assurance taxi" },
      { href: BASE + "rc-pro/", label: "RC Pro taxi" },
      { href: BASE + "tarif/", label: "Tarif taxi" },
      { href: BASE + "creation-activite/", label: "Creation d activite" },
      { href: "/assurance-vtc/garanties/", label: "Garanties VTC (si double activite)" },
      { href: LANDING, label: "Devis taxi" },
    ],
    faq: [
      {
        q: "Quelles garanties sont obligatoires pour un taxi ?",
        a: "Au minimum une RC auto adaptee a l'activite avec usage TPT, et une couverture professionnelle (RC pro). Les attestations doivent etre presentables en controle.",
      },
      {
        q: "Puis-je rouler avec une assurance auto particuliere ?",
        a: "En general non pour une activite taxi declaree. L'usage transport de personnes a titre onereux doit etre explicitement garanti.",
      },
      {
        q: "Comment obtenir un devis garanties incluses ?",
        a: "Via notre landing taxi : un conseiller ORIAS vous rappelle pour caler les postes (conducteur, TPT, bris de glace, vehicule relais…) selon votre profil.",
      },
      {
        q: "Quelle difference entre RC auto et RC pro ?",
        a: "La RC auto couvre les dommages aux tiers en circulation. La RC pro couvre le risque lie a l'exercice professionnel du transport de personnes.",
      },
    ],
  });
}

function buildTaxiGarantiesObligatoiresAlias(page) {
  var BASE = "/assurance-taxi/";
  var LANDING = "/landings/taxi.html";
  return page({
    file: "assurance-taxi/garanties-obligatoires/index.html",
    theme: "taxi",
    badge: "Socle legal",
    title: "Garanties obligatoires assurance taxi | RC auto, TPT & RC pro",
    description:
      "Garanties obligatoires taxi : RC automobile, usage TPT et RC professionnelle. Complements recommandes pour chauffeurs. Devis courtier ORIAS.",
    h1: "Garanties obligatoires taxi : le socle avant la premiere course",
    intro:
      "Avant de prendre la route, verifiez le minimum legal et professionnel (RC auto + TPT + RC pro). Puis completez conducteur, bris de glace et vehicule relais selon votre risque.",
    cta: { href: LANDING, label: "Obtenir mon devis taxi" },
    crumbs: [
      { name: "Accueil", url: "/" },
      { name: "Assurance taxi", url: BASE },
      { name: "Garanties obligatoires", url: BASE + "garanties-obligatoires/" },
    ],
    benefits: [
      { title: "Conformite", text: "RC auto usage taxi / TPT + RC pro : le duo exige par le cadre legal et les controles." },
      { title: "Sans mauvaise surprise", text: "On verifie que l'attestation mentionne bien l'activite taxi." },
      { title: "Complements utiles", text: "Conducteur, bris de glace, vol, dommages, vehicule relais : on les dimensionne ensuite." },
    ],
    sections: [
      {
        h2: "Le minimum pour exercer",
        paragraphs: [
          "Sans attestation conforme, les controles peuvent bloquer votre activite. Le socle combine responsabilite civile automobile adaptee, mention TPT et responsabilite civile professionnelle.",
        ],
        list: [
          "RC automobile avec usage transport de personnes / taxi (TPT)",
          "RC professionnelle a plafonds adaptes",
          "Attestations nominatives a jour a bord",
        ],
      },
      {
        h2: "Completer le socle",
        paragraphs: [
          "Le detail de chaque garantie (conducteur, TPT, bris de glace, vol, incendie, dommages, vehicule relais, perte d'exploitation) est sur notre page catalogue.",
        ],
        list: [
          "Voir le detail : /assurance-taxi/garanties/",
          "RC Pro dediee : /assurance-taxi/rc-pro/",
          "Devis : /landings/taxi.html",
        ],
      },
    ],
    related: [
      { href: BASE + "garanties/", label: "Toutes les garanties taxi" },
      { href: BASE + "rc-pro/", label: "RC Pro taxi" },
      { href: BASE, label: "Guide assurance taxi" },
      { href: LANDING, label: "Devis taxi" },
    ],
    faq: [
      {
        q: "Quelles sont les garanties obligatoires taxi ?",
        a: "RC auto adaptee a l'activite avec usage TPT, et RC professionnelle. Le reste depend de votre vehicule, financement et zone.",
      },
      {
        q: "Ou voir le detail de chaque garantie ?",
        a: "Sur la page Garanties assurance taxi : conducteur, TPT, bris de glace, vol, incendie, dommages, vehicule relais, perte d'exploitation, RC pro.",
      },
    ],
  });
}

module.exports = {
  buildTaxiGarantiesPage: buildTaxiGarantiesPage,
  buildTaxiGarantiesObligatoiresAlias: buildTaxiGarantiesObligatoiresAlias,
};
