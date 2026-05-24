/**
 * Genere seo/france-cities.json (~165 villes) + seo/france-departments.json
 * Usage: node scripts/build-france-cities-json.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

/** slug, name, region slug, dept slug */
const CITIES = [
  ["paris", "Paris", "ile-de-france", "paris"],
  ["boulogne-billancourt", "Boulogne-Billancourt", "ile-de-france", "hauts-de-seine"],
  ["saint-denis", "Saint-Denis", "ile-de-france", "seine-saint-denis"],
  ["argenteuil", "Argenteuil", "ile-de-france", "val-d-oise"],
  ["montreuil", "Montreuil", "ile-de-france", "seine-saint-denis"],
  ["versailles", "Versailles", "ile-de-france", "yvelines"],
  ["nanterre", "Nanterre", "ile-de-france", "hauts-de-seine"],
  ["creteil", "Creteil", "ile-de-france", "val-de-marne"],
  ["cergy", "Cergy", "ile-de-france", "val-d-oise"],
  ["levallois-perret", "Levallois-Perret", "ile-de-france", "hauts-de-seine"],
  ["marseille", "Marseille", "provence-alpes-cote-d-azur", "bouches-du-rhone"],
  ["nice", "Nice", "provence-alpes-cote-d-azur", "alpes-maritimes"],
  ["toulon", "Toulon", "provence-alpes-cote-d-azur", "var"],
  ["aix-en-provence", "Aix-en-Provence", "provence-alpes-cote-d-azur", "bouches-du-rhone"],
  ["avignon", "Avignon", "provence-alpes-cote-d-azur", "vaucluse"],
  ["antibes", "Antibes", "provence-alpes-cote-d-azur", "alpes-maritimes"],
  ["cannes", "Cannes", "provence-alpes-cote-d-azur", "alpes-maritimes"],
  ["hyeres", "Hyeres", "provence-alpes-cote-d-azur", "var"],
  ["arles", "Arles", "provence-alpes-cote-d-azur", "bouches-du-rhone"],
  ["frejus", "Frejus", "provence-alpes-cote-d-azur", "var"],
  ["lyon", "Lyon", "auvergne-rhone-alpes", "rhone"],
  ["saint-etienne", "Saint-Etienne", "auvergne-rhone-alpes", "loire"],
  ["grenoble", "Grenoble", "auvergne-rhone-alpes", "isere"],
  ["villeurbanne", "Villeurbanne", "auvergne-rhone-alpes", "rhone"],
  ["annecy", "Annecy", "auvergne-rhone-alpes", "haute-savoie"],
  ["valence", "Valence", "auvergne-rhone-alpes", "drome"],
  ["chambery", "Chambery", "auvergne-rhone-alpes", "savoie"],
  ["clermont-ferrand", "Clermont-Ferrand", "auvergne-rhone-alpes", "puy-de-dome"],
  ["venissieux", "Venissieux", "auvergne-rhone-alpes", "rhone"],
  ["toulouse", "Toulouse", "occitanie", "haute-garonne"],
  ["montpellier", "Montpellier", "occitanie", "herault"],
  ["nimes", "Nimes", "occitanie", "gard"],
  ["perpignan", "Perpignan", "occitanie", "pyrenees-orientales"],
  ["beziers", "Beziers", "occitanie", "herault"],
  ["narbonne", "Narbonne", "occitanie", "aude"],
  ["montauban", "Montauban", "occitanie", "tarn-et-garonne"],
  ["albi", "Albi", "occitanie", "tarn"],
  ["carcassonne", "Carcassonne", "occitanie", "aude"],
  ["sete", "Sete", "occitanie", "herault"],
  ["bordeaux", "Bordeaux", "nouvelle-aquitaine", "gironde"],
  ["limoges", "Limoges", "nouvelle-aquitaine", "haute-vienne"],
  ["poitiers", "Poitiers", "nouvelle-aquitaine", "vienne"],
  ["la-rochelle", "La Rochelle", "nouvelle-aquitaine", "charente-maritime"],
  ["pau", "Pau", "nouvelle-aquitaine", "pyrenees-atlantiques"],
  ["bayonne", "Bayonne", "nouvelle-aquitaine", "pyrenees-atlantiques"],
  ["merignac", "Merignac", "nouvelle-aquitaine", "gironde"],
  ["pessac", "Pessac", "nouvelle-aquitaine", "gironde"],
  ["agen", "Agen", "nouvelle-aquitaine", "lot-et-garonne"],
  ["niort", "Niort", "nouvelle-aquitaine", "deux-sevres"],
  ["angouleme", "Angouleme", "nouvelle-aquitaine", "charente"],
  ["biarritz", "Biarritz", "nouvelle-aquitaine", "pyrenees-atlantiques"],
  ["lille", "Lille", "hauts-de-france", "nord"],
  ["amiens", "Amiens", "hauts-de-france", "somme"],
  ["roubaix", "Roubaix", "hauts-de-france", "nord"],
  ["tourcoing", "Tourcoing", "hauts-de-france", "nord"],
  ["dunkerque", "Dunkerque", "hauts-de-france", "nord"],
  ["calais", "Calais", "hauts-de-france", "pas-de-calais"],
  ["valenciennes", "Valenciennes", "hauts-de-france", "nord"],
  ["lens", "Lens", "hauts-de-france", "pas-de-calais"],
  ["douai", "Douai", "hauts-de-france", "nord"],
  ["beauvais", "Beauvais", "hauts-de-france", "oise"],
  ["strasbourg", "Strasbourg", "grand-est", "bas-rhin"],
  ["reims", "Reims", "grand-est", "marne"],
  ["metz", "Metz", "grand-est", "moselle"],
  ["mulhouse", "Mulhouse", "grand-est", "haut-rhin"],
  ["nancy", "Nancy", "grand-est", "meurthe-et-moselle"],
  ["troyes", "Troyes", "grand-est", "aube"],
  ["colmar", "Colmar", "grand-est", "haut-rhin"],
  ["charleville-mezieres", "Charleville-Mezieres", "grand-est", "ardennes"],
  ["chalons-en-champagne", "Chalons-en-Champagne", "grand-est", "marne"],
  ["thionville", "Thionville", "grand-est", "moselle"],
  ["epinal", "Epinal", "grand-est", "vosges"],
  ["nantes", "Nantes", "pays-de-la-loire", "loire-atlantique"],
  ["angers", "Angers", "pays-de-la-loire", "maine-et-loire"],
  ["le-mans", "Le Mans", "pays-de-la-loire", "sarthe"],
  ["saint-nazaire", "Saint-Nazaire", "pays-de-la-loire", "loire-atlantique"],
  ["cholet", "Cholet", "pays-de-la-loire", "maine-et-loire"],
  ["la-roche-sur-yon", "La Roche-sur-Yon", "pays-de-la-loire", "vendee"],
  ["laval", "Laval", "pays-de-la-loire", "mayenne"],
  ["rennes", "Rennes", "bretagne", "ille-et-vilaine"],
  ["brest", "Brest", "bretagne", "finistere"],
  ["quimper", "Quimper", "bretagne", "finistere"],
  ["lorient", "Lorient", "bretagne", "morbihan"],
  ["vannes", "Vannes", "bretagne", "morbihan"],
  ["saint-malo", "Saint-Malo", "bretagne", "ille-et-vilaine"],
  ["saint-brieuc", "Saint-Brieuc", "bretagne", "cotes-d-armor"],
  ["rouen", "Rouen", "normandie", "seine-maritime"],
  ["le-havre", "Le Havre", "normandie", "seine-maritime"],
  ["caen", "Caen", "normandie", "calvados"],
  ["cherbourg", "Cherbourg-en-Cotentin", "normandie", "manche"],
  ["evreux", "Evreux", "normandie", "eure"],
  ["dieppe", "Dieppe", "normandie", "seine-maritime"],
  ["dijon", "Dijon", "bourgogne-franche-comte", "cote-d-or"],
  ["besancon", "Besancon", "bourgogne-franche-comte", "doubs"],
  ["montbeliard", "Montbeliard", "bourgogne-franche-comte", "doubs"],
  ["auxerre", "Auxerre", "bourgogne-franche-comte", "yonne"],
  ["nevers", "Nevers", "bourgogne-franche-comte", "nievre"],
  ["macon", "Macon", "bourgogne-franche-comte", "saone-et-loire"],
  ["belfort", "Belfort", "bourgogne-franche-comte", "territoire-de-belfort"],
  ["tours", "Tours", "centre-val-de-loire", "indre-et-loire"],
  ["orleans", "Orleans", "centre-val-de-loire", "loiret"],
  ["bourges", "Bourges", "centre-val-de-loire", "cher"],
  ["blois", "Blois", "centre-val-de-loire", "loir-et-cher"],
  ["chartres", "Chartres", "centre-val-de-loire", "eure-et-loir"],
  ["chateauroux", "Chateauroux", "centre-val-de-loire", "indre"],
  ["ajaccio", "Ajaccio", "corse", "corse-du-sud"],
  ["bastia", "Bastia", "corse", "haute-corse"],
  ["fort-de-france", "Fort-de-France", "martinique", "martinique"],
  ["saint-denis-reunion", "Saint-Denis", "la-reunion", "la-reunion"],
  ["saint-paul-reunion", "Saint-Paul", "la-reunion", "la-reunion"],
  ["saint-pierre-reunion", "Saint-Pierre", "la-reunion", "la-reunion"],
  ["pointe-a-pitre", "Pointe-a-Pitre", "guadeloupe", "guadeloupe"],
  ["cayenne", "Cayenne", "guyane", "guyane"],
  ["mamoudzou", "Mamoudzou", "mayotte", "mayotte"],
  ["saint-quentin", "Saint-Quentin", "hauts-de-france", "aisne"],
  ["arras", "Arras", "hauts-de-france", "pas-de-calais"],
  ["compiegne", "Compiegne", "hauts-de-france", "oise"],
  ["montlucon", "Montlucon", "auvergne-rhone-alpes", "allier"],
  ["roanne", "Roanne", "auvergne-rhone-alpes", "loire"],
  ["vichy", "Vichy", "auvergne-rhone-alpes", "allier"],
  ["aurillac", "Aurillac", "auvergne-rhone-alpes", "cantal"],
  ["rodez", "Rodez", "occitanie", "aveyron"],
  ["tarbes", "Tarbes", "occitanie", "hautes-pyrenees"],
  ["foix", "Foix", "occitanie", "ariege"],
  ["mende", "Mende", "occitanie", "lozere"],
  ["privas", "Privas", "auvergne-rhone-alpes", "ardeche"],
  ["gap", "Gap", "provence-alpes-cote-d-azur", "hautes-alpes"],
  ["digne-les-bains", "Digne-les-Bains", "provence-alpes-cote-d-azur", "alpes-de-haute-provence"],
  ["draguignan", "Draguignan", "provence-alpes-cote-d-azur", "var"],
  ["grasse", "Grasse", "provence-alpes-cote-d-azur", "alpes-maritimes"],
  ["martigues", "Martigues", "provence-alpes-cote-d-azur", "bouches-du-rhone"],
  ["salon-de-provence", "Salon-de-Provence", "provence-alpes-cote-d-azur", "bouches-du-rhone"],
  ["saint-raphael", "Saint-Raphael", "provence-alpes-cote-d-azur", "var"],
  ["sarreguemines", "Sarreguemines", "grand-est", "moselle"],
  ["haguenau", "Haguenau", "grand-est", "bas-rhin"],
  ["saint-omer", "Saint-Omer", "hauts-de-france", "pas-de-calais"],
  ["cambrai", "Cambrai", "hauts-de-france", "nord"],
  ["maubeuge", "Maubeuge", "hauts-de-france", "nord"],
  ["laon", "Laon", "hauts-de-france", "aisne"],
  ["soissons", "Soissons", "hauts-de-france", "aisne"],
  ["verson", "Vire", "normandie", "calvados"],
  ["alencon", "Alencon", "normandie", "orne"],
  ["lannion", "Lannion", "bretagne", "cotes-d-armor"],
  ["morlaix", "Morlaix", "bretagne", "finistere"],
  ["quimperle", "Quimperle", "bretagne", "finistere"],
  ["saint-herblain", "Saint-Herblain", "pays-de-la-loire", "loire-atlantique"],
  ["reze", "Reze", "pays-de-la-loire", "loire-atlantique"],
  ["saumur", "Saumur", "pays-de-la-loire", "maine-et-loire"],
  ["fontenay-le-comte", "Fontenay-le-Comte", "pays-de-la-loire", "vendee"],
  ["mont-de-marsan", "Mont-de-Marsan", "nouvelle-aquitaine", "landes"],
  ["perigueux", "Perigueux", "nouvelle-aquitaine", "dordogne"],
  ["bergerac", "Bergerac", "nouvelle-aquitaine", "dordogne"],
  ["royan", "Royan", "nouvelle-aquitaine", "charente-maritime"],
  ["cognac", "Cognac", "nouvelle-aquitaine", "charente"],
  ["brive-la-gaillarde", "Brive-la-Gaillarde", "nouvelle-aquitaine", "correze"],
  ["gueret", "Gueret", "nouvelle-aquitaine", "creuse"],
  ["tulle", "Tulle", "nouvelle-aquitaine", "correze"],
  ["auch", "Auch", "occitanie", "gers"],
  ["muret", "Muret", "occitanie", "haute-garonne"],
  ["cahors", "Cahors", "occitanie", "lot"],
  ["pamiers", "Pamiers", "occitanie", "ariege"],
  ["saint-gaudens", "Saint-Gaudens", "occitanie", "haute-garonne"],
  ["lunel", "Lunel", "occitanie", "herault"],
  ["ales", "Ales", "occitanie", "gard"],
  ["orange", "Orange", "provence-alpes-cote-d-azur", "vaucluse"],
  ["carpentras", "Carpentras", "provence-alpes-cote-d-azur", "vaucluse"],
  ["manosque", "Manosque", "provence-alpes-cote-d-azur", "alpes-de-haute-provence"],
  ["istres", "Istres", "provence-alpes-cote-d-azur", "bouches-du-rhone"],
  ["mantes-la-jolie", "Mantes-la-Jolie", "ile-de-france", "yvelines"],
  ["meaux", "Meaux", "ile-de-france", "seine-et-marne"],
  ["melun", "Melun", "ile-de-france", "seine-et-marne"],
  ["evry-courcouronnes", "Evry-Courcouronnes", "ile-de-france", "essonne"],
  ["corbeil-essonnes", "Corbeil-Essonnes", "ile-de-france", "essonne"],
  ["saint-germain-en-laye", "Saint-Germain-en-Laye", "ile-de-france", "yvelines"],
  ["issy-les-moulineaux", "Issy-les-Moulineaux", "ile-de-france", "hauts-de-seine"],
  ["clichy", "Clichy", "ile-de-france", "hauts-de-seine"],
  ["colombes", "Colombes", "ile-de-france", "hauts-de-seine"],
  ["asnieres-sur-seine", "Asnieres-sur-Seine", "ile-de-france", "hauts-de-seine"],
  ["rueil-malmaison", "Rueil-Malmaison", "ile-de-france", "hauts-de-seine"],
  ["champigny-sur-marne", "Champigny-sur-Marne", "ile-de-france", "val-de-marne"],
  ["saint-maur-des-fosses", "Saint-Maur-des-Fosses", "ile-de-france", "val-de-marne"],
  ["drancy", "Drancy", "ile-de-france", "seine-saint-denis"],
  ["aubervilliers", "Aubervilliers", "ile-de-france", "seine-saint-denis"],
  ["noisy-le-grand", "Noisy-le-Grand", "ile-de-france", "seine-saint-denis"],
  ["villejuif", "Villejuif", "ile-de-france", "val-de-marne"],
  ["antony", "Antony", "ile-de-france", "hauts-de-seine"],
  ["sarcelles", "Sarcelles", "ile-de-france", "val-d-oise"],
  ["courbevoie", "Courbevoie", "ile-de-france", "hauts-de-seine"],
  ["bezons", "Bezons", "ile-de-france", "val-d-oise"],
];

