/**
 * Secteur d'intervention du négociateur (localité territoriale) + mission mandat.
 * Sert à dire à l'acquéreur si on peut aller chercher le mandat sur place.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ImmoSecteur = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var BASE = {
    city: "Varangéville",
    postal_code: "54110",
    department: "54",
    department_label: "Meurthe-et-Moselle",
    region: "Grand Est",
  };

  /** Communes desservies en direct (déplacement immédiat, ~30 min). */
  var CORE_CITIES = [
    "Varangéville",
    "Saint-Nicolas-de-Port",
    "Dombasle-sur-Meurthe",
    "Rosières-aux-Salines",
    "Sommerviller",
    "Crévic",
    "Haraucourt",
    "Lenoncourt",
    "Art-sur-Meurthe",
    "Laneuveville-devant-Nancy",
    "Heillecourt",
    "Jarville-la-Malgrange",
    "Vandœuvre-lès-Nancy",
    "Ludres",
    "Fléville-devant-Nancy",
    "Tomblaine",
    "Essey-lès-Nancy",
    "Saulxures-lès-Nancy",
    "Saint-Max",
    "Malzéville",
    "Nancy",
    "Pulnoy",
    "Seichamps",
    "Cerville",
    "Buissoncourt",
    "Maixe",
    "Einville-au-Jard",
    "Damelevières",
    "Blainville-sur-l'Eau",
    "Lunéville",
    "Neuves-Maisons",
    "Pont-à-Mousson",
    "Toul",
  ];

  /** Département de rattachement : la localité territoriale au sens large. */
  var CORE_DEPARTMENTS = ["54"];

  /** Départements limitrophes : déplacement possible, à caler ensemble. */
  var NEAR_DEPARTMENTS = ["55", "57", "88", "67", "68", "51", "52", "70", "90"];

  var LEVELS = {
    coeur: {
      id: "coeur",
      short: "Secteur immédiat",
      tone: "ok",
      message: "Je me déplace directement : je contacte le vendeur et je vais chercher le mandat.",
    },
    territoire: {
      id: "territoire",
      short: "Ma localité territoriale",
      tone: "ok",
      message: "C'est mon département : je prends l'annonce en main et je vais chercher le mandat.",
    },
    proche: {
      id: "proche",
      short: "Secteur élargi",
      tone: "warn",
      message: "Hors secteur immédiat mais accessible : on cale le déplacement ensemble avant d'aller chercher le mandat.",
    },
    hors: {
      id: "hors",
      short: "Hors secteur",
      tone: "warn",
      message: "Trop loin pour un déplacement : je reste votre interlocuteur et j'active un confrère local (apport d'affaires).",
    },
    inconnu: {
      id: "inconnu",
      short: "Secteur à préciser",
      tone: "neutral",
      message: "Indiquez la ville ou le code postal du bien : je vous dis tout de suite si je peux aller chercher le mandat.",
    },
  };

  function normalizeCity(value) {
    var s = String(value == null ? "" : value).toLowerCase();
    try {
      s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    } catch (e) {}
    return s
      .replace(/œ/g, "oe")
      .replace(/æ/g, "ae")
      .replace(/['’]/g, " ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  var CORE_CITY_KEYS = CORE_CITIES.map(normalizeCity);

  function departmentFromPostal(postal) {
    var digits = String(postal == null ? "" : postal).replace(/\D/g, "");
    if (digits.length < 2) return "";
    if (digits.slice(0, 2) === "97" || digits.slice(0, 2) === "98") return digits.slice(0, 3);
    if (digits.slice(0, 2) === "20") return "20";
    return digits.slice(0, 2);
  }

  function isCoreCity(city) {
    var key = normalizeCity(city);
    if (!key) return false;
    return CORE_CITY_KEYS.indexOf(key) !== -1;
  }

  /**
   * Niveau de couverture d'un bien.
   * @returns {{level:string,short:string,tone:string,message:string,department:string,city:string,canHunt:boolean,needsPartner:boolean}}
   */
  function evaluate(input) {
    input = input || {};
    var city = String(input.city == null ? "" : input.city).trim();
    var department = departmentFromPostal(input.postal_code || input.postal || input.department);
    var level = "inconnu";
    if (isCoreCity(city) && (!department || CORE_DEPARTMENTS.indexOf(department) !== -1)) {
      level = "coeur";
    } else if (department && CORE_DEPARTMENTS.indexOf(department) !== -1) {
      level = "territoire";
    } else if (department && NEAR_DEPARTMENTS.indexOf(department) !== -1) {
      level = "proche";
    } else if (department) {
      level = "hors";
    } else if (city) {
      level = "hors";
    }
    var def = LEVELS[level];
    return {
      level: level,
      short: def.short,
      tone: def.tone,
      message: def.message,
      department: department,
      city: city,
      canHunt: level === "coeur" || level === "territoire" || level === "proche",
      needsPartner: level === "hors",
    };
  }

  /** Libellé public du secteur, affiché sur la landing. */
  function secteurLabel() {
    return (
      "Grand Nancy, Saint-Nicolas-de-Port, Dombasle-sur-Meurthe, Lunéville — " +
      BASE.department_label +
      " (" +
      BASE.department +
      ")"
    );
  }

  /** Phrase courte pour un formulaire (feedback en direct). */
  function feedback(input) {
    var res = evaluate(input);
    var place = res.city || (res.department ? "Département " + res.department : "");
    return {
      level: res.level,
      tone: res.tone,
      text: (place ? place + " — " : "") + res.short + ". " + res.message,
      canHunt: res.canHunt,
      needsPartner: res.needsPartner,
    };
  }

  var MANDATE_KINDS = {
    acheteur: {
      id: "chasse",
      label: "Aller chercher le mandat auprès du vendeur",
      crmLabel: "Mission : aller chercher le mandat (annonce envoyée par l'acquéreur)",
    },
    vendeur: {
      id: "vente",
      label: "Je suis prêt à confier un mandat de vente",
      crmLabel: "Mandat de vente proposé par le propriétaire",
    },
    les_deux: {
      id: "vente_recherche",
      label: "Mandat de vente pour mon bien + recherche pour le rachat",
      crmLabel: "Mandat de vente + mandat de recherche (vend et rachète)",
    },
  };

  function mandateKind(role) {
    return MANDATE_KINDS[role] || MANDATE_KINDS.acheteur;
  }

  /** Message de confirmation après dépôt : ce qui se passe côté mandat. */
  function missionMessage(input) {
    input = input || {};
    if (!input.requested) return "Bien enregistré. Un conseiller vous rappelle.";
    var level = input.level || "inconnu";
    if (level === "inconnu") {
      return "Je regarde l'annonce et je vais chercher le mandat auprès du vendeur.";
    }
    return (LEVELS[level] || LEVELS.inconnu).message;
  }

  return {
    BASE: BASE,
    CORE_CITIES: CORE_CITIES,
    CORE_DEPARTMENTS: CORE_DEPARTMENTS,
    NEAR_DEPARTMENTS: NEAR_DEPARTMENTS,
    LEVELS: LEVELS,
    MANDATE_KINDS: MANDATE_KINDS,
    normalizeCity: normalizeCity,
    departmentFromPostal: departmentFromPostal,
    isCoreCity: isCoreCity,
    evaluate: evaluate,
    feedback: feedback,
    mandateKind: mandateKind,
    missionMessage: missionMessage,
    secteurLabel: secteurLabel,
  };
});
