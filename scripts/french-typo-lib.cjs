/**
 * Relecture typographique des pages générées : accents, apostrophes et « à ».
 * Les gabarits historiques sont écrits sans accents (« Assurance VTC a Lyon »,
 * « Sante », « Credit ») : ce texte sortait tel quel dans Google.
 *
 * frenchifyHtml(html) ne touche que :
 *   - le texte visible (hors <script>, <style>) ;
 *   - les balises meta description / og / twitter / keywords et les attributs alt ;
 *   - les champs texte des données structurées JSON-LD (FAQ, Service…).
 * Jamais les URL, href, classes ou identifiants.
 *
 * Seuls les mots sans ambiguïté sont corrigés (pas « marche », « assure », « eleve »…).
 */

/** minuscule sans accent → forme correcte (la majuscule initiale est gérée automatiquement) */
const WORDS = {
  presenter: "présenter", preparer: "préparer", age: "âge", espece: "espèce", especes: "espèces",
  adhesion: "adhésion", etudient: "étudient", etudier: "étudier", ile: "île", iles: "îles",
  precedent: "précédent", precedente: "précédente", depart: "départ",
  pret: "prêt", prets: "prêts", credit: "crédit", credits: "crédits", sante: "santé",
  departement: "département", departements: "départements", reponse: "réponse", reponses: "réponses",
  meme: "même", memes: "mêmes", dedie: "dédié", dediee: "dédiée", dedies: "dédiés", liees: "liées",
  demarrer: "démarrer", legales: "légales", legale: "légale", confidentialite: "confidentialité",
  metropole: "métropole", frequentes: "fréquentes", frequente: "fréquente", apres: "après",
  equivalentes: "équivalentes", equivalente: "équivalente", telephone: "téléphone",
  activite: "activité", activites: "activités", decidez: "décidez", journee: "journée",
  expliquees: "expliquées", prevoyance: "prévoyance", equitation: "équitation",
  proprietaire: "propriétaire", proprietaires: "propriétaires", sinistralite: "sinistralité",
  acces: "accès", criteres: "critères", critere: "critère", selection: "sélection",
  vehicule: "véhicule", vehicules: "véhicules", resiliation: "résiliation", creation: "création",
  francaise: "française", francaises: "françaises", francais: "français",
  responsabilite: "responsabilité", pieces: "pièces", etes: "êtes", tres: "très",
  faisabilite: "faisabilité", capacite: "capacité", negociation: "négociation",
  equilibrees: "équilibrées", intermediaire: "intermédiaire", proteger: "protéger",
  copropriete: "copropriété", mensualite: "mensualité", mensualites: "mensualités",
  residence: "résidence", accompagnee: "accompagnée", deposer: "déposer", echange: "échange",
  affichee: "affichée", listee: "listée", securite: "sécurité", percu: "perçu",
  specialise: "spécialisé", specialises: "spécialisés", independant: "indépendant",
  independants: "indépendants", onereux: "onéreux", peripherique: "périphérique",
  regional: "régional", regionale: "régionale", region: "région", regions: "régions",
  precis: "précis", precise: "précise", aeroport: "aéroport", aeroports: "aéroports", deja: "déjà",
  etude: "étude", etudes: "études", etape: "étape", etapes: "étapes", delai: "délai", delais: "délais",
  eligibilite: "éligibilité", immediat: "immédiat", immediate: "immédiate", numero: "numéro",
  qualite: "qualité", societe: "société", societes: "sociétés", regime: "régime", energie: "énergie",
  economie: "économie", economies: "économies", economiser: "économiser", equipe: "équipe",
  evaluer: "évaluer", eviter: "éviter", evite: "évite", verifier: "vérifier",
  reference: "référence", references: "références", different: "différent", differents: "différents",
  differente: "différente", differentes: "différentes", general: "général", generale: "générale",
  generales: "générales", probleme: "problème", problemes: "problèmes", systeme: "système",
  periode: "période", premiere: "première", derniere: "dernière", entiere: "entière",
  financiere: "financière", financieres: "financières", immobiliere: "immobilière",
  immobilieres: "immobilières", clientele: "clientèle", modele: "modèle", modeles: "modèles",
  concretement: "concrètement", egalement: "également", generalement: "généralement",
  completement: "complètement", deces: "décès", sejour: "séjour", etranger: "étranger",
  etat: "état", etats: "états", evenement: "événement", evenements: "événements",
  interet: "intérêt", interets: "intérêts", benefice: "bénéfice", benefices: "bénéfices",
  beneficier: "bénéficier", beneficiez: "bénéficiez", experience: "expérience",
  preference: "préférence", necessaire: "nécessaire", necessaires: "nécessaires",
  supplementaire: "supplémentaire", supplementaires: "supplémentaires",
  complementaire: "complémentaire", complementaires: "complémentaires", elevee: "élevée",
  duree: "durée", durees: "durées", annee: "année", annees: "années", donnees: "données",
  arrivee: "arrivée", entree: "entrée", idee: "idée", idees: "idées", cle: "clé", cles: "clés",
  zero: "zéro", hopital: "hôpital", cout: "coût", couts: "coûts", impot: "impôt", impots: "impôts",
  bientot: "bientôt", plutot: "plutôt", controle: "contrôle", controles: "contrôles", role: "rôle",
  batiment: "bâtiment", chateau: "château", etre: "être", connaitre: "connaître", ete: "été",
  grace: "grâce", prive: "privé", privee: "privée", prives: "privés", proximite: "proximité",
  prevoir: "prévoir", preavis: "préavis", echeance: "échéance", echeances: "échéances",
  resilier: "résilier", malusse: "malussé",
  salarie: "salarié", salaries: "salariés",   degats: "dégâts", degat: "dégât", penalite: "pénalité", penalites: "pénalités",
  frequence: "fréquence", kilometrage: "kilométrage", carriere: "carrière", metier: "métier",
  metiers: "métiers", detail: "détail", details: "détails", demenagement: "déménagement",
  depassement: "dépassement", depassements: "dépassements",
  medecin: "médecin", medecins: "médecins",
  medical: "médical", medicale: "médicale", specialiste: "spécialiste", specialistes: "spécialistes",
  veterinaire: "vétérinaire", veterinaires: "vétérinaires", scolarite: "scolarité",
  simplifiee: "simplifiée", personnalisee: "personnalisée",
  renovation: "rénovation", energetique: "énergétique", ecologique: "écologique",
  electrique: "électrique", electriques: "électriques", theorique: "théorique",
  strategie: "stratégie", methode: "méthode", scenario: "scénario", scenarios: "scénarios",
  reel: "réel", reelle: "réelle", reels: "réels", realiste: "réaliste", resultat: "résultat",
  resultats: "résultats", resume: "résumé", reussir: "réussir", reduire: "réduire",
  reduction: "réduction", reductions: "réductions", regles: "règles",
  reglementation: "réglementation",   operation: "opération", operations: "opérations",   agrement: "agrément", attenuer: "atténuer", decouvert: "découvert",
  debloquer: "débloquer", deblocage: "déblocage", decision: "décision", definir: "définir",
  definitif: "définitif", demarche: "démarche", demarches: "démarches", depot: "dépôt",
  desormais: "désormais", difference: "différence", elements: "éléments", element: "élément",
  emettre: "émettre", epargne: "épargne", equilibre: "équilibre",
  equipement: "équipement", equipements: "équipements", etablissement: "établissement",
  etablissements: "établissements", evolution: "évolution", ecart: "écart", ecarts: "écarts",
  ecrit: "écrit", ecrire: "écrire", egal: "égal", egale: "égale", election: "élection",
  eligible: "éligible", eligibles: "éligibles", emission: "émission", enoncer: "énoncer",
  heritage: "héritage", hesiter: "hésiter", hesitez: "hésitez",
  ideal: "idéal", ideale: "idéale",   interessant: "intéressant", interessante: "intéressante", interieur: "intérieur",
  exterieur: "extérieur", superieur: "supérieur", superieure: "supérieure",
  inferieur: "inférieur", inferieure: "inférieure", anterieur: "antérieur",
  liberte: "liberté", majorite: "majorité", minorite: "minorité", mobilite: "mobilité",
  modalites: "modalités", nationalite: "nationalité", necessite: "nécessité",
  opportunite: "opportunité", opportunites: "opportunités", priorite: "priorité",
  priorites: "priorités", propriete: "propriété", proprietes: "propriétés",
  quantite: "quantité", realite: "réalité", rentabilite: "rentabilité", serenite: "sérénité",
  simplicite: "simplicité", solidite: "solidité", specificite: "spécificité",
  specificites: "spécificités", stabilite: "stabilité", totalite: "totalité",
  utilite: "utilité", validite: "validité", visibilite: "visibilité", fiscalite: "fiscalité",
  disponibilite: "disponibilité", flexibilite: "flexibilité", conformite: "conformité",
  solvabilite: "solvabilité", anciennete: "ancienneté", nouveaute: "nouveauté",
};

