/**
 * Catégories de documents — dépôt bien (vendeur) et recherche / financement (acquéreur).
 * Vendeur : 2 zones Drive — pub (annonce) vs perso (confidentiel).
 */
(function (global) {
  var PERSO_GROUPS = [
    {
      id: "identite",
      label: "Identité & domicile vendeur(s)",
      driveFolder: "04_documents_confidentiels",
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
      driveFolder: "06_mandat_pieces",
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
      driveFolder: "04_documents_confidentiels",
      items: [
        { type: "reglement_copro", label: "Règlement de copropriété & EDD" },
        { type: "pv_ag", label: "PV dernière AG + convocation" },
        { type: "charges_copro", label: "Appels de charges (3 derniers)" },
        { type: "carnet_entretien", label: "Carnet d'entretien immeuble" },
        { type: "fiche_synth_copro", label: "Fiche synthétique copro (Loi ALUR)" },
      ],
    },
    {
      id: "fiscalite",
      label: "Fiscalité & prêt en cours",
      driveFolder: "04_documents_confidentiels",
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
      driveFolder: "04_documents_confidentiels",
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
      driveFolder: "04_documents_confidentiels",
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
      driveFolder: "04_documents_confidentiels",
      items: [
        { type: "compteurs", label: "Relevés compteurs (eau, élec, gaz)" },
        { type: "inventaire_meuble", label: "Inventaire mobilier (si meublé)" },
        { type: "mandat_signe", label: "Mandat signé / bon de visite" },
        { type: "autre_doc", label: "Autre document confidentiel" },
      ],
    },
  ];

  var PUB_GROUPS = [
    {
      id: "diagnostics",
      label: "Diagnostics pour l'annonce (DPE, ERP…)",
      driveFolder: "05_diagnostics",
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
      id: "pub_docs",
      label: "Descriptif & visuels annonce",
      driveFolder: "03_documents_publics",
      items: [
        { type: "descriptif_annonce", label: "PDF / texte descriptif vitrine" },
        { type: "plan_pub", label: "Plan surface pour annonce" },
        { type: "capture_annonce", label: "Capture écran annonce (Leboncoin…)" },
      ],
    },
  ];

  var VENDEUR = {
    title: "Documents du bien à vendre",
    intro:
      "Classés automatiquement sur Google Drive : infos perso (confidentiel) vs pièces pub (annonce). Les photos Leboncoin se déposent dans la section ci-dessus.",
    need: "vendeur-immo",
    zones: [
      {
        id: "pub",
        label: "Infos pour la pub (annonce, Leboncoin…)",
        driveHint: "Drive : 01_photos_publiques (photos) · 05_diagnostics · 03_documents_publics",
        groups: PUB_GROUPS,
      },
      {
        id: "perso",
        label: "Infos perso du bien (confidentiel vendeur)",
        driveHint: "Drive : 04_documents_confidentiels · 06_mandat_pieces",
        groups: PERSO_GROUPS,
      },
    ],
    groups: PUB_GROUPS.concat(PERSO_GROUPS),
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

  function flattenGroups(cfg) {
    if (!cfg) return [];
    if (cfg.zones && cfg.zones.length) {
      return cfg.zones.reduce(function (acc, z) {
        return acc.concat(
          (z.groups || []).map(function (g) {
            return Object.assign({}, g, { zoneId: z.id, zoneLabel: z.label });
          })
        );
      }, []);
    }
    return cfg.groups || [];
  }

  /** Checklist vendeur — mêmes types que section 3, sans second upload. */
  function getChecklistGroups() {
    return flattenGroups(VENDEUR).map(function (g) {
      return {
        id: g.id,
        legend: g.label,
        items: (g.items || []).map(function (it) {
          return { type: it.type, label: it.label };
        }),
      };
    });
  }

  function getConfig(mode) {
    if (mode === "vendeur" || mode === "vendeur-immo") return VENDEUR;
    if (mode === "acheteur" || mode === "acheteur-immo") return ACHETEUR;
    return VENDEUR;
  }

  global.ImmoDocumentsConfig = {
    getConfig: getConfig,
    getChecklistGroups: getChecklistGroups,
    flattenGroups: flattenGroups,
    vendeur: VENDEUR,
    acheteur: ACHETEUR,
    get checklist() {
      return getChecklistGroups();
    },
  };
})(typeof window !== "undefined" ? window : global);
