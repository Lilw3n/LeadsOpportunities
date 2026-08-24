/**
 * SEO local — bassin Nice / Côte d'Azur (06).
 * Priorité leads : assurance animaux (chien, chat), VTC, chasse — puis les autres piliers.
 * Le prêt immobilier reste renvoyé vers Nancy métropole (54), pas un hub crédit niçois.
 */
var PRIORITY_PRODUCTS = ["animaux", "chien", "chat", "vtc", "chasse"];
var OTHER_PRODUCTS = ["equitation", "habitation", "sante", "auto", "emprunteur", "prevoyance"];

var COMMUNES = [
  {
    slug: "nice",
    name: "Nice",
    keywords: ["assurance animaux nice", "assurance vtc nice", "assurance chasse nice"],
    animaux:
      "Ville dense, Promenade des Anglais, collines (Cimiez, Fabron) : chiens en appartement, chats d'intérieur et chaleur estivale. Les urgences véto de nuit se paient cher — un plafond confort évite de choisir selon la facture.",
    vtc:
      "Aéroport NCE, port de croisière, gare Nice-Ville, hôtels Promenade et collines : volume de courses élevé toute l'année, pics Festival de Cannes et saison. Déclarez un usage Côte d'Azur, pas seulement communal.",
    chasse:
      "Nice intra-muros n'est pas un territoire de chasse : les demandes viennent du Moyen Pays, de la Vésubie et des sociétés du 06. RC chasseur et chien courant se montent depuis Nice pour tout le département.",
    local: "Métropole Nice Côte d'Azur — Baie des Anges, A8, tram, aéroport",
  },
  {
    slug: "cagnes-sur-mer",
    name: "Cagnes-sur-Mer",
    keywords: ["assurance chien cagnes", "assurance vtc cagnes sur mer"],
    animaux:
      "Hippodrome, villas et résidences entre mer et colline : beaucoup de chiens de taille moyenne. Tiques et chaleur côtière dès mai — vérifiez prévention et plafond hospitalisation.",
    vtc:
      "Entre Nice et Antibes sur la basse, Hippodrome et Villeneuve-Loubet : liaisons aéroport et courses soirées. Stationnement tendu au Cros-de-Cagnes.",
    chasse:
      "Cagnes est urbaine ; les chasseurs du secteur visent plutôt Vence, Grasse et l'arrière-pays. Nous montons la RC depuis Cagnes pour tout le 06.",
    local: "Entre Nice et Antibes — Cros-de-Cagnes, hippodrome, colline",
  },
  {
    slug: "saint-laurent-du-var",
    name: "Saint-Laurent-du-Var",
    keywords: ["assurance vtc saint laurent du var", "assurance animaux saint laurent du var"],
    animaux:
      "Cap 3000, résidences et bords du Var : chiens en balade le long de la promenade, chats d'appartement. Cliniques de l'ouest niçois accessibles — comparez plafonds avant un gros acte.",
    vtc:
      "Porte de l'aéroport Nice-Côte d'Azur : files terminaux, hôtels aéroport, Cap 3000. Usage aéroport + A8 à déclarer clairement au contrat.",
    chasse:
      "Commune urbaine collée à Nice. Les dossiers chasse du Var / Estérol ou Moyen Pays se montent ici comme à Nice.",
    local: "Aéroport NCE, Cap 3000, embouchure du Var",
  },
  {
    slug: "antibes",
    name: "Antibes",
    keywords: ["assurance animaux antibes", "assurance vtc antibes", "assurance chat juan les pins"],
    animaux:
      "Vieille ville, Juan-les-Pins, Cap d'Antibes : mix chats d'appartement et chiens de villas. Été très chaud, tiques dans les pinèdes — prévention et urgence comptent.",
    vtc:
      "Port Vauban, Juan-les-Pins, liaisons Cannes / Nice / aéroport. Saison et événements (Jazz à Juan) : kilométrage côtier, pas seulement urbain.",
    chasse:
      "Antibes est littoral ; les territoires sont plutôt vers Vallauris / hinterland grassois. RC chasseur valable pour les sorties 06 et 83.",
    local: "Juan-les-Pins, Cap d'Antibes, Port Vauban",
  },
  {
    slug: "cannes",
    name: "Cannes",
    keywords: ["assurance vtc cannes", "assurance chien cannes", "assurance animaux cannes"],
    animaux:
      "Croisette, Californie, résidences standing : beaucoup de petits chiens et chats d'intérieur. Copropriétés strictes — un contrat clair rassure aussi le syndic.",
    vtc:
      "Festival, Palais, Croisette, gare, liaisons aéroport Nice et Mandelieu. Pics événementiels : le contrat doit autoriser le transport de personnes à titre onéreux toute l'année.",
    chasse:
      "Cannes n'est pas un territoire de chasse. Les chasseurs cannois sortent vers l'Estérel, Grasse ou le Moyen Pays — RC et chien de chasse depuis Cannes.",
    local: "Croisette, Palais des Festivals, Californie",
  },
  {
    slug: "le-cannet",
    name: "Le Cannet",
    keywords: ["assurance animaux le cannet", "assurance chien le cannet"],
    animaux:
      "Résidentiel collé à Cannes : maisons, collectifs, chiens de famille. Moins de tourisme que la Croisette, mêmes cliniques véto cannoises.",
    vtc:
      "Base résidentielle pour courses Cannes / Mougins / aéroport. Moins de files Promenade, plus de prises en charge hôtels et domiciles.",
    chasse: "Sorties vers Grasse, Tanneron, Estérel. RC chasseur montée depuis Le Cannet pour le 06.",
    local: "Collé à Cannes — Rocheville, Californie côté colline",
  },
  {
    slug: "mougins",
    name: "Mougins",
    keywords: ["assurance animaux mougins", "assurance vtc mougins"],
    animaux:
      "Villas, golfs, collines : chiens de propriété et chats. Zones boisées = tiques, sangliers aux abords. Plafond chirurgie utile.",
    vtc:
      "Sophia / Cannes / Valbonne : clientèle résidentielle et corporate. Accès A8, moins de files aéroport qu'à Saint-Laurent.",
    chasse: "Proximité hinterland grassois et Tanneron — dossiers RC + chien courant fréquents.",
    local: "Entre Cannes et Grasse — golfs, villas, accès Sophia",
  },
  {
    slug: "grasse",
    name: "Grasse",
    keywords: ["assurance chasse grasse", "assurance animaux grasse", "rc chasseur grasse"],
    animaux:
      "Préfecture des Alpes-Maritimes, collines et villages : chiens de maison, chats, parfois chiens de chasse. Contrats animaux et chasse se croisent souvent.",
    vtc:
      "Moins de volume aéroport que Nice, plus de liaisons Cannes / Sophia / Moyen Pays. Usage mixte à déclarer.",
    chasse:
      "Porte du Moyen Pays grassois : sociétés de chasse, sanglier, territoires collinaires. RC chasseur et options chien courant sont le cœur du dossier.",
    local: "Capitale du parfum, porte du Moyen Pays (06)",
  },
  {
    slug: "vence",
    name: "Vence",
    keywords: ["assurance chasse vence", "assurance chien vence"],
    animaux:
      "Cité médiévale et collines : chiens en jardin, tiques, chaleur. Cliniques de Vence / Cagnes — comparez franchise et plafond annuel.",
    vtc: "Liaisons Nice / Cagnes / Tourrettes. Volume plus faible que le littoral, courses souvent plus longues.",
    chasse:
      "Vence et le moyen pays (Coursegoules, Courmettes) : vrais territoires. RC, défense pénale et chien de chasse à caler avant l'ouverture.",
    local: "Moyen Pays niçois — collines, villages, accès Baie des Anges",
  },
  {
    slug: "valbonne",
    name: "Valbonne",
    keywords: ["assurance vtc valbonne", "assurance animaux sophia antipolis"],
    animaux:
      "Village et technopole Sophia Antipolis : chiens de cadres, chats d'appart. Parcs et pinèdes — prévention antiparasitaire utile.",
    vtc:
      "Sophia Antipolis : courses corporate, hôtels campus, liaisons aéroport Nice et gares Cannes / Antibes. Usage pro à faire figurer.",
    chasse: "Moins de chasse urbaine ; les sorties se font vers Grasse / hinterland. RC depuis Valbonne pour le 06.",
    local: "Sophia Antipolis — campus, hôtels d'affaires, village",
  },
  {
    slug: "villeneuve-loubet",
    name: "Villeneuve-Loubet",
    keywords: ["assurance animaux villeneuve loubet", "assurance vtc marina baie des anges"],
    animaux:
      "Marina Baie des Anges, lots pavillonnaires, bords du Loup : chiens en résidence et en maison. Copropriétés tours = règlement animalier à anticiper.",
    vtc: "Entre Cagnes et Antibes, Marina, A8. Liaisons aéroport et littoral — usage côtier.",
    chasse: "Littoral urbanisé ; chasse plutôt vers hinterland. Dossier RC 06 depuis Villeneuve-Loubet.",
    local: "Marina Baie des Anges, embouchure du Loup",
  },
  {
    slug: "mandelieu-la-napoule",
    name: "Mandelieu-la-Napoule",
    keywords: ["assurance vtc mandelieu", "assurance animaux mandelieu"],
    animaux: "Port, Estérel, résidences : chiens en balade pinède, chaleur, tiques. Urgences Cannes / Mandelieu.",
    vtc:
      "Aéroport Cannes-Mandelieu, port de La Napoule, liaisons Croisette et A8. Mix loisir / affaires, saison très marquée.",
    chasse: "Estérel proche : sanglier, sociétés du 06/83. RC chasseur + chien de chasse.",
    local: "Estérel, port de La Napoule, aéroport Cannes-Mandelieu",
  },
  {
    slug: "menton",
    name: "Menton",
    keywords: ["assurance animaux menton", "assurance vtc menton"],
    animaux:
      "Frontière italienne, microclimat, résidences : chats d'appartement, petits chiens. Cliniques Menton / Roquebrune.",
    vtc:
      "Menton, Roquebrune, liaisons Nice et Italie (côté FR uniquement pour nos contrats). Courses frontalières : rester sur un usage France métropolitaine.",
    chasse: "Territoires vers Sospel / hinterland mentonnais. RC chasseur 06.",
    local: "Frontière italienne, baie de Garavan, microclimat",
  },
  {
    slug: "saint-jean-cap-ferrat",
    name: "Saint-Jean-Cap-Ferrat",
    keywords: ["assurance animaux saint jean cap ferrat"],
    animaux: "Villas, palaces, chiens de propriété. Contrats confort, plafonds élevés, souvent plusieurs animaux.",
    vtc: "Clientèle palaces et villas, transferts aéroport Nice. Berlines, image véhicule, courses haut de gamme.",
    chasse: "Presqu'île résidentielle — dossiers chasse du 06 montés depuis le Cap.",
    local: "Presqu'île, palaces, villas entre Nice et Beaulieu",
  },
  {
    slug: "villefranche-sur-mer",
    name: "Villefranche-sur-Mer",
    keywords: ["assurance vtc villefranche", "assurance animaux villefranche sur mer"],
    animaux: "Rade, vieille ville, colline : chiens en ruelles étroites, chats. Accès véto Nice / Beaulieu.",
    vtc: "Port de croisière, rade, liaisons Nice / Cap-Ferrat. Pics paquebots.",
    chasse: "Littoral ; chasse vers l'arrière-pays niçois. RC 06.",
    local: "Rade de Villefranche, port de croisière",
  },
  {
    slug: "beaulieu-sur-mer",
    name: "Beaulieu-sur-Mer",
    keywords: ["assurance animaux beaulieu sur mer"],
    animaux: "Petite commune résidentielle entre Villefranche et Eze : chiens de standing, chats d'appartement.",
    vtc: "Hôtels, casino, liaisons Nice / Monaco côté FR. Courses courtes littoral + aéroport.",
    chasse: "Pas de territoire local — RC pour sorties 06.",
    local: "Entre Villefranche et Cap-d'Ail — hôtels, casino",
  },
  {
    slug: "biot",
    name: "Biot",
    keywords: ["assurance animaux biot", "assurance vtc biot"],
    animaux: "Village perché, verre, collines : chiens de maison, tiques, sangliers aux abords.",
    vtc: "Entre Antibes et Valbonne, Villeneuve-Loubet. Mix loisir / Sophia.",
    chasse: "Collines biotaises / hinterland — RC et chien courant.",
    local: "Village, verrerie, entre Antibes et Sophia",
  },
  {
    slug: "roquebrune-cap-martin",
    name: "Roquebrune-Cap-Martin",
    keywords: ["assurance animaux roquebrune cap martin"],
    animaux: "Cap Martin, Cabanon, colline : chiens en villa, chaleur, sentiers côtiers.",
    vtc: "Entre Menton et Cap-d'Ail, liaisons Nice. Usage littoral est.",
    chasse: "Hinterland mentonnais / Sospel. RC chasseur 06.",
    local: "Cap Martin, entre Menton et Monaco (côté France)",
  },
  {
    slug: "vallauris",
    name: "Vallauris",
    keywords: ["assurance animaux vallauris", "assurance chien golfe juan"],
    animaux: "Golfe-Juan, céramique, colline : chiens de famille, chats. Accès véto Antibes / Cannes.",
    vtc: "Golfe-Juan, liaisons Cannes / Antibes / aéroport. Saison portuaire.",
    chasse: "Collines vers Mougins / Grasse. RC 06.",
    local: "Golfe-Juan, Vallauris village, entre Cannes et Antibes",
  },
  {
    slug: "la-trinite",
    name: "La Trinité",
    keywords: ["assurance animaux la trinite", "assurance vtc la trinite 06"],
    animaux: "Porte nord-est de Nice, zones d'activité et collines : chiens de maison, accès cliniques niçoises.",
    vtc: "Axe Nice / Moyen Pays, liaisons Paillon. Moins de Promenade, plus de domicile / zones d'activité.",
    chasse: "Accès Vésubie / hinterland. RC chasseur depuis La Trinité.",
    local: "Paillon, porte de la Vésubie, nord-est de Nice",
  },
  {
    slug: "carros",
    name: "Carros",
    keywords: ["assurance animaux carros", "assurance chasse carros"],
    animaux: "Carros-Ville et Carros-le-Neuf : chiens de lotissement, chats. Moins de tourisme, mêmes assureurs.",
    vtc: "Zone industrielle, liaisons Nice / Saint-Laurent. Usage mixte pro / domicile.",
    chasse: "Collines du moyen Var / hinterland. RC et chien de chasse.",
    local: "Moyen Var, zone d'activité, collines au-dessus de Saint-Laurent",
  },
  {
    slug: "saint-martin-vesubie",
    name: "Saint-Martin-Vésubie",
    keywords: ["assurance chasse saint martin vesubie", "assurance chien de chasse vesubie"],
    animaux:
      "Montagne, parc du Mercantour : chiens de randonnée et chiens de chasse. Blessures, tiques, sangliers — plafond et RC animalières à regarder.",
    vtc: "Peu de VTC local ; liaisons Nice / La Trinité pour les chauffeurs de la métropole.",
    chasse:
      "Cœur Vésubie / Mercantour : ouverture, battues, chiens courants. RC chasseur, défense, options chien — dossier prioritaire hinterland 06.",
    local: "Mercantour, Vésubie, Suisse niçoise",
    hinterland: true,
  },
  {
    slug: "sospel",
    name: "Sospel",
    keywords: ["assurance chasse sospel", "rc chasseur sospel"],
    animaux: "Vallée de la Bévéra : chiens de maison et de chasse. Cliniques Menton / Nice.",
    vtc: "Liaisons Menton / hinterland. Volume faible, courses plus longues.",
    chasse:
      "Territoires Bévéra / Authion : sanglier, sociétés locales. RC chasseur et chien courant — angle SEO chasse 06.",
    local: "Bévéra, Authion, porte mentonnaise du Mercantour",
    hinterland: true,
  },
];

