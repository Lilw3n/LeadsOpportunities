/**
 * Contenu local bassin nancéien (54) — mine de sel, Solvay, basilique Saint-Nicolas-de-Port.
 * Objectif acquisition : attirer des acquéreurs autour de Saint-Nicolas-de-Port et communes voisines.
 * Bureau courtier : Varangeville (15–17 rue Pierre Curie).
 */
var BASSIN_SLUGS = {
  nancy: { name: "Nancy", cp: "54000", role: "agglomeration" },
  varangeville: { name: "Varangeville", cp: "54110", role: "siege" },
  "dombasle-sur-meurthe": { name: "Dombasle-sur-Meurthe", cp: "54110", role: "industrie" },
  "saint-nicolas-de-port": { name: "Saint-Nicolas-de-Port", cp: "54210", role: "patrimoine" },
  "art-sur-meurthe": { name: "Art-sur-Meurthe", cp: "54510", role: "acquereur_rayon" },
  haroue: { name: "Haroué", cp: "54290", role: "acquereur_rayon" },
  "laneuveville-devant-nancy": { name: "Laneuveville-devant-Nancy", cp: "54410", role: "acquereur_rayon" },
  tomblaine: { name: "Tomblaine", cp: "54510", role: "acquereur_rayon" },
  lenoncourt: { name: "Lenoncourt", cp: "54110", role: "acquereur_rayon" },
  dieulouard: { name: "Dieulouard", cp: "54380", role: "acquereur_rayon" },
  montauville: { name: "Montauville", cp: "54770", role: "acquereur_rayon" },
  "fleville-devant-nancy": { name: "Fléville-devant-Nancy", cp: "54710", role: "acquereur_rayon" },
  "blenod-les-pont-a-mousson": { name: "Blénod-lès-Pont-à-Mousson", cp: "54700", role: "acquereur_rayon" },
  maxeville: { name: "Maxéville", cp: "54320", role: "banlieue" },
  luneville: { name: "Lunéville", cp: "54300", role: "ville" },
  toul: { name: "Toul", cp: "54200", role: "ville" },
  "pont-a-mousson": { name: "Pont-à-Mousson", cp: "54700", role: "ville" },
};

/** Communes prioritaires pour acquéreurs autour de Saint-Nicolas-de-Port */
var ACQUEREUR_RAYON_SAINT_NICOLAS = [
  { slug: "saint-nicolas-de-port", name: "Saint-Nicolas-de-Port", cp: "54210" },
  { slug: "art-sur-meurthe", name: "Art-sur-Meurthe", cp: "54510" },
  { slug: "haroue", name: "Haroué", cp: "54290" },
  { slug: "laneuveville-devant-nancy", name: "Laneuveville-devant-Nancy", cp: "54410" },
  { slug: "tomblaine", name: "Tomblaine", cp: "54510" },
  { slug: "lenoncourt", name: "Lenoncourt", cp: "54110" },
  { slug: "dieulouard", name: "Dieulouard", cp: "54380" },
  { slug: "montauville", name: "Montauville", cp: "54770" },
  { slug: "fleville-devant-nancy", name: "Fléville-devant-Nancy", cp: "54710" },
  { slug: "dombasle-sur-meurthe", name: "Dombasle-sur-Meurthe", cp: "54110" },
  { slug: "varangeville", name: "Varangeville", cp: "54110" },
  { slug: "blenod-les-pont-a-mousson", name: "Blénod-lès-Pont-à-Mousson", cp: "54700" },
];

var LANDMARKS = {
  mineSel:
    "la mine de sel de Varangeville (Compagnie des Salins du Midi et des Salines de l'Est), au cœur du bassin potassique lorrain",
  solvay:
    "le site industriel Solvay à Dombasle-sur-Meurthe, pilier chimique du val de Meurthe depuis plus d'un siècle",
  basilique:
    "la basilique Saint-Nicolas-de-Port, haut lieu de pèlerinage et monument emblématique de Meurthe-et-Moselle",
  chateauHaroue: "le château d'Haroué, joyau architectural du sud nancéien",
};

function isBassinCity(city) {
  if (!city) return false;
  if (city.dept === "meurthe-et-moselle") return true;
  if (city.slug && BASSIN_SLUGS[city.slug]) return true;
  return false;
}

function isAcquereurRayonSaintNicolas(city) {
  if (!city || !city.slug) return false;
  return ACQUEREUR_RAYON_SAINT_NICOLAS.some(function (c) {
    return c.slug === city.slug;
  });
}

