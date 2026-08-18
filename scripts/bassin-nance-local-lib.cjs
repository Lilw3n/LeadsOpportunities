/**
 * Contenu local bassin nancéien (54) — mine de sel, Solvay, basilique Saint-Nicolas-de-Port.
 * Bureau courtier : Varangeville (15–17 rue Pierre Curie).
 */
var BASSIN_SLUGS = {
  nancy: { name: "Nancy", cp: "54000", role: "agglomeration" },
  varangeville: { name: "Varangeville", cp: "54110", role: "siege" },
  "dombasle-sur-meurthe": { name: "Dombasle-sur-Meurthe", cp: "54110", role: "industrie" },
  "saint-nicolas-de-port": { name: "Saint-Nicolas-de-Port", cp: "54210", role: "patrimoine" },
  maxeville: { name: "Maxéville", cp: "54320", role: "banlieue" },
  luneville: { name: "Lunéville", cp: "54300", role: "ville" },
  toul: { name: "Toul", cp: "54200", role: "ville" },
  "pont-a-mousson": { name: "Pont-à-Mousson", cp: "54700", role: "ville" },
};

var LANDMARKS = {
  mineSel:
    "la mine de sel de Varangeville (Compagnie des Salins du Midi et des Salines de l'Est), au cœur du bassin potassique lorrain",
  solvay:
    "le site industriel Solvay à Dombasle-sur-Meurthe, pilier chimique du val de Meurthe depuis plus d'un siècle",
  basilique:
    "la basilique Saint-Nicolas-de-Port, haut lieu de pèlerinage et monument emblématique de Meurthe-et-Moselle",
};

function isBassinCity(city) {
  if (!city) return false;
  if (city.dept === "meurthe-et-moselle") return true;
  if (city.slug && BASSIN_SLUGS[city.slug]) return true;
  return false;
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

function localIntroParagraph(city) {
  var p = bassinProfile(city);
  if (p.role === "siege") {
    return (
      "Notre bureau est à Varangeville, à deux pas du bassin minier et salifère : " +
      LANDMARKS.mineSel +
      ". Salariés de l'industrie, fonctionnaires, indépendants et familles du 54 : prêt, assurance et immo avec un interlocuteur qui connaît le territoire."
    );
  }
  if (p.role === "industrie" || city.slug === "dombasle-sur-meurthe") {
    return (
      "À Dombasle-sur-Meurthe, " +
      LANDMARKS.solvay +
      " structure l'emploi local. Acheter, assurer ou financer un bien ici, c'est tenir compte de ce tissu industriel et des communes voisines (Varangeville, Nancy, Saint-Nicolas-de-Port)."
    );
  }
  if (p.role === "patrimoine" || city.slug === "saint-nicolas-de-port") {
    return (
      "Saint-Nicolas-de-Port accueille " +
      LANDMARKS.basilique +
      " — ville vivante entre Nancy et le val de Meurthe. Projets immobiliers, mutuelle ou prêt : nous accompagnons résidents et acquéreurs du secteur depuis Varangeville."
    );
  }
  if (city.slug === "nancy") {
    return (
      "Nancy métropole concentre étudiants, fonctionnaires et cadres ; le bassin salifère (mine de Varangeville), l'industrie Solvay à Dombasle et le pèlerinage de Saint-Nicolas-de-Port complètent le marché local. Courtier basé à Varangeville, nous couvrons l'ensemble du 54."
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
    ", un projet immo ou assurance se joue sur le bon interlocuteur. Bureau à Varangeville, rappel sous 15 min."
  );
}

function seoSections(city) {
  if (!isBassinCity(city)) return [];
  var p = bassinProfile(city);
  return [
    {
      h2: p.commune + " et le bassin nancéien : un territoire qu'on connaît",
      paragraphs: [localIntroParagraph(city)],
      list: [
        "Mine de sel de Varangeville — emploi salifère et bassin potassique",
        "Solvay Dombasle — site industriel historique du val de Meurthe",
        "Basilique Saint-Nicolas-de-Port — patrimoine et vie locale",
        "Bureau courtier : 15–17 rue Pierre Curie, Varangeville",
        "Nancy métropole, Maxéville, Lunéville, Toul — même accompagnement",
      ],
    },
    {
      h2: "Acquéreur ou vendeur dans le 54",
      paragraphs: [
        "Simulation prêt, projection du coût réel (taxe foncière, charges), estimation DVF et dépôt de pièces sécurisé : le parcours est pensé pour les projets du bassin, pas pour un modèle parisien générique.",
        "Salariés Solvay, agents des mines, commerçants de Saint-Nicolas, familles nancéiennes : nous calons le dossier sur vos revenus réels et votre projet (RP, investissement, reprise).",
      ],
      list: [
        "Recherche de bien — landings/acheteur-immo.html",
        "Projection achat — charges + prêt",
        "Crédit immo & assurance emprunteur",
        "Estimation vente (données DVF locales)",
      ],
    },
  ];
}

function seoFaqExtra(city) {
  if (!isBassinCity(city)) return [];
  return [
    {
      q: "Où est votre bureau pour le 54 ?",
      a: "15 et 17 rue Pierre Curie, 54110 Varangeville — à proximité du bassin minier et salifère. Rendez-vous sur place ou entièrement à distance.",
    },
    {
      q: "Accompagnez-vous les salariés Solvay et du secteur minier ?",
      a: "Oui. Revenus, prévoyance, mutuelle et prêt immobilier : nous montons des dossiers adaptés aux profils industriels du val de Meurthe.",
    },
    {
      q: "Intervenez-vous à Saint-Nicolas-de-Port et autour de la basilique ?",
      a: "Oui, pour l'achat, la vente, le financement et les assurances — Saint-Nicolas-de-Port, Dombasle, Varangeville et Nancy métropole.",
    },
  ];
}

function proximityLead() {
  return (
    "Basés à Varangeville (mine de sel, bassin potassique), nous connaissons Dombasle et Solvay, Saint-Nicolas-de-Port et sa basilique, ainsi que Nancy métropole. Prêt, assurance et immo avec un même conseiller — pas une plateforme anonyme."
  );
}

module.exports = {
  BASSIN_SLUGS: BASSIN_SLUGS,
  LANDMARKS: LANDMARKS,
  isBassinCity: isBassinCity,
  bassinProfile: bassinProfile,
  localIntroParagraph: localIntroParagraph,
  seoSections: seoSections,
  seoFaqExtra: seoFaqExtra,
  proximityLead: proximityLead,
};
