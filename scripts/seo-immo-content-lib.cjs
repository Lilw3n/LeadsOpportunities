/**
 * Contenu local prêt immobilier + recherche de bien.
 * Angles îles, DOM-TOM, COM et destinations françaises.
 */
var contentLib = require("./seo-content-lib.cjs");
var bassin = require("./bassin-nance-local-lib.cjs");

var ISLAND_REGIONS = {
  corse: {
    label: "Corse",
    market:
      "marche insulaire tendu, villas et appartements vus mer, forte demande de residences secondaires et de locations saisonnieres",
    loan:
      "les banques regardent le projet (residence principale corse, secondaire continentale, locatif) et le cout de la vie insulaire. Apport, reste a vivre et assurance emprunteur pesent autant que le taux affiche",
    search:
      "stock limite hors saison, delais de visite, diagnostics et coproprietes anciennes dans les centres. Privilegiez un mandat de recherche avec budget pret valide",
  },
  martinique: {
    label: "Martinique",
    market: "villas creoles, residences recentes et maisons individuelles, prix portes par le littoral et Fort-de-France / Lamentin",
    loan:
      "financement outre-mer : etablissements locaux et reseaux nationaux. Nous montons un dossier lisible (revenus, charges, projet RP ou investissement) et l assurance emprunteur Loi Lemoine",
    search:
      "biens cyclones / humidite : etat de la toiture, termites, assurance habitation. Un courtier aide a caler le budget avant les visites",
  },
  guadeloupe: {
    label: "Guadeloupe",
    market: "Grande-Terre / Basse-Terre, residences, villas et terrains, forte saisonnalite touristique sur le Gosier et Saint-Francois",
    loan:
      "pret immobilier Antilles : capacite d emprunt, apport et garanties. Les banques demandent un projet clair (RP, secondaire, locatif saisonnier)",
    search:
      "comparez front de mer, hauteurs et centres urbains (Abymes, Baie-Mahault). Filtrez selon budget pret, pas seulement le prix affiche",
  },
  "la-reunion": {
    label: "La Reunion",
    market: "Ouest (Saint-Paul, Saint-Leu), Sud (Saint-Pierre, Tampon) et Nord (Saint-Denis) : marches distincts, relief et risques naturels",
    loan:
      "pret Reunion : vie chere, deplacement, et parfois double residence. Nous calibrons mensualite + assurance + reste a vivre avant de viser un bien",
    search:
      "maisons individuelles, appartements recents, villas en hauteur. Verifiez PPR, assainissement et charges avant d offrir",
  },
  guyane: {
    label: "Guyane",
    market: "Cayenne, Kourou, Saint-Laurent : offre plus contrainte, terrains et maisons, logistique locale",
    loan:
      "financement Guyane : profils salaries, fonction publique, independants. Dossier banque + assurance emprunteur, sans promesse de taux miracle",
    search:
      "foncier et maisons individuelles dominent. Un budget pret arrete evite les visites hors enveloppe",
  },
  mayotte: {
    label: "Mayotte",
    market: "Mamoudzou, Petite-Terre (Dzaoudzi), Koungou : offre limitee, forte pression demographique",
    loan:
      "pret Mayotte : etude au cas par cas (revenus, apport, nature du bien). Accompagnement a distance depuis la metropole si besoin",
    search:
      "stock restreint : priorisez les biens dont le financement est realiste et les titres clairs",
  },
  "polynesie-francaise": {
    label: "Polynesie francaise",
    market: "Papeete, Faaa, Moorea : franc CFP, banques du Pacifique, residences et villas lagoon",
    loan:
      "nous accompagnons les profils France / residents pour un projet d achat. Les etablissements locaux (IEOM, banques du Pacifique) sont etudies au cas par cas — pas de promesse de pret metropole automatique en CFP",
    search:
      "villas, appartements Papeete, biens Moorea. Cadrez usage (RP, secondaire, locatif) et budget avant les visites",
  },
  "nouvelle-caledonie": {
    label: "Nouvelle-Caledonie",
    market: "Noumea, Mont-Dore, Dumbea : franc CFP, quartiers residentiels et front de mer",
    loan:
      "accompagnement depuis la France pour un projet caledonien : montage du besoin, pieces, et orientation vers les circuits locaux quand le pret metropole ne s applique pas",
    search:
      "maisons de ville, residences, villas periurbaines. Filtrez selon enveloppe reelle (prix + frais + assurance)",
  },
  "saint-martin": {
    label: "Saint-Martin",
    market: "Marigot et zone francaise : villas, condos, forte composante touristique et saisonniere",
    loan:
      "projets Saint-Martin : RP, secondaire ou locatif. Nous clarifions apport, mensualite et assurance avant de viser un bien cote FR",
    search:
      "stock villa / residence. Verifiez charges, saisonnalite locative et assurances (cyclone, responsabilite)",
  },
  "saint-barthelemy": {
    label: "Saint-Barthelemy",
    market: "Gustavia et hauteurs : marche haut de gamme, villas, rarete du foncier",
    loan:
      "financement Saint-Barth : dossiers patrimoniaux, apport eleve, parfois montage SCI. Etude de faisabilite avant toute offre",
    search:
      "villas et rares appartements. Un mandat de recherche + simulation pret evite les offres hors budget",
  },
  "saint-pierre-et-miquelon": {
    label: "Saint-Pierre-et-Miquelon",
    market: "Saint-Pierre : marche etroit, maisons individuelles, logistique Atlantique Nord",
    loan:
      "peu d offres bancaires standard : nous etudions le profil et les circuits possibles (metropole / local) sans promesse irrealiste",
    search:
      "stock limite. Cadrez le projet (mutation, RP, secondaire) avant de chercher",
  },
  "wallis-et-futuna": {
    label: "Wallis-et-Futuna",
    market: "Mata-Utu : marche tres etroit, projets souvent lies a une mutation ou un retour au pays",
    loan:
      "accompagnement sur-mesure : pieces, capacite, et realisme du financement. Pas de grille nationale unique",
    search:
      "offre rare. Nous aidons a formuler le besoin et le budget avant toute demarche locale",
  },
};

