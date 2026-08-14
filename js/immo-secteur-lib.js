/**
 * Secteur d'intervention négociateur — recherche de bien et chasse au mandat.
 * Un client envoie l'URL d'une annonce (Leboncoin, PAP, agence…) : on va chercher le mandat,
 * en priorité sur la localité, sinon en secteur élargi ou relais.
 * Utilisable en Node et dans le navigateur.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ImmoSecteur = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var SECTOR = {
    baseCity: "Varangéville",
    basePostal: "54110",
    department: "54",
    departmentLabel: "Meurthe-et-Moselle",
    region: "Grand Est",
    radiusKm: 30,
    coreCities: [
      "Varangéville",
      "Saint-Nicolas-de-Port",
      "Dombasle-sur-Meurthe",
      "Rosières-aux-Salines",
      "Laneuveville-devant-Nancy",
      "Jarville-la-Malgrange",
      "Heillecourt",
      "Ludres",
      "Fléville-devant-Nancy",
      "Tomblaine",
      "Essey-lès-Nancy",
      "Nancy",
      "Vandoeuvre-lès-Nancy",
      "Villers-lès-Nancy",
      "Lunéville",
      "Pont-à-Mousson",
      "Toul",
      "Frouard",
      "Pompey",
      "Baccarat",
    ],
    nearDepartments: ["08", "10", "51", "52", "55", "57", "67", "68", "88"],
  };

  var ZONES = {
    coeur: {
      id: "coeur",
      label: "Dans mon secteur",
      mandateReady: true,
      message:
        "C'est ma localité : je contacte le vendeur et je vais chercher le mandat pour vous accompagner sur la visite et la négociation.",
    },
    proche: {
      id: "proche",
      label: "Secteur élargi",
      mandateReady: false,
      message:
        "Hors de ma localité mais en " +
        SECTOR.region +
        " : je tente le mandat, sinon je travaille l'annonce avec un confrère du coin.",
    },
    hors: {
      id: "hors",
      label: "Hors secteur",
      mandateReady: false,
      message:
        "Trop loin pour aller chercher le mandat moi-même : j'enregistre le bien, je relaie à un confrère et je garde le prêt et les assurances.",
    },
    inconnu: {
      id: "inconnu",
      label: "Secteur à préciser",
      mandateReady: false,
      message: "Indiquez la ville ou le code postal du bien pour savoir si je peux aller chercher le mandat.",
    },
  };

  function normalizeCity(value) {
    var s = String(value == null ? "" : value).toLowerCase();
    if (typeof s.normalize === "function") s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return s.replace(/[^a-z0-9]+/g, " ").trim();
  }

  var CORE_CITY_KEYS = SECTOR.coreCities.map(normalizeCity);

  function postalOf(value) {
    return String(value == null ? "" : value).replace(/\D/g, "").slice(0, 5);
  }

  function departmentOf(postal) {
    var cp = postalOf(postal);
    if (cp.length < 2) return "";
    if (cp.indexOf("97") === 0 || cp.indexOf("98") === 0) return cp.slice(0, 3);
    return cp.slice(0, 2);
  }

  function isCoreCity(city) {
    var key = normalizeCity(city);
    if (!key) return false;
    return CORE_CITY_KEYS.some(function (known) {
      return known === key || key.indexOf(known) === 0;
    });
  }

  /**
   * Classe un bien : cœur de secteur (mandat direct), secteur élargi, hors secteur.
   */
  function evaluate(input) {
    var data = input || {};
    var postal = postalOf(data.postal_code || data.postal || data.postalCode);
    var dept = departmentOf(postal) || String(data.department || "").trim();
    var city = data.city || data.ville || "";
    var zone = ZONES.inconnu;

    if (dept === SECTOR.department || (!dept && isCoreCity(city))) {
      zone = ZONES.coeur;
    } else if (dept && SECTOR.nearDepartments.indexOf(dept) !== -1) {
      zone = ZONES.proche;
    } else if (dept) {
      zone = ZONES.hors;
    } else if (city) {
      zone = ZONES.hors;
    }

    if (zone === ZONES.proche && isCoreCity(city)) zone = ZONES.coeur;

    return {
      zone: zone.id,
      label: zone.label,
      message: zone.message,
      mandateReady: zone.mandateReady,
      inSector: zone.id === "coeur" || zone.id === "proche",
      department: dept || "",
      postal_code: postal,
      city: String(city || "").trim(),
      baseCity: SECTOR.baseCity,
      radiusKm: SECTOR.radiusKm,
    };
  }

  /**
   * Texte court pour badge / CRM (« Dans mon secteur — Meurthe-et-Moselle »).
   */
  function shortLabel(result) {
    var r = result && result.zone ? result : evaluate(result);
    if (r.zone === "coeur") return r.label + " — " + SECTOR.departmentLabel;
    if (r.zone === "proche") return r.label + " — " + SECTOR.region;
    if (r.zone === "hors") return r.label + (r.department ? " (dép. " + r.department + ")" : "");
    return r.label;
  }

  return {
    SECTOR: SECTOR,
    ZONES: ZONES,
    normalizeCity: normalizeCity,
    postalOf: postalOf,
    departmentOf: departmentOf,
    isCoreCity: isCoreCity,
    evaluate: evaluate,
    shortLabel: shortLabel,
  };
});
