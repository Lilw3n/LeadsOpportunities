/**
 * Pièces justificatives par vertical / need pour tous les questionnaires.
 * Entreprise · Auto · VTC · Santé · Finance · Habitation · Pro · Niches.
 */
(function (global) {
  var ENTREPRISE_ITEMS = [
    { type: "kbis", label: "KBIS (moins de 3 mois)", required: true },
    { type: "avis_insee", label: "Avis de situation INSEE (SIREN / SIRET)", required: true },
    { type: "rib_entreprise", label: "RIB entreprise", required: false },
  ];

  var AUTO_ITEMS = [
    { type: "permis", label: "Permis de conduire", required: true },
    { type: "carte_grise", label: "Carte grise", required: true },
    {
      type: "releve_info",
      label: "Relevé d'information (3 à 5 dernières années)",
      required: true,
    },
    { type: "attestation_assurance", label: "Attestation / contrat auto actuel", required: false },
  ];

  var FINANCE_ITEMS = [
    { type: "piece_identite", label: "Pièce d'identité (CNI / passeport)", required: true },
    { type: "avis_imposition", label: "Avis d'imposition (2 derniers)", required: true },
    { type: "bulletins_salaire", label: "3 derniers bulletins de salaire", required: true },
    { type: "releves_bancaires", label: "3 derniers relevés bancaires", required: false },
    { type: "contrat_travail", label: "Contrat de travail / attestation employeur", required: false },
    { type: "rib", label: "RIB", required: true },
  ];

  var BY_NEED = {
    collective: {
      title: "Pièces pour votre devis mutuelle collective",
      intro:
        "Documents entreprise indispensables pour chiffrer la mutuelle collective. PDF, JPG ou PNG — max 12 Mo.",
      items: ENTREPRISE_ITEMS.concat([
        { type: "convention_collective", label: "Convention collective applicable", required: false },
        { type: "contrat_mutuelle", label: "Contrat mutuelle actuel (si renouvellement)", required: false },
        { type: "liste_salaries", label: "Liste des salariés / effectif", required: false },
        { type: "dsn", label: "DSN ou bulletin de salaire type", required: false },
      ]),
    },
    vtc: {
      title: "Pièces pour votre devis VTC",
      intro:
        "Comme pour l'auto + l'entreprise : permis, carte grise, relevé d'information, KBIS / INSEE, et carte VTC. Vous pouvez envoyer maintenant ou plus tard.",
      items: AUTO_ITEMS.concat(ENTREPRISE_ITEMS).concat([
        { type: "carte_vtc", label: "Carte professionnelle VTC", required: true },
        { type: "attestation_vtc", label: "Attestation d'inscription au registre VTC", required: false },
      ]),
    },
    auto: {
      title: "Pièces pour votre assurance auto",
      intro:
        "Permis, carte grise et relevé d'information (3 à 5 dernières années) accélèrent le devis. Envoi optionnel à cette étape.",
      items: AUTO_ITEMS.concat([{ type: "rib", label: "RIB", required: false }]),
    },
    moto: {
      title: "Pièces pour votre assurance deux-roues",
      intro: "Permis, carte grise et relevé d'information pour monter le devis moto / scooter.",
      items: [
        { type: "permis", label: "Permis de conduire (catégorie adaptée)", required: true },
        { type: "carte_grise", label: "Carte grise", required: true },
        {
          type: "releve_info",
          label: "Relevé d'information (3 à 5 dernières années)",
          required: true,
        },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    flotte: {
      title: "Pièces pour votre flotte professionnelle",
      intro: "Documents entreprise + liste des véhicules et relevés d'information.",
      items: ENTREPRISE_ITEMS.concat([
        { type: "liste_vehicules", label: "Liste des véhicules (immatriculations)", required: true },
        {
          type: "releve_info",
          label: "Relevés d'information (3 à 5 ans) par véhicule",
          required: true,
        },
        { type: "permis", label: "Permis des conducteurs principaux", required: false },
      ]),
    },
    temporaire: {
      title: "Pièces pour une assurance temporaire",
      intro: "Permis, carte grise et relevé d'information si disponibles.",
      items: [
        { type: "permis", label: "Permis de conduire", required: true },
        { type: "carte_grise", label: "Carte grise", required: true },
        { type: "releve_info", label: "Relevé d'information", required: false },
      ],
    },
    sante: {
      title: "Pièces pour votre devis mutuelle",
      intro:
        "Carte Vitale (ou numéro de Sécurité sociale) pour identifier les ayants droit. Contrat actuel utile pour comparer.",
      items: [
        { type: "carte_vitale", label: "Carte Vitale (recto / verso ou attestation)", required: true },
        { type: "attestation_secu", label: "Attestation de droits Sécurité sociale", required: false },
        { type: "contrat_mutuelle", label: "Contrat ou tableau de garanties actuel", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
      extraFields: [
        {
          name: "numero_secu",
          label: "N° Sécurité sociale (si pas de scan Carte Vitale)",
          type: "text",
          placeholder: "1 85 XX XX XXX XXX XX",
          required: false,
        },
      ],
    },
    prevoyance: {
      title: "Pièces pour votre prévoyance",
      intro: "Identité et situation pour monter le dossier prévoyance.",
      items: [
        { type: "piece_identite", label: "Pièce d'identité", required: true },
        { type: "carte_vitale", label: "Carte Vitale / attestation Sécurité sociale", required: false },
        { type: "bulletins_salaire", label: "Bulletins de salaire / revenus", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    tns: {
      title: "Pièces prévoyance TNS",
      intro: "Documents entreprise et revenus pour les indépendants.",
      items: ENTREPRISE_ITEMS.concat([
        { type: "piece_identite", label: "Pièce d'identité", required: true },
        { type: "avis_imposition", label: "Avis d'imposition / liasse fiscale", required: true },
        { type: "rib", label: "RIB", required: false },
      ]),
    },
    deces: {
      title: "Pièces assurance décès / obsèques",
      intro: "Identité du souscripteur pour le devis.",
      items: [
        { type: "piece_identite", label: "Pièce d'identité", required: true },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    habitation: {
      title: "Pièces pour votre assurance habitation",
      intro: "Bail, attestation actuelle ou inventaire — utiles pour le chiffrage.",
      items: [
        { type: "piece_identite", label: "Pièce d'identité", required: false },
        { type: "bail", label: "Bail / titre de propriété", required: false },
        { type: "attestation_habitation", label: "Attestation / contrat habitation actuel", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    pno: {
      title: "Pièces PNO (propriétaire non occupant)",
      intro: "Titre ou bail et attestation actuelle si vous en avez.",
      items: [
        { type: "titre_propriete", label: "Titre de propriété / acte", required: false },
        { type: "attestation_habitation", label: "Contrat PNO / habitation actuel", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    mrh: {
      title: "Pièces multirisque habitation",
      intro: "Documents utiles au devis MRH.",
      items: [
        { type: "piece_identite", label: "Pièce d'identité", required: false },
        { type: "bail", label: "Bail / titre de propriété", required: false },
        { type: "attestation_habitation", label: "Contrat habitation actuel", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    "credit-immo": {
      title: "Pièces pour votre demande de prêt immobilier",
      intro:
        "Ces documents accélèrent l'étude de financement. Archivés sur votre dossier et le Drive courtier.",
      items: FINANCE_ITEMS.concat([
        { type: "compromis_offre", label: "Compromis / offre d'achat (si signé)", required: false },
        { type: "apport_justificatif", label: "Justificatif d'apport (épargne, donation…)", required: false },
      ]),
    },
    pret: {
      title: "Pièces pour votre demande de prêt",
      intro: "Identité, revenus et RIB pour monter le dossier financement.",
      items: FINANCE_ITEMS.slice(),
    },
    banque: {
      title: "Pièces dossier banque / financement",
      intro: "Documents bancaires et revenus pour l'étude.",
      items: FINANCE_ITEMS.concat([
        { type: "offre_pret", label: "Offre de prêt / simulation banque", required: false },
        { type: "tableau_amortissement", label: "Tableau d'amortissement", required: false },
      ]),
    },
    finance: {
      title: "Pièces dossier finance",
      intro: "Justificatifs pour le montage financier.",
      items: FINANCE_ITEMS.slice(),
    },
    rac: {
      title: "Pièces pour votre rachat de crédits",
      intro: "Tableaux d'amortissement et revenus pour le RAC.",
      items: FINANCE_ITEMS.concat([
        { type: "tableau_amortissement", label: "Tableaux d'amortissement des crédits", required: true },
        { type: "offre_pret", label: "Offres / contrats de prêts en cours", required: false },
      ]),
    },
    conso: {
      title: "Pièces crédit consommation",
      intro: "Identité et revenus pour l'étude.",
      items: FINANCE_ITEMS.slice(),
    },
    "credit-pro": {
      title: "Pièces crédit professionnel",
      intro: "Documents entreprise et financiers pour le dossier.",
      items: ENTREPRISE_ITEMS.concat(FINANCE_ITEMS.slice(0, 4)),
    },
    renegociation: {
      title: "Pièces renégociation de prêt",
      intro: "Offre actuelle et revenus pour comparer.",
      items: FINANCE_ITEMS.concat([
        { type: "offre_pret", label: "Offre / contrat de prêt actuel", required: true },
        { type: "tableau_amortissement", label: "Tableau d'amortissement", required: true },
      ]),
    },
    emprunteur: {
      title: "Pièces assurance emprunteur",
      intro: "Identité et offre de prêt pour la délégation / comparaison.",
      items: [
        { type: "piece_identite", label: "Pièce d'identité", required: true },
        { type: "offre_pret", label: "Offre de prêt / tableau d'amortissement", required: true },
        { type: "questionnaire_sante", label: "Questionnaire santé banque (si reçu)", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    "acheteur-immo": {
      title: "Pièces dossier acquéreur (prêt & assurances)",
      intro: "Pour le prêt, l'emprunteur et l'habitation : déposez les pièces dès que possible.",
      items: FINANCE_ITEMS.concat([
        { type: "compromis_offre", label: "Compromis / offre", required: false },
        { type: "apport_justificatif", label: "Justificatif d'apport", required: false },
      ]),
    },
    "vendeur-immo": {
      title: "Pièces dossier vendeur",
      intro: "Titre, diagnostics et identité pour préparer la vente.",
      items: [
        { type: "piece_identite", label: "Pièce d'identité", required: true },
        { type: "titre_propriete", label: "Titre de propriété", required: false },
        { type: "diagnostics", label: "Diagnostics immobiliers", required: false },
        { type: "taxe_fonciere", label: "Taxe foncière", required: false },
      ],
    },
    immo: {
      title: "Pièces dossier immobilier",
      intro: "Documents utiles au montage prêt / assurance habitation.",
      items: [
        { type: "piece_identite", label: "Pièce d'identité", required: true },
        { type: "avis_imposition", label: "Avis d'imposition", required: false },
        { type: "bulletins_salaire", label: "Bulletins de salaire", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    "rc-pro": {
      title: "Pièces RC professionnelle",
      intro: "Documents entreprise pour chiffrer la RC Pro.",
      items: ENTREPRISE_ITEMS.concat([
        { type: "contrat_rc_pro", label: "Contrat RC Pro actuel (si renouvellement)", required: false },
        { type: "piece_identite", label: "Pièce d'identité du dirigeant", required: false },
      ]),
    },
    mrp: {
      title: "Pièces multirisque professionnelle",
      intro: "KBIS, INSEE et description d'activité.",
      items: ENTREPRISE_ITEMS.concat([
        { type: "contrat_mrp", label: "Contrat MRP actuel", required: false },
      ]),
    },
    decennale: {
      title: "Pièces assurance décennale",
      intro: "Documents entreprise et qualificatifs métier.",
      items: ENTREPRISE_ITEMS.concat([
        { type: "qualifications", label: "Qualifications / attestations métier", required: false },
        { type: "contrat_decennale", label: "Contrat décennale actuel", required: false },
      ]),
    },
    "pj-pro": {
      title: "Pièces protection juridique pro",
      intro: "Documents entreprise utiles au devis.",
      items: ENTREPRISE_ITEMS.slice(),
    },
    dirigeant: {
      title: "Pièces assurance dirigeant / homme clé",
      intro: "Entreprise + identité du dirigeant.",
      items: ENTREPRISE_ITEMS.concat([
        { type: "piece_identite", label: "Pièce d'identité du dirigeant", required: true },
      ]),
    },
    animaux: {
      title: "Pièces assurance animaux",
      intro: "Carnet de santé / identification de l'animal si disponible.",
      items: [
        { type: "piece_identite", label: "Pièce d'identité du propriétaire", required: false },
        { type: "carnet_sante_animal", label: "Carnet de santé / puce / tatouage", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    chasse: {
      title: "Pièces assurance chasse",
      intro: "Permis de chasser et identité.",
      items: [
        { type: "piece_identite", label: "Pièce d'identité", required: true },
        { type: "permis_chasser", label: "Permis de chasser", required: true },
        { type: "validation_chasse", label: "Validation annuelle", required: false },
      ],
    },
    equitation: {
      title: "Pièces assurance équitation",
      intro: "Identité et documents du cheval / centre si utiles.",
      items: [
        { type: "piece_identite", label: "Pièce d'identité", required: false },
        { type: "sire_cheval", label: "Document d'identification du cheval (SIRE)", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    bateau: {
      title: "Pièces assurance bateau",
      intro: "Acte de francisation / carte de circulation et permis.",
      items: [
        { type: "acte_francisation", label: "Acte de francisation / carte de circulation", required: true },
        { type: "permis_bateau", label: "Permis bateau", required: false },
        { type: "releve_info", label: "Relevé d'information / sinistres", required: false },
      ],
    },
    caravane: {
      title: "Pièces caravane / camping-car",
      intro: "Carte grise et relevé d'information.",
      items: [
        { type: "carte_grise", label: "Carte grise", required: true },
        { type: "permis", label: "Permis de conduire", required: true },
        {
          type: "releve_info",
          label: "Relevé d'information (3 à 5 dernières années)",
          required: false,
        },
      ],
    },
    default: {
      title: "Pièces justificatives",
      intro:
        "Déposez les documents utiles au montage de votre devis (identité, contrats, justificatifs). Formats PDF, JPG ou PNG (max 12 Mo).",
      items: [
        { type: "piece_identite", label: "Pièce d'identité", required: false },
        { type: "kbis", label: "KBIS (si entreprise)", required: false },
        { type: "avis_insee", label: "Avis INSEE (si entreprise)", required: false },
        { type: "rib", label: "RIB", required: false },
        { type: "generic", label: "Autre document utile", required: false },
      ],
    },
  };

  var ALIASES = {
    credit_immo: "credit-immo",
    "pret-immobilier": "credit-immo",
    pret_immobilier: "credit-immo",
    rachat: "rac",
    "rachat-credits": "rac",
    rachat_credits: "rac",
    mutuelle: "sante",
    "sante-collective": "collective",
    "mutuelle-collective": "collective",
    "assurance-emprunteur": "emprunteur",
    "rc_pro": "rc-pro",
    "pj_pro": "pj-pro",
    "credit_pro": "credit-pro",
    "vendeur_immo": "vendeur-immo",
    "acheteur_immo": "acheteur-immo",
    "acheteur-vendeur-immo": "acheteur-immo",
    taxi: "vtc",
    "deux-roues": "moto",
    scooter: "moto",
    entreprise: "rc-pro",
    pro: "rc-pro",
  };

  function normalizeNeed(needOrVertical) {
    var key = String(needOrVertical || "default").toLowerCase().trim();
    if (ALIASES[key]) return ALIASES[key];
    if (BY_NEED[key]) return key;
    if (key.indexOf("credit") !== -1 || key.indexOf("pret") !== -1) return "credit-immo";
    if (key.indexOf("banque") !== -1 || key.indexOf("finance") !== -1) return "banque";
    if (key.indexOf("rac") !== -1 || key.indexOf("rachat") !== -1) return "rac";
    if (key.indexOf("vtc") !== -1 || key.indexOf("taxi") !== -1) return "vtc";
    if (key.indexOf("collect") !== -1) return "collective";
    if (key.indexOf("sante") !== -1 || key.indexOf("mutuelle") !== -1) return "sante";
    if (key.indexOf("habit") !== -1 || key.indexOf("mrh") !== -1) return "habitation";
    if (key.indexOf("pno") !== -1) return "pno";
    if (key.indexOf("moto") !== -1 || key.indexOf("scooter") !== -1) return "moto";
    if (key.indexOf("flotte") !== -1) return "flotte";
    if (key.indexOf("auto") !== -1 || key.indexOf("vehicule") !== -1) return "auto";
    if (key.indexOf("decennale") !== -1) return "decennale";
    if (key.indexOf("rc") !== -1 && key.indexOf("pro") !== -1) return "rc-pro";
    if (key.indexOf("vendeur") !== -1) return "vendeur-immo";
    if (key.indexOf("immo") !== -1 || key.indexOf("acheteur") !== -1) return "immo";
    if (key.indexOf("animal") !== -1 || key.indexOf("chien") !== -1 || key.indexOf("chat") !== -1) {
      return "animaux";
    }
    if (key.indexOf("chasse") !== -1) return "chasse";
    if (key.indexOf("bateau") !== -1) return "bateau";
    return "default";
  }

  function getConfig(needOrVertical) {
    var key = normalizeNeed(needOrVertical);
    return BY_NEED[key] || BY_NEED.default;
  }

  function hasDocumentStep() {
    return true;
  }

  global.DEVIS_DOCUMENT_CONFIG = {
    getConfig: getConfig,
    normalizeNeed: normalizeNeed,
    hasDocumentStep: hasDocumentStep,
    BY_NEED: BY_NEED,
    ENTREPRISE_ITEMS: ENTREPRISE_ITEMS,
    AUTO_ITEMS: AUTO_ITEMS,
  };
})(typeof window !== "undefined" ? window : global);