var SLUG_SET = {};
COMMUNES.forEach(function (c) {
  SLUG_SET[c.slug] = c;
});

var PRODUCT_META = {
  animaux: {
    silo: "Assurance animaux",
    dir: "assurance-animaux",
    landing: "/landings/animaux.html",
    keywordLead: "assurance chien chat",
  },
  chien: {
    silo: "Assurance chien",
    dir: "assurance-chien",
    landing: "/landings/animaux.html",
    keywordLead: "assurance chien",
  },
  chat: {
    silo: "Assurance chat",
    dir: "assurance-chat",
    landing: "/landings/animaux.html",
    keywordLead: "assurance chat",
  },
  vtc: {
    silo: "Assurance VTC",
    dir: "assurance-vtc",
    landing: "/landings/vtc.html",
    keywordLead: "assurance VTC",
  },
  chasse: {
    silo: "Assurance chasse",
    dir: "assurance-chasse",
    landing: "/landings/chasse.html",
    keywordLead: "RC chasseur",
  },
  equitation: {
    silo: "Assurance équitation",
    dir: "assurance-equitation",
    landing: "/landings/equitation.html",
    keywordLead: "assurance équitation",
  },
  habitation: {
    silo: "Assurance habitation",
    dir: "assurance-habitation",
    landing: "/landings/devis.html?need=habitation",
    keywordLead: "assurance habitation",
  },
  sante: {
    silo: "Mutuelle santé",
    dir: "assurance-sante",
    landing: "/landings/sante.html",
    keywordLead: "mutuelle",
  },
  auto: {
    silo: "Assurance auto",
    dir: "assurance-auto",
    landing: "/landings/devis.html?need=auto",
    keywordLead: "assurance auto",
  },
  emprunteur: {
    silo: "Assurance emprunteur",
    dir: "assurance-emprunteur",
    landing: "/landings/devis.html?need=emprunteur",
    keywordLead: "assurance emprunteur",
  },
  prevoyance: {
    silo: "Assurance prévoyance",
    dir: "assurance-prevoyance",
    landing: "/landings/devis.html?need=prevoyance",
    keywordLead: "prévoyance",
  },
};

