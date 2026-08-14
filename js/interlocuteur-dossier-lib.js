/**
 * Catégorise les réponses questionnaire en dossier interlocuteur :
 * info perso, info pro, biens (véhicule / immeuble), projet.
 * Navigateur + Node.
 */
(function (root) {
  var LABELS = {
    civility: "Civilité",
    firstName: "Prénom",
    first_name: "Prénom",
    lastName: "Nom",
    last_name: "Nom",
    fullName: "Nom complet",
    email: "E-mail",
    phone: "Téléphone",
    phone2: "Téléphone 2",
    familyPhone: "Téléphone famille",
    homePhone: "Téléphone domicile",
    street: "Adresse (rue)",
    postalCode: "Code postal",
    postal_code: "Code postal",
    city: "Ville",
    cityFull: "Ville",
    birthDate: "Date de naissance",
    dateNaissance: "Date de naissance",
    driverDob: "Date de naissance",
    age: "Âge",
    maritalStatus: "Statut matrimonial",
    householdType: "Profil foyer",
    childrenCount: "Nombre d’enfants",
    familySize: "Taille du foyer",
    country: "Pays",
    address: "Adresse",
    companyName: "Raison sociale",
    company: "Entreprise",
    companySiret: "SIREN / SIRET",
    collectiveSiret: "SIREN / SIRET",
    siret: "SIRET",
    siren: "SIREN",
    ape: "Code APE / NAF",
    naf: "Code NAF",
    legalForm: "Forme juridique",
    jobTitle: "Poste",
    job: "Profession",
    profession: "Profession",
    csp: "Catégorie socio-professionnelle",
    socioPro: "Catégorie socio-professionnelle",
    companyStreet: "Adresse pro (rue)",
    companyAddress: "Adresse professionnelle",
    companyPostal: "CP professionnel",
    companyCity: "Ville professionnelle",
    companyEmail: "E-mail professionnel",
    proEmail: "E-mail professionnel",
    turnover: "CA",
    employees: "Effectif",
    activity: "Activité",
    vtcPlatform: "Plateforme VTC",
    vtcStatus: "Statut VTC",
    autoPlate: "Plaque",
    vtcVehiclePlate: "Plaque",
    vehiclePlate: "Plaque",
    motoPlate: "Plaque moto",
    tempVehiclePlate: "Plaque",
    fleetMainPlate: "Plaque flotte",
    rvPlate: "Plaque",
    vehicleBrand: "Marque",
    vehicleModel: "Modèle",
    vehicleYear: "Année",
    vehicleType: "Type de véhicule",
    autoDriverProfile: "Profil conducteur",
    autoFormula: "Formule auto",
    bonusMalus: "Bonus-malus",
    propertyType: "Type de bien",
    homeType: "Type de logement",
    homeSurface: "Surface (m²)",
    propertySurface: "Surface (m²)",
    projectType: "Type de projet",
    postalProject: "CP du bien",
    propertyFound: "État recherche / bien",
    immoProjectStage: "Stade projet immo",
    immoPropertyPrice: "Budget / prix",
    roomsMin: "Pièces min.",
    propertySought: "Bien recherché",
    homeStatus: "Statut occupant",
    budgetMax: "Budget max",
    budgetMin: "Budget min",
    searchCities: "Secteurs visés",
    need: "Produit demandé",
    serviceNeed: "Produit demandé",
    serviceLabel: "Produit",
    vertical: "Vertical",
    buyerNeeds: "Besoins (prêt & assurances)",
    financeProject: "Avancement projet",
    healthPriority: "Priorité santé",
    healthStatus: "Mutuelle actuelle",
    parcours_label: "Parcours",
    huntLicense: "Permis de chasser",
    huntCover: "Couverture chasse",
    huntWeapon: "Arme",
    huntType: "Type de chasse",
  };

  var VALUE_LABELS = {
    M: "M.",
    Mme: "Mme",
    marie: "Marié(e)",
    celibataire: "Célibataire",
    pacse: "Pacsé(e)",
    union_libre: "Union libre",
    divorce: "Divorcé(e)",
    veuf: "Veuf / veuve",
    maison: "Maison",
    appartement: "Appartement",
    immeuble: "Immeuble / lots",
    terrain: "Terrain",
    pret: "Prêt immobilier",
    emprunteur: "Assurance emprunteur",
    habitation: "Assurance habitation",
  };

  var PERSO_KEYS = [
    "civility",
    "firstName",
    "first_name",
    "lastName",
    "last_name",
    "fullName",
    "email",
    "phone",
    "phone2",
    "familyPhone",
    "homePhone",
    "birthDate",
    "dateNaissance",
    "driverDob",
    "age",
    "maritalStatus",
    "householdType",
    "childrenCount",
    "familySize",
    "street",
    "address",
    "postalCode",
    "postal_code",
    "cityFull",
    "city",
    "country",
  ];

  var PRO_KEYS = [
    "companyName",
    "company",
    "companySiret",
    "collectiveSiret",
    "siret",
    "siren",
    "ape",
    "naf",
    "legalForm",
    "jobTitle",
    "job",
    "profession",
    "csp",
    "socioPro",
    "companyStreet",
    "companyAddress",
    "companyPostal",
    "companyCity",
    "companyEmail",
    "proEmail",
    "turnover",
    "employees",
    "activity",
    "vtcPlatform",
    "vtcStatus",
  ];

  var VEHICLE_KEYS = [
    "autoPlate",
    "vtcVehiclePlate",
    "vehiclePlate",
    "motoPlate",
    "tempVehiclePlate",
    "fleetMainPlate",
    "rvPlate",
    "vehicleBrand",
    "vehicleModel",
    "vehicleYear",
    "vehicleType",
    "autoDriverProfile",
    "autoFormula",
    "bonusMalus",
  ];

  var IMMO_KEYS = [
    "propertyType",
    "homeType",
    "homeSurface",
    "propertySurface",
    "projectType",
    "postalProject",
    "propertyFound",
    "immoProjectStage",
    "immoPropertyPrice",
    "roomsMin",
    "propertySought",
    "homeStatus",
    "budgetMax",
    "budgetMin",
    "searchCities",
  ];

  var PROJET_KEYS = [
    "need",
    "serviceNeed",
    "serviceLabel",
    "vertical",
    "buyerNeeds",
    "financeProject",
    "healthPriority",
    "healthStatus",
    "parcours_label",
    "huntLicense",
    "huntCover",
    "huntWeapon",
    "huntType",
  ];

  var SKIP = {
    utm_source: 1,
    utm_medium: 1,
    utm_campaign: 1,
    utm_content: 1,
    gclid: 1,
    fbclid: 1,
    ttclid: 1,
    visitor_id: 1,
    clientIp: 1,
    client_ip: 1,
    fbp: 1,
    attr_fbp: 1,
    payload: 1,
    funnel: 1,
    eligibility: 1,
    tariffQuote: 1,
    crossSell: 1,
    consent: 1,
    _hp: 1,
    openedAt: 1,
    questionnaireDraft: 1,
    custom_answers: 1,
  };

  function parsePayload(raw) {
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  function flatten(val) {
    if (val == null || val === "") return null;
    if (typeof val === "boolean") return val ? "Oui" : "Non";
    if (typeof val === "number") return String(val);
    if (Array.isArray(val)) {
      return (
        val
          .map(function (x) {
            if (x == null) return "";
            if (typeof x === "object") return JSON.stringify(x);
            return VALUE_LABELS[String(x)] || String(x);
          })
          .filter(Boolean)
          .join(", ") || null
      );
    }
    if (typeof val === "object") return JSON.stringify(val);
    var s = String(val).trim();
    if (!s) return null;
    return VALUE_LABELS[s] || s;
  }

  function labelOf(key) {
    if (LABELS[key]) return LABELS[key];
    return String(key)
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^\w/, function (c) {
        return c.toUpperCase();
      });
  }

  function pick(payload, keys) {
    var out = [];
    var seen = {};
    (keys || []).forEach(function (k) {
      var v = flatten(payload[k]);
      if (!v) return;
      var lab = labelOf(k);
      var id = lab + ":" + v;
      if (seen[id]) return;
      seen[id] = true;
      out.push({ key: k, label: lab, value: v });
    });
    return out;
  }

  function first(payload, keys) {
    var i;
    for (i = 0; i < keys.length; i++) {
      var v = payload[keys[i]];
      if (v != null && String(v).trim()) return String(v).trim();
    }
    return "";
  }

  function ageFromDob(dob) {
    if (!dob) return "";
    var d = new Date(dob);
    if (isNaN(d.getTime())) return "";
    var now = new Date();
    var age = now.getFullYear() - d.getFullYear();
    var m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age > 0 && age < 120 ? String(age) : "";
  }

  function mergePayloads(lead, extraPayload) {
    var p = parsePayload(extraPayload || (lead && lead.payload));
    if (lead) {
      if (lead.email && !p.email) p.email = lead.email;
      if (lead.phone && !p.phone) p.phone = lead.phone;
      if (lead.vertical && !p.vertical) p.vertical = lead.vertical;
    }
    if (p.questionnaireDraft && typeof p.questionnaireDraft === "object") {
      Object.keys(p.questionnaireDraft).forEach(function (k) {
        if (p[k] == null || p[k] === "") p[k] = p.questionnaireDraft[k];
      });
    }
    if (p.custom_answers && typeof p.custom_answers === "object") {
      Object.keys(p.custom_answers).forEach(function (k) {
        if (p[k] == null || p[k] === "") p[k] = p.custom_answers[k];
      });
    }
    return p;
  }

  function buildDossier(lead, extraPayload) {
    var p = mergePayloads(lead, extraPayload);
    if (!p.age) {
      var dob = first(p, ["birthDate", "dateNaissance", "driverDob"]);
      var computed = ageFromDob(dob);
      if (computed) p.age = computed;
    }
    var perso = pick(p, PERSO_KEYS);
    var pro = pick(p, PRO_KEYS);
    var vehicules = pick(p, VEHICLE_KEYS);
    var immobilier = pick(p, IMMO_KEYS);
    var projet = pick(p, PROJET_KEYS);

    var known = {};
    PERSO_KEYS.concat(PRO_KEYS, VEHICLE_KEYS, IMMO_KEYS, PROJET_KEYS).forEach(function (k) {
      known[k] = true;
    });
    var autres = [];
    Object.keys(p).forEach(function (k) {
      if (known[k] || SKIP[k]) return;
      if (k.indexOf("utm_") === 0 || k.indexOf("attr_") === 0 || k.indexOf("meta_") === 0) return;
      if (typeof p[k] === "object" && !Array.isArray(p[k])) return;
      var v = flatten(p[k]);
      if (!v || v.length > 240) return;
      autres.push({ key: k, label: labelOf(k), value: v });
    });

    return {
      perso: perso,
      pro: pro,
      biens: { vehicules: vehicules, immobilier: immobilier, autres: autres.slice(0, 24) },
      projet: projet,
      raw: p,
    };
  }

  function patchesFromDossier(dossier) {
    var p = (dossier && dossier.raw) || {};
    var siret = first(p, ["companySiret", "collectiveSiret", "siret", "siren"]);
    var companyAddr = [first(p, ["companyStreet", "companyAddress"]), first(p, ["companyPostal"]), first(p, ["companyCity"])]
      .filter(Boolean)
      .join(" ");
    var persoAddr = [first(p, ["street", "address"]), first(p, ["postalCode", "postal_code"]), first(p, ["cityFull", "city"])]
      .filter(Boolean)
      .join(" ");
    var plate = first(p, VEHICLE_KEYS.filter(function (k) {
      return /plate/i.test(k);
    }));
    return {
      firstName: first(p, ["firstName", "first_name"]),
      lastName: first(p, ["lastName", "last_name"]),
      email: first(p, ["email"]),
      phone: first(p, ["phone"]),
      company: {
        name: first(p, ["companyName", "company"]),
        siret: siret,
        activity: first(p, ["activity", "job", "profession", "jobTitle"]),
        address: companyAddr || persoAddr,
        email: first(p, ["companyEmail", "proEmail"]),
      },
      family: {
        maritalStatus: first(p, ["maritalStatus"]),
        emergencyContact: {
          phone: first(p, ["familyPhone", "homePhone", "phone2"]),
        },
      },
      vehicle: plate
        ? {
            registration: plate,
            brand: first(p, ["vehicleBrand"]),
            model: first(p, ["vehicleModel"]),
            year: first(p, ["vehicleYear"]),
            vehicle_type: first(p, ["vehicleType"]) || "Voiture particuliere",
            status: "Actif",
          }
        : null,
      immo: immobilierSummary(p),
    };
  }

  function immobilierSummary(p) {
    var type = first(p, ["propertyType", "homeType", "propertySought"]);
    if (!type && !first(p, ["homeSurface", "propertySurface", "projectType"])) return null;
    return {
      type: type,
      surface: first(p, ["homeSurface", "propertySurface"]),
      projectType: first(p, ["projectType", "immoProjectStage"]),
      postal: first(p, ["postalProject", "postalCode", "postal_code"]),
      city: first(p, ["cityFull", "city", "searchCities"]),
      price: first(p, ["immoPropertyPrice", "budgetMax"]),
      status: first(p, ["propertyFound", "homeStatus"]),
    };
  }

  function countFilled(dossier) {
    if (!dossier) return 0;
    var n = (dossier.perso || []).length + (dossier.pro || []).length + (dossier.projet || []).length;
    var b = dossier.biens || {};
    n += (b.vehicules || []).length + (b.immobilier || []).length;
    return n;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function rowsHtml(rows) {
    if (!rows || !rows.length) return '<p class="int-empty">Aucune information saisie dans le formulaire.</p>';
    return (
      '<dl class="int-dl">' +
      rows
        .map(function (r) {
          return "<dt>" + esc(r.label) + "</dt><dd>" + esc(r.value) + "</dd>";
        })
        .join("") +
      "</dl>"
    );
  }

  function renderSections(dossier, opts) {
    opts = opts || {};
    var d = dossier || { perso: [], pro: [], biens: {}, projet: [] };
    var b = d.biens || {};
    var html =
      '<div class="int-dossier">' +
      (opts.title !== false
        ? '<p class="int-dossier-lead">Infos reprises du questionnaire — classées pour la fiche interlocuteur.</p>'
        : "") +
      '<section class="int-card int-card-perso"><h3>Info perso</h3>' +
      rowsHtml(d.perso) +
      "</section>" +
      '<section class="int-card int-card-pro"><h3>Info pro</h3>' +
      rowsHtml(d.pro) +
      "</section>" +
      '<section class="int-card int-card-biens"><h3>Biens — véhicule, immobilier</h3>' +
      "<h4>Véhicule / mobilier</h4>" +
      rowsHtml(b.vehicules) +
      "<h4>Maison, appartement, immeuble</h4>" +
      rowsHtml(b.immobilier) +
      ((b.autres || []).length ? "<h4>Autres éléments</h4>" + rowsHtml(b.autres) : "") +
      "</section>" +
      '<section class="int-card int-card-projet"><h3>Projet / produit demandé</h3>' +
      rowsHtml(d.projet) +
      "</section></div>";
    return html;
  }

  function slackLines(dossier, ctx) {
    ctx = ctx || {};
    var p = (dossier && dossier.raw) || {};
    var name = [first(p, ["firstName", "first_name"]), first(p, ["lastName", "last_name"])].filter(Boolean).join(" ");
    var lines = [
      "*Fiche interlocuteur*" + (name ? " — " + name : ""),
      first(p, ["email"]) ? "Email: " + first(p, ["email"]) : "",
      first(p, ["phone"]) ? "Tél: " + first(p, ["phone"]) : "",
      first(p, ["need", "serviceNeed", "vertical"]) ? "Produit: " + first(p, ["need", "serviceNeed", "vertical"]) : "",
      first(p, ["companySiret", "siret", "siren"]) ? "SIREN/SIRET: " + first(p, ["companySiret", "siret", "siren"]) : "",
      ctx.contactUrl ? "<" + ctx.contactUrl + "|Ouvrir la fiche>" : "",
      ctx.eventsUrl ? "<" + ctx.eventsUrl + "|Événements>" : "",
    ];
    return lines.filter(Boolean).join("\n");
  }

  var api = {
    LABELS: LABELS,
    parsePayload: parsePayload,
    buildDossier: buildDossier,
    patchesFromDossier: patchesFromDossier,
    countFilled: countFilled,
    renderSections: renderSections,
    slackLines: slackLines,
    first: first,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.InterlocuteurDossier = api;
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
