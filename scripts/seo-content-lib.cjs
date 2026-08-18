/**
 * Contenu SEO local — variantes par ville, maillage proche, enrichissement silos.
 */
function hashSlug(slug) {
  var h = 0;
  for (var i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

function pickVariant(slug, variants) {
  if (!variants || !variants.length) return "";
  return variants[hashSlug(slug) % variants.length];
}

/** Bassin Nancy / Meurthe-et-Moselle — zone d'intervention prioritaire SEO. */
var NANCY_BASSIN_SLUGS = {
  nancy: 1,
  varangeville: 1,
  luneville: 1,
  "jarville-la-malgrange": 1,
  "laneuveville-devant-nancy": 1,
  "dombasle-sur-meurthe": 1,
  "saint-nicolas-de-port": 1,
  "vandoeuvre-les-nancy": 1,
  "saint-max": 1,
  laxou: 1,
  "villers-les-nancy": 1,
  maxeville: 1,
  toul: 1,
  "pont-a-mousson": 1,
  "essey-les-nancy": 1,
  tomblaine: 1,
  seichamps: 1,
  heillecourt: 1,
  malzeville: 1,
  "saint-julien-les-vandoeuvre": 1,
  pompey: 1,
  custines: 1,
  richardmenil: 1,
  jarny: 1,
  "pont-saint-vincent": 1,
};

function isNancyBassin(city) {
  return !!(city && (city.dept === "meurthe-et-moselle" || NANCY_BASSIN_SLUGS[city.slug]));
}

function nancyBassinNearbyOrder(city, allCities) {
  var priority = [
    "varangeville",
    "nancy",
    "jarville-la-malgrange",
    "laneuveville-devant-nancy",
    "dombasle-sur-meurthe",
    "luneville",
    "saint-nicolas-de-port",
    "vandoeuvre-les-nancy",
    "laxou",
    "saint-max",
    "maxeville",
    "villers-les-nancy",
    "toul",
    "pont-a-mousson",
  ];
  if (!isNancyBassin(city)) return null;
  var bySlug = {};
  allCities.forEach(function (c) {
    if (c.dept === "meurthe-et-moselle" && c.slug !== city.slug) bySlug[c.slug] = c;
  });
  var ordered = [];
  priority.forEach(function (slug) {
    if (bySlug[slug]) {
      ordered.push(bySlug[slug]);
      delete bySlug[slug];
    }
  });
  Object.keys(bySlug)
    .sort()
    .forEach(function (slug) {
      ordered.push(bySlug[slug]);
    });
  return ordered;
}

function getNearbyCities(city, allCities, limit) {
  limit = limit || 8;
  var nancyOrdered = nancyBassinNearbyOrder(city, allCities);
  if (nancyOrdered && nancyOrdered.length) {
    return nancyOrdered.slice(0, limit);
  }
  var same = allCities.filter(function (c) {
    return c.dept === city.dept && c.slug !== city.slug;
  });
  var other = allCities.filter(function (c) {
    return c.regionSlug === city.regionSlug && c.dept !== city.dept && c.slug !== city.slug;
  });
  var merged = same.concat(other);
  merged.sort(function (a, b) {
    return a.name.localeCompare(b.name, "fr");
  });
  return merged.slice(0, limit);
}

function nearbyLinks(city, allCities, productDir, limit) {
  return getNearbyCities(city, allCities, limit).map(function (c) {
    return {
      href: "/" + productDir + "/" + c.slug + "/",
      label: c.name,
    };
  });
}

function animauxCitySections(city) {
  var localTip = pickVariant(city.slug, [
    "Les urgences veterinaires de nuit restent rares : une bonne assurance lisse les gros postes (chirurgie, imagerie).",
    "A " + city.name + ", comme ailleurs, le prix depend surtout de l age et de la race — pas du code postal.",
    "Beaucoup de proprietaires sous-estiment le cout d une hospitalisation : 800 a 2 000 EUR selon les cas.",
    "La prevention (vaccins, antiparasitaires) est souvent remboursee via un sous-plafond dedie.",
  ]);
  return [
    {
      h2: "Assurance chien et chat a " + city.name,
      paragraphs: [
        "Residents de " +
          city.name +
          " (" +
          city.region +
          ") : notre comparatif couvre les memes assureurs qu en grande metropole (Santévet, Bulle Bleue, Kozoo, reseau courtage).",
        localTip,
      ],
      list: [
        "Assurance chien : races, chiots, seniors",
        "Assurance chat : chaton, d interieur ou d exterieur",
        "Formules accident, equilibre ou confort",
        "Demande de rappel — pas de numero public, formulaire en ligne",
      ],
    },
    {
      h2: "Comment obtenir un devis depuis " + city.name,
      paragraphs: [
        "1) Questionnaire animaux en 3 minutes sur notre landing dediee. 2) Tarif indicatif modifiable. 3) Rappel conseiller pour valider plafonds et exclusions.",
        "Vous pouvez aussi utiliser le formulaire express (30 secondes) si vous preferez etre rappele directement.",
      ],
    },
    {
      h2: "Maillage local utile",
      paragraphs: [
        "Consultez aussi le guide national chien ou chat, le comparatif des formules et la page remboursement veterinaire pour comprendre plafonds et franchises avant de signer.",
      ],
    },
  ];
}

function chienCitySections(city) {
  return [
    {
      h2: "Assurance chien a " + city.name,
      paragraphs: [
        "Grandes races, chiots ou chiens seniors : le tarif varie fortement. Nous filtrons les contrats encore ouverts a l adhesion selon l age de votre chien.",
        pickVariant(city.slug, [
          "Les pathologies de race (dysplasie, hernie) sont souvent soumises a carence ou exclusion : nous verifions avant de vous proposer une offre.",
          "Un chiot assure tot beneficie en general de conditions plus favorables qu un chien adopte a 9 ans.",
        ]),
      ],
    },
    {
      h2: "Pages utiles",
      list: [
        "Assurance chien pas cher — limites a connaitre",
        "Assurance chiot — prevention et vaccins",
        "Chien senior — plafonds realistes",
        "Comparatif national des mutuelles chien",
      ],
    },
  ];
}

function chatCitySections(city) {
  return [
    {
      h2: "Assurance chat a " + city.name,
      paragraphs: [
        "Chat d appartement ou chat libre : le profil de risque change. Nous adaptons le niveau de garanties (prevention, plafond annuel, franchise).",
        pickVariant(city.slug, [
          "Les chats exterieurs ont plus de risques de blessure : privilegiez un plafond confort si votre budget le permet.",
          "Sterilisation et bilan annuel : verifiez le sous-plafond prevention du contrat.",
        ]),
      ],
    },
    {
      h2: "Guides lies",
      list: [
        "Assurance chat pas cher",
        "Assurance chaton",
        "Chat senior",
        "Tarif assurance animaux",
      ],
    },
  ];
}

function chasseCitySections(city) {
  return [
    {
      h2: "Assurance chasse a " + city.name,
      paragraphs: [
        "RC chasseur, blessures, chiens courants : les besoins varient selon disciplines et territoires. Nous cadrons votre dossier avec un conseiller specialise.",
        "Residents de " + city.name + " et du " + city.dept.replace(/-/g, " ") + " : devis national, accompagnement telephone.",
      ],
    },
  ];
}

function vtcCitySections(city) {
  var isIdf = city.regionSlug === "ile-de-france";
  var localTip = pickVariant(city.slug, [
    "Comparez RC Pro, dommages vehicule et franchises a garanties equivalentes — pas seulement la prime affichee.",
    "Un bon CRM (bonus-malus) peut faire baisser la cotisation de plusieurs centaines d'euros par an.",
    "Le vehicule de remplacement evite de perdre des courses apres un sinistre, surtout a temps plein.",
  ]);
  var sections = [
    {
      h2: "Assurance VTC a " + city.name,
      paragraphs: [
        "Chauffeurs Uber, Bolt, Heetch ou independants : la zone " +
          city.name +
          " (" +
          city.region +
          ") influence le risque percu par les assureurs (trafic, stationnement, sinistralite).",
        localTip,
      ],
      list: [
        "RC professionnelle et garanties conducteur",
        "Vehicule de remplacement si activite a temps plein",
        "Creation d'activite ou renouvellement",
        "Demande de rappel via formulaire en ligne",
      ],
      figure: isIdf
        ? { file: "vtc/chauffeur-ville.jpg", alt: "Chauffeur VTC a " + city.name }
        : { file: "vtc/berline-ville.jpg", alt: "Berline VTC — " + city.name },
    },
  ];
  if (isIdf) {
    sections.push({
      h2: city.name + " dans l activite VTC francilienne",
      paragraphs: [
        pickVariant(city.slug, [
          "Paris, CDG, Orly, La Defense et le peripherique structurent les courses. Un chauffeur base a " +
            city.name +
            " declare souvent un usage regional, pas uniquement communal.",
          "Petite et grande couronne : les liaisons aéroports et gares parisiennes pèsent sur le kilométrage. Nous le faisons figurer dans le comparatif.",
          "En Ile-de-France, le contrat doit autoriser le transport de personnes a titre onereux — une auto perso ne suffit pas pour Uber ou Bolt.",
        ]),
        "Consultez aussi le hub regional Ile-de-France, les pages aéroports et les arrondissements parisiens pour un maillage local precis.",
      ],
      list: [
        "Hub VTC Ile-de-France",
        "Aéroports CDG et Orly",
        "La Defense et gares parisiennes",
      ],
      figure: { file: "vtc/paris-nuit.jpg", alt: "Ile-de-France de nuit — courses VTC depuis " + city.name },
    });
  }
  sections.push({
    h2: "Guides et blog VTC",
    paragraphs: [
      "Consultez nos articles : payer moins cher, RC Pro, plateformes, resiliation. Pages locales comme celle-ci + hub national.",
    ],
  });
  return sections;
}

function equitationCitySections(city) {
  return [
    {
      h2: "Assurance equitation a " + city.name,
      paragraphs: [
        "Proprietaire de cheval, cavalier ou centre equestre : RC equestre, mortalite cheval, materiel. Nous orientons vers les produits disponibles selon votre activite.",
        "En " + city.region + ", les ecuries et cavaliers de loisir ont les memes exigences de couverture qu au niveau national.",
      ],
    },
  ];
}

function creditImmoCitySections(city) {
  var sections = [
    {
      h2: "Financer un bien a " + city.name,
      paragraphs: [
        "Marche local, apport, assurance emprunteur : chaque element compte dans l acceptation du dossier. Nous vous aidons a presenter un financement credible.",
      ],
    },
  ];
  if (isNancyBassin(city)) {
    sections.push({
      h2: "Courtier implanté en Meurthe-et-Moselle",
      paragraphs: [
        "Bureau a Varangeville (54110), a quelques minutes de Nancy, Dombasle-sur-Meurthe et Laneuveville : permanences sur place et rappel conseiller pour tout le bassin nanceien.",
        pickVariant(city.slug, [
          "A " +
            city.name +
            ", le prix au m2 varie fortement entre centre-ville, communes limitrophes et secteur Lunéville / Saint-Nicolas-de-Port : nous croisons capacite d emprunt, taxe fonciere et charges pour une projection realiste.",
          "Primo-accedants de " +
            city.name +
            " : anticipez notaire, travaux et assurance emprunteur (loi Lemoine) avant la visite du bien.",
          "Investissement locatif autour de Nancy metropole : nous chiffrons mensualite, rentabilite brute et reste a vivre apres charges de copropriete.",
        ]),
      ],
      list: [
        "Simulation projection achat (credit + charges + energie)",
        "Capacite d emprunt et endettement HCSF",
        "Assurance emprunteur : delegation et economie",
        "Accompagnement dossier banque — Grand Est",
      ],
    });
    sections.push({
      h2: "Communes proches",
      paragraphs: [
        "Nous accompagnons les projets sur Nancy metropole, Varangeville, Jarville-la-Malgrange, Lunéville, Saint-Nicolas-de-Port, Vandoeuvre, Laxou et l ensemble de la Meurthe-et-Moselle (54).",
      ],
    });
  }
  return sections;
}

function habitationCitySections(city) {
  var sections = [
    {
      h2: "Assurance habitation a " + city.name,
      paragraphs: [
        "Locataire ou proprietaire : multirisque, degats des eaux, vol et responsabilite civile. Devis adapte a votre logement en " + city.region + ".",
      ],
    },
  ];
  if (isNancyBassin(city)) {
    sections[0].paragraphs.push(
      "Sur le bassin nanceien, les coproprietes et maisons individuelles de " +
        city.name +
        " ont des profils de risque differents : nous ajustons plafonds et franchises."
    );
  }
  return sections;
}

function emprunteurCitySections(city) {
  var sections = [
    {
      h2: "Assurance emprunteur a " + city.name,
      paragraphs: [
        "Loi Lemoine : changez d assureur a tout moment pour reduire le cout de votre pret. Nous comparons equivalence de garanties et economie sur la duree du credit.",
      ],
    },
  ];
  if (isNancyBassin(city)) {
    sections.push({
      h2: "Coupler credit immo et assurance emprunteur",
      paragraphs: [
        "Depuis notre bureau de Varangeville, nous traitons credit immobilier et assurance emprunteur pour les acquereurs de " +
          city.name +
          " et des communes voisines — un seul interlocuteur pour le cout global du projet.",
      ],
    });
  }
  return sections;
}

function creditImmoCityIntro(city) {
  if (!isNancyBassin(city)) {
    return (
      "Projet d achat ou investissement locatif a " +
      city.name +
      " ? Nous analysons votre capacite d emprunt et identifions les banques les plus favorables a votre profil en " +
      city.region +
      "."
    );
  }
  if (city.slug === "varangeville") {
    return (
      "Siege et bureau Leads Opportunities a Varangeville : simulation credit immobilier, projection complete (pret + taxe fonciere + charges) et montage dossier pour Nancy metropole et la Meurthe-et-Moselle."
    );
  }
  return (
    "Achat ou investissement a " +
    city.name +
    " (54) ? Courtier base a Varangeville, a proximite de Nancy : capacite d emprunt, negociation de taux et assurance emprunteur pour le bassin nanceien."
  );
}

function creditImmoCityDescription(city) {
  if (!isNancyBassin(city)) {
    return (
      "Credit immobilier a " +
      city.name +
      " : simulation, capacite d emprunt, negociation de taux. Courtier ORIAS, primo-accedants et investisseurs."
    );
  }
  return (
    "Credit immobilier " +
    city.name +
    " (54) : simulation, projection achat, taux et assurance emprunteur. Bureau Varangeville — Nancy metropole, Lunéville, Saint-Nicolas-de-Port."
  );
}

function defaultCityFaq(city, productLabel) {
  return [
    {
      q: "Intervenez-vous a " + city.name + " ?",
      a: "Oui. " + productLabel + " partout en France : devis en ligne puis rappel conseiller (heures ouvrables).",
    },
    {
      q: "Le devis est-il gratuit ?",
      a: "Oui, sans engagement. Vous decidez apres avoir compare les garanties expliquees par telephone.",
    },
    {
      q: "Quel delai de reponse ?",
      a: "En moyenne sous 15 minutes en journee ouvrable apres votre demande en ligne.",
    },
  ];
}

function animauxCityFaq(city) {
  return defaultCityFaq(city, "Assurance animaux").concat([
    {
      q: "Assurance chien ou chat : quelle difference a " + city.name + " ?",
      a: "Le tarif depend de l espece, l age et la race. Meme processus de devis : questionnaire en ligne puis rappel pour comparer les offres.",
    },
    {
      q: "Puis-je assurer un animal senior ?",
      a: "Selon assureurs et age limite a l adhesion. Nous testons votre profil et expliquons les plafonds restants.",
    },
  ]);
}

module.exports = {
  hashSlug: hashSlug,
  pickVariant: pickVariant,
  NANCY_BASSIN_SLUGS: NANCY_BASSIN_SLUGS,
  isNancyBassin: isNancyBassin,
  getNearbyCities: getNearbyCities,
  nearbyLinks: nearbyLinks,
  animauxCitySections: animauxCitySections,
  chienCitySections: chienCitySections,
  chatCitySections: chatCitySections,
  vtcCitySections: vtcCitySections,
  chasseCitySections: chasseCitySections,
  equitationCitySections: equitationCitySections,
  creditImmoCitySections: creditImmoCitySections,
  habitationCitySections: habitationCitySections,
  emprunteurCitySections: emprunteurCitySections,
  creditImmoCityIntro: creditImmoCityIntro,
  creditImmoCityDescription: creditImmoCityDescription,
  defaultCityFaq: defaultCityFaq,
  animauxCityFaq: animauxCityFaq,
};