function getCommune(slugOrCity) {
  var slug = typeof slugOrCity === "string" ? slugOrCity : slugOrCity && slugOrCity.slug;
  return SLUG_SET[slug] || null;
}

function isBassinCity(city) {
  return !!(city && SLUG_SET[city.slug]);
}

function allSlugs() {
  return COMMUNES.map(function (c) {
    return c.slug;
  });
}

function supportsProduct(key) {
  return PRIORITY_PRODUCTS.indexOf(key) !== -1 || OTHER_PRODUCTS.indexOf(key) !== -1;
}

function isPriorityProduct(key) {
  return PRIORITY_PRODUCTS.indexOf(key) !== -1;
}

function fieldForProduct(c, key) {
  if (key === "animaux" || key === "chien" || key === "chat") return c.animaux;
  if (key === "vtc") return c.vtc;
  if (key === "chasse") return c.chasse;
  return c.local;
}

function cityTitle(product, city) {
  var c = getCommune(city);
  var name = c ? c.name : city.name;
  var meta = PRODUCT_META[product.key] || {};
  if (product.key === "animaux") return "Assurance animaux " + name + " | Chien & chat — Côte d'Azur (06)";
  if (product.key === "chien") return "Assurance chien " + name + " | Devis Côte d'Azur (06)";
  if (product.key === "chat") return "Assurance chat " + name + " | Devis Côte d'Azur (06)";
  if (product.key === "vtc") return "Assurance VTC " + name + " | Aéroport Nice, Côte d'Azur";
  if (product.key === "chasse") return "Assurance chasse " + name + " | RC chasseur Alpes-Maritimes";
  return (meta.silo || product.siloLabel) + " " + name + " | Côte d'Azur (06)";
}

