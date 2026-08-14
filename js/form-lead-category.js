/**
 * Classification des leads issus des formulaires site
 * (catégorie métier + type de parcours).
 * Utilisable navigateur (window.FormLeadCategory) et Node (module.exports).
 */
(function (root) {
  var CATEGORIES = {
    mobilite: { id: "mobilite", label: "Mobilité" },
    sante: { id: "sante", label: "Santé et prévoyance" },
    habitat: { id: "habitat", label: "Habitat" },
    finance: { id: "finance", label: "Financement & immobilier" },
    pro: { id: "pro", label: "Professionnel" },
    patrimoine: { id: "patrimoine", label: "Patrimoine" },
    animaux: { id: "animaux", label: "Animaux de compagnie" },
    niches: { id: "niches", label: "Assurances de niche" },
    contact: { id: "contact", label: "Contact / autre" },
  };

  var KINDS = {
    questionnaire: { id: "questionnaire", label: "Questionnaire" },
    contact_request: { id: "contact_request", label: "Demande de contact" },
    express_callback: { id: "express_callback", label: "Rappel express" },
  };

  var NEED_META = {
    vtc: { need: "vtc", label: "Assurance VTC", category: "mobilite" },
    auto: { need: "auto", label: "Assurance auto", category: "mobilite" },
    moto: { need: "moto", label: "Deux-roues / scooter", category: "mobilite" },
    taxi: { need: "taxi", label: "Assurance taxi", category: "mobilite" },
    flotte: { need: "flotte", label: "Flotte professionnelle", category: "mobilite" },
    temporaire: { need: "temporaire", label: "Assurance temporaire", category: "mobilite" },
    sante: { need: "sante", label: "Mutuelle santé", category: "sante" },
    mutuelle: { need: "sante", label: "Mutuelle santé", category: "sante" },
    prevoyance: { need: "prevoyance", label: "Prévoyance individuelle", category: "sante" },
    tns: { need: "tns", label: "Prévoyance TNS", category: "sante" },
    deces: { need: "deces", label: "Assurance décès / obsèques", category: "sante" },
    collective: { need: "collective", label: "Mutuelle collective", category: "sante" },
    habitation: { need: "habitation", label: "Assurance habitation", category: "habitat" },
    mrh: { need: "mrh", label: "Multirisque habitation", category: "habitat" },
    pno: { need: "pno", label: "PNO", category: "habitat" },
    emprunteur: { need: "emprunteur", label: "Assurance emprunteur", category: "habitat" },
    immo: { need: "credit-immo", label: "Crédit immobilier", category: "finance" },
    "credit-immo": { need: "credit-immo", label: "Crédit immobilier", category: "finance" },
    "acheteur-immo": { need: "acheteur-immo", label: "Recherche de bien", category: "finance" },
    "vendeur-immo": { need: "vendeur-immo", label: "Dépôt de bien à vendre", category: "finance" },
    "acheteur-vendeur-immo": {
      need: "acheteur-vendeur-immo",
      label: "Vendre et racheter",
      category: "finance",
    },
    "projection-achat": { need: "credit-immo", label: "Projection coût réel achat", category: "finance" },
    rachat: { need: "rachat", label: "Rachat de crédit", category: "finance" },
    conso: { need: "conso", label: "Crédit consommation", category: "finance" },
    "credit-pro": { need: "credit-pro", label: "Crédit professionnel", category: "finance" },
    renegociation: { need: "renegociation", label: "Renégociation de prêt", category: "finance" },
    "rc-pro": { need: "rc-pro", label: "RC professionnelle", category: "pro" },
    mrp: { need: "mrp", label: "Multirisque professionnelle", category: "pro" },
    decennale: { need: "decennale", label: "Assurance décennale", category: "pro" },
    "pj-pro": { need: "pj-pro", label: "Protection juridique pro", category: "pro" },
    dirigeant: { need: "dirigeant", label: "Dirigeant / homme clé", category: "pro" },
    "assurance-vie": { need: "assurance-vie", label: "Assurance vie / épargne", category: "patrimoine" },
    retraite: { need: "retraite", label: "Retraite supplémentaire", category: "patrimoine" },
    gav: { need: "gav", label: "Garantie accidents de la vie", category: "patrimoine" },
    pj: { need: "pj", label: "Protection juridique", category: "patrimoine" },
    famille: { need: "famille", label: "Scolaire et famille", category: "patrimoine" },
    animaux: { need: "animaux", label: "Assurance animaux", category: "animaux" },
    chasse: { need: "chasse", label: "Assurance chasse", category: "niches" },
    equitation: { need: "equitation", label: "Assurance équitation", category: "niches" },
    instrument: { need: "instrument", label: "Instrument de musique", category: "niches" },
    "materiel-photo": { need: "materiel-photo", label: "Matériel photo", category: "niches" },
    bateau: { need: "bateau", label: "Bateau plaisance", category: "niches" },
    caravane: { need: "caravane", label: "Caravane / camping-car", category: "niches" },
    autre: { need: "autre", label: "Autre demande", category: "contact" },
    devis: { need: "autre", label: "Demande de devis", category: "contact" },
    contact: { need: "contact", label: "Formulaire de contact", category: "contact" },
    unknown: { need: "autre", label: "Demande non classée", category: "contact" },
  };

  var ALIASES = {
    credit_immo: "credit-immo",
    creditimmo: "credit-immo",
    pret: "credit-immo",
    "pret-immo": "credit-immo",
    acheteur_immo: "acheteur-immo",
    vendeur_immo: "vendeur-immo",
    acheteur_vendeur_immo: "acheteur-vendeur-immo",
    assurance_animaux: "animaux",
    "assurance-animaux": "animaux",
    pet: "animaux",
    mutuelle: "sante",
    sante_collective: "collective",
    "sante-collective": "collective",
    rc_pro: "rc-pro",
    pj_pro: "pj-pro",
    credit_pro: "credit-pro",
    assurance_vie: "assurance-vie",
    materiel_photo: "materiel-photo",
    homepage_contact: "contact",
    landing_callback: "contact",
  };

  function hyphen(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/\s+/g, "-");
  }

  function parsePayload(raw) {
    if (!raw) return {};
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return {};
    }
  }

  function lookupNeed(raw) {
    var key = hyphen(raw);
    if (!key) return null;
    if (ALIASES[key]) key = hyphen(ALIASES[key]);
    if (NEED_META[key]) return NEED_META[key];
    var catalog =
      (typeof window !== "undefined" && window.SERVICE_CATALOG) ||
      (typeof global !== "undefined" && global.SERVICE_CATALOG) ||
      null;
    if (catalog && catalog.getService) {
      var svc = catalog.getService(key);
      if (svc) {
        return {
          need: svc.need || key,
          label: svc.label || key,
          category: svc.category || "contact",
        };
      }
    }
    return null;
  }

  function classifyKind(row, payload) {
    payload = payload || {};
    var source = hyphen((row && row.source) || payload.source || "");
    var journey = String(payload.journey || (row && row.journey) || "").toLowerCase();
    var msg = String(payload.message || payload.comment || "").toLowerCase();

    if (
      payload.callbackRequested === true ||
      journey === "callback" ||
      source.indexOf("callback") >= 0 ||
      msg.indexOf("rappel express") >= 0
    ) {
      return "express_callback";
    }
    if (
      source === "homepage-contact" ||
      source === "services-catalog" ||
      source.indexOf("contact") >= 0
    ) {
      return "contact_request";
    }
    var step = Number(
      (row && row.questionnaire_step) || payload.questionnaire_step || payload.step || 0
    );
    var total = Number(
      (row && row.questionnaire_total) || payload.questionnaire_total || payload.step_total || 0
    );
    if (
      source === "wizard-progress" ||
      source === "landing-form" ||
      source === "landing-quick" ||
      journey === "standard" ||
      journey === "full" ||
      journey === "express" ||
      journey === "pet-express" ||
      step > 0 ||
      total > 0 ||
      payload.funnel ||
      payload.questionnaireDraft
    ) {
      return "questionnaire";
    }
    if (payload.message || payload.comment) return "contact_request";
    return "questionnaire";
  }

  function classifyFormLead(row) {
    row = row || {};
    var payload = parsePayload(row.payload);
    var candidates = [
      payload.formNeed,
      payload.serviceNeed,
      payload.need,
      row.vertical,
      payload.vertical,
      payload.seo_product,
      row.seo_product,
    ];
    var meta = null;
    for (var i = 0; i < candidates.length; i++) {
      meta = lookupNeed(candidates[i]);
      if (meta) break;
    }
    if (!meta) {
      meta = NEED_META.autre;
    }
    var categoryId = hyphen(payload.formCategory || payload.serviceCategory || meta.category);
    if (!CATEGORIES[categoryId]) categoryId = meta.category;
    var cat = CATEGORIES[categoryId] || CATEGORIES.contact;
    var kind = classifyKind(row, payload);
    var kindMeta = KINDS[kind] || KINDS.questionnaire;
    return {
      category: cat.id,
      categoryLabel: cat.label,
      need: meta.need,
      needLabel: payload.serviceLabel || meta.label,
      kind: kindMeta.id,
      kindLabel: kindMeta.label,
    };
  }

  function applyToLead(row) {
    var c = classifyFormLead(row);
    row.formCategory = c.category;
    row.formCategoryLabel = c.categoryLabel;
    row.formNeed = c.need;
    row.formNeedLabel = c.needLabel;
    row.formKind = c.kind;
    row.formKindLabel = c.kindLabel;
    return row;
  }

  function categoryList() {
    return Object.keys(CATEGORIES).map(function (id) {
      return CATEGORIES[id];
    });
  }

  function kindList() {
    return Object.keys(KINDS).map(function (id) {
      return KINDS[id];
    });
  }

  var api = {
    CATEGORIES: CATEGORIES,
    KINDS: KINDS,
    NEED_META: NEED_META,
    classifyFormLead: classifyFormLead,
    applyToLead: applyToLead,
    categoryList: categoryList,
    kindList: kindList,
    hyphen: hyphen,
  };

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.FormLeadCategory = api;
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
