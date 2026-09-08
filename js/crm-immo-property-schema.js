/**
 * Schéma fiche bien intelligente — sections, champs, règles d'affichage.
 * Gère appart / maison / terrain / pro / vente / location + composition imbriquée.
 */
window.CrmImmoSchema = (function () {
  var TYPES = [
    { id: "appartement", label: "Appartement" },
    { id: "maison", label: "Maison" },
    { id: "terrain", label: "Terrain" },
    { id: "local", label: "Local / professionnel" },
    { id: "immeuble", label: "Immeuble" },
    { id: "parking", label: "Parking / garage" },
    { id: "complexe", label: "Complexe (terrain + bâtis)" },
  ];

  var TRANSACTIONS = [
    { id: "vente", label: "Vente" },
    { id: "location", label: "Location" },
  ];

  var UNIT_TYPES = [
    { id: "terrain", label: "Terrain / parcelle" },
    { id: "maison", label: "Maison / bâti" },
    { id: "appartement", label: "Appartement / lot" },
    { id: "local", label: "Local pro" },
    { id: "dependance", label: "Dépendance" },
  ];

  function f(id, label, type, opts) {
    opts = opts || {};
    return {
      id: id,
      label: label,
      type: type || "text",
      unit: opts.unit || "",
      options: opts.options || null,
      showIf: opts.showIf || null,
      hint: opts.hint || "",
      important: !!opts.important,
    };
  }

  function tri(id, label, opts) {
    return f(id, label, "tri", opts);
  }

  function sel(id, label, options, opts) {
    opts = opts || {};
    opts.options = options;
    return f(id, label, "select", opts);
  }

  function num(id, label, unit, opts) {
    opts = opts || {};
    opts.unit = unit || "";
    return f(id, label, "number", opts);
  }

  function area(id, label, opts) {
    return f(id, label, "textarea", opts);
  }

  function date(id, label, opts) {
    return f(id, label, "date", opts);
  }

  var OUI_NON = ["", "Oui", "Non", "Non renseigné"];
  var ZONE_OPTS = ["", "U", "AU", "A", "N", "Autre"];

  /**
   * Réorganisation métier :
   * Composition d'abord (terrain→maison→appts loués),
   * puis localisation / finances / surfaces,
   * puis caractéristiques selon type,
   * puis juridique (mandat, bail, diagnostics),
   * puis exploitation (visites, commentaires, gestion, travaux, estimation, pièces).
   */
  var SECTIONS = [
    {
      id: "composition",
      label: "Composition",
      hint: "Terrain + maison + appartements loués, lots, dépendances…",
      showIf: { types: ["maison", "terrain", "immeuble", "complexe", "local"] },
      special: "units",
    },
    {
      id: "localisation",
      label: "Localisation",
      fields: [
        f("adresse", "Adresse", "text", { important: true }),
        f("complement", "Complément d'adresse"),
        f("code_postal", "Code postal", "text", { important: true }),
        f("ville", "Ville", "text", { important: true }),
        f("quartier", "Quartier / secteur"),
        f("departement", "Département"),
        num("lat", "Latitude"),
        num("lng", "Longitude"),
        f("digicode", "Digicode"),
        f("etage", "Étage", "text", { showIf: { types: ["appartement"] } }),
        tri("ascenseur", "Ascenseur", { showIf: { types: ["appartement", "immeuble"] } }),
        area("acces", "Accès / itinéraire"),
      ],
    },
    {
      id: "finances",
      label: "Aspects financiers",
      fields: [
        num("prix_net", "Prix net vendeur / loyer HC", "€", { important: true }),
        num("prix_fai", "Prix FAI", "€", { showIf: { transactions: ["vente"] } }),
        num("honoraires", "Honoraires", "€"),
        sel("charge_honoraires", "Honoraires à charge", ["", "Vendeur", "Acquéreur", "Partagés"], {
          showIf: { transactions: ["vente"] },
        }),
        num("charges_mensuelles", "Charges mensuelles", "€"),
        num("taxe_fonciere", "Taxe foncière", "€/an"),
        num("taxe_habitation", "Taxe d'habitation", "€/an"),
        num("loyer_hc", "Loyer HC", "€", { showIf: { transactions: ["location"] } }),
        num("depot_garantie", "Dépôt de garantie", "€", { showIf: { transactions: ["location"] } }),
        num("frais_agence_loc", "Frais agence location", "€", { showIf: { transactions: ["location"] } }),
        area("info_financieres", "Informations financières complémentaires"),
      ],
    },
    {
      id: "surfaces",
      label: "Surfaces",
      fields: [
        num("surface_habitable", "Surface habitable", "m²", {
          important: true,
          showIf: { types: ["appartement", "maison", "immeuble", "complexe", "local"] },
        }),
        num("surface_carrez", "Surface Carrez", "m²", { showIf: { types: ["appartement", "immeuble"] } }),
        num("surface_utile", "Surface utile", "m²"),
        num("surface_terrain", "Surface terrain", "m²", {
          showIf: { types: ["maison", "terrain", "complexe"] },
        }),
        num("surface_sejour", "Surface séjour", "m²", { showIf: { types: ["appartement", "maison"] } }),
        num("nb_pieces", "Nombre de pièces", "", { important: true }),
        num("nb_chambres", "Nombre de chambres"),
        num("nb_sdb", "Salles de bain / eau"),
        num("nb_niveaux", "Nombre de niveaux", "", { showIf: { types: ["maison", "immeuble"] } }),
      ],
    },
    {
      id: "interieur",
      label: "Intérieur",
      showIf: { types: ["appartement", "maison", "immeuble", "complexe", "local"] },
      fields: [
        sel("cuisine", "Cuisine", ["", "Équipée", "Américaine", "Séparée", "Kitchenette", "Non"]),
        sel("chauffage", "Chauffage", ["", "Individuel gaz", "Individuel élec.", "Collectif", "Pompe chaleur", "Poêle", "Autre"]),
        sel("eau_chaude", "Eau chaude", ["", "Individuelle", "Collective", "Autre"]),
        tri("cheminee", "Cheminée"),
        tri("climatisation", "Climatisation"),
        tri("alarme", "Alarme"),
        tri("fibre", "Fibre optique"),
        area("descriptif_interieur", "Descriptif intérieur", { important: true }),
      ],
    },
    {
      id: "exterieur",
      label: "Extérieur",
      showIf: { types: ["appartement", "maison", "immeuble", "complexe", "local"] },
      fields: [
        tri("balcon", "Balcon"),
        num("surface_balcon", "Surface balcon", "m²"),
        tri("terrasse", "Terrasse"),
        num("surface_terrasse", "Surface terrasse", "m²"),
        tri("jardin", "Jardin"),
        num("surface_jardin", "Surface jardin", "m²"),
        tri("piscine", "Piscine"),
        tri("garage", "Garage"),
        tri("parking", "Parking"),
        num("nb_parkings", "Nb parkings"),
        tri("cave", "Cave"),
        tri("box", "Box"),
        area("descriptif_exterieur", "Descriptif extérieur"),
      ],
    },
    {
      id: "copropriete",
      label: "Copropriété",
      showIf: { types: ["appartement", "immeuble"] },
      fields: [
        num("nb_lots", "Nombre de lots"),
        f("tantiemes", "Tantièmes"),
        num("charges_copro", "Charges copro", "€/mois"),
        f("syndic", "Syndic"),
        tri("procedure_copro", "Procédure en cours"),
        area("info_copro", "Informations copropriété"),
        f("lot_garage", "N° lot garage"),
        f("lot_parking", "N° lot parking"),
        f("lot_cave", "N° lot cave"),
        f("lot_principal", "N° lot principal"),
      ],
    },
    {
      id: "terrain",
      label: "Terrain",
      showIf: { types: ["terrain", "maison", "complexe"] },
      fields: [
        num("longueur", "Longueur", "m"),
        num("emprise_servitude", "Emprise servitude", "m²"),
        num("surface_plancher", "Surface de plancher", "m²"),
        num("surface_min_batir", "Surface minimale pour bâtir", "m²", { important: true }),
        num("hauteur_demolir", "Hauteur à démolir", "m"),
        num("surface_demolir", "Surface à démolir", "m²"),
        tri("batiment_demolir", "Bâtiment à démolir"),
        num("ces", "CES"),
        num("cos", "COS"),
        tri("plu", "PLU"),
        tri("certificat_urbanisme", "Certificat d'urbanisme"),
        sel("zonage", "Zonage", ZONE_OPTS),
        sel("type_zone", "Type de zone", ["", "Constructible", "Non constructible", "Mixte"]),
        tri("construction_libre", "Construction libre"),
        f("ref_lot", "Référence du lot", "text", { important: true }),
        num("nb_lots_terrain", "Nombre de lots"),
        tri("reglt_lotissement", "Règlt particulier lotissement"),
        sel("amenagement", "Aménagement", ["", "Viabilisé", "À viabiliser", "Partiel"]),
        sel("aspect", "Aspect", ["", "Plat", "Pente douce", "Pente", "Vallonné"]),
        sel("cloture", "Clôture", ["", "Oui", "Non", "Partielle"]),
        tri("viabilise", "Viabilisé", { important: true }),
        sel("cable", "Câble", OUI_NON),
        sel("edf", "EDF", OUI_NON),
        tri("gaz", "Gaz"),
        sel("alimentation_gaz", "Alimentation gaz", OUI_NON, { important: true }),
        sel("eau_ville", "Eau ville", OUI_NON),
        sel("telephone_reseau", "Téléphone", OUI_NON),
        tri("servitude", "Servitude"),
        f("assainissement", "Assainissement"),
        sel("eaux_pluviales", "Eaux pluviales", OUI_NON),
        sel("eaux_usees", "Eaux usées", OUI_NON),
        tri("assainissement_collectif", "Assainissement collectif"),
        area("emplacement_compteur", "Emplacement compteur, assainissement", { important: true }),
        area("info_terrain", "Informations complémentaires", { important: true }),
        area("descriptif_terrain", "Descriptif terrain", { important: true }),
      ],
    },
    {
      id: "bail",
      label: "Bail",
      hint: "Visible si location, ou si un lot/unité est loué.",
      showIf: { anyOf: ["location", "has_rented_unit", "occupe"] },
      fields: [
        sel("type_bail", "Type de bail", [
          "",
          "Nu (loi 89)",
          "Meublé",
          "Colocation bail unique",
          "Colocation chambres",
          "Mobilité",
          "Étudiant",
          "Commercial",
          "Professionnel",
          "Autre",
        ]),
        date("date_debut_bail", "Date début bail"),
        date("date_fin_bail", "Date fin bail"),
        num("loyer_actuel", "Loyer actuel", "€"),
        num("charges_locatives", "Charges locatives", "€"),
        tri("meuble", "Meublé"),
        sel("regime_meuble", "Régime meublé / exonération", [
          "",
          "LMNP micro-BIC",
          "LMNP réel",
          "LMP",
          "Chambre chez l’habitant",
          "Partie de la RP",
          "Meublé de tourisme classé",
          "Saisonnier",
        ]),
        tri("colocation", "Colocation"),
        num("nb_colocataires", "Nombre de colocataires"),
        sel("coloc_bail_type", "Bail coloc", ["", "Bail unique", "Baux individuels (chambres)", "Mixte"]),
        sel("caution_solidaire", "Caution solidaire", ["", "Oui — solidaire", "Non — individuelle", "Mixte"]),
        tri("clause_revision", "Clause de révision IRL"),
        f("irl_trimestre_ref", "Trimestre IRL de référence", "text", { hint: "Ex. T2 2025 — même trimestre chaque année" }),
        num("irl_indice_signature", "Indice IRL à la signature"),
        date("date_prochaine_revision", "Prochaine révision IRL"),
        tri("encadrement_loyer", "Encadrement des loyers"),
        tri("zone_tendue", "Zone tendue"),
        num("preavis_locataire_mois", "Préavis locataire", "mois"),
        num("depot_garantie_bail", "Dépôt de garantie", "€"),
        tri("grille_vetuste", "Grille de vétusté annexée"),
        num("provision_charges_sortie", "Provision charges (sortie)", "€"),
        num("nb_cles", "Nombre de clés / badges"),
        date("date_restitution_cles", "Restitution des clés"),
        date("date_mise_en_demeure", "Date mise en demeure"),
        num("solde_impaye", "Solde impayé", "€"),
        tri("clause_interets_retard", "Clause intérêts de retard"),
        area("annexes_bail", "Annexes du bail (liste / manquantes)"),
        date("date_avis_travaux", "Date avis travaux"),
        num("duree_travaux_jours", "Durée travaux prévue", "j"),
        area("avis_travaux_contenu", "Contenu avis travaux (pièces, horaires, baisse de loyer)"),
        sel("dernier_avis_type", "Dernier avis au locataire", [
          "",
          "IRL",
          "Travaux",
          "Visites / accès",
          "Congé bailleur",
          "Congé locataire",
          "Meublé / exonérations",
          "Mise en demeure",
          "Restitution dépôt / clés",
        ]),
        date("date_dernier_avis", "Date dernier avis"),
        f("locataire_nom", "Locataire (nom)"),
        area("clauses_bail", "Clauses / observations bail"),
      ],
    },
    {
      id: "mandat",
      label: "Mandat",
      fields: [
        f("ref_affaire", "Référence affaire"),
        f("n_mandat", "N° mandat"),
        f("n_archive", "N° archive"),
        sel("forme_mandat", "Forme mandat", ["", "Simple", "Exclusif", "Semi-exclusif"]),
        sel("type_mandat", "Type mandat", ["", "Vente", "Location", "Gestion locative", "Syndic", "Recherche", "Estimation"]),
        sel("garantie_loyer", "Garantie loyer", OUI_NON),
        f("origine_info", "Origine de l'information"),
        date("date_mandat", "Date mandat"),
        date("date_premier_mandat", "Date premier mandat"),
        date("date_echeance", "Date échéance", { hint: "Privé : durée visible proprio + Wendy uniquement" }),
        area("listing_urls", "Liens annonces (un par ligne)", { hint: "Leboncoin, SeLoger… jusqu'à 12 URLs" }),
        area("fee_share_notes", "Partage honoraires (entrant/sortant)", { hint: "Convention écrite — voir partenaires-immo" }),
        date("date_renouvellement", "Date renouvellement"),
        date("date_acquisition", "Date acquisition"),
        num("delai_publication", "Délai publication mandat", "jours"),
        f("disponibilite", "Disponibilité"),
        tri("demarchage_domicile", "Démarchage à domicile"),
        tri("mandat_hors_etablissement", "Mandat hors établissement"),
        tri("accord_commercialisation", "Accord de commercialisation"),
        area("info_mandat", "Informations complémentaires", { important: true }),
        area("notaire", "Notaire", { important: true }),
        area("syndic_mandat", "Syndic", { important: true }),
        area("geometre", "Géomètre", { important: true }),
        area("cause_vente_detail", "Détail cause vente/location", { important: true }),
        area("designation_bien", "Désignation du bien", { important: true }),
        f("tantiemes_mandat", "Tantièmes"),
        f("contenance_totale", "Contenance (total)"),
        date("date_butoir_vente", "Date butoir vente"),
        num("nb_refs_cadastrales", "Nombre de références cadastrales"),
        f("section_cadastrale", "Nom section cadastrale"),
        f("numero_cadastre", "Numéro cadastre"),
        f("lieu_dit_cadastre", "Lieu dit cadastre"),
        f("contenance_cadastre", "Contenance cadastre"),
        tri("dommage_ouvrage", "Dommage ouvrage"),
        tri("certificat_conformite", "Certificat conformité"),
        tri("garantie_decennale", "Garantie décennale"),
        tri("vente_encheres", "Vente aux enchères"),
        tri("garantie_revente", "Garantie revente"),
        sel("cause_vente", "Cause vente/location", ["", "Mutation", "Succession", "Divorce", "Investissement", "Autre"]),
      ],
    },
    {
      id: "diagnostics",
      label: "Diagnostics",
      fields: [
        f("orga_diagnostics", "Organisation diagnostics"),
        date("date_audit_energetique", "Audit énergétique"),
        tri("erp", "État des Risques et Pollutions (ERP)"),
        date("date_erp", "Date ERP"),
        tri("carrez", "Diagnostic Carrez"),
        date("date_carrez", "Date Carrez"),
        tri("amiante", "Diagnostic Amiante"),
        date("date_amiante", "Date Amiante"),
        tri("parasitaire", "Diagnostic Parasitaire"),
        date("date_parasitaire", "Date Parasitaire"),
        tri("plomb", "Diagnostic Plomb"),
        date("date_plomb", "Date Plomb"),
        tri("termites", "Diagnostic Termites"),
        date("date_termites", "Date Termites"),
        sel("perf_numerique", "Diagnostic Perf. Numérique", ["", "Très bon", "Bon", "Moyen", "Faible", "Non"]),
        date("date_perf_num", "Date Perf. Numérique"),
        tri("diag_gaz", "Diagnostic Gaz"),
        date("date_gaz", "Date Gaz"),
        tri("diag_elec", "Diagnostic Électrique"),
        date("date_elec", "Date Électrique"),
        tri("diag_assainissement", "Diagnostic Assainissement"),
        date("date_assainissement", "Date Assainissement"),
        tri("soumis_affichage_dpe", "Soumis à l'affichage du DPE"),
        f("n_ademe", "N° ADEME"),
        tri("dpe_neuf_non_communique", "Programme neuf — DPE non communiqué"),
        tri("usage_moins_4_mois", "Bâtiment résidentiel utilisé < 4 mois / an"),
        tri("non_chauffe", "Bâtiment non chauffé ou cheminée foyer ouvert"),
        tri("monument_historique", "Monument historique classé"),
        tri("lieu_culte", "Lieu de culte"),
        tri("usage_spe", "Usage agricole / artisanal / industriel spécifique"),
        tri("construction_provisoire", "Construction provisoire < 2 ans"),
        tri("independant_50", "Bâtiment indépendant < 50 m²"),
        date("date_dpe", "Date établissement DPE"),
        sel("conso_energie_finale", "Consommation énergie finale", ["", "A", "B", "C", "D", "E", "F", "G"]),
        sel("conso_energie_primaire", "Consommation énergie primaire (lettre)", ["", "A", "B", "C", "D", "E", "F", "G"]),
        num("valeur_energie_primaire", "Valeur énergie primaire", "kWh/m²/an"),
        num("valeur_energie_finale", "Valeur énergie finale", "kWh"),
        sel("ges", "Gaz Effet de Serre", ["", "A", "B", "C", "D", "E", "F", "G"]),
        num("valeur_ges", "Valeur GES", "Kg CO₂/m²/an"),
        num("cout_energie_min", "Montant min. dépenses annuelles énergie", "€"),
        num("cout_energie_max", "Montant max. dépenses annuelles énergie", "€"),
        f("annee_ref_prix_energie", "Année de référence prix énergie"),
        num("surface_ref_dpe", "Surface de référence DPE", "m²"),
        area("info_diagnostics", "Informations complémentaires"),
      ],
    },
    {
      id: "annonce_pub",
      label: "Annonce & pubs",
      hint: "Saisie type Leboncoin : texte, upload photos, vidéos, visite virtuelle. Ou utilisez CRM → Pubs mandats / démo pour l’interface complète avec miniatures.",
      fields: [
        area("ad_headline", "Titre annonce pub", { important: true, hint: "Titre affiché sur Meta / Google / vitrine" }),
        area("ad_body", "Texte annonce", { important: true, hint: "Description commerciale (sans téléphone ni e-mail)" }),
        area("ad_photo_urls", "Photos (URLs, une par ligne)", { hint: "https… ou data:image — max 12" }),
        area("ad_video_urls", "Vidéos (URLs, une par ligne)", { hint: "YouTube, Vimeo, fichier https…" }),
        f("ad_virtual_tour", "Lien visite virtuelle", "text", { hint: "Matterport, Nodalview, Kuula…" }),
        area("ad_platforms", "Plateformes diffusées", { hint: "Meta, Google, Leboncoin…" }),
        tri("ad_channel_public", "Vitrine publique (mandats)"),
        tri("ad_channel_private", "Démo privée vendeur (anti-copie)"),
        f("ad_demo_label", "Libellé démo privée"),
      ],
    },
    {
      id: "visites",
      label: "Visites",
      fields: [
        tri("bien_occupe", "Bien occupé"),
        area("heures_visite", "Heures de visite"),
        f("nom_contact_visite", "Nom contact"),
        f("tel_contact_visite", "Téléphone contact"),
        f("porte", "Porte"),
        area("consignes", "Consignes / itinéraires"),
        f("numero_cle", "Numéro clé"),
        date("cle_rendue_le", "Clé rendue le"),
        f("n_cave_visite", "N° cave"),
        f("n_parking_visite", "N° parking"),
        tri("panneau", "Panneau"),
        date("date_pose_panneau", "Date pose panneau"),
        date("date_retrait_panneau", "Date retrait panneau"),
        area("agences_autorisees", "Agences autorisées"),
      ],
    },
    {
      id: "commentaires",
      label: "Commentaires",
      fields: [
        f("url_fiche", "URL fiche bien", "text", { important: true }),
        f("url_origine_pige", "URL origine pige", "text", { important: true }),
        area("observations_generales", "Observations générales"),
        area("points_forts", "Points forts", { important: true }),
        area("points_faibles", "Points faibles", { important: true }),
        area("note_confidentielle", "Note confidentielle"),
        area("observations", "Observations / historique pige"),
        area("vente_privee", "Vente privée"),
        area("commentaire_estimation", "Commentaire estimation"),
        area("commentaire_document", "Commentaire document"),
        area("infos_complementaires", "Informations complémentaires"),
      ],
    },
    {
      id: "gestion",
      label: "Gestion",
      fields: [
        tri("location_gerance", "Location gérance"),
        f("agence_gerance", "Agence de gérance"),
        f("n_mandat_gerance", "N° mandat de gérance"),
      ],
    },
    {
      id: "travaux",
      label: "Travaux",
      fields: [
        area("travaux_a_prevoir", "Travaux à prévoir"),
        area("travaux_realises", "Travaux réalisés"),
        num("budget_travaux", "Budget travaux estimé", "€"),
        date("date_travaux", "Date travaux"),
      ],
    },
    {
      id: "estimation",
      label: "Rapport d'estimation",
      fields: [
        num("valeur_terrain", "Valeur du terrain", "€"),
        num("valeur_m2_construction", "Valeur du m² à la construction", "€"),
        f("annexe1_libelle", "Libellé annexe 1"),
        num("annexe1_prix", "Prix annexe 1", "€"),
        f("annexe2_libelle", "Libellé annexe 2"),
        num("annexe2_prix", "Prix annexe 2", "€"),
        f("annexe3_libelle", "Libellé annexe 3"),
        num("annexe3_prix", "Prix annexe 3", "€"),
        num("taux_rentabilite_1", "Rentabilité taux 1", "%"),
        num("taux_rentabilite_2", "Rentabilité taux 2", "%"),
        num("taux_rentabilite_3", "Rentabilité taux 3", "%"),
        f("frac1_desig", "Fractionnement désignation 1"),
        num("frac1_valeur", "Fractionnement valeur 1", "€"),
        f("frac2_desig", "Fractionnement désignation 2"),
        num("frac2_valeur", "Fractionnement valeur 2", "€"),
        f("frac3_desig", "Fractionnement désignation 3"),
        num("frac3_valeur", "Fractionnement valeur 3", "€"),
        f("frac4_desig", "Fractionnement désignation 4"),
        num("frac4_valeur", "Fractionnement valeur 4", "€"),
        num("fin_taux_1", "Financement taux intérêt 1", "%"),
        num("fin_taux_2", "Financement taux intérêt 2", "%"),
        num("fin_taux_3", "Financement taux intérêt 3", "%"),
        num("fin_apport_1", "Financement apport 1", "%"),
        num("fin_apport_2", "Financement apport 2", "%"),
        num("fin_apport_3", "Financement apport 3", "%"),
        num("fin_duree_1", "Financement durée 1"),
        num("fin_duree_2", "Financement durée 2"),
        num("fin_duree_3", "Financement durée 3"),
        num("prix_final_ponderation", "Prix final pondération", "€"),
        num("ponderation_taux", "Pondération du prix : taux", "%"),
        area("valoris_details", "Valoris : détails"),
      ],
    },
    {
      id: "pieces",
      label: "Pièces justificatives",
      special: "documents",
    },
  ];

  var DOC_GROUPS = [
    {
      id: "diagnostics",
      label: "Diagnostics et certificats réglementaires",
      items: [
        { id: "dpe", label: "DPE (10 ans)", when: ["all"] },
        { id: "erp", label: "ERP (6 mois)", when: ["all"] },
        { id: "amiante", label: "Amiante (bâti < 1997)", when: ["appartement", "maison", "immeuble", "local"] },
        { id: "termites", label: "Termites (selon zone)", when: ["appartement", "maison", "immeuble", "terrain"] },
        { id: "plomb", label: "Plomb (logement < 1949)", when: ["appartement", "maison", "immeuble"] },
        { id: "bruit", label: "Nuisance sonore aérienne", when: ["all"] },
        { id: "gaz", label: "Gaz (> 15 ans)", when: ["appartement", "maison", "immeuble"] },
        { id: "elec", label: "Électricité (> 15 ans)", when: ["appartement", "maison", "immeuble"] },
        { id: "carrez", label: "Loi Carrez", when: ["appartement", "immeuble"] },
        { id: "parasite", label: "Diagnostic parasite", when: ["maison", "appartement", "immeuble"] },
        { id: "assain_col", label: "Assainissement collectif", when: ["maison", "terrain", "complexe"] },
        { id: "assain_non", label: "Assainissement non collectif", when: ["maison", "terrain", "complexe"] },
      ],
    },
    {
      id: "dossier",
      label: "Pièces nécessaires à la constitution du dossier",
      items: [
        { id: "titre", label: "Titre de propriété", when: ["all"] },
        { id: "identite", label: "Justificatif d'identité", when: ["all"] },
        { id: "domicile", label: "Justificatif de domicile", when: ["all"] },
        { id: "livret", label: "Livret de famille", when: ["all"] },
        { id: "taxe_hab", label: "Taxe d'habitation", when: ["appartement", "maison"] },
        { id: "taxe_fonc", label: "Taxe foncière", when: ["all"] },
        { id: "facture_energie", label: "Facture consommation énergie", when: ["appartement", "maison", "local"] },
        { id: "mobilier", label: "Liste du mobilier", when: ["location"] },
        { id: "chaudiere", label: "Entretien chaudière", when: ["appartement", "maison"] },
        { id: "ramonage", label: "Attestation ramonage", when: ["maison", "appartement"] },
        { id: "kbis", label: "Kbis < 3 mois (si société)", when: ["all"] },
        { id: "statuts", label: "Statuts société", when: ["all"] },
        { id: "bail_doc", label: "Bail et avenants (si loué)", when: ["location", "has_rented_unit"] },
        { id: "conge_bailleur", label: "Congé donné par le bailleur", when: ["location", "has_rented_unit"] },
        { id: "conge_locataire", label: "Congé donné par le locataire", when: ["location", "has_rented_unit"] },
        { id: "autorisation_visite", label: "Autorisation écrite du locataire pour visites", when: ["has_rented_unit"] },
      ],
    },
    {
      id: "maison",
      label: "Pièces nécessaires pour une maison",
      items: [
        { id: "plu", label: "Extrait POS / PLU", when: ["maison", "terrain", "complexe"] },
        { id: "cadastre", label: "Plan cadastral", when: ["maison", "terrain", "complexe"] },
        { id: "puits", label: "Attestation puits / forage", when: ["maison", "terrain"] },
        { id: "dommage", label: "Attestation dommage-ouvrage", when: ["maison"] },
        { id: "conformite", label: "Certificat de conformité", when: ["maison"] },
        { id: "assain_conf", label: "Conformité réseau assainissement", when: ["maison", "terrain"] },
        { id: "dat", label: "Déclaration d'achèvement des travaux", when: ["maison", "terrain"] },
        { id: "permis", label: "Permis de construire", when: ["maison", "terrain"] },
        { id: "plans", label: "Plans maison", when: ["maison"] },
      ],
    },
    {
      id: "copro",
      label: "Pièces nécessaires pour une copropriété",
      items: [
        { id: "pv_ag", label: "PV d'AG (3 derniers)", when: ["appartement", "immeuble"] },
        { id: "dta", label: "DTA et fiche synthétique", when: ["appartement", "immeuble"] },
        { id: "convoc_ag", label: "Convocation prochaine AG", when: ["appartement", "immeuble"] },
        { id: "pre_etat_date", label: "Pré état daté", when: ["appartement", "immeuble"] },
        { id: "reglement_copro", label: "Règlement de copropriété / EDD", when: ["appartement", "immeuble"] },
        { id: "appels_fonds", label: "Appels de fonds (4 derniers)", when: ["appartement", "immeuble"] },
        { id: "decompte_charges", label: "Décompte des charges", when: ["appartement", "immeuble"] },
        { id: "carnet_entretien", label: "Carnet d'entretien immeuble", when: ["appartement", "immeuble"] },
      ],
    },
    {
      id: "terrain_docs",
      label: "Pièces nécessaires pour un terrain",
      items: [
        { id: "cu", label: "Certificat d'urbanisme", when: ["terrain", "complexe"] },
        { id: "plan_cad", label: "Plan cadastral", when: ["terrain", "complexe"] },
        { id: "matrice", label: "Matrice cadastrale", when: ["terrain", "complexe"] },
        { id: "arpentage", label: "Document d'arpentage", when: ["terrain", "complexe"] },
        { id: "dp", label: "Déclaration préalable", when: ["terrain", "complexe"] },
        { id: "permis_amenager", label: "Permis d'aménager", when: ["terrain", "complexe"] },
        { id: "plan_masse", label: "Plan de masse", when: ["terrain", "complexe"] },
        { id: "plan_division", label: "Plan de division", when: ["terrain", "complexe"] },
        { id: "plan_reseaux", label: "Plan des réseaux", when: ["terrain", "complexe"] },
        { id: "reglement_lotissement", label: "Règlement de lotissement", when: ["terrain", "complexe"] },
        { id: "cahier_charges", label: "Cahier des charges", when: ["terrain", "complexe"] },
      ],
    },
    {
      id: "financement",
      label: "Pièces nécessaires au financement",
      items: [
        { id: "revenus", label: "Justificatifs de revenus", when: ["all"] },
        { id: "pret", label: "Justificatifs du prêt immobilier", when: ["vente"] },
        { id: "epargne", label: "Justificatifs de l'épargne", when: ["vente"] },
      ],
    },
  ];

  var TABS = [
    { id: "description", label: "Description" },
    { id: "pieces_plan", label: "Pièces" },
    { id: "images", label: "Images" },
    { id: "cloud", label: "Immo cloud" },
    { id: "vendeur", label: "Personnes & parts" },
    { id: "historique", label: "Historique" },
    { id: "stats", label: "Statistiques" },
  ];

  function contextFlags(property) {
    property = property || {};
    var units = Array.isArray(property.units) ? property.units : [];
    var hasRented = units.some(function (u) {
      return u && (u.transaction === "location" || u.loue || u.status === "loue");
    });
    var occupe = !!(property.details && property.details.visites && property.details.visites.bien_occupe === "yes");
    return {
      type: property.property_type || "appartement",
      transaction: property.transaction || "vente",
      has_rented_unit: hasRented,
      occupe: occupe,
    };
  }

  function matchShowIf(showIf, ctx) {
    if (!showIf) return true;
    if (showIf.types && showIf.types.indexOf(ctx.type) === -1) return false;
    if (showIf.transactions && showIf.transactions.indexOf(ctx.transaction) === -1) return false;
    if (showIf.anyOf) {
      var ok = showIf.anyOf.some(function (flag) {
        if (flag === "location") return ctx.transaction === "location";
        if (flag === "has_rented_unit") return !!ctx.has_rented_unit;
        if (flag === "occupe") return !!ctx.occupe;
        return !!ctx[flag];
      });
      if (!ok) return false;
    }
    return true;
  }

  function visibleSections(property) {
    var ctx = contextFlags(property);
    return SECTIONS.filter(function (s) {
      return matchShowIf(s.showIf, ctx);
    });
  }

  function visibleFields(section, property) {
    var ctx = contextFlags(property);
    return (section.fields || []).filter(function (field) {
      return matchShowIf(field.showIf, ctx);
    });
  }

  function documentApplies(item, property) {
    var ctx = contextFlags(property);
    var when = item.when || ["all"];
    return when.some(function (w) {
      if (w === "all") return true;
      if (w === "vente" || w === "location") return ctx.transaction === w;
      if (w === "has_rented_unit") return ctx.has_rented_unit;
      return ctx.type === w;
    });
  }

  function suggestedRequired(item, property) {
    var ctx = contextFlags(property);
    if (item.id === "carrez" && (ctx.type === "appartement" || ctx.type === "immeuble")) return true;
    if (item.id === "dpe" && ctx.type !== "terrain" && ctx.type !== "parking") return true;
    if (item.id === "titre" || item.id === "identite") return true;
    if (item.id === "cu" && (ctx.type === "terrain" || ctx.type === "complexe")) return true;
    if (item.id === "bail_doc" && (ctx.transaction === "location" || ctx.has_rented_unit)) return true;
    return false;
  }

  function emptyDetails() {
    var out = {};
    SECTIONS.forEach(function (s) {
      if (s.fields) {
        out[s.id] = {};
        s.fields.forEach(function (field) {
          out[s.id][field.id] = field.type === "tri" ? "any" : "";
        });
      }
    });
    out.pieces = { items: {} };
    return out;
  }

  function emptyUnit(type) {
    return {
      id: "unit_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6),
      type: type || "appartement",
      label: "",
      transaction: "vente",
      loue: false,
      surface_m2: "",
      rooms: "",
      bedrooms: "",
      price: "",
      loyer: "",
      notes: "",
      parent_id: null,
    };
  }

  return {
    TYPES: TYPES,
    TRANSACTIONS: TRANSACTIONS,
    UNIT_TYPES: UNIT_TYPES,
    SECTIONS: SECTIONS,
    DOC_GROUPS: DOC_GROUPS,
    TABS: TABS,
    contextFlags: contextFlags,
    visibleSections: visibleSections,
    visibleFields: visibleFields,
    documentApplies: documentApplies,
    suggestedRequired: suggestedRequired,
    emptyDetails: emptyDetails,
    emptyUnit: emptyUnit,
    matchShowIf: matchShowIf,
  };
})();