function cityDescription(product, city) {
  var c = getCommune(city);
  var name = c ? c.name : city.name;
  if (product.key === "animaux") {
    return (
      "Assurance chien et chat à " +
      name +
      " (Alpes-Maritimes) : frais véto, chaleur côtière, plafonds. Comparatif Santévet, Bulle Bleue, Kozoo. Courtier ORIAS, devis gratuit."
    );
  }
  if (product.key === "chien") {
    return "Assurance chien à " + name + " : chiot, adulte, senior. Devis Côte d'Azur, courtier ORIAS, rappel conseiller.";
  }
  if (product.key === "chat") {
    return "Assurance chat à " + name + " : chaton, intérieur, senior. Devis Alpes-Maritimes, courtier ORIAS.";
  }
  if (product.key === "vtc") {
    return (
      "Assurance VTC à " +
      name +
      " : aéroport Nice-Côte d'Azur, Promenade, Cannes, Uber Bolt. RC Pro, véhicule, courtier ORIAS."
    );
  }
  if (product.key === "chasse") {
    return (
      "Assurance chasse à " +
      name +
      " : RC chasseur, chien courant, hinterland Mercantour / Moyen Pays (06). Devis gratuit, courtier ORIAS."
    );
  }
  return (
    (PRODUCT_META[product.key] ? PRODUCT_META[product.key].silo : product.siloLabel) +
    " à " +
    name +
    " (Côte d'Azur, 06). Courtier ORIAS, devis gratuit."
  );
}