const REGIONS = JSON.parse(
  fs.readFileSync(path.join(ROOT, "seo/france-regions.json"), "utf8")
);
const regionNameBySlug = {};
REGIONS.forEach(function (r) {
  regionNameBySlug[r.slug] = r.name;
});

const seen = new Set();
const cities = [];
CITIES.forEach(function (row) {
  const slug = row[0];
  if (seen.has(slug)) return;
  seen.add(slug);
  cities.push({
    slug: slug,
    name: row[1],
    region: regionNameBySlug[row[2]] || row[2],
    regionSlug: row[2],
    dept: row[3],
  });
});

cities.sort(function (a, b) {
  return a.name.localeCompare(b.name, "fr");
});

const deptMap = {};
cities.forEach(function (c) {
  if (!deptMap[c.dept]) {
    deptMap[c.dept] = { slug: c.dept, name: titleDept(c.dept), region: c.region, regionSlug: c.regionSlug };
  }
});

function titleDept(slug) {
  return slug
    .split("-")
    .map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join("-")
    .replace(/D Or/g, "d Or")
    .replace(/De /g, "de ")
    .replace(/Du /g, "du ")
    .replace(/Et /g, "et ");
}

const departments = Object.values(deptMap).sort(function (a, b) {
  return a.name.localeCompare(b.name, "fr");
});

fs.writeFileSync(path.join(ROOT, "seo/france-cities.json"), JSON.stringify(cities, null, 2) + "\n", "utf8");
fs.writeFileSync(
  path.join(ROOT, "seo/france-departments.json"),
  JSON.stringify(departments, null, 2) + "\n",
  "utf8"
);

console.log("Cities:", cities.length, "| Departments:", departments.length);
