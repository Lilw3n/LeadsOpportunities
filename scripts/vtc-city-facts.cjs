/**
 * Repères locaux des villes VTC indexées (aéroports, gares, courses types).
 * Uniquement des faits vérifiables et stables : pas de tarifs, pas de statistiques.
 * Sert à rendre chaque page ville réellement différente des autres.
 */
const FACTS = {
  paris: {
    airports: "les aéroports Paris-Charles-de-Gaulle et Paris-Orly",
    stations: "les grandes gares (Gare du Nord, Gare de Lyon, Montparnasse, Saint-Lazare)",
    rides: ["Transferts aéroports CDG et Orly", "Courses de nuit et sorties de gares", "Quartiers d’affaires, dont La Défense", "Salons et événements (Porte de Versailles, Villepinte)"],
    note: "À Paris, le kilométrage annuel et les trajets de nuit sont élevés : ce sont deux informations que l’assureur demande et qui pèsent sur le tarif.",
  },
  lyon: {
    airports: "l’aéroport Lyon-Saint-Exupéry",
    stations: "les gares de la Part-Dieu et de Perrache",
    rides: ["Transferts vers Lyon-Saint-Exupéry", "Sorties de gare Part-Dieu et Perrache", "Presqu’île, Confluence et quartier d’affaires de la Part-Dieu", "Événements à Eurexpo et au Groupama Stadium"],
    note: "Beaucoup de chauffeurs lyonnais enchaînent ville et autoroute vers l’aéroport : pensez à déclarer ce kilométrage pour un devis juste.",
  },
  marseille: {
    airports: "l’aéroport Marseille-Provence, à Marignane",
    stations: "la gare Saint-Charles",
    rides: ["Transferts vers l’aéroport Marseille-Provence", "Gare Saint-Charles et Vieux-Port", "Terminaux de croisière", "Liaisons vers Aix-en-Provence et Cassis"],
    note: "Entre le centre, le port et l’aéroport, les trajets marseillais mêlent ville dense et voies rapides : le stationnement du véhicule la nuit est une question fréquente des assureurs.",
  },
  nice: {
    airports: "l’aéroport Nice-Côte d’Azur",
    stations: "la gare de Nice-Ville",
    rides: ["Transferts depuis l’aéroport Nice-Côte d’Azur", "Liaisons vers Monaco, Cannes et Antibes", "Hôtels de la Promenade des Anglais", "Saison touristique et congrès"],
    note: "Sur la Côte d’Azur, les véhicules haut de gamme sont fréquents : la valeur du véhicule et la garantie vol comptent beaucoup dans le devis.",
  },
  cannes: {
    airports: "l’aéroport Nice-Côte d’Azur, le plus proche",
    stations: "la gare de Cannes",
    rides: ["Festival de Cannes et congrès du Palais des Festivals", "Transferts vers l’aéroport de Nice", "Liaisons vers Antibes, Grasse et Monaco", "Clientèle hôtelière de la Croisette"],
    note: "L’activité cannoise est très saisonnière, avec des pics pendant les congrès : une immobilisation du véhicule à ces périodes coûte cher, d’où l’intérêt du véhicule de remplacement.",
  },
  toulouse: {
    airports: "l’aéroport Toulouse-Blagnac",
    stations: "la gare Matabiau",
    rides: ["Transferts vers Toulouse-Blagnac", "Gare Matabiau et centre-ville", "Sites aéronautiques de Blagnac et Colomiers", "Soirées étudiantes et matchs au Stadium"],
    note: "La clientèle d’affaires de l’aéronautique génère beaucoup de trajets vers Blagnac : un usage régulier que le contrat doit couvrir.",
  },
  bordeaux: {
    airports: "l’aéroport Bordeaux-Mérignac",
    stations: "la gare Saint-Jean",
    rides: ["Transferts vers Bordeaux-Mérignac", "Gare Saint-Jean (TGV depuis Paris)", "Circuits dans le vignoble (Médoc, Saint-Émilion)", "Liaisons vers le bassin d’Arcachon"],
    note: "Les sorties vers le vignoble et le bassin d’Arcachon allongent les trajets : indiquez votre zone d’activité réelle, pas seulement Bordeaux.",
  },
  lille: {
    airports: "l’aéroport Lille-Lesquin",
    stations: "les gares Lille-Flandres et Lille-Europe",
    rides: ["Gares Lille-Flandres et Lille-Europe (TGV, Eurostar)", "Transferts vers Lille-Lesquin", "Quartier d’affaires Euralille", "Courses transfrontalières vers la Belgique"],
    note: "Si vous faites des courses vers la Belgique, vérifiez que le contrat couvre bien les trajets à l’étranger : c’est un point à demander au moment du devis.",
  },
  strasbourg: {
    airports: "l’aéroport Strasbourg-Entzheim",
    stations: "la gare de Strasbourg",
    rides: ["Gare de Strasbourg et centre historique", "Institutions européennes pendant les sessions", "Transferts vers Strasbourg-Entzheim", "Marché de Noël en fin d’année"],
    note: "Les sessions du Parlement européen et le marché de Noël créent des pics d’activité : anticipez le renouvellement du contrat avant ces périodes.",
  },
  nantes: {
    airports: "l’aéroport Nantes-Atlantique",
    stations: "la gare de Nantes",
    rides: ["Transferts vers Nantes-Atlantique", "Gare de Nantes et Île de Nantes", "Liaisons vers La Baule et Saint-Nazaire", "Événements à la Cité des Congrès"],
    note: "Les liaisons vers la côte (La Baule, Pornic) font partie de l’activité nantaise l’été : un kilométrage à prévoir dans le devis.",
  },
  montpellier: {
    airports: "l’aéroport Montpellier-Méditerranée",
    stations: "les gares Saint-Roch et Sud de France",
    rides: ["Transferts vers Montpellier-Méditerranée", "Gares Saint-Roch et Sud de France", "Plages (Palavas, La Grande-Motte) en saison", "Vie étudiante et soirées"],
    note: "Entre saison estivale et vie étudiante, l’activité de nuit est importante à Montpellier : la garantie du conducteur mérite d’être regardée de près.",
  },
  rennes: {
    airports: "l’aéroport Rennes-Saint-Jacques",
    stations: "la gare de Rennes",
    rides: ["Gare de Rennes (TGV depuis Paris)", "Transferts vers Rennes-Saint-Jacques", "Liaisons vers Saint-Malo", "Soirées étudiantes"],
    note: "Les liaisons vers Saint-Malo et la côte allongent les trajets au départ de Rennes : déclarez votre rayon d’activité réel.",
  },
  grenoble: {
    airports: "l’aéroport Grenoble-Alpes-Isère",
    stations: "la gare de Grenoble",
    rides: ["Transferts vers les stations de ski en hiver", "Gare de Grenoble", "Liaisons vers Lyon-Saint-Exupéry", "Sites scientifiques de la Presqu’île"],
    note: "Les transferts vers les stations en hiver supposent des équipements adaptés et des routes de montagne : parlez-en lors du devis.",
  },
  "boulogne-billancourt": {
    airports: "les aéroports d’Orly et de Roissy",
    stations: "les gares parisiennes",
    rides: ["Sièges d’entreprises et médias", "Parc des Princes et Roland-Garros", "Transferts vers Orly", "Courses vers Paris ouest et La Défense"],
    note: "À Boulogne-Billancourt, la clientèle d’affaires domine : un véhicule récent et bien garanti est souvent exigé par les plateformes haut de gamme.",
  },
  "saint-denis": {
    airports: "l’aéroport Paris-Charles-de-Gaulle, proche par l’A1",
    stations: "la Gare du Nord, à quelques minutes",
    rides: ["Soirs de match et de concert au Stade de France", "Transferts vers Roissy par l’A1", "Quartier d’affaires de la Plaine Saint-Denis", "Courses vers Paris nord"],
    note: "Les soirs d’événement au Stade de France concentrent la demande : un sinistre ce soir-là fait perdre beaucoup, d’où l’intérêt d’une assistance rapide.",
  },
  argenteuil: {
    airports: "l’aéroport de Roissy",
    stations: "la gare Saint-Lazare, reliée directement",
    rides: ["Courses vers La Défense", "Transferts vers Roissy", "Trajets domicile-travail vers Paris", "Val-d’Oise et boucle de la Seine"],
    note: "Depuis Argenteuil, beaucoup de courses partent vers La Défense et Paris : l’usage déclaré doit couvrir toute l’Île-de-France.",
  },
  montreuil: {
    airports: "les aéroports de Roissy et d’Orly",
    stations: "la Gare de Lyon et la gare de Bercy",
    rides: ["Courses vers Paris est", "Transferts vers Roissy et Orly", "Soirées et sorties de salles de concert", "Est parisien par l’A3"],
    note: "Collée à Paris, Montreuil génère surtout des courses courtes et nombreuses : le nombre de trajets compte autant que la distance.",
  },
  nanterre: {
    airports: "les aéroports de Roissy et d’Orly",
    stations: "les gares de La Défense et Saint-Lazare",
    rides: ["Quartier d’affaires de La Défense", "Paris La Défense Arena les soirs de concert", "Transferts vers Roissy et Orly", "Université et préfecture des Hauts-de-Seine"],
    note: "La Défense apporte une clientèle d’affaires régulière en semaine : un contrat avec véhicule de remplacement limite les pertes en cas d’immobilisation.",
  },
  creteil: {
    airports: "l’aéroport d’Orly, tout proche",
    stations: "la Gare de Lyon",
    rides: ["Transferts vers Orly", "Hôpital Henri-Mondor et préfecture", "Courses vers Paris sud-est", "Val-de-Marne par l’A86"],
    note: "La proximité d’Orly fait des transferts aéroport une part importante de l’activité à Créteil.",
  },
  versailles: {
    airports: "l’aéroport d’Orly",
    stations: "les gares de Versailles (Chantiers, Rive Droite, Rive Gauche)",
    rides: ["Visiteurs du château de Versailles", "Transferts vers Orly et Roissy", "Liaisons vers Paris et La Défense", "Clientèle hôtelière et séminaires"],
    note: "La clientèle touristique du château réserve souvent à l’avance des trajets longs vers les aéroports : la garantie des passagers est essentielle.",
  },
  "vitry-sur-seine": {
    airports: "l’aéroport d’Orly, très proche",
    stations: "la gare d’Austerlitz",
    rides: ["Transferts vers Orly", "Courses vers Paris sud", "Marché de Rungis tôt le matin", "Val-de-Marne par l’A86"],
    note: "À Vitry-sur-Seine, les départs matinaux vers Orly et Rungis sont fréquents : précisez vos horaires habituels lors du devis.",
  },
};

function getVtcCityFacts(slug) {
  return FACTS[slug] || null;
}

module.exports = { getVtcCityFacts, VTC_FACT_SLUGS: Object.keys(FACTS) };