function cityH1(product, city) {
  var c = getCommune(city);
  var name = c ? c.name : city.name;
  if (product.key === "animaux") return "Assurance animaux à " + name + " — chien et chat, Côte d'Azur";
  if (product.key === "chien") return "Assurance chien à " + name;
  if (product.key === "chat") return "Assurance chat à " + name;
  if (product.key === "vtc") return "Assurance VTC à " + name + " (Côte d'Azur)";
  if (product.key === "chasse") return "Assurance chasse à " + name + " — RC chasseur 06";
  return (product.siloLabel || "Assurance") + " à " + name;
}

function cityIntro(product, city) {
  var c = getCommune(city);
  var name = c ? c.name : city.name;
  var body = c ? fieldForProduct(c, product.key) : "";
  if (product.key === "animaux" || product.key === "chien" || product.key === "chat") {
    return (
      "Propriétaire à " +
      name +
      " ? " +
      body +
      " Nous comparons les formules (prévention, chirurgie, plafonds) avec un conseiller ORIAS — demande en ligne, rappel en journée ouvrable."
    );
  }
  if (product.key === "vtc") {
    return (
      "Chauffeur VTC basé à " +
      name +
      " ? " +
      body +
      " Nous alignons RC Pro et véhicule sur Uber, Bolt, Heetch pour la zone Nice — Côte d'Azur."
    );
  }
  if (product.key === "chasse") {
    return (
      "Chasseur à " +
      name +
      " ou dans le 06 ? " +
      body +
      " Devis RC chasseur et options chien de chasse, sans engagement."
    );
  }
  return (
    "Habitant de " +
    name +
    " (" +
    (c ? c.local : "Côte d'Azur") +
    ") : devis " +
    (product.siloLabel || "assurance") +
    " en ligne, rappel conseiller ORIAS. Même accompagnement que Nice, Antibes, Cannes et le bassin."
  );
}

