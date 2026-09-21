/**
 * Types & calculs Prêt Immo / RAC (indicatif courtier).
 */
window.CrmPretImmo = (function () {
  var SIM_TYPES = [
    { id: "immo", label: "IMMO", group: "simulation", desc: "Prêt immobilier" },
    { id: "rac", label: "RAC", group: "simulation", desc: "Rachat / regroupement de crédits", hasHousing: true },
    { id: "sci", label: "SCI", group: "simulation", desc: "Financement SCI" },
    { id: "scpi", label: "SCPI", group: "simulation", desc: "SCPI à crédit" },
    { id: "conso", label: "CONSO", group: "simulation", desc: "Crédit conso" },
    { id: "hypo", label: "HYPO", group: "simulation", desc: "Prêt hypothécaire" },
    { id: "viager", label: "VIAGER", group: "simulation", desc: "Viager" },
    { id: "pvh", label: "PVH", group: "outil", desc: "Calculette montant à rembourser" },
  ];

  var HOUSING_STATUSES = [
    { id: "proprietaire", label: "Propriétaire" },
    { id: "locataire", label: "Locataire" },
    { id: "heberge", label: "Hébergé" },
  ];

  var POSITIONS = [
    { id: "brouillon", label: "Brouillon" },
    { id: "simulation", label: "Simulation" },
    { id: "coordonnees", label: "Coordonnées transmises" },
    { id: "ddp", label: "DDP en cours" },
    { id: "pieces", label: "Pièces en attente" },
    { id: "banque", label: "En banque" },
    { id: "accorde", label: "Accordé" },
    { id: "refuse", label: "Refusé" },
    { id: "signe", label: "Signé" },
    { id: "archive", label: "Archivé" },
  ];

  var PROF_SITUATIONS = [
    "Salarié CDI",
    "Salarié CDD",
    "Fonctionnaire",
    "Indépendant / TNS",
    "Retraité",
    "Sans emploi",
    "Autre",
  ];

  var CIVILITES = [
    { id: "mme", label: "Mme" },
    { id: "m", label: "M." },
  ];

  var MARITAL = ["Célibataire", "Union libre", "Marié(e)", "Pacsé(e)", "Divorcé(e)", "Veuf(ve)"];

  var IMMO_PROJECT_TYPES = [
    "Ancien",
    "VEFA",
    "CCMI",
    "Terrain + construction",
    "Travaux",
    "SCPI",
    "Autre",
  ];

  var LOGEMENT_TYPES = [
    "Locataire",
    "Propriétaire",
    "Hébergé",
    "Logement de fonction",
    "Autre",
  ];

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  function euro(n) {
    return (
      (Number(n) || 0).toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }) + " €"
    );
  }

  function monthlyPayment(principal, annualRatePct, months) {
    var P = Math.max(0, Number(principal) || 0);
    var n = Math.max(1, Math.round(Number(months) || 0));
    var r = (Number(annualRatePct) || 0) / 100 / 12;
    if (P <= 0) return 0;
    if (r <= 0) return round2(P / n);
    var f = Math.pow(1 + r, n);
    return round2((P * r * f) / (f - 1));
  }

  function emptyPerson() {
    return {
      civilite: "m",
      nom: "",
      prenom: "",
      nom_jeune_fille: "",
      birthdate: "",
      birthplace: "",
      birth_dept: "",
      birth_country: "France",
      nationality: "Française",
      phone: "",
      email: "",
      situation: "Célibataire",
      profession: "",
      situation_pro: "Salarié CDI",
      employeur: "",
      secteur: "",
      pro_debut: "",
      siren: "",
    };
  }

  function emptyProjet() {
    return {
      type: "Ancien",
      emprunteur_type: "physique",
      prix_achat: 0,
      travaux: 0,
      frais_notaire: 0,
      frais_garantie: 0,
      frais_dossier: 0,
      frais_mandat: 0,
      frais_mutation: 0,
      frais_divers: 0,
      apport: 0,
      duree_mois: 300,
      taux: 3.5,
      assurance_e_taux: 0.34,
      assurance_e_quotite: 100,
      assurance_c_taux: 0.34,
      assurance_c_quotite: 0,
      sci_nom: "",
      sci_rp: false,
      scpi_nom: "",
      scpi_parts: 0,
      scpi_valeur_part: 0,
      hypo_valeur_bien: 0,
      hypo_montant: 0,
      viager_valeur: 0,
      viager_montant: 0,
      viager_type_bien: "rp",
      objet: "",
      /** Axes financement corrélés à la doc (PTZ / relais) */
      ptz: false,
      relais: false,
    };
  }

  function emptyDossier(overrides) {
    var o = overrides || {};
    return {
      id: o.id || "",
      ref: o.ref || "",
      created_at: o.created_at || new Date().toISOString(),
      updated_at: o.updated_at || new Date().toISOString(),
      rubrique: o.rubrique || "rac",
      housing_status: o.housing_status || "proprietaire",
      position: o.position || "brouillon",
      projet: o.projet || emptyProjet(),
      banque_detail: o.banque_detail || { nom: "", iban: "", bic: "", anciennete: "", carte: "aucune" },
      toggles: o.toggles || {
        autres_biens: false,
        biens_sci: false,
        credits_conso: false,
        epargne: false,
        banque: true,
        retard: false,
      },
      epargne: o.epargne || 0,
      emprunteur: o.emprunteur || emptyPerson(),
      coemprunteur: o.coemprunteur || emptyPerson(),
      has_co: !!o.has_co,
      enfants_nb: o.enfants_nb || 0,
      enfants_ages: o.enfants_ages || [],
      logement: o.logement || { adresse: "", cp: "", ville: "", anciennete: "" },
      propriete: o.propriete || { valeur_bien: 0, depuis: "" },
      hebergement: o.hebergement || { type: "parents", loyer_partenaire: 0 },
      revenus: o.revenus || {
        salaire_e: 0,
        salaire_c: 0,
        pension_recue: 0,
        foncier: 0,
        caf: 0,
        apl: 0,
        autres: 0,
      },
      charges: o.charges || {
        loyer: 0,
        pension_versee: 0,
        autres: 0,
      },
      credits: o.credits || {
        pret_immo_nb: 0,
        pret_immo_mens: 0,
        pret_immo_crd: 0,
        pret_conso_nb: 0,
        pret_conso_mens: 0,
        pret_conso_crd: 0,
        pret_garder_nb: 0,
        pret_garder_mens: 0,
        pret_garder_crd: 0,
        decouvert: 0,
        projet: 0,
        besoin_client: 0,
        deja_rac: false,
      },
      retards: o.retards || {
        impot: false,
        huissier: false,
        contentieux: false,
        loyer: false,
        hypotheque: false,
        copro: false,
        montant: 0,
        mois_loyer: 0,
        rejet_prelev: false,
        rejet_cheques: false,
        nb_rejets: 0,
        fiche_bdf: false,
      },
      simulation: o.simulation || {
        frais_operation: 0,
        ira: 0,
        honoraires: 0,
        avec_hypo: true,
      },
      banque: o.banque || "",
      produit: o.produit || "",
      montant: o.montant || 0,
      apporteur: o.apporteur || "",
      reseau: o.reseau || "",
      utilisateur: o.utilisateur || "",
      analyste: o.analyste || "",
      gestionnaire: o.gestionnaire || "",
      ddp: o.ddp || false,
      comments: o.comments || [],
      property_id: o.property_id || "",
      contact_id: o.contact_id || "",
      archived: !!o.archived,
      /** Transmission légère de contacts (indicateur d'affaires) */
      mode: o.mode || "dossier",
      delegation: !!o.delegation,
      responsable: o.responsable || { nom: "", email: "", tel: "" },
      infos_complementaires: o.infos_complementaires || "",
      emprunteur_anciennete: o.emprunteur_anciennete || "",
      coemprunteur_anciennete: o.coemprunteur_anciennete || "",
    };
  }

  function sumRevenus(r) {
    r = r || {};
    return round2(
      (Number(r.salaire_e) || 0) +
        (Number(r.salaire_c) || 0) +
        (Number(r.pension_recue) || 0) +
        (Number(r.foncier) || 0) +
        (Number(r.caf) || 0) +
        (Number(r.apl) || 0) +
        (Number(r.autres) || 0)
    );
  }

  function sumCharges(c) {
    c = c || {};
    return round2((Number(c.loyer) || 0) + (Number(c.pension_versee) || 0) + (Number(c.autres) || 0));
  }

  function synthesize(dossier) {
    var d = dossier || emptyDossier();
    var cr = d.credits || {};
    var sim = d.simulation || {};
    var p = d.projet || emptyProjet();
    var totalRevenus = sumRevenus(d.revenus);
    var totalCharges = sumCharges(d.charges);
    var creditsGardes = Number(cr.pret_garder_mens) || 0;
    var creditsExistants =
      creditsGardes + (Number(cr.pret_immo_mens) || 0) + (Number(cr.pret_conso_mens) || 0);
    var crd =
      (Number(cr.pret_immo_crd) || 0) +
      (Number(cr.pret_conso_crd) || 0);
    var decouvert = Number(cr.decouvert) || 0;
    var projetExtra = Number(cr.projet) || 0;
    var retards = Number((d.retards && d.retards.montant) || 0);
    var ira = Number(sim.ira) || 0;
    var fraisOp = Number(sim.frais_operation) || 0;
    var honoraires = Number(sim.honoraires) || 0;

    var prixAchat = Number(p.prix_achat) || 0;
    var travaux = Number(p.travaux) || 0;
    var frais =
      (Number(p.frais_notaire) || 0) +
      (Number(p.frais_garantie) || 0) +
      (Number(p.frais_dossier) || 0) +
      (Number(p.frais_mandat) || 0) +
      (Number(p.frais_mutation) || 0) +
      (Number(p.frais_divers) || 0);
    var coutProjet = round2(prixAchat + travaux + frais + projetExtra);
    if (d.rubrique === "scpi") {
      coutProjet = round2((Number(p.scpi_parts) || 0) * (Number(p.scpi_valeur_part) || 0) + frais);
      prixAchat = round2((Number(p.scpi_parts) || 0) * (Number(p.scpi_valeur_part) || 0));
    }
    if (d.rubrique === "hypo" || d.rubrique === "viager") {
      prixAchat = Number(p.hypo_valeur_bien || p.viager_valeur) || 0;
      coutProjet = Number(p.hypo_montant || p.viager_montant) || 0;
    }
    if (d.rubrique === "conso") {
      coutProjet =
        Number(cr.besoin_client || cr.projet || p.prix_achat) || 0;
      prixAchat = coutProjet;
    }

    var apport = Number(p.apport) || 0;
    var aFinancer = Math.max(0, round2(coutProjet - apport));
    if (d.rubrique === "hypo" || d.rubrique === "viager") {
      aFinancer = Number(p.hypo_montant || p.viager_montant) || aFinancer;
    }
    var duree = Number(p.duree_mois) || 300;
    var taux = Number(p.taux) || 0;
    var mensHa = monthlyPayment(aFinancer, taux, duree);
    var assurE =
      round2((aFinancer * (Number(p.assurance_e_taux) || 0) * (Number(p.assurance_e_quotite) || 0)) / 100 / 100 / 12);
    var assurC = d.has_co
      ? round2((aFinancer * (Number(p.assurance_c_taux) || 0) * (Number(p.assurance_c_quotite) || 0)) / 100 / 100 / 12)
      : 0;
    var mensAc = round2(mensHa + assurE + assurC);

    var chargesAvant = round2(totalCharges + creditsExistants);
    var chargesApres = round2(totalCharges + creditsGardes + mensAc);
    var dtiAvant = totalRevenus > 0 ? round2((chargesAvant / totalRevenus) * 100) : 0;
    var dtiApres = totalRevenus > 0 ? round2((chargesApres / totalRevenus) * 100) : 0;
    var rav = round2(totalRevenus - chargesApres);
    var pers = 1 + (d.has_co ? 1 : 0) + (Number(d.enfants_nb) || 0);
    var ravPers = pers > 0 ? round2(rav / pers) : rav;
    var valeurGarantie = Number(p.hypo_valeur_bien || p.viager_valeur || prixAchat) || 0;
    var ratioHypo = valeurGarantie > 0 ? round2((aFinancer / valeurGarantie) * 100) : 0;

    var besoinRac =
      round2(crd + decouvert + projetExtra + retards + ira + fraisOp + honoraires) ||
      Number(cr.besoin_client) ||
      0;

    return {
      totalRevenus: totalRevenus,
      totalCharges: totalCharges,
      creditsGardes: creditsGardes,
      creditsExistants: creditsExistants,
      crd: crd,
      decouvert: decouvert,
      projet: projetExtra,
      retards: retards,
      ira: ira,
      frais: frais,
      honoraires: honoraires,
      besoinTotal: d.rubrique === "rac" ? besoinRac : aFinancer,
      mensARacheter: (Number(cr.pret_immo_mens) || 0) + (Number(cr.pret_conso_mens) || 0),
      resteAVivre: rav,
      dtiEstime: dtiApres,
      avecHypo: !!sim.avec_hypo,
      prixAchat: prixAchat,
      coutProjet: coutProjet,
      apport: apport,
      aFinancer: aFinancer,
      dureeMois: duree,
      taux: taux,
      mensHa: mensHa,
      mensAc: mensAc,
      assurE: assurE,
      assurC: assurC,
      dtiAvant: dtiAvant,
      dtiApres: dtiApres,
      rav: rav,
      ravPers: ravPers,
      ratioHypo: ratioHypo,
      valeurGarantie: valeurGarantie,
      solvabilite: dtiApres <= 35 ? "ok" : dtiApres <= 40 ? "vigilance" : "hors",
    };
  }

  function consoDetail(dossier) {
    var s = synthesize(dossier);
    var p = (dossier && dossier.projet) || emptyProjet();
    var fraisDossier = round2(s.aFinancer * 0.01);
    var mandat = round2(s.aFinancer * 0.01);
    var cr = (dossier && dossier.credits) || {};
    return {
      projetMens: s.mensHa,
      fraisDossier: fraisDossier,
      mandat: mandat,
      sousTotalMens: round2(s.mensHa),
      sousTotalCrd: round2(s.aFinancer + fraisDossier + mandat),
      rpMens: Number(cr.pret_immo_mens) || 0,
      rpCrd: Number(cr.pret_immo_crd) || 0,
      consoMens: Number(cr.pret_conso_mens) || 0,
      consoCrd: Number(cr.pret_conso_crd) || 0,
      totalMens: round2(s.mensHa + (Number(cr.pret_immo_mens) || 0) + (Number(cr.pret_conso_mens) || 0)),
      totalCrd: round2(s.aFinancer + fraisDossier + mandat + (Number(cr.pret_immo_crd) || 0) + (Number(cr.pret_conso_crd) || 0)),
      dti: s.dtiApres,
      rav: s.rav,
      ravPers: s.ravPers,
      taux: Number(p.taux) || 0,
    };
  }

  function displayName(person) {
    if (!person) return "";
    return ((person.prenom || "") + " " + (person.nom || "")).trim();
  }

  function typeLabel(id) {
    var t = SIM_TYPES.find(function (x) {
      return x.id === id;
    });
    return t ? t.label : id || "—";
  }

  function positionLabel(id) {
    var p = POSITIONS.find(function (x) {
      return x.id === id;
    });
    return p ? p.label : id || "—";
  }

  function housingLabel(id) {
    var h = HOUSING_STATUSES.find(function (x) {
      return x.id === id;
    });
    return h ? h.label : id || "—";
  }

  /**
   * PVH — capital dû après différé total (intérêts capitalisés mensuellement).
   * Ex. 10 000 € à 6 % → 18 194 € à 10 ans.
   */
  function pvhCapitalDue(principal, annualRatePct, years) {
    var P = Math.max(0, Number(principal) || 0);
    var r = (Number(annualRatePct) || 0) / 100 / 12;
    var n = Math.max(0, Math.round((Number(years) || 0) * 12));
    if (P <= 0) return 0;
    if (r <= 0 || n <= 0) return round2(P);
    return round2(P * Math.pow(1 + r, n));
  }

  function pvhTable(principal, annualRatePct, durations) {
    var yearsList = durations && durations.length ? durations : [5, 10, 15, 20];
    return yearsList.map(function (y) {
      return {
        years: y,
        amount: pvhCapitalDue(principal, annualRatePct, y),
      };
    });
  }

  return {
    SIM_TYPES: SIM_TYPES,
    HOUSING_STATUSES: HOUSING_STATUSES,
    POSITIONS: POSITIONS,
    PROF_SITUATIONS: PROF_SITUATIONS,
    CIVILITES: CIVILITES,
    MARITAL: MARITAL,
    IMMO_PROJECT_TYPES: IMMO_PROJECT_TYPES,
    LOGEMENT_TYPES: LOGEMENT_TYPES,
    emptyPerson: emptyPerson,
    emptyProjet: emptyProjet,
    emptyDossier: emptyDossier,
    sumRevenus: sumRevenus,
    sumCharges: sumCharges,
    synthesize: synthesize,
    consoDetail: consoDetail,
    monthlyPayment: monthlyPayment,
    displayName: displayName,
    typeLabel: typeLabel,
    positionLabel: positionLabel,
    housingLabel: housingLabel,
    pvhCapitalDue: pvhCapitalDue,
    pvhTable: pvhTable,
    euro: euro,
    round2: round2,
  };
})();