var DEST_SLUGS = {
  "saint-tropez": "Golfe de Saint-Tropez : villas, rares appartements, prix parmi les plus eleves de France",
  "sainte-maxime": "rivage varois, residences et villas, clientele secondaire et locatif saisonnier",
  ramatuelle: "presqu ile, villas et domaines, ticket d entree eleve",
  cannes: "Croisette, Californie, residences standing et investissement saisonnier",
  nice: "baie des Anges, immeubles haussmanniens et neuf, marche tres liquide",
  antibes: "Cap d Antibes / Juan : villas et appartements, mix RP et secondaire",
  menton: "frontiere italienne, immeubles et villas, fiscalite et residence a clarifier",
  "saint-jean-cap-ferrat": "peninsule prestige, villas rares, dossiers patrimoniaux",
  cassis: "calanques, stock contraint, residences secondaires",
  bandol: "littoral varois, appartements vue mer et maisons de village",
  "saint-martin-de-re": "Ile de Re : villages classes, maisons de pecheurs, forte saisonnalite",
  "la-flotte": "port de Re, maisons et petites coproprietes",
  "le-chateau-d-oleron": "Ile d Oleron : maisons, terrains, budget plus accessible que Re",
  "saint-pierre-d-oleron": "coeur d Oleron, mix RP et secondaire",
  arcachon: "bassin, villas tchanquees / ville d hiver, prix eleves",
  "lege-cap-ferret": "Cap Ferret : rarete, dunes, ticket d entree tres haut",
  "noirmoutier-en-l-ile": "ile vendeenne, maisons et residences, pont / passage du Gois",
  "les-sables-d-olonne": "front de mer, appartements et maisons, vendee atlantique",
  "la-baule": "baie, immeubles et villas, clientele secondaire",
  "le-palais": "Belle-Ile-en-Mer : maisons, rarete, logistique bateau",
  dinard: "cote d Emeraude, villas anglo-normandes, secondaire",
  deauville: "cote fleurie, appartements et villas, saisonnier",
  honfleur: "vieux bassin, immeubles et maisons, stock tendu",
  chamonix: "haute montagne, chalets et residences, LMNP / saisonnier",
  megeve: "chalets prestige, dossiers patrimoniaux",
  biarritz: "cote basque, appartements et villas, marche international",
  hyeres: "iles d Or / Presqu ile de Giens, mix mer et arriere-pays",
  frejus: "esterel, residences et maisons, Var est",
  "saint-raphael": "littoral varois, gare TGV, appartements et villas",
};

function isIsland(city) {
  return !!ISLAND_REGIONS[city.regionSlug];
}

function isDestination(city) {
  return !!DEST_SLUGS[city.slug];
}