function citySections(product, city) {
  var c = getCommune(city);
  var name = c ? c.name : city.name;
  var body = c ? fieldForProduct(c, product.key) : "";
  var sections = [];

  if (product.key === "animaux" || product.key === "chien" || product.key === "chat") {
    var species = product.key === "chat" ? "chat" : product.key === "chien" ? "chien" : "chien et chat";
    sections.push({
      h2: "Assurance " + species + " à " + name + " — bassin Nice Côte d'Azur",
      paragraphs: [
        body,
        "Santévet, Bulle Bleue, Kozoo et le réseau courtage : nous filtrons plafonds, franchises et délais de carence selon l'âge et l'espèce — pas seulement le prix affiché.",
      ],
      list: [
        "Chien : chiot, adulte, senior, grandes races",
        "Chat : chaton, intérieur / extérieur, senior",
        "Chaleur côtière, tiques, urgences de nuit",
        "Devis landing animaux ou rappel express 30 s",
      ],
    });
    sections.push({
      h2: "Communes voisines — même comparatif",
      paragraphs: [
        "Nice, Cagnes-sur-Mer, Saint-Laurent-du-Var, Antibes, Cannes, Le Cannet, Menton et le Moyen Pays : une seule demande couvre tout le 06.",
        "Hub Côte d'Azur animaux pour toutes les pages locales.",
      ],
    });
    return sections;
  }

  if (product.key === "vtc") {
    sections.push({
      h2: "Assurance VTC à " + name + " — aéroport Nice et Côte d'Azur",
      paragraphs: [
        body,
        "Le contrat auto perso ne couvre pas le transport de personnes à titre onéreux. Nous vérifions RC Pro, dommages véhicule, franchises et usage aéroport / A8 / Promenade.",
      ],
      list: [
        "Compatible Uber, Bolt, Heetch",
        "Aéroport Nice-Côte d'Azur (NCE)",
        "Cannes, Antibes, Sophia Antipolis",
        "Création d'activité ou renouvellement",
      ],
    });
    sections.push({
      h2: "Maillage VTC Côte d'Azur",
      paragraphs: [
        "Consultez le hub Côte d'Azur, la page aéroport Nice et les fiches Cannes / Antibes / Saint-Laurent-du-Var. Même courtier que le silo Île-de-France, zone d'exercice différente.",
      ],
    });
    return sections;
  }

  if (product.key === "chasse") {
    sections.push({
      h2: "RC chasseur à " + name + " — Alpes-Maritimes",
      paragraphs: [
        body,
        "Le littoral (Nice, Cannes, Antibes) n'est pas le terrain : les sorties se font au Moyen Pays, Vésubie, Mercantour, Estérel. La RC et le chien de chasse se souscrivent depuis n'importe quelle commune du 06.",
      ],
      list: [
        "RC chasseur et défense pénale",
        "Options chien courant / chien de chasse",
        "Territoires 06 et limitrophes (83, 04)",
        "Devis en ligne, rappel conseiller",
      ],
    });
    return sections;
  }

  sections.push({
    h2: (product.siloLabel || "Assurance") + " à " + name + " — Côte d'Azur",
    paragraphs: [
      body + ".",
      "Même parcours que Nice, Cagnes, Antibes et Cannes : formulaire en ligne, comparatif expliqué, courtier ORIAS. Le prêt immobilier du cabinet reste ancré sur Nancy métropole (54) — ici on capte les leads assurance du 06.",
    ],
  });
  return sections;
}