/** Noms propres : uniquement avec la majuscule */
const PROPER = {
  Compiegne: "Compiègne", Hyeres: "Hyères", Montbeliard: "Montbéliard", Lege: "Lège",
  Ile: "Île", Iles: "Îles", Rhone: "Rhône", Pyrenees: "Pyrénées", Caledonie: "Calédonie",
  Polynesie: "Polynésie", Reunion: "Réunion", Isere: "Isère", Herault: "Hérault",
  Correze: "Corrèze", Lozere: "Lozère", Nievre: "Nièvre", Ardeche: "Ardèche", Ariege: "Ariège",
  Drome: "Drôme", Finistere: "Finistère", Vendee: "Vendée", Saone: "Saône", Sevres: "Sèvres",
  Cotes: "Côtes", Bouxieres: "Bouxières", Mezieres: "Mézières",
  Malzeville: "Malzéville", Maxeville: "Maxéville", Mereville: "Méréville", Rosieres: "Rosières",
  Fleville: "Fléville", Asnieres: "Asnières", Angouleme: "Angoulême", Megeve: "Megève",
  Besancon: "Besançon", Orleans: "Orléans", Nimes: "Nîmes", Etienne: "Étienne",
  Beziers: "Béziers", Montelimar: "Montélimar", Chambery: "Chambéry", Perigueux: "Périgueux",
  Sete: "Sète", Evry: "Évry", Creteil: "Créteil", Merignac: "Mérignac",
  Venissieux: "Vénissieux", Frejus: "Fréjus", Epinal: "Épinal", Evreux: "Évreux",
  Macon: "Mâcon", Chalons: "Châlons", Chateauroux: "Châteauroux", Varangeville: "Varangéville",
  Vandoeuvre: "Vandœuvre", Alencon: "Alençon", Ales: "Alès", Guerande: "Guérande",
  Selestat: "Sélestat", Senart: "Sénart",
  Mediterranee: "Méditerranée", Exupery: "Exupéry",
};

