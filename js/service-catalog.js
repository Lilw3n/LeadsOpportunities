/**
 * Catalogue services — routage devis et categories de questionnaire.
 */
(function (global) {
  var CATEGORIES = {
    mobilite: { id: "mobilite", label: "Mobilite" },
    sante: { id: "sante", label: "Sante et prevoyance" },
    habitat: { id: "habitat", label: "Habitat" },
    finance: { id: "finance", label: "Financement" },
    pro: { id: "pro", label: "Professionnel" },
    patrimoine: { id: "patrimoine", label: "Patrimoine" },
    animaux: { id: "animaux", label: "Animaux de compagnie" },
    niches: { id: "niches", label: "Assurances de niche" },
  };

  var SERVICES = {
    vtc: {
      need: "vtc",
      label: "Assurance VTC",
      category: "mobilite",
      vertical: "vtc",
      landing: "./landings/vtc.html",
    },
    sante: {
      need: "sante",
      label: "Mutuelle sante",
      category: "sante",
      vertical: "sante",
      landing: "./landings/sante.html",
    },
    immo: {
      need: "immo",
      label: "Credit immobilier",
      category: "finance",
      vertical: "credit_immo",
      landing: "./landings/credit-immo.html",
    },
    auto: { need: "auto", label: "Assurance auto", category: "mobilite", vertical: "auto" },
    moto: { need: "moto", label: "Deux-roues / scooter", category: "mobilite", vertical: "moto" },
    flotte: { need: "flotte", label: "Flotte professionnelle", category: "mobilite", vertical: "flotte" },
    temporaire: {
      need: "temporaire",
      label: "Assurance temporaire",
      category: "mobilite",
      vertical: "temporaire",
    },
    prevoyance: {
      need: "prevoyance",
      label: "Prevoyance individuelle",
      category: "sante",
      vertical: "prevoyance",
    },
    tns: { need: "tns", label: "Prevoyance TNS", category: "sante", vertical: "tns" },
    deces: { need: "deces", label: "Assurance deces / obseques", category: "sante", vertical: "deces" },
    collective: {
      need: "collective",
      label: "Mutuelle collective entreprise",
      category: "sante",
      vertical: "collective",
      landing: "./landings/sante-collective.html",
    },
    habitation: {
      need: "habitation",
      label: "Assurance habitation",
      category: "habitat",
      vertical: "habitation",
    },
    pno: { need: "pno", label: "PNO", category: "habitat", vertical: "pno" },
    emprunteur: {
      need: "emprunteur",
      label: "Assurance emprunteur",
      category: "habitat",
      vertical: "emprunteur",
    },
    mrh: { need: "mrh", label: "Multirisque habitation", category: "habitat", vertical: "mrh" },
    rachat: { need: "rachat", label: "Rachat de credit", category: "finance", vertical: "rachat" },
    conso: { need: "conso", label: "Credit consommation", category: "finance", vertical: "conso" },
    "credit-pro": {
      need: "credit-pro",
      label: "Credit professionnel",
      category: "finance",
      vertical: "credit_pro",
    },
    renegociation: {
      need: "renegociation",
      label: "Renegociation de pret",
      category: "finance",
      vertical: "renegociation",
    },
    "rc-pro": { need: "rc-pro", label: "RC professionnelle", category: "pro", vertical: "rc_pro" },
    mrp: { need: "mrp", label: "Multirisque professionnelle", category: "pro", vertical: "mrp" },
    decennale: { need: "decennale", label: "Assurance decennale", category: "pro", vertical: "decennale" },
    "pj-pro": { need: "pj-pro", label: "Protection juridique pro", category: "pro", vertical: "pj_pro" },
    dirigeant: { need: "dirigeant", label: "Dirigeant / homme cle", category: "pro", vertical: "dirigeant" },
    "assurance-vie": {
      need: "assurance-vie",
      label: "Assurance vie / epargne",
      category: "patrimoine",
      vertical: "assurance_vie",
    },
    retraite: { need: "retraite", label: "Retraite supplementaire", category: "patrimoine", vertical: "retraite" },
    gav: { need: "gav", label: "Garantie accidents de la vie", category: "patrimoine", vertical: "gav" },
    pj: { need: "pj", label: "Protection juridique", category: "patrimoine", vertical: "pj" },
    famille: { need: "famille", label: "Scolaire et famille", category: "patrimoine", vertical: "famille" },
    animaux: {
      need: "animaux",
      label: "Assurance animaux",
      category: "animaux",
      vertical: "assurance_animaux",
      landing: "./landings/animaux.html",
    },
    chien: {
      need: "animaux",
      label: "Assurance chien",
      category: "animaux",
      vertical: "assurance_animaux",
      landing: "./landings/animaux.html?species=chien",
    },
    chat: {
      need: "animaux",
      label: "Assurance chat",
      category: "animaux",
      vertical: "assurance_animaux",
      landing: "./landings/animaux.html?species=chat",
    },
    chasse: { need: "chasse", label: "Assurance chasse", category: "niches", vertical: "assurance_chasse" },
    equitation: { need: "equitation", label: "Assurance equitation", category: "niches", vertical: "assurance_equitation" },
    instrument: { need: "instrument", label: "Assurance instrument musique", category: "niches", vertical: "assurance_instrument" },
    "materiel-photo": {
      need: "materiel-photo",
      label: "Assurance materiel photo",
      category: "niches",
      vertical: "assurance_materiel_photo",
    },
    bateau: { need: "bateau", label: "Assurance bateau plaisance", category: "niches", vertical: "assurance_bateau" },
    caravane: { need: "caravane", label: "Caravane / camping-car", category: "niches", vertical: "assurance_caravane" },
    autre: { need: "autre", label: "Autre demande", category: "patrimoine", vertical: "autre" },
  };

  function getService(need) {
    if (!need) return null;
    var key = String(need).trim().toLowerCase();
    return SERVICES[key] || null;
  }

  /** Parcours rapide dedie (sinon devis-express generique). */
  var RAPIDE_LANDINGS = {
    animaux: "./landings/animaux-express.html",
    chien: "./landings/animaux-express.html?species=chien",
    chat: "./landings/animaux-express.html?species=chat",
    vtc: "./landings/devis-rapide.html",
  };

  /** Parcours complet dedie (sinon questionnaire universel). */
  var COMPLET_LANDINGS = {
    animaux: "./landings/animaux.html",
    chien: "./landings/animaux.html?species=chien",
    chat: "./landings/animaux.html?species=chat",
    vtc: "./landings/vtc.html",
    sante: "./landings/sante.html",
    immo: "./landings/credit-immo.html",
  };

  function normalizeLandingPath(path, opts) {
    if (!path) return path;
    opts = opts || {};
    if (opts.fromAssurancesFolder) {
      return path.replace(/^\.\/landings\//, "../landings/");
    }
    if (opts.fromLandingsFolder) {
      return path.replace(/^\.\/landings\//, "./");
    }
    return path;
  }

  function getRapideUrl(need, opts) {
    opts = opts || {};
    var key = String(need || "").trim().toLowerCase();
    if (RAPIDE_LANDINGS[key]) {
      return normalizeLandingPath(RAPIDE_LANDINGS[key], opts);
    }
    var base = "./landings/devis-express.html?need=" + encodeURIComponent(key || "autre");
    if (opts.fromAssurancesFolder) {
      return base.replace(/^\.\/landings\//, "../landings/");
    }
    if (opts.fromLandingsFolder) {
      return base.replace(/^\.\/landings\//, "./");
    }
    return base;
  }

  function getCompletUrl(need, opts) {
    opts = opts || {};
    var key = String(need || "").trim().toLowerCase();
    if (COMPLET_LANDINGS[key]) {
      return normalizeLandingPath(COMPLET_LANDINGS[key], opts);
    }
    var q =
      "./landings/questionnaire.html?need=" +
      encodeURIComponent(key || "autre") +
      "&journey=standard";
    if (opts.fromAssurancesFolder) {
      return q.replace(/^\.\/landings\//, "../landings/");
    }
    if (opts.fromLandingsFolder) {
      return q.replace(/^\.\/landings\//, "./");
    }
    return q;
  }

  function getDevisUrl(need, opts) {
    return getCompletUrl(need, opts);
  }

  function resolveFromQuery(search) {
    var params = new URLSearchParams(search || global.location.search);
    return getService(params.get("need") || params.get("service") || "");
  }

  global.SERVICE_CATALOG = {
    CATEGORIES: CATEGORIES,
    SERVICES: SERVICES,
    RAPIDE_LANDINGS: RAPIDE_LANDINGS,
    COMPLET_LANDINGS: COMPLET_LANDINGS,
    getService: getService,
    getDevisUrl: getDevisUrl,
    getRapideUrl: getRapideUrl,
    getCompletUrl: getCompletUrl,
    resolveFromQuery: resolveFromQuery,
  };
})(typeof window !== "undefined" ? window : global);