function cityFaq(product, city) {
  var c = getCommune(city);
  var name = c ? c.name : city.name;
  if (product.key === "animaux" || product.key === "chien" || product.key === "chat") {
    return [
      {
        q: "Puis-je assurer mon chien ou chat depuis " + name + " ?",
        a:
          "Oui. Devis en ligne pour " +
          name +
          " et tout le bassin Nice Côte d'Azur (06). Rappel conseiller, sans engagement.",
      },
      {
        q: "Les cliniques vétérinaires de la Côte d'Azur sont-elles concernées ?",
        a: "L'assurance rembourse selon le contrat, pas selon une clinique agréée. Nice, Cagnes, Antibes, Cannes : mêmes plafonds.",
      },
      {
        q: "La chaleur estivale change-t-elle quelque chose ?",
        a: "Elle n'est pas une exclusion classique, mais les urgences (coup de chaleur, piqûres) pèsent sur le plafond. Nous calibrons en conséquence.",
      },
    ];
  }
  if (product.key === "vtc") {
    return [
      {
        q: "Assurance VTC à " + name + " compatible Uber / Bolt ?",
        a: "Oui. Nous alignons RC Pro et véhicule sur les exigences plateformes pour les chauffeurs basés à " + name + " et l'aéroport Nice.",
      },
      {
        q: "Faut-il une zone aéroport sur le contrat ?",
        a: "Si vous faites NCE (Saint-Laurent-du-Var / Nice), déclarez l'usage aéroport et A8. Nous le faisons figurer dans le comparatif.",
      },
      {
        q: "Cannes et Nice : deux contrats ?",
        a: "Non. Un usage Côte d'Azur couvre en général Nice, Cannes, Antibes, Sophia. C'est le kilométrage et le stationnement qui varient.",
      },
    ];
  }
  if (product.key === "chasse") {
    return [
      {
        q: "La RC chasse est-elle utile si j'habite " + name + " en ville ?",
        a: "Oui si vous chassez dans le 06 (Moyen Pays, Vésubie, Estérel…). La commune de résidence n'est pas le territoire.",
      },
      {
        q: "Puis-je assurer mon chien de chasse à part ?",
        a: "Oui : option sur la police chasse ou assurance chien classique en complément. Nous comparons les deux.",
      },
    ];
  }
  return [
    {
      q: "Intervenez-vous à " + name + " ?",
      a: "Oui, pour les assurances du bassin Nice Côte d'Azur (06). Devis en ligne, rappel conseiller ORIAS.",
    },
  ];
}

function nearbyLinks(city, productDir) {
  return COMMUNES.filter(function (c) {
    return c.slug !== city.slug;
  })
    .slice(0, 16)
    .map(function (c) {
      return {
        href: "/" + productDir + "/" + c.slug + "/",
        label: c.name,
      };
    });
}