/** Expressions : traitées avant les mots isolés */
const PHRASES = [
  [/\bCote d(?=[ '’-])/g, "Côte d"],
  [/\bLa Defense\b/g, "La Défense"],
  [/\bFranche-Comte\b/g, "Franche-Comté"],
  [/\bPuy-de-Dome\b/g, "Puy-de-Dôme"],
  [/-les-Nancy\b/g, "-lès-Nancy"],
  [/\bbase a\b/g, "basé à"],
  [/\bbases a\b/g, "basés à"],
  [/\badapte a\b/g, "adapté à"],
  [/\bgrace a\b/g, "grâce à"],
  [/\b(du|le|au|ce) marche\b/g, "$1 marché"],
  [/\bdeclare souvent\b/g, "déclare souvent"],
  [/\ba ete\b/g, "a été"],
  [/\bont ete\b/g, "ont été"],
];

const L = "A-Za-zÀ-ÖØ-öø-ÿŒœ";
const BEFORE = "(?<![" + L + "0-9/.@_&;])";
const AFTER = "(?![" + L + "0-9/@_])";

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const WORD_MAP = new Map();
Object.keys(WORDS).forEach(function (k) {
  if (WORDS[k] === k) return;
  WORD_MAP.set(k, WORDS[k]);
  WORD_MAP.set(cap(k), cap(WORDS[k]));
});
Object.keys(PROPER).forEach(function (k) {
  if (PROPER[k] !== k) WORD_MAP.set(k, PROPER[k]);
});
const WORD_RE = new RegExp(BEFORE + "(" + Array.from(WORD_MAP.keys()).sort(function (a, b) { return b.length - a.length; }).join("|") + ")" + AFTER, "g");

const VOWEL = "aeiouyhâàéèêëîïôöûüAEIOUYHÂÀÉÈÊÎÔ";

function frenchifyText(t) {
  if (!t || !/[A-Za-z]/.test(t)) return t;
  var s = t;
  PHRASES.forEach(function (p) {
    s = s.replace(p[0], p[1]);
  });
  s = s.replace(WORD_RE, function (m) {
    return WORD_MAP.get(m) || m;
  });

  // Apostrophes manquantes : « d aide », « l assurance », « jusqu a », « n est », « c est », « s il », « j ai »
  s = s.replace(new RegExp("(?<![" + L + "0-9'’])(?<!\\d )([dlnscj]|qu|jusqu|lorsqu|puisqu) (?=[" + VOWEL + "])", "g"), "$1’");
  s = s.replace(new RegExp("(?<![" + L + "0-9'’])([DL]) (?=[aeiouyhâàéèêî])", "g"), "$1’");
  s = s.replace(/\baujourd hui\b/g, "aujourd’hui");

  // « a » préposition → « à »
  s = s.replace(/\bjusqu’a\b/g, "jusqu’à");
  s = s.replace(new RegExp("(?<=[A-Za-zéèêàçûîô0-9)»] )a (?=[A-ZÉÈÎÔ][a-zéèêàç])", "g"), "à ");
  s = s.replace(/(?<=[a-zéèêàçûîô0-9)»,] )a (?=(?:titre|distance|domicile|jour|temps|garanties|chaque|risque|risques|hauteur|court|moyen|long|taux|proximité|la demande|la souscription|la signature|des fins)\b)/g, "à ");
  s = s.replace(/(?<=[a-zéèêàçûîô0-9)»,] )a (?=[a-zéèêàç]+(?:er|ir)\b)/g, "à ");
  s = s.replace(/(^|[.!?:>] ?)A (?=(?:partir|titre|distance|domicile|noter|savoir|retenir|prévoir|quel|quelle|qui|quoi)\b)/g, "$1À ");
  return s;
}

const TEXT_KEYS = { name: 1, text: 1, description: 1, headline: 1, alternateName: 1 };

function frenchifyJson(node) {
  if (Array.isArray(node)) return node.map(frenchifyJson);
  if (node && typeof node === "object") {
    Object.keys(node).forEach(function (k) {
      if (typeof node[k] === "string") {
        if (TEXT_KEYS[k]) node[k] = frenchifyText(node[k]);
      } else node[k] = frenchifyJson(node[k]);
    });
  }
  return node;
}

const META_RE = /(<meta\b[^>]*\b(?:name|property)="(?:description|keywords|og:title|og:description|twitter:title|twitter:description)"[^>]*\bcontent=")([^"]*)(")/g;
const ALT_RE = /(<img\b[^>]*\balt=")([^"]*)(")/g;
const TOKEN_RE = /<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<[^>]+>/g;

function frenchifyHtml(html) {
  var out = "";
  var pos = 0;
  var m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(html))) {
    out += frenchifyText(html.slice(pos, m.index));
    var tag = m[0];
    if (/^<script\b[^>]*application\/ld\+json/i.test(tag)) {
      tag = tag.replace(/^(<script\b[^>]*>)([\s\S]*?)(<\/script>)$/, function (_, a, body, c) {
        try {
          return a + JSON.stringify(frenchifyJson(JSON.parse(body))) + c;
        } catch (e) {
          return a + body + c;
        }
      });
    } else if (/^<meta\b/i.test(tag)) {
      META_RE.lastIndex = 0;
      tag = tag.replace(META_RE, function (_, a, text, c) {
        return a + frenchifyText(text) + c;
      });
    } else if (/^<img\b/i.test(tag)) {
      ALT_RE.lastIndex = 0;
      tag = tag.replace(ALT_RE, function (_, a, text, c) {
        return a + frenchifyText(text) + c;
      });
    }
    out += tag;
    pos = m.index + m[0].length;
  }
  return out + frenchifyText(html.slice(pos));
}

module.exports = { frenchifyHtml, frenchifyText };
