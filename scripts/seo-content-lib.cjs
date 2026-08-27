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
  var dept = String(city.dept || "").replace(/-/g, " ");
  return [
    {
      h2: "Assurance chasse à " + city.name,
      paragraphs: [
        "RC chasseur, permis de chasser, blessures, chiens courants : devis assurance chasse à " +
          city.name +
          " (" +
          city.region +
          (dept ? ", " + dept : "") +
          "). Un courtier ORIAS cadre le dossier.",
        "Territoires, battue, affût, chasse au gibier d'eau : les garanties ne sont pas les mêmes. Nous comparons RC, individuelle accident et chien de chasse.",
      ],
      list: [
        "Devis assurance chasse " + city.name,
        "RC chasseur " + city.region,
        "Assurance chien de chasse " + city.name,
        "Permis de chasser et responsabilité civile",
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

function vspCitySections(city) {
  return [
    {
      h2: "Assurance voiture sans permis a " + city.name,
      paragraphs: [
        "VSP, voiturette et quadricycle leger : RC obligatoire, vol et bris selon formules. Nous comparons les contrats specialises pour les habitants de " +
          city.name +
          ".",
        "Permis AM (BSR), ASSR selon annee de naissance : le dossier se prepare en ligne, rappel conseiller pour " +
          city.region +
          ".",
      ],
      list: [
        "Devis VSP sans engagement",
        "Jeunes conducteurs 16-25 ans",
        "Marques Aixam, Ligier, Microcar…",
        "Pages nationales : permis AM, tarif, quadricycle",
      ],
    },
  ];
}

function autoCitySections(city) {
  return [
    {
      h2: "Assurance auto à " + city.name,
      paragraphs: [
        "Devis assurance auto à " +
          city.name +
          " (" +
          city.region +
          ") : tous risques, au tiers, intermédiaire, jeune conducteur, bonus-malus, vol, bris de glace.",
        "Stationnement, trajets domicile-travail, sinistralité locale : nous comparons à garanties équivalentes, y compris grilles courtier grossiste.",
      ],
      list: [
        "Devis auto " + city.name,
        "Assurance auto pas cher " + city.name,
        "Tous risques ou tiers",
        "Changer d'assurance auto (loi Hamon)",
        "Malus après accident",
      ],
    },
    {
      h2: "Changer d'assurance auto à " + city.name,
      paragraphs: [
        "Après 12 mois, la loi Hamon permet de résilier sans frais. Relevé d'information obligatoire. Un conseiller ORIAS relit le dossier pour " +
          city.name +
          ".",
      ],
    },
  ];
}

function habitationCitySections(city) {
  return [
    {
      h2: "Assurance habitation à " + city.name,
      paragraphs: [
        "MRH à " +
          city.name +
          " (" +
          city.region +
          ") : locataire, propriétaire occupant, vol, dégâts des eaux, RC vie privée, capital mobilier.",
        "Attestation locataire, copropriété, cave et dépendances : un courtier calibre la formule, y compris offres grossistes.",
      ],
      list: [
        "Devis habitation " + city.name,
        "Assurance locataire " + city.name,
        "MRH propriétaire " + city.name,
        "Vol et cambriolage",
        "Dégâts des eaux et franchise",
      ],
    },
    {
      h2: "Vol, cambriolage et sous-assurance à " + city.name,
      paragraphs: [
        "À " +
          city.name +
          ", vérifiez franchise vol, plafonds bijoux / high-tech et conditions d'alarme. Une sous-évaluation du mobilier plafonne l'indemnité le jour du sinistre.",
      ],
    },
  ];
}

function productIntentPhrases(product) {
  var key = (product && product.key) || "";
  var map = {
    vtc: [
      "devis assurance VTC",
      "RC Pro chauffeur VTC",
      "assurance Uber Bolt Heetch",
      "assurance VTC pas cher",
      "courtier VTC",
    ],
    sante: [
      "devis mutuelle santé",
      "mutuelle optique dentaire",
      "mutuelle hospitalisation",
      "comparatif mutuelle",
      "mutuelle senior",
      "mutuelle TNS",
    ],
    credit: [
      "simulation crédit immobilier",
      "taux crédit immo",
      "courtier crédit",
      "primo-accédant",
      "capacité d'emprunt",
    ],
    pret: [
      "prêt immobilier",
      "simulation prêt",
      "apport personnel",
      "assurance emprunteur",
      "taux immobilier",
    ],
    recherche: [
      "recherche de bien",
      "achat immobilier",
      "appartement maison villa",
      "chasseur immobilier",
      "budget prêt",
    ],
    finance: [
      "rachat de crédits",
      "crédit consommation",
      "crédit professionnel",
      "regroupement de crédits",
      "trésorerie",
    ],
    banque: ["compte bancaire", "épargne", "trésorerie pro", "ouverture de compte", "courtier banque"],
    auto: [
      "devis assurance auto",
      "assurance auto tous risques",
      "assurance auto au tiers",
      "jeune conducteur",
      "bonus-malus",
      "loi Hamon auto",
    ],
    habitation: [
      "devis assurance habitation",
      "MRH locataire",
      "assurance propriétaire",
      "dégâts des eaux",
      "vol cambriolage",
      "loi Hamon habitation",
    ],
    emprunteur: [
      "assurance emprunteur",
      "loi Lemoine",
      "délégation d'assurance",
      "équivalence de garanties",
      "changer d'assurance de prêt",
    ],
    prevoyance: [
      "assurance prévoyance",
      "prévoyance TNS",
      "décès invalidité",
      "arrêt de travail ITT",
      "protection du revenu",
    ],
    animaux: [
      "assurance chien",
      "assurance chat",
      "frais vétérinaires",
      "mutuelle animaux",
      "assurance animaux sans carence",
    ],
    chien: ["assurance chien", "assurance chiot", "chien senior", "frais véto chien", "mutuelle chien"],
    chat: ["assurance chat", "assurance chaton", "chat senior", "frais véto chat", "mutuelle chat"],
    chasse: ["RC chasseur", "assurance chasse", "chien de chasse", "permis de chasser", "responsabilité chasseur"],
    equitation: ["RC équestre", "assurance cheval", "assurance équitation", "centre équestre", "mortalité cheval"],
    vsp: [
      "assurance voiture sans permis",
      "assurance VSP",
      "permis AM",
      "quadricycle léger",
      "voiturette Aixam Ligier",
    ],
  };
  return map[key] || ["devis", "courtier ORIAS", "comparatif", "changer d'assurance"];
}

function humanDept(slug) {
  var small = { et: 1, de: 1, des: 1, du: 1, la: 1, le: 1, les: 1, en: 1, d: 1, l: 1 };
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map(function (w, i) {
      if (i > 0 && small[w]) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join("-");
}

function deptLabel(cityOrDept) {
  if (!cityOrDept) return "";
  if (cityOrDept.dept) return humanDept(cityOrDept.dept);
  if (cityOrDept.slug && cityOrDept.name) return cityOrDept.name;
  return humanDept(cityOrDept.slug || "");
}

function isInsuranceProduct(product) {
  var key = (product && product.key) || "";
  return (
    {
      vtc: 1,
      sante: 1,
      auto: 1,
      habitation: 1,
      emprunteur: 1,
      prevoyance: 1,
      animaux: 1,
      chien: 1,
      chat: 1,
      chasse: 1,
      equitation: 1,
      vsp: 1,
    }[key] === 1
  );
}

function localSwitchPhrase(product, name) {
  var key = (product && product.key) || "";
  if (key === "credit" || key === "pret") return "Simulation crédit " + name;
  if (key === "finance") return "Étude rachat " + name;
  if (key === "banque") return "Rappel banque " + name;
  if (key === "recherche") return "Recherche de bien " + name;
  return "Changer d'assurance à " + name;
}

function localPageKeywords(product, placeName, region, dept) {
  var label = (product && product.siloLabel) || "Assurance";
  var items = [
    label + " " + placeName,
    "devis " + label.toLowerCase() + " " + placeName,
    "courtier " + placeName,
    "comparatif " + placeName,
    isInsuranceProduct(product) ? "changer d'assurance " + placeName : localSwitchPhrase(product, placeName),
    region || "",
    dept ? "assurance " + String(dept).replace(/-/g, " ") : "",
    region ? label + " " + region : "",
    "courtier ORIAS " + placeName,
  ];
  productIntentPhrases(product).forEach(function (p) {
    items.push(p + " " + placeName);
  });
  return items.filter(Boolean).join(", ");
}

function localKeywordSection(product, city) {
  var label = (product && product.siloLabel) || "Assurance";
  var name = city.name;
  var region = city.region || "";
  var dept = deptLabel(city);
  var phrases = productIntentPhrases(product);
  var woven = phrases.slice(0, 5).map(function (p) {
    return p + " " + name;
  });
  return {
    h2: "Devis " + label.toLowerCase() + " à " + name + " — " + region,
    paragraphs: [
      "À " +
        name +
        (region ? " (" + region + (dept ? ", " + dept : "") + ")" : "") +
        ", un courtier ORIAS compare " +
        label.toLowerCase() +
        " à garanties équivalentes : devis gratuit, rappel conseiller, sans engagement.",
      "Les demandes locales portent souvent sur " +
        woven.join(", ") +
        ". Nous traitons aussi les communes voisines du même département.",
    ],
    list: [
      "Devis " + label.toLowerCase() + " " + name,
      "Courtier " + label.toLowerCase() + " " + name,
      "Comparatif " + name + (region ? " / " + region : ""),
      localSwitchPhrase(product, name),
    ].concat(
      phrases.slice(0, 6).map(function (p) {
        return p + " — " + name;
      })
    ),
  };
}

function localCatchmentSection(product, city) {
  var label = (product && product.siloLabel) || "Assurance";
  var name = city.name;
  var region = city.region || "";
  var dept = deptLabel(city);
  return {
    h2: label + " près de " + name + (region ? " — " + region : ""),
    paragraphs: [
      "Le dossier " +
        label.toLowerCase() +
        " se monte à distance pour " +
        name +
        (region ? " et toute la région " + region : "") +
        ". Pages ville, département et région : même parcours devis et même conseiller ORIAS.",
    ],
    list: [
      label + (region ? " " + region : ""),
      dept ? "Devis " + dept : "Devis " + name,
      "Courtier " + (region || name),
      "Communes voisines de " + name,
    ].filter(Boolean),
  };
}

function localKeywordSections(product, city) {
  return [localKeywordSection(product, city), localCatchmentSection(product, city)];
}

function localDeptSection(product, dept, cityCount) {
  var label = (product && product.siloLabel) || "Assurance";
  var phrases = productIntentPhrases(product);
  return {
    h2: "Devis " + label.toLowerCase() + " dans le " + dept.name,
    paragraphs: [
      label +
        " " +
        dept.name +
        " (" +
        dept.region +
        ") : " +
        cityCount +
        " villes couvertes. Courtier ORIAS, devis gratuit, comparatif à garanties équivalentes.",
      "Requêtes fréquentes : devis " +
        label.toLowerCase() +
        " " +
        dept.name +
        ", courtier " +
        dept.name +
        ", " +
        label.toLowerCase() +
        " " +
        dept.region +
        ".",
    ],
    list: phrases.map(function (p) {
      return p + " — " + dept.name;
    }),
  };
}

function localRegionSection(product, region, deptCount, cityCount) {
  var label = (product && product.siloLabel) || "Assurance";
  var phrases = productIntentPhrases(product);
  return {
    h2: label + " en " + region.name + " — devis par ville et département",
    paragraphs: [
      "Devis " +
        label.toLowerCase() +
        " en " +
        region.name +
        " : " +
        deptCount +
        " départements, " +
        cityCount +
        " villes. Courtier ORIAS, rappel conseiller, sans engagement.",
    ],
    list: phrases.slice(0, 6).map(function (p) {
      return p + " — " + region.name;
    }),
  };
}

function localIntentFaq(product, city) {
  var label = (product && product.siloLabel) || "Assurance";
  var name = city.name;
  var region = city.region || "";
  var insuranceKeys = {
    vtc: 1,
    sante: 1,
    auto: 1,
    habitation: 1,
    emprunteur: 1,
    prevoyance: 1,
    animaux: 1,
    chien: 1,
    chat: 1,
    chasse: 1,
    equitation: 1,
    vsp: 1,
  };
  var items = [
    {
      q: "Devis " + label.toLowerCase() + " à " + name + " : comment ça marche ?",
      a:
        "Formulaire en ligne, rappel conseiller ORIAS sous 15 min en journée. Couverture " +
        name +
        (region ? ", " + region : "") +
        " et communes voisines.",
    },
    {
      q: "Y a-t-il un courtier " + label.toLowerCase() + " à " + name + " ?",
      a:
        "Oui : courtage à distance pour " +
        name +
        (region ? " et le " + region : "") +
        ". Pas de magasin obligatoire, dossier 100 % France.",
    },
  ];
  if (insuranceKeys[product && product.key]) {
    items.push({
      q: "Puis-je changer d'" + label.toLowerCase() + " à " + name + " ?",
      a:
        (product && product.key) === "emprunteur"
          ? "Loi Lemoine : délégation et résiliation à tout moment sous équivalence de garanties. Un courtier prépare le dossier pour " +
            name +
            "."
          : "Après 12 mois, la loi Hamon permet souvent de changer sans frais. Un courtier prépare le dossier à " +
            name +
            ".",
    });
  } else {
    items.push({
      q: "Intervenez-vous aussi près de " + name + " ?",
      a: "Oui, tout le " + (region || "département") + " : pages par ville et département, même parcours devis.",
    });
  }
  return items;
}

function santeCitySections(city) {
  return [
    {
      h2: "Mutuelle santé à " + city.name,
      paragraphs: [
        "Devis mutuelle à " +
          city.name +
          " (" +
          city.region +
          ") : optique, dentaire, hospitalisation, médecine courante, senior, TNS.",
        "Le prix seul est trompeur : deux contrats peuvent afficher la même cotisation avec des remboursements très différents. Un courtier ORIAS part de votre usage réel.",
      ],
      list: [
        "Devis mutuelle " + city.name,
        "Comparatif mutuelle " + city.region,
        "Mutuelle optique dentaire",
        "Mutuelle hospitalisation",
        "Mutuelle senior / TNS",
      ],
    },
    {
      h2: "Changer de mutuelle à " + city.name,
      paragraphs: [
        "Résiliation infra-annuelle après 12 mois (loi sur la complémentaire santé). Nous vérifions les délais de carence et le niveau de remboursement avant de vous faire signer à " +
          city.name +
          ".",
      ],
    },
  ];
}

function creditCitySections(city) {
  return [
    {
      h2: "Crédit immobilier à " + city.name,
      paragraphs: [
        "Simulation crédit immobilier à " +
          city.name +
          " (" +
          city.region +
          ") : capacité d'emprunt, apport, taux, assurance emprunteur, HCSF 35 %.",
        "Primo-accédant, résidence principale, investissement locatif : un courtier ORIAS présente un dossier crédible aux banques partenaires.",
      ],
      list: [
        "Simulation crédit " + city.name,
        "Taux immobilier " + city.region,
        "Courtier crédit " + city.name,
        "Prêt refusé : deuxième chance",
        "Assurance emprunteur (Lemoine)",
      ],
    },
  ];
}

function emprunteurCitySections(city) {
  return [
    {
      h2: "Assurance emprunteur à " + city.name,
      paragraphs: [
        "Délégation d'assurance, loi Lemoine, équivalence de garanties : devis assurance emprunteur à " +
          city.name +
          " (" +
          city.region +
          ").",
        "Changer d'assurance de prêt peut baisser le coût total du crédit. Un courtier vérifie ce que votre banque exige avant d'envoyer le dossier.",
      ],
      list: [
        "Devis assurance emprunteur " + city.name,
        "Loi Lemoine " + city.region,
        "Délégation d'assurance de prêt",
        "Équivalence de garanties banque",
      ],
    },
  ];
}

function prevoyanceCitySections(city) {
  return [
    {
      h2: "Prévoyance à " + city.name,
      paragraphs: [
        "Décès, invalidité, arrêt de travail (ITT/IPT), TNS et dirigeants : devis prévoyance à " +
          city.name +
          " (" +
          city.region +
          ").",
        "Salariés, indépendants, professions libérales : les prestations varient selon le statut. Un courtier ORIAS clarifie les garanties avant souscription.",
      ],
      list: [
        "Devis prévoyance " + city.name,
        "Prévoyance TNS " + city.region,
        "Assurance décès invalidité",
        "Protection du revenu / Madelin",
      ],
    },
  ];
}

function equitationCitySections(city) {
  return [
    {
      h2: "Assurance équitation à " + city.name,
      paragraphs: [
        "Propriétaire de cheval, cavalier ou centre équestre à " +
          city.name +
          " : RC équestre, mortalité cheval, matériel, responsabilité civile. Devis équitation " +
          city.region +
          ".",
        "Loisir, compétition, pension : nous orientons vers les contrats encore ouverts, avec un conseiller ORIAS.",
      ],
      list: [
        "Devis assurance équitation " + city.name,
        "RC équestre " + city.region,
        "Assurance cheval " + city.name,
        "Centre équestre et pension",
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
  vspCitySections: vspCitySections,
  autoCitySections: autoCitySections,
  habitationCitySections: habitationCitySections,
  santeCitySections: santeCitySections,
  creditCitySections: creditCitySections,
  emprunteurCitySections: emprunteurCitySections,
  prevoyanceCitySections: prevoyanceCitySections,
  productIntentPhrases: productIntentPhrases,
  humanDept: humanDept,
  isInsuranceProduct: isInsuranceProduct,
  localPageKeywords: localPageKeywords,
  localKeywordSection: localKeywordSection,
  localCatchmentSection: localCatchmentSection,
  localKeywordSections: localKeywordSections,
  localDeptSection: localDeptSection,
  localRegionSection: localRegionSection,
  localIntentFaq: localIntentFaq,
  defaultCityFaq: defaultCityFaq,
  animauxCityFaq: animauxCityFaq,
};
