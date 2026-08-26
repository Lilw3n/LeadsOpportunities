/**
 * Pièces justificatives par vertical / need pour le parcours devis.
 * Couvre assurance, banque, finance, immo — même pipeline Drive partout.
 */
(function (global) {
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
        "Ces documents accélèrent le chiffrage. Vous pouvez les envoyer maintenant ou plus tard — ils sont archivés sur votre dossier et sur notre Drive courtier.",
      items: [
        { type: "kbis", label: "KBIS (moins de 3 mois)", required: true },
        { type: "convention_collective", label: "Convention collective applicable", required: false },
        { type: "contrat_mutuelle", label: "Contrat mutuelle actuel (si renouvellement)", required: false },
        { type: "liste_salaries", label: "Liste des salariés / effectif", required: false },
        { type: "dsn", label: "DSN ou bulletin de salaire type", required: false },
        { type: "rib", label: "RIB entreprise", required: false },
      ],
    },
    vtc: {
      title: "Pièces pour votre devis VTC",
      intro: "Carte grise, permis, relevé d'information, KBIS si société — pour préparer votre devis Auto Pro.",
      items: [
        { type: "carte_grise", label: "Carte grise", required: true },
        { type: "permis", label: "Permis de conduire", required: true },
        { type: "releve_info", label: "Relevé d'information assurance", required: false },
        { type: "kbis", label: "KBIS (si société)", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    sante: {
      title: "Pièces pour votre devis mutuelle",
      intro: "Tableau de garanties actuel ou dernier avis de cotisation — optionnel mais utile.",
      items: [
        { type: "contrat_mutuelle", label: "Contrat ou tableau de garanties actuel", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    habitation: {
      title: "Pièces pour votre assurance habitation",
      intro: "Bail, attestation actuelle ou inventaire — utiles pour le chiffrage.",
      items: [
        { type: "contrat_mutuelle", label: "Attestation / contrat habitation actuel", required: false },
        { type: "piece_identite", label: "Pièce d'identité", required: false },
        { type: "rib", label: "RIB", required: false },
        { type: "generic", label: "Autre pièce utile", required: false },
      ],
    },
    auto: {
      title: "Pièces pour votre assurance auto",
      intro: "Carte grise, permis et relevé d'information accélèrent le devis.",
      items: [
        { type: "carte_grise", label: "Carte grise", required: true },
        { type: "permis", label: "Permis de conduire", required: true },
        { type: "releve_info", label: "Relevé d'information", required: false },
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
    "acheteur-immo": {
      title: "Pièces dossier acquéreur (prêt & assurances)",
      intro:
        "Pour le prêt, l'emprunteur et l'habitation : déposez les pièces dès que possible.",
      items: FINANCE_ITEMS.concat([
        { type: "compromis_offre", label: "Compromis / offre", required: false },
        { type: "apport_justificatif", label: "Justificatif d'apport", required: false },
      ]),
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
    default: {
      title: "Pièces justificatives",
      intro: "Déposez les documents utiles au montage de votre devis. Formats PDF, JPG ou PNG (max 12 Mo).",
      items: [
        { type: "generic", label: "Document utile au devis", required: false },
        { type: "piece_identite", label: "Pièce d'identité", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
  };

  var ALIASES = {
    "credit_immo": "credit-immo",
    "pret-immobilier": "credit-immo",
    "pret_immobilier": "credit-immo",
    "rachat": "rac",
    "rachat-credits": "rac",
    "rachat_credits": "rac",
    mutuelle: "sante",
    "sante-collective": "collective",
    "mutuelle-collective": "collective",
    emprunteur: "credit-immo",
    "assurance-emprunteur": "credit-immo",
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
    if (key.indexOf("auto") !== -1 || key.indexOf("vehicule") !== -1) return "auto";
    if (key.indexOf("immo") !== -1 || key.indexOf("vendeur") !== -1) return "immo";
    return "default";
  }

  function getConfig(needOrVertical) {
    var key = normalizeNeed(needOrVertical);
    return BY_NEED[key] || BY_NEED.default;
  }

  function hasDocumentStep(needOrVertical) {
    return true;
  }

  global.DEVIS_DOCUMENT_CONFIG = {
    getConfig: getConfig,
    normalizeNeed: normalizeNeed,
    hasDocumentStep: hasDocumentStep,
    BY_NEED: BY_NEED,
  };
})(typeof window !== "undefined" ? window : global);