function hubCityGrid(productDir) {
  return COMMUNES.map(function (c) {
    return { href: "/" + productDir + "/" + c.slug + "/", label: c.name };
  });
}

function hubRelated() {
  return [
    { href: "/assurance-animaux/nice-cote-azur/", label: "Hub animaux Côte d'Azur" },
    { href: "/assurance-vtc/cote-d-azur/", label: "Hub VTC Côte d'Azur" },
    { href: "/assurance-vtc/aeroport-nice/", label: "VTC aéroport Nice" },
    { href: "/assurance-chasse/cote-d-azur/", label: "Hub chasse 06" },
    { href: "/nice-cote-azur/", label: "Hub Nice Côte d'Azur" },
  ];
}

function extraRelatedForProduct(key) {
  var extra = hubRelated();
  if (key === "animaux" || key === "chien" || key === "chat") {
    extra = extra.concat([
      { href: "/assurance-animaux/chien/pas-cher/", label: "Chien pas cher" },
      { href: "/landings/animaux.html", label: "Devis animaux" },
    ]);
  }
  if (key === "vtc") {
    extra = extra.concat([
      { href: "/assurance-vtc/ile-de-france/", label: "VTC Île-de-France" },
      { href: "/landings/vtc.html", label: "Devis VTC" },
    ]);
  }
  if (key === "chasse") {
    extra = extra.concat([
      { href: "/assurance-chasse/rc-chasseur/", label: "RC chasseur" },
      { href: "/landings/chasse.html", label: "Devis chasse" },
    ]);
  }
  return extra;
}

function newCityRows() {
  return [
    ["cagnes-sur-mer", "Cagnes-sur-Mer", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["saint-laurent-du-var", "Saint-Laurent-du-Var", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["le-cannet", "Le Cannet", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["mougins", "Mougins", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["villeneuve-loubet", "Villeneuve-Loubet", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["mandelieu-la-napoule", "Mandelieu-la-Napoule", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["vence", "Vence", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["valbonne", "Valbonne", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["villefranche-sur-mer", "Villefranche-sur-Mer", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["beaulieu-sur-mer", "Beaulieu-sur-Mer", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["biot", "Biot", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["roquebrune-cap-martin", "Roquebrune-Cap-Martin", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["vallauris", "Vallauris", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["la-trinite", "La Trinité", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["carros", "Carros", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["saint-martin-vesubie", "Saint-Martin-Vésubie", "provence-alpes-cote-d-azur", "alpes-maritimes"],
    ["sospel", "Sospel", "provence-alpes-cote-d-azur", "alpes-maritimes"],
  ];
}

var NEW_SLUG_SET = {};
newCityRows().forEach(function (row) {
  NEW_SLUG_SET[row[0]] = true;
});

function isNewBassinCity(city) {
  var slug = typeof city === "string" ? city : city && city.slug;
  return !!NEW_SLUG_SET[slug];
}

function isCreditProduct(key) {
  return key === "pret" || key === "credit";
}

function shouldNoindexCredit(city, key) {
  return isNewBassinCity(city) && isCreditProduct(key);
}

function nancyCreditCanonical(key) {
  return key === "credit" ? "/credit-immo/nancy-metropole/" : "/pret-immobilier/nancy-metropole/";
}

module.exports = {
  COMMUNES: COMMUNES,
  PRIORITY_PRODUCTS: PRIORITY_PRODUCTS,
  OTHER_PRODUCTS: OTHER_PRODUCTS,
  PRODUCT_META: PRODUCT_META,
  allSlugs: allSlugs,
  getCommune: getCommune,
  isBassinCity: isBassinCity,
  supportsProduct: supportsProduct,
  isPriorityProduct: isPriorityProduct,
  cityTitle: cityTitle,
  cityDescription: cityDescription,
  cityH1: cityH1,
  cityIntro: cityIntro,
  citySections: citySections,
  cityFaq: cityFaq,
  nearbyLinks: nearbyLinks,
  hubCityGrid: hubCityGrid,
  hubRelated: hubRelated,
  extraRelatedForProduct: extraRelatedForProduct,
  newCityRows: newCityRows,
  isNewBassinCity: isNewBassinCity,
  isCreditProduct: isCreditProduct,
  shouldNoindexCredit: shouldNoindexCredit,
  nancyCreditCanonical: nancyCreditCanonical,
};