function bassinProfile(city) {
  var slug = city && city.slug;
  var meta = (slug && BASSIN_SLUGS[slug]) || { name: city.name, cp: "", role: "commune" };
  return {
    commune: meta.name,
    cp: meta.cp,
    role: meta.role,
    siegedAt: "Varangeville (15–17 rue Pierre Curie, 54110)",
    landmarks: LANDMARKS,
  };
}

function acquereurRayonListText() {
  return ACQUEREUR_RAYON_SAINT_NICOLAS.map(function (c) {
    return c.name;
  }).join(", ");
}

function localIntroParagraph(city) {
  var p = bassinProfile(city);
  if (p.role === "siege") {
    return (
      "Notre bureau est à Varangeville, à deux pas du bassin minier et salifère : " +
      LANDMARKS.mineSel +
      ". Nous aidons les acquéreurs du 54 — notamment autour de Saint-Nicolas-de-Port, Art-sur-Meurthe et Haroué — à caler budget, prêt et alerte recherche."
    );
  }
  if (p.role === "industrie" || city.slug === "dombasle-sur-meurthe") {
    return (
      "À Dombasle-sur-Meurthe, " +
      LANDMARKS.solvay +
      " structure l'emploi local. Beaucoup d'acquéreurs ciblent Dombasle, Varangeville ou Saint-Nicolas-de-Port pour rester proches du travail tout en gardant un budget maîtrisé."
    );
  }
  if (p.role === "patrimoine" || city.slug === "saint-nicolas-de-port") {
    return (
      "Vous cherchez à acheter à Saint-Nicolas-de-Port ou aux alentours ? " +
      LANDMARKS.basilique +
      " attire familles et actifs du val de Meurthe. Nous montons alertes recherche, projection budget et dossier prêt depuis notre bureau de Varangeville."
    );
  }
  if (city.slug === "art-sur-meurthe") {
    return (
      "Art-sur-Meurthe est l'une des communes les plus recherchées par les acquéreurs proches de Saint-Nicolas-de-Port : cadre calme, accès rapide à Nancy et au site Solvay de Dombasle. Alerte bien + prêt sur mesure."
    );
  }
  if (city.slug === "haroue") {
    return (
      "Haroué et son " +
      LANDMARKS.chateauHaroue +
      " séduisent les acquéreurs qui veulent du caractère sans s'éloigner de Nancy ni de Saint-Nicolas-de-Port. Maisons et corps de ferme : nous calons l'enveloppe prêt avant les visites."
    );
  }
  if (p.role === "acquereur_rayon") {
    return (
      "Acquéreur à " +
      p.commune +
      " : vous êtes dans le rayon Saint-Nicolas-de-Port / Nancy sud — entre " +
      LANDMARKS.basilique +
      ", Art-sur-Meurthe, Haroué et le val de Meurthe. Alerte recherche, projection charges et dossier banque depuis Varangeville."
    );
  }
  if (city.slug === "nancy") {
    return (
      "Nancy métropole concentre étudiants, fonctionnaires et cadres ; beaucoup d'acquéreurs élargissent vers Saint-Nicolas-de-Port, Art-sur-Meurthe, Haroué ou le bassin salifère (Varangeville, Dombasle). Courtier basé à Varangeville."
    );
  }
  return (
    "En " +
    p.commune +
    " (Meurthe-et-Moselle), entre " +
    LANDMARKS.mineSel +
    ", " +
    LANDMARKS.solvay +
    " et " +
    LANDMARKS.basilique +
    ", un projet d'achat se prépare avec une alerte bien et un prêt validé. Bureau à Varangeville."
  );
}

function acquereurSections(city) {
  if (!isAcquereurRayonSaintNicolas(city) && city.slug !== "nancy" && city.slug !== "varangeville") {
    return [];
  }
  var p = bassinProfile(city);
  return [
    {
      h2: "Acquéreur à " + p.commune + " et alentours de Saint-Nicolas-de-Port",
      paragraphs: [
        "Vous visez " +
          p.commune +
          " ou une commune voisine ? Le marché local mêle maisons de village, pavillons et biens proches de la basilique, d'Art-sur-Meurthe ou du château d'Haroué.",
        "Notre parcours acquéreur : 1) alerte recherche (ville, budget, pièces) 2) projection du coût réel 3) dossier prêt si besoin — sans remplir un questionnaire inutile si vous êtes encore en phase découverte.",
      ],
      list: [
        "Saint-Nicolas-de-Port, Art-sur-Meurthe, Haroué",
        "Laneuveville, Tomblaine, Lenoncourt, Dieulouard",
        "Montauville, Fléville, Dombasle, Varangeville",
        "Coller une annonce Leboncoin / SeLoger / PAP",
      ],
    },
  ];
}