function profile(city) {
  var island = ISLAND_REGIONS[city.regionSlug];
  if (island) {
    return {
      kind: "island",
      label: island.label,
      market: island.market,
      loan: island.loan,
      search: island.search,
    };
  }
  if (DEST_SLUGS[city.slug]) {
    return {
      kind: "destination",
      label: city.region,
      market: DEST_SLUGS[city.slug],
      loan:
        "residence secondaire, locatif saisonnier ou RP : les banques n etudient pas le meme risque. Nous calons apport, usage et assurance emprunteur avant l offre",
      search:
        "stock saisonnier, visites concentrees hors ete. Un budget pret arrete fait gagner les biens serieux",
    };
  }
  if (bassin.isBassinCity(city)) {
    return {
      kind: "bassin-nance",
      label: "Meurthe-et-Moselle — bassin nancéien",
      market: bassin.localIntroParagraph(city),
      loan:
        "salaires industriels (Solvay, mines), fonction publique nancéienne ou commerces locaux : nous calons capacité d emprunt, apport et assurance emprunteur sur votre réalité du 54",
      search:
        "entre Nancy, Varangeville, Dombasle et Saint-Nicolas-de-Port : annonces portails + budget prêt validé avant visite — estimation DVF disponible pour les vendeurs",
    };
  }
  return {
    kind: "metro",
    label: city.region,
    market:
      "marche " +
      city.name +
      " (" +
      city.region +
      ") : appartements, maisons et, selon les quartiers, neuf ou ancien a renovar",
    loan:
      "capacite d emprunt, taux d effort, apport et assurance emprunteur. Nous comparons les banques favorables a votre profil",
    search:
      "annonces portails + recherche off-market. Filtrez par mensualite cible, pas seulement par prix",
  };
}

function pretCitySections(city) {
  var p = profile(city);
  var tip = contentLib.pickVariant(city.slug, [
    "Le taux affiche ne fait pas le cout : assurance, frais de dossier et duree changent la mensualite reelle.",
    "Un apport de 10 a 20 % rassure, mais un excellent reste a vivre peut compenser un apport plus juste.",
    "La Loi Lemoine permet de changer d assurance emprunteur a tout moment : c est un levier sur 20 ou 25 ans.",
    "PTZ, pret Action Logement ou pret relais : on les integre seulement s ils collent a votre projet a " + city.name + ".",
    "Mieux vaut une enveloppe validee avant de signer un compromis qu une offre trop juste le jour J.",
  ]);
  var sections = [
    {
      h2: "Pret immobilier a " + city.name + " : ce que les banques regardent",
      paragraphs: [
        "Projet a " +
          city.name +
          " (" +
          p.label +
          ") : " +
          p.market +
          ".",
        p.loan + ".",
        tip,
      ],
      list: [
        "Simulation capacite d emprunt et mensualite",
        "Apport, reste a vivre, charges et credits en cours",
        "Assurance emprunteur (Loi Lemoine) et cout global",
        "Primo-accedant, investissement locatif ou residence secondaire",
        "Projection du cout reel (taxe fonciere, energie, travaux)",
      ],
    },
    {
      h2: "Monter un dossier credible pour " + city.name,
      paragraphs: [
        "Vendeurs et notaires veulent une attestation de financement solide. Nous preparons un dossier lisible : revenus, pieces, projet du bien, et scenario 20 / 25 ans.",
        contentLib.pickVariant(city.slug, [
          "A " + city.name + ", un accord de principe avant les visites serieuses evite de perdre le bien.",
          "Les banques n aiment pas les dossiers bricoles : un courtier aligne les pieces des le premier envoi.",
          "Investisseur : cash-flow, fiscalite et assurance pèsent autant que le taux nominal.",
        ]),
      ],
      list: [
        "Bulletins, avis d impot, releves 3 mois",
        "Apport disponible et epargne de precaution",
        "Type de bien vise a " + city.name,
        "Calendrier (compromis, conditions suspensives)",
      ],
    },
  ];
  if (p.kind === "island") {
    sections.push({
      h2: "Iles et outre-mer : particularites a " + city.name,
      paragraphs: [
        "Nous travaillons aussi avec les Francais des iles et des destinations : residents, metropolitains qui achètent sur place, ou insulaires qui financent un bien en metropole.",
        "Accompagnement a distance (visio, pieces numeriques). Les etablissements locaux sont pris en compte quand le circuit metropole ne suffit pas.",
        "Pas de promesse de taux unique : chaque profil (salarie, independant, fonction publique, expat de retour) a sa grille.",
      ],
      list: [
        "Residence principale insulaire",
        "Residence secondaire / saisonnier",
        "Achat metropole depuis l ile",
        "Assurance emprunteur et habitation",
      ],
    });
  } else if (p.kind === "destination") {
    sections.push({
      h2: "Destination " + city.name + " : secondaire, locatif, RP",
      paragraphs: [
        "Les banques distinguent nettement residence principale, secondaire et location saisonniere. A " +
          city.name +
          ", le dossier doit le dire clairement.",
        "Nous calons l usage, la duree d occupation, et le plan B si la location ne remplit pas.",
      ],
    });
  } else if (p.kind === "bassin-nance") {
    sections = sections.concat(bassin.seoSections(city));
  }
  sections.push({
    h2: "Recherche de bien et projection a " + city.name,
    paragraphs: [
      "Une fois l enveloppe connue, enchainez sur la recherche de bien et la projection du cout mensuel reel (pret + taxe fonciere + charges + travaux).",
    ],
  });
  return sections;
}

