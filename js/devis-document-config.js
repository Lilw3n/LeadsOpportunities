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
    default: {
      title: "Pièces justificatives",
      intro: "Déposez les documents utiles au montage de votre devis. Formats PDF, JPG ou PNG (max 12 Mo).",
      items: [
        { type: "generic", label: "Document utile au devis", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
  };

  function getConfig(needOrVertical) {
    var key = needOrVertical || "default";
    return BY_NEED[key] || BY_NEED.default;
  }

  global.DEVIS_DOCUMENT_CONFIG = {
    getConfig: getConfig,
    BY_NEED: BY_NEED,
  };
})(typeof window !== "undefined" ? window : global);
