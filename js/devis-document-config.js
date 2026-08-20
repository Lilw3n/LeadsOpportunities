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
      intro:
        "Carte Vitale, attestation de droits, contrat ou tableau de garanties actuel — pour préparer votre devis mutuelle. Formats PDF, JPG ou PNG (max 12 Mo).",
      items: [
        { type: "carte_vitale", label: "Carte Vitale (recto / verso) ou attestation Vitale", required: true },
        { type: "attestation_droits", label: "Attestation de droits Ameli (Sécurité sociale)", required: true },
        { type: "piece_identite", label: "Pièce d'identité (CNI / passeport)", required: true },
        { type: "contrat_mutuelle", label: "Contrat mutuelle actuel / tableau de garanties", required: false },
        { type: "attestation_mutuelle", label: "Attestation mutuelle / carte de tiers payant", required: false },
        { type: "avis_cotisation", label: "Dernier avis de cotisation mutuelle", required: false },
        { type: "ordonnance", label: "Ordonnance / devis optique ou dentaire (si besoin)", required: false },
        { type: "justificatif_domicile", label: "Justificatif de domicile (< 3 mois)", required: false },
        { type: "rib", label: "RIB", required: false },
      ],
    },
    "credit-immo": {
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
  };

  function normalizeNeed(needOrVertical) {
    var key = String(needOrVertical || "default")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-");
    if (!key) return "default";
    if (key.indexOf("sante") >= 0 || key.indexOf("mutuelle") >= 0) return "sante";
    if (key.indexOf("credit") >= 0 || key.indexOf("pret") >= 0 || key.indexOf("prêt") >= 0) return "credit-immo";
    if (key.indexOf("acheteur") >= 0) return "acheteur-immo";
    if (key.indexOf("vtc") >= 0 || key.indexOf("auto") >= 0) return "vtc";
    if (key.indexOf("collective") >= 0 || key.indexOf("entreprise") >= 0) return "collective";
    if (key.indexOf("immo") >= 0) return "immo";
    return key;
  }

  function getConfig(needOrVertical) {
    var key = normalizeNeed(needOrVertical);
    return BY_NEED[key] || BY_NEED.default;
  }

  global.DEVIS_DOCUMENT_CONFIG = {
    getConfig: getConfig,
    normalizeNeed: normalizeNeed,
    BY_NEED: BY_NEED,
  };
})(typeof window !== "undefined" ? window : global);
