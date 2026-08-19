/**
 * Catégories de documents — dépôt bien (vendeur) et recherche / financement (acquéreur).
 */
(function (global) {
  var VENDEUR = {
    title: "Documents du bien à vendre",
    intro:
      "Déposez les pièces par catégorie (PDF, JPG, PNG — max 12 Mo). Elles sont archivées dans le dossier immo Google Drive du bien.",
    need: "vendeur-immo",
    groups: [
      {
        id: "identite",
        label: "Identité & domicile vendeur(s)",
        items: [
          { type: "identite", label: "Pièce d'identité / passeport (tous mandants)" },
          { type: "domicile", label: "Justificatif de domicile (< 3 mois)" },
          { type: "livret_famille", label: "Livret de famille / acte mariage / PACS" },
          { type: "kbis_sci", label: "Kbis / statuts SCI (personne morale)" },
        ],
      },
      {
        id: "titre",
        label: "Titre, propriété & actes",
        items: [
          { type: "titre_propriete", label: "Titre de propriété / acte notarié" },
          { type: "acte_vente", label: "Acte de vente / acte d'acquisition" },
          { type: "cadastre", label: "Plan cadastral / extrait cadastre" },
          { type: "plans", label: "Plans du bien / permis de construire" },
          { type: "servitudes", label: "Servitudes / bornage" },
        ],
      },
      {
        id: "copro",
        label: "Copropriété",
        items: [
          { type: "reglement_copro", label: "Règlement de copropriété & EDD" },
          { type: "pv_ag", label: "PV dernière AG + convocation" },
          { type: "charges_copro", label: "Appels de charges (3 derniers)" },
          { type: "carnet_entretien", label: "Carnet d'entretien immeuble" },
          { type: "fiche_synth_copro", label: "Fiche synthétique copro (Loi ALUR)" },
        ],
      },
      {
        id: "diagnostics",
        label: "Diagnostics & technique",
        driveHint: "diagnostics",
        items: [
          { type: "dpe", label: "DPE (< 10 ans / valide)" },
          { type: "amiante", label: "Amiante (avant 1997)" },
          { type: "plomb", label: "Plomb CREP (avant 1949)" },
          { type: "termites", label: "État parasitaire / termites" },
          { type: "erp", label: "ERP (risques naturels / technologiques)" },
          { type: "gaz_elec", label: "Conformité gaz / électricité" },
          { type: "assainissement", label: "Assainissement / SPANC" },
          { type: "carrez", label: "Mesurage Loi Carrez (copro)" },
        ],
      },
      {
        id: "fiscalite",
        label: "Fiscalité & prêt en cours",
        items: [
          { type: "taxe_fonciere", label: "Taxe foncière (dernier avis)" },
          { type: "taxe_habitation", label: "Taxe d'habitation (si applicable)" },
          { type: "releve_pret", label: "Tableau amortissement / CRD prêt" },
          { type: "assurance_pno", label: "Assurance PNO / habitation en cours" },
        ],
      },
      {
        id: "location",
        label: "Location (si bien occupé / loué)",
        items: [
          { type: "bail", label: "Bail en cours + annexes" },
          { type: "edl", label: "État des lieux entrée / sortie" },
          { type: "quittances", label: "Quittances de loyer (3 dernières)" },
          { type: "depot_garantie", label: "Dépôt de garantie / inventaire meublé" },
        ],
      },
      {
        id: "travaux",
        label: "Construction < 10 ans & travaux",
        items: [
          { type: "do_attestation", label: "Attestation dommage-ouvrage" },
          { type: "decennale", label: "Attestation garantie décennale" },
          { type: "factures_travaux", label: "Factures travaux récents / garanties" },
          { type: "declaration_travaux", label: "Déclaration préalable / permis" },
        ],
      },
      {
        id: "divers",
        label: "Compteurs, mandat & divers",
        items: [
          { type: "compteurs", label: "Relevés compteurs (eau, élec, gaz)" },
          { type: "inventaire_meuble", label: "Inventaire mobilier (si meublé)" },
          { type: "mandat_signe", label: "Mandat signé / bon de visite" },
          { type: "autre_doc", label: "Autre document" },
        ],
      },
    ],
  };

  var ACHETEUR = {
    title: "Documents financement & recherche de bien",
    intro:
      "Pour étudier votre prêt et votre capacité d'emprunt : déposez les pièces par catégorie. Archivées sur votre dossier client et Google Drive.",
    need: "acheteur-immo",
    groups: [
      {
        id: "identite",
        label: "Identité & situation familiale",
        items: [
          { type: "piece_identite", label: "Pièce d'identité (CNI / passeport)" },
          { type: "livret_famille", label: "Livret de famille / acte mariage / PACS" },
          { type: "justificatif_domicile", label: "Justificatif de domicile (< 3 mois)" },
        ],
      },
      {
        id: "revenus",
        label: "Revenus & emploi",
        items: [
          { type: "bulletins_salaire", label: "3 derniers bulletins de salaire" },
          { type: "contrat_travail", label: "Contrat de travail" },
          { type: "attestation_employeur", label: "Attestation employeur / CDI en cours" },
          { type: "avis_imposition", label: "Avis d'imposition (2 derniers)" },
          { type: "revenus_fonciers", label: "Revenus fonciers / BIC / BNC (si applicable)" },
        ],
      },
      {
        id: "banque",
        label: "Banque & apport",
        items: [
          { type: "releves_bancaires", label: "3 derniers relevés bancaires" },
          { type: "rib", label: "RIB" },
          { type: "apport_justificatif", label: "Justificatif d'apport (épargne, donation…)" },
          { type: "epargne", label: "Relevés livrets / assurance-vie (apport)" },
        ],
      },
      {
        id: "credits",
        label: "Crédits en cours",
        items: [
          { type: "tableau_amortissement", label: "Tableaux d'amortissement prêts en cours" },
          { type: "offre_pret", label: "Offre de prêt / simulation banque" },
          { type: "releve_pret", label: "Relevé de compte prêt immobilier actuel" },
        ],
      },
      {
        id: "projet",
        label: "Projet d'achat",
        items: [
          { type: "compromis_offre", label: "Compromis / offre d'achat signée" },
          { type: "annonce_bien", label: "Annonce ou descriptif du bien visé" },
          { type: "estimation_bien", label: "Estimation / DPE du bien visé" },
        ],
      },
    ],
  };

  function getConfig(mode) {
    if (mode === "vendeur" || mode === "vendeur-immo") return VENDEUR;
    if (mode === "acheteur" || mode === "acheteur-immo") return ACHETEUR;
    return VENDEUR;
  }

  global.ImmoDocumentsConfig = {
    getConfig: getConfig,
    vendeur: VENDEUR,
    acheteur: ACHETEUR,
  };
})(typeof window !== "undefined" ? window : global);
