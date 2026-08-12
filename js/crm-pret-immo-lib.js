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

  function emptyPerson() {
    return {
      civilite: "m",
      nom: "",
      prenom: "",
      birthdate: "",
      phone: "",
      email: "",
      situation: "Célibataire",
      profession: "",
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
    var totalRevenus = sumRevenus(d.revenus);
    var totalCharges = sumCharges(d.charges);
    var creditsGardes = Number(cr.pret_garder_mens) || 0;
    var crd =
      (Number(cr.pret_immo_crd) || 0) +
      (Number(cr.pret_conso_crd) || 0);
    var decouvert = Number(cr.decouvert) || 0;
    var projet = Number(cr.projet) || 0;
    var retards = Number((d.retards && d.retards.montant) || 0);
    var ira = Number(sim.ira) || 0;
    var frais = Number(sim.frais_operation) || 0;
    var honoraires = Number(sim.honoraires) || 0;
    var besoin =
      round2(crd + decouvert + projet + retards + ira + frais + honoraires) ||
      Number(cr.besoin_client) ||
      0;
    var mensARacheter =
      (Number(cr.pret_immo_mens) || 0) + (Number(cr.pret_conso_mens) || 0);
    var resteAVivre = round2(totalRevenus - totalCharges - creditsGardes);
    var dti =
      totalRevenus > 0
        ? round2(((totalCharges + creditsGardes + mensARacheter * 0.7) / totalRevenus) * 100)
        : 0;

    return {
      totalRevenus: totalRevenus,
      totalCharges: totalCharges,
      creditsGardes: creditsGardes,
      crd: crd,
      decouvert: decouvert,
      projet: projet,
      retards: retards,
      ira: ira,
      frais: frais,
      honoraires: honoraires,
      besoinTotal: besoin,
      mensARacheter: mensARacheter,
      resteAVivre: resteAVivre,
      dtiEstime: dti,
      avecHypo: !!sim.avec_hypo,
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

  return {
    SIM_TYPES: SIM_TYPES,
    HOUSING_STATUSES: HOUSING_STATUSES,
    POSITIONS: POSITIONS,
    PROF_SITUATIONS: PROF_SITUATIONS,
    CIVILITES: CIVILITES,
    MARITAL: MARITAL,
    emptyPerson: emptyPerson,
    emptyDossier: emptyDossier,
    sumRevenus: sumRevenus,
    sumCharges: sumCharges,
    synthesize: synthesize,
    displayName: displayName,
    typeLabel: typeLabel,
    positionLabel: positionLabel,
    housingLabel: housingLabel,
    euro: euro,
    round2: round2,
  };
})();
