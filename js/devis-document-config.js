/**
 * Pièces justificatives par vertical / need pour le parcours devis.
 */
(function (global) {
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
    credit-immo: {
      title: "Pièces pour votre demande de prêt immobilier",
      intro:
        "Ces documents accélèrent l'étude de financement. Vous pouvez les déposer maintenant ou plus tard — archivés sur votre dossier et le Drive courtier.",
      items: [
        { type: "piece_identite", label: "Pièce d'identité (CNI / passeport)", required: true },
        { type: "avis_imposition", label: "Avis d'imposition (2 derniers)", required: true },
        { type: "bulletins_salaire", label: "3 derniers bulletins de salaire", required: true },
        { type: "releves_bancaires", label: "3 derniers relevés bancaires", required: false },
        { type: "contrat_travail", label: "Contrat de travail / attestation employeur", required: false },
        { type: "compromis_offre", label: "Compromis / offre d'achat (si signé)", required: false },
        { type: "apport_justificatif", label: "Justificatif d'apport (épargne, donation…)", required: false },
        { type: "rib", label: "RIB", required: true },
      ],
    },
    "acheteur-immo": {
      title: "Pièces dossier acquéreur (prêt & assurances)",
      intro:
        "Pour le prêt, l'emprunteur et l'habitation : déposez les pièces dès que possible. Le conseiller complète le dossier ensuite.",
      items: [
        { type: "piece_identite", label: "Pièce d'identité", required: true },
        { type: "avis_imposition", label: "Avis d'imposition", required: true },
        { type: "bulletins_salaire", label: "Bulletins de salaire (3 derniers)", required: true },
        { type: "releves_bancaires", label: "Relevés bancaires", required: false },
        { type: "compromis_offre", label: "Compromis / offre", required: false },
        { type: "apport_justificatif", label: "Justificatif d'apport", required: false },
        { type: "rib", label: "RIB", required: true },
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
    default: {
      title: "Pièces justificatives",
      intro: "Déposez les documents utiles au montage de votre devis. Formats PDF, JPG ou PNG (max 12 Mo).",
      items: [
        { type: "generic", label: "Document utile au devis", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    pieces: {
      title: "Envoi de vos pièces justificatives",
      section: "Pièces à importer",
      intro:
        "Pièces justificatives à importer afin de poursuivre l'étude de votre dossier. Dans le cas où vous souhaitez joindre plusieurs fichiers pour une même pièce, cliquez sur + pour importer un exemplaire supplémentaire du document.",
      items: [
        { type: "attestation_autoregulation", label: "DP Attestation autorégulation", required: true },
        { type: "politique_reclamations", label: "Politique de gestion des réclamations", required: false },
        { type: "procedure_vente_souscription", label: "Procédure de vente et de souscription", required: false },
      ],
    },
  };

  function introFor(cfg) {
    var items = (cfg && cfg.items) || [];
    var n = items.length;
    return (
      n +
      " pièce" +
      (n > 1 ? "s" : "") +
      " justificative" +
      (n > 1 ? "s" : "") +
      " à importer afin de poursuivre l'étude de votre dossier. Dans le cas où vous souhaitez joindre plusieurs fichiers pour une même pièce, cliquez sur + pour importer un exemplaire supplémentaire du document."
    );
  }

  function getConfig(needOrVertical) {
    var key = needOrVertical || "pieces";
    var cfg = BY_NEED[key] || BY_NEED.pieces;
    return {
      title: cfg.title,
      section: cfg.section || "Pièces à importer",
      intro: introFor(cfg),
      items: cfg.items || [],
    };
  }

  global.DEVIS_DOCUMENT_CONFIG = {
    getConfig: getConfig,
    introFor: introFor,
    BY_NEED: BY_NEED,
  };
})(typeof window !== "undefined" ? window : global);
