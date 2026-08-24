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
    propertyPrice: "Prix du bien",
    worksAmount: "Montant des travaux",
    downPayment: "Apport personnel",
    downPaymentSource: "Origine de l’apport",
    loanRefusedBefore: "Prêt déjà refusé ?",
    horizon: "Horizon d’achat / signature",
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
    role: "Profil",
    hats: "Profils",
    portals: "Portails / sources",
    portal: "Portail",
    propertyIds: "Identifiant(s) du bien",
    propertyId: "Identifiant du bien",
    listingUrls: "URL(s) d'annonce",
    listingUrl: "URL d'annonce",
    criteriaId: "Critères de recherche",
    sellerName: "Nom du vendeur",
    sellerPhone: "Téléphone vendeur",
    sellerEmail: "E-mail vendeur",
    sellerAgency: "Agence",
    sellerKind: "Type de vendeur",
    sellerType: "Type de vendeur",
    photoCount: "Nombre de photos",
    hasCapture: "Capture d'écran",
    hasDescription: "Description saisie",
    alsoBuys: "Achete aussi",
    wantsRelais: "Intérêt prêt relais / vente en chaîne",
    wantsSellDossier: "Dossier de vente détaillé",
    confirmByEmail: "Confirmation par e-mail",
    confirmByPhone: "Confirmation par téléphone",
    confirmMethod: "Mode de confirmation",
    createAccount: "Création de compte",
    buyCity: "Ville recherchée (achat)",
    buyBudgetMax: "Budget achat max.",
    signalementSource: "Source du signalement",
    addressHint: "Indication d'adresse",
    message: "Message",
    description: "Description",
    comment: "Commentaire",
    sellCity: "Ville du bien",
    sellPostalCode: "Code postal du bien",
    sellPropertyType: "Type de bien (vente)",
    sellListingType: "Type d'annonce",
    sellPropertyCategory: "Type de bien (catégorie)",
    sellPropertySubtype: "Sous-type de bien",
    sellCoproStatus: "Statut copropriété",
    sellCommercialActivity: "Activité commerciale",
    sellEnvironment: "Environnement",
    sellGeneralCondition: "État général",
    sellPriceDisplay: "Affichage du prix",
    sellSurface: "Surface du bien (m²)",
    sellRooms: "Nombre de pièces",
    sellPrice: "Prix souhaité",
    sellDossierSummary: "Résumé dossier vente",
    notes: "Notes",
    platform: "Réseau d’acquisition",
    pipeline_stage: "Étape pipeline",
    status: "Statut",
    lead_score: "Score lead",
    adminQuestionnaireNotes: "Note admin (questionnaire)",
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
    vendeur: "Vendeur",
    acheteur: "Acheteur",
    acquereur: "Acquéreur",
    les_deux: "Vendeur et acheteur",
    signalement: "Signalement",
    chasseur: "Chasseur de bien",
    manual: "Saisie manuelle",
    listing_manual: "Dépôt manuel",
    listing_url: "URL d'annonce",
    site_web: "Site web",
    google: "Compte Google",
    email: "E-mail",
    phone: "Téléphone",
    pro: "Professionnel",
    agence: "Agence",
    particulier: "Particulier",
    vendeur_immo: "Vente immobilière",
    acheteur_immo: "Achat immobilier",
    acheteur_vendeur_immo: "Achat et vente immobilière",
    chasseur_immo: "Chasseur de bien",
    credit_immo: "Crédit immobilier",
    pret_immobilier: "Prêt immobilier",
    meta_lead_rapide: "Meta Lead Rapide",
    google_intention_chaude: "Google Intention Chaude",
    organique_confiance: "Organique Confiance",
    leboncoin: "Leboncoin",
    seloger: "SeLoger",
    pap: "PAP",
    bienici: "Bien'ici",
    logic_immo: "Logic-immo",
    figaro: "Figaro Immobilier",
    avendrealouer: "Avendre A Louer",
    prix_hai: "Prix HAI",
    nous_consulter: "Prix : nous consulter",
    tres_bon: "Très bon",
    bon: "Bon",
    moyen: "Moyen",
    a_renover: "À rénover",
    a_restaurer: "À restaurer",
    neuf: "Neuf / récent",
    centre_ville: "centre ville",
    bois: "bois",
    village: "village",
    campagne_isolee: "campagne isolée",
    campagne_non_isolee: "campagne non-isolée",
    clos_prive: "clos privé",
    lotissement: "lotissement",
    parc: "parc",
    plage: "plage",
    urbain: "urbain",
    zone_commerciale: "zone Commerciale",
    zone_residentielle: "zone Résidentielle",
    peripherie: "Périphérie / périurbain",
    campagne: "Campagne",
    littoral: "Bord de mer / littoral",
    montagne: "Montagne / station",
    zone_industrielle: "Zone industrielle",
    residentiel: "Quartier résidentiel",
    rural: "Zone rurale",
    autre: "Autre",
    cession_bail: "Cession de bail",
    location: "Location",
    location_vacances: "Location vacances",
    produit_investissement: "Produit d'investissement",
    vente: "Vente",
    vente_prestige: "Vente de prestige",
    viager: "Viager",
    fonds_commerce: "Vente fonds de commerce / murs commerciaux / parts de société",
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
    "propertyPrice",
    "worksAmount",
    "roomsMin",
    "propertySought",
    "homeStatus",
    "budgetMax",
    "budgetMin",
    "searchCities",
    "sellCity",
    "sellPostalCode",
    "sellPropertyType",
    "sellListingType",
    "sellPropertyCategory",
    "sellPropertySubtype",
    "sellCoproStatus",
    "sellCommercialActivity",
    "sellEnvironment",
    "sellGeneralCondition",
    "sellPriceDisplay",
    "sellSurface",
    "sellRooms",
    "sellPrice",
    "property_type",
    "price_fai",
  ];

  var PROJET_KEYS = [
    "need",
    "serviceNeed",
    "serviceLabel",
    "vertical",
    "buyerNeeds",
    "financeProject",
    "loanRefusedBefore",
    "horizon",
    "downPayment",
    "downPaymentSource",
    "healthPriority",
    "healthStatus",
    "parcours_label",
    "role",
    "hats",
    "portals",
    "portal",
    "propertyIds",
    "propertyId",
    "listingUrls",
    "listingUrl",
    "criteriaId",
    "sellerName",
    "sellerPhone",
    "sellerEmail",
    "sellerAgency",
    "sellerKind",
    "sellerType",
    "photoCount",
    "hasCapture",
    "hasDescription",
    "alsoBuys",
    "wantsRelais",
    "wantsSellDossier",
    "confirmByEmail",
    "confirmByPhone",
    "confirmMethod",
    "createAccount",
    "buyCity",
    "buyBudgetMax",
    "signalementSource",
    "addressHint",
    "message",
    "description",
    "comment",
    "notes",
    "platform",
  ];

  var MONEY_KEYS = {
    propertyPrice: 1,
    immoPropertyPrice: 1,
    worksAmount: 1,
    downPayment: 1,
    budgetMax: 1,
    budgetMin: 1,
    buyBudgetMax: 1,
    sellPrice: 1,
    price_fai: 1,
  };

  var SKIP = {
    utm_source: 1,
    utm_medium: 1,
    utm_campaign: 1,
    utm_content: 1,
    gclid: 1,
    fbclid: 1,
    ttclid: 1,
    msclkid: 1,
    visitor_id: 1,
    visitorId: 1,
    clientIp: 1,
    client_ip: 1,
    clientUa: 1,
    client_ua: 1,
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
    opened_at: 1,
    questionnaireDraft: 1,
    custom_answers: 1,
    sellDossier: 1,
    adminEdits: 1,
    adminFieldComments: 1,
    adminEditedAt: 1,
    adminEditedBy: 1,
    questionnaire_step: 1,
    questionnaire_total: 1,
    questionnaire_pct: 1,
    page: 1,
    variant: 1,
    journey: 1,
    source: 1,
    form_id: 1,
    formId: 1,
    parcours_id: 1,
    parcours_type: 1,
    parcours_workflow: 1,
    landing_path: 1,
    landing_slug: 1,
    landing_at: 1,
    referrer: 1,
    referrer_first: 1,
    referrer_last: 1,
    seo_product: 1,
    seo_city: 1,
    seo_department: 1,
    id: 1,
    leadId: 1,
    lead_id: 1,
    contact_id: 1,
    contactId: 1,
    event_id: 1,
    event_category: 1,
    event_label: 1,
    serverReceivedAt: 1,
    devis_preview: 1,
    devis_summary: 1,
    website: 1,
    company_url: 1,
    portfolio: 1,
    relevance: 1,
    relevanceReasons: 1,
  };

  function parsePayload(raw) {
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    var s = String(raw).trim();
    if (!s) return {};
    try {
      return JSON.parse(s);
    } catch (e) {
      return {};
    }
  }

  function looksLikeLeadPayload(p) {
    p = p || {};
    return !!(
      p.email ||
      p.phone ||
      p.firstName ||
      p.first_name ||
      p.vertical ||
      p.need ||
      p.city ||
      p.sellCity ||
      (Array.isArray(p.propertyIds) && p.propertyIds.length)
    );
  }

  function flattenLeadPayload(raw) {
    var p = typeof raw === "string" ? parsePayload(raw) : Object.assign({}, raw || {});
    if (typeof p.payload === "string") {
      var innerStr = parsePayload(p.payload);
      if (looksLikeLeadPayload(innerStr)) {
        p = Object.assign({}, innerStr, p);
        delete p.payload;
      }
    }
    if (p.payload && typeof p.payload === "object" && !Array.isArray(p.payload)) {
      p = Object.assign({}, p.payload, p);
      delete p.payload;
    }
    return p;
  }

  function resolveLeadPayloadFromEvent(description, extraData) {
    extraData = extraData || {};
    var candidates = [];
    if (extraData.leadSnapshot != null) candidates.push(extraData.leadSnapshot);
    if (extraData.payload != null) candidates.push(extraData.payload);
    if (description != null && String(description).trim()) candidates.push(description);
    var merged = {};
    var i;
    for (i = 0; i < candidates.length; i++) {
      var flat = flattenLeadPayload(candidates[i]);
      if (!flat || typeof flat !== "object" || !Object.keys(flat).length) continue;
      merged = Object.assign({}, merged, flat);
    }
    return merged;
  }

  function formatMoney(val) {
    var n = Number(String(val).replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(n)) return String(val);
    try {
      return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
    } catch (e) {
      return String(Math.round(n)) + " €";
    }
  }

  function flatten(val, key) {
    if (val == null || val === "") return null;
    if (typeof val === "boolean") return val ? "Oui" : "Non";
    if (typeof val === "number") {
      if (MONEY_KEYS[key]) {
        if (key === "worksAmount" && val === 0) return "Aucun";
        return formatMoney(val);
      }
      return String(val);
    }
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
    if (MONEY_KEYS[key] && /^-?\d+([.,]\d+)?$/.test(s.replace(/\s/g, ""))) {
      if (key === "worksAmount" && Number(s.replace(/\s/g, "").replace(",", ".")) === 0) return "Aucun";
      return formatMoney(s);
    }
    if (
      key === "sellCommercialActivity" &&
      root.ImmoListingTaxonomy &&
      root.ImmoListingTaxonomy.commercialActivityLabel
    ) {
      return root.ImmoListingTaxonomy.commercialActivityLabel(s) || s;
    }
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
      var v = flatten(payload[k], k);
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
      if (k.indexOf("seo_") === 0 || k.indexOf("landing_") === 0 || k.indexOf("parcours_") === 0) return;
      if (typeof p[k] === "object" && !Array.isArray(p[k])) return;
      var v = flatten(p[k], k);
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

  function rowsHtml(rows, fieldComments) {
    fieldComments = fieldComments || {};
    if (!rows || !rows.length) return '<p class="int-empty">Aucune information saisie dans le formulaire.</p>';
    return (
      '<dl class="int-dl">' +
      rows
        .map(function (r) {
          var comment = fieldComments[r.key];
          var commentHtml = comment
            ? '<small class="int-admin-comment">Admin : ' + esc(comment) + "</small>"
            : "";
          return "<dt>" + esc(r.label) + "</dt><dd>" + esc(r.value) + commentHtml + "</dd>";
        })
        .join("") +
      "</dl>"
    );
  }

  function cardHtml(title, className, bodyHtml, opts) {
    opts = opts || {};
    if (opts.hide) return "";
    return '<section class="int-card ' + className + '"><h3>' + esc(title) + "</h3>" + bodyHtml + "</section>";
  }

  function renderSections(dossier, opts) {
    opts = opts || {};
    var d = dossier || { perso: [], pro: [], biens: {}, projet: [] };
    var b = d.biens || {};
    var raw = d.raw || {};
    var fieldComments = raw.adminFieldComments || {};
    var adminNotes = raw.adminQuestionnaireNotes || "";
    var notesBanner = adminNotes
      ? '<div class="int-admin-notes-banner"><strong>Note admin (questionnaire) :</strong> ' + esc(adminNotes) + "</div>"
      : "";

    var hasVehicules = !!(b.vehicules || []).length;
    var hasImmo = !!(b.immobilier || []).length;
    var hasAutres = !!(b.autres || []).length;
    var vehiculesHtml = hasVehicules
      ? "<h4>Véhicule / mobilier</h4>" + rowsHtml(b.vehicules, fieldComments)
      : "";
    var immoHtml = hasImmo
      ? "<h4>Maison, appartement, immeuble</h4>" + rowsHtml(b.immobilier, fieldComments)
      : "";
    var autresHtml = hasAutres
      ? "<h4>Autres éléments utiles</h4>" + rowsHtml(b.autres, fieldComments)
      : "";
    var biensBody = vehiculesHtml + immoHtml + autresHtml;
    var hasPerso = !!(d.perso || []).length;
    var hasPro = !!(d.pro || []).length;
    var hasProjet = !!(d.projet || []).length;
    var hasBiens = hasVehicules || hasImmo || hasAutres;

    var html =
      '<div class="int-dossier">' +
      (opts.title !== false
        ? '<p class="int-dossier-lead">Infos reprises du questionnaire — classées pour la fiche interlocuteur.</p>'
        : "") +
      notesBanner +
      cardHtml(
        "Info perso",
        "int-card-perso",
        hasPerso ? rowsHtml(d.perso, fieldComments) : '<p class="int-empty">Aucune information saisie dans le formulaire.</p>'
      ) +
      cardHtml("Info pro", "int-card-pro", rowsHtml(d.pro, fieldComments), { hide: !hasPro }) +
      cardHtml("Biens — véhicule, immobilier", "int-card-biens", biensBody, { hide: !hasBiens }) +
      cardHtml("Projet / financement", "int-card-projet", rowsHtml(d.projet, fieldComments), {
        hide: !hasProjet,
      }) +
      "</div>";
    return html;
  }

  function leadEventSummaryText(body) {
    var p = flattenLeadPayload(body);
    var parts = [];
    var name = [p.firstName || p.first_name, p.lastName || p.last_name].filter(Boolean).join(" ");
    if (name) parts.push(name);
    if (p.email) parts.push(String(p.email));
    var phone = p.phone || p.sellerPhone;
    if (phone) parts.push(String(phone));
    var city = p.city || p.sellCity;
    var postal = p.postal_code || p.sellPostalCode || p.postalCode;
    if (city) parts.push(city + (postal ? " (" + postal + ")" : ""));
    if (p.sellerName && p.sellerName !== name) parts.push("vendeur annonce : " + p.sellerName);
    if (p.sellerKind) parts.push(p.sellerKind);
    if (p.vertical || p.need) parts.push(String(p.vertical || p.need));
    if (p.leadScore != null) parts.push("score " + p.leadScore);
    if (Array.isArray(p.propertyIds) && p.propertyIds.length) parts.push(p.propertyIds.length + " bien(s)");
    return parts.join(" · ").slice(0, 480);
  }

  function renderLeadEventBody(description, extraData) {
    extraData = extraData || {};
    var p = resolveLeadPayloadFromEvent(description, extraData);
    if (!looksLikeLeadPayload(p)) {
      var desc = String(description || "").trim();
      if (desc && desc.charAt(0) !== "{" && desc.charAt(0) !== "[") {
        return '<p class="event-desc">' + esc(desc) + "</p>";
      }
      if (looksLikeLeadPayload(flattenLeadPayload(description))) {
        p = flattenLeadPayload(description);
      } else {
        var summary = leadEventSummaryText(p);
        if (summary) return '<p class="event-desc">' + esc(summary) + "</p>";
        return "";
      }
    }
    var dossier = buildDossier(null, p);
    var b = dossier.biens || {};
    function section(title, cls, rows) {
      if (!rows || !rows.length) return "";
      return (
        '<section class="int-card ' +
        cls +
        '"><h3>' +
        esc(title) +
        "</h3>" +
        rowsHtml(rows) +
        "</section>"
      );
    }
    var bienRows = []
      .concat(b.vehicules || [], b.immobilier || [], (b.autres || []).slice(0, 8));
    var html = '<div class="event-lead-dossier"><div class="int-dossier int-dossier--compact">';
    if (p.leadScore != null) {
      html +=
        '<p class="event-lead-score">Score lead : <strong>' + esc(String(p.leadScore)) + "</strong></p>";
    }
    html += section("Contact", "int-card-perso", dossier.perso);
    html += section("Professionnel", "int-card-pro", dossier.pro);
    html += section("Bien immobilier", "int-card-biens", bienRows);
    html += section("Projet / annonce", "int-card-projet", dossier.projet);
    html += "</div></div>";
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
    VALUE_LABELS: VALUE_LABELS,
    parsePayload: parsePayload,
    buildDossier: buildDossier,
    patchesFromDossier: patchesFromDossier,
    countFilled: countFilled,
    renderSections: renderSections,
    renderLeadEventBody: renderLeadEventBody,
    flattenLeadPayload: flattenLeadPayload,
    resolveLeadPayloadFromEvent: resolveLeadPayloadFromEvent,
    looksLikeLeadPayload: looksLikeLeadPayload,
    leadEventSummaryText: leadEventSummaryText,
    slackLines: slackLines,
    first: first,
    labelOf: labelOf,
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.InterlocuteurDossier = api;
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
