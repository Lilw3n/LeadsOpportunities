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

function getNearbyCities(city, allCities, limit) {
  limit = limit || 8;
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
  return [
    {
      h2: "Assurance VTC a " + city.name,
      paragraphs: [
        "Chauffeurs Uber, Bolt, Heetch ou independants : la zone " +
          city.name +
          " (" +
          city.region +
          ") influence le risque percu par les assureurs (trafic, stationnement, sinistralite).",
        pickVariant(city.slug, [
          "Comparez RC Pro, dommages vehicule et franchises a garanties equivalentes — pas seulement la prime affichee.",
          "Un bon CRM (bonus-malus) peut faire baisser la cotisation de plusieurs centaines d'euros par an.",
        ]),
      ],
      list: [
        "RC professionnelle et garanties conducteur",
        "Vehicule de remplacement si activite a temps plein",
        "Creation d'activite ou renouvellement",
        "Demande de rappel via formulaire en ligne",
      ],
    },
    {
      h2: "Guides et blog VTC",
      paragraphs: [
        "Consultez nos articles : payer moins cher, RC Pro, plateformes, resiliation. Pages locales comme celle-ci + hub national.",
      ],
    },
  ];
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
  getNearbyCities: getNearbyCities,
  nearbyLinks: nearbyLinks,
  animauxCitySections: animauxCitySections,
  chienCitySections: chienCitySections,
  chatCitySections: chatCitySections,
  vtcCitySections: vtcCitySections,
  chasseCitySections: chasseCitySections,
  equitationCitySections: equitationCitySections,
  defaultCityFaq: defaultCityFaq,
  animauxCityFaq: animauxCityFaq,
};