function pretCityFaq(city) {
  var p = profile(city);
  var faq = contentLib.defaultCityFaq(city, "Pret immobilier").concat([
    {
      q: "Puis-je obtenir un pret immobilier a " + city.name + " ?",
      a:
        "Oui, nous etudions les projets a " +
        city.name +
        " (" +
        p.label +
        ") : residence principale, secondaire ou locatif. Simulation gratuite, sans engagement.",
    },
    {
      q: "Gerez-vous les dossiers depuis les iles et l outre-mer ?",
      a: "Oui. Residents des Antilles, Reunion, Corse, Pacifique ou metropole : pieces a distance, rappel conseiller, montage pret + assurance emprunteur.",
    },
    {
      q: "Quel apport pour acheter a " + city.name + " ?",
      a: "Cela depend du prix local, de votre reste a vivre et de la banque. Nous calculons une fourchette realiste, sans barème public unique.",
    },
    {
      q: "La simulation est-elle gratuite ?",
      a: "Oui. Premiere analyse de faisabilite gratuite, puis accompagnement dossier si vous poursuivez.",
    },
  ]);
  if (bassin.isBassinCity(city)) {
    faq = faq.concat(bassin.seoFaqExtra(city));
  }
  return faq;
}

function rechercheCitySections(city) {
  var p = profile(city);
  var tip = contentLib.pickVariant(city.slug, [
    "Ignorez les annonces 15 % sous le marche : elles sont souvent deja sous offre ou non finançables.",
    "Un bien au bon prix avec un pret valide bat un « coup de coeur » hors enveloppe.",
    "Copropriete : lisez PV d AG et fonds travaux avant de vous engager a " + city.name + ".",
    "Pour une destination saisonniere, calculez la vacance locative, pas seulement la nuitée ete.",
  ]);
  var sections = [
    {
      h2: "Recherche de bien a " + city.name,
      paragraphs: [
        p.market + ".",
        p.search + ".",
        tip,
      ],
      list: [
        "Appartement, maison, villa, terrain",
        "Residence principale, secondaire ou locatif",
        "Budget calé sur un pret (pas l inverse)",
        "Annonces portails + recherche accompagnee",
      ],
    },
    {
      h2: "Comment on cherche avec vous a " + city.name,
      paragraphs: [
        "1) Questionnaire acheteur (budget, pieces, quartier). 2) Enveloppe pret si besoin. 3) Selection de biens et prise de contact. 4) Offre et conditions suspensives.",
        "Vous pouvez aussi deposer un bien si vous vendez, pour un echange local.",
      ],
    },
  ];
  if (p.kind === "island" || p.kind === "destination") {
    sections.push({
      h2: "Iles et destinations : chercher autrement",
      paragraphs: [
        "A " +
          city.name +
          ", le stock bouge avec la saison. Nous priorisons les biens dont le financement est tenable et les diagnostics acceptables (toiture, humidite, copropriete, risques naturels).",
        "Metropolitains et residents des iles : visites groupees, mandats, et budget pret avant le deplacement.",
      ],
    });
  }
  if (p.kind === "bassin-nance") {
    sections = sections.concat(bassin.seoSections(city));
  }
  sections.push({
    h2: "Financer le bien trouve a " + city.name,
    paragraphs: [
      "La page pret immobilier " +
        city.name +
        " detaille capacite d emprunt, apport et assurance. La projection d achat montre le cout mensuel reel.",
    ],
  });
  return sections;
}

function rechercheCityFaq(city) {
  var faq = contentLib.defaultCityFaq(city, "Recherche de bien").concat([
    {
      q: "Cherchez-vous des biens a " + city.name + " ?",
      a: "Oui. Formulaire acheteur, criteres (budget, type, quartier) puis selection. Couverture metropole, Corse, DOM-TOM et destinations.",
    },
    {
      q: "Puis-je vendre un bien a " + city.name + " ?",
      a: "Oui, parcours vendeur / depot d annonce. Un conseiller rappelle pour qualifier le mandat.",
    },
    {
      q: "Faut-il un pret avant de visiter ?",
      a: "Fortement conseille a " + city.name + " : les vendeurs privilegient les dossiers finances. Simulation gratuite.",
    },
  ]);
  if (bassin.isBassinCity(city)) {
    faq = faq.concat(bassin.seoFaqExtra(city));
  }
  return faq;
}

module.exports = {
  ISLAND_REGIONS: ISLAND_REGIONS,
  DEST_SLUGS: DEST_SLUGS,
  profile: profile,
  isIsland: isIsland,
  isDestination: isDestination,
  pretCitySections: pretCitySections,
  pretCityFaq: pretCityFaq,
  rechercheCitySections: rechercheCitySections,
  rechercheCityFaq: rechercheCityFaq,
};