function seoSections(city) {
  if (!isBassinCity(city)) return [];
  var p = bassinProfile(city);
  var sections = [
    {
      h2: p.commune + " et le bassin nancéien : un territoire qu'on connaît",
      paragraphs: [localIntroParagraph(city)],
      list: [
        "Mine de sel de Varangeville — bassin potassique",
        "Solvay Dombasle — emploi industriel local",
        "Basilique Saint-Nicolas-de-Port — cœur du rayon acquéreur",
        "Art-sur-Meurthe, Haroué (château), val de Meurthe",
        "Bureau : 15–17 rue Pierre Curie, Varangeville",
      ],
    },
    {
      h2: "Trouver un bien à acheter dans le 54",
      paragraphs: [
        "Alerte recherche, projection budget (prêt + taxe foncière + charges) et dossier banque : pensé pour les acquéreurs du sud nancéien, pas pour un modèle parisien.",
        "Rayon couvert autour de Saint-Nicolas : " + acquereurRayonListText() + ".",
      ],
      list: [
        "Recherche de bien — /landings/acheteur-immo.html",
        "Projection achat — coût mensuel réel",
        "Crédit immo + assurance emprunteur",
        "Estimation si vous vendez pour racheter",
      ],
    },
  ];
  sections = sections.concat(acquereurSections(city));
  return sections;
}

function seoFaqExtra(city) {
  if (!isBassinCity(city)) return [];
  var faq = [
    {
      q: "Où est votre bureau pour le 54 ?",
      a: "15 et 17 rue Pierre Curie, 54110 Varangeville — à proximité du bassin minier et salifère. Rendez-vous sur place ou entièrement à distance.",
    },
    {
      q: "Je cherche à acheter autour de Saint-Nicolas-de-Port : comment ça marche ?",
      a:
        "Lancez une alerte sur notre recherche de bien (ville, budget, pièces) : Saint-Nicolas, Art-sur-Meurthe, Haroué, etc. On vous rappelle quand un mandat correspond et on enchaîne sur le prêt si besoin.",
    },
    {
      q: "Couvrez-vous Art-sur-Meurthe et Haroué pour les acquéreurs ?",
      a: "Oui. Ce sont des communes très demandées par les acheteurs du bassin. Alerte + projection budget + dossier prêt depuis Varangeville.",
    },
    {
      q: "Accompagnez-vous les salariés Solvay et du secteur minier ?",
      a: "Oui. Revenus, prévoyance, mutuelle et prêt immobilier : dossiers adaptés aux profils industriels du val de Meurthe.",
    },
  ];
  if (city.slug === "saint-nicolas-de-port" || isAcquereurRayonSaintNicolas(city)) {
    faq.push({
      q: "Puis-je cibler plusieurs communes (ex. Saint-Nicolas + Art-sur-Meurthe) ?",
      a: "Oui. Indiquez votre secteur prioritaire dans l'alerte ou collez des annonces de plusieurs villes — nous recalons l'enveloppe prêt sur l'ensemble du projet.",
    });
  }
  return faq;
}

function proximityLead() {
  return (
    "Basés à Varangeville, nous aidons les acquéreurs autour de Saint-Nicolas-de-Port, Art-sur-Meurthe, Haroué, Dombasle (Solvay) et Nancy métropole. Alerte bien, prêt et assurance — un conseiller local."
  );
}

module.exports = {
  BASSIN_SLUGS: BASSIN_SLUGS,
  ACQUEREUR_RAYON_SAINT_NICOLAS: ACQUEREUR_RAYON_SAINT_NICOLAS,
  LANDMARKS: LANDMARKS,
  isBassinCity: isBassinCity,
  isAcquereurRayonSaintNicolas: isAcquereurRayonSaintNicolas,
  bassinProfile: bassinProfile,
  acquereurRayonListText: acquereurRayonListText,
  localIntroParagraph: localIntroParagraph,
  acquereurSections: acquereurSections,
  seoSections: seoSections,
  seoFaqExtra: seoFaqExtra,
  proximityLead: proximityLead,
};
