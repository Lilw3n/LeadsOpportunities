/**
 * Champs essentiels parcours rapide (devis-express.html) — par categorie et par need.
 */
(function (global) {
  function fieldRow(html) {
    return '<div class="grid">' + html + "</div>";
  }

  function select(name, label, options, required) {
    var req = required !== false ? " required" : "";
    var opts = options
      .map(function (o) {
        return '<option value="' + o.v + '">' + o.t + "</option>";
      })
      .join("");
    return (
      "<label>" +
      label +
      '<select name="' +
      name +
      '"' +
      req +
      '><option value="">Choisir...</option>' +
      opts +
      "</select></label>"
    );
  }

  function input(name, label, type, placeholder, required) {
    var req = required !== false ? " required" : "";
    return (
      "<label>" +
      label +
      '<input name="' +
      name +
      '" type="' +
      (type || "text") +
      '" placeholder="' +
      (placeholder || "") +
      '"' +
      req +
      " /></label>"
    );
  }

  var BY_CATEGORY = {
    mobilite: function () {
      return (
        fieldRow(
          select("vehicleType", "Type de vehicule", [
            { v: "auto", t: "Voiture" },
            { v: "moto", t: "Moto / scooter" },
            { v: "utilitaire", t: "Utilitaire" },
            { v: "autre", t: "Autre" },
          ]) +
            select("vehicleUsage", "Usage", [
              { v: "prive", t: "Prive" },
              { v: "pro", t: "Professionnel" },
            ])
        ) +
        fieldRow(
          select("currentInsurerMob", "Assurance actuelle", [
            { v: "aucun", t: "Pas encore assure" },
            { v: "en_cours", t: "Contrat en cours" },
            { v: "resilie", t: "Resiliation recente" },
          ], false)
        )
      );
    },
    sante: function () {
      return fieldRow(
        select("householdType", "Profil", [
          { v: "solo", t: "Moi seul(e)" },
          { v: "couple", t: "Couple" },
          { v: "famille", t: "Famille" },
        ]) +
          select("healthPriority", "Priorite", [
            { v: "hospitalisation", t: "Hospitalisation" },
            { v: "dentaire", t: "Dentaire / optique" },
            { v: "budget", t: "Petit budget" },
          ])
      );
    },
    habitat: function () {
      return fieldRow(
        select("propertyType", "Logement", [
          { v: "appart", t: "Appartement" },
          { v: "maison", t: "Maison" },
        ]) +
          select("occupancyStatus", "Statut", [
            { v: "locataire", t: "Locataire" },
            { v: "proprio", t: "Proprietaire" },
            { v: "pno", t: "Bailleur PNO" },
          ])
      );
    },
    finance: function () {
      return fieldRow(
        select("financeProject", "Projet", [
          { v: "achat", t: "Achat immobilier" },
          { v: "rachat", t: "Rachat de credits" },
          { v: "conso", t: "Credit consommation" },
          { v: "renegociation", t: "Renegociation" },
        ]) +
          input("financeAmount", "Montant (EUR)", "text", "Ex. 180000", true)
      );
    },
    pro: function () {
      return fieldRow(
        input("businessActivity", "Activite / metier", "text", "Ex. plombier", true) +
          select("legalForm", "Statut", [
            { v: "ei", t: "EI / micro" },
            { v: "sarl", t: "SARL / EURL" },
            { v: "sas", t: "SAS / SASU" },
          ], false)
      );
    },
    patrimoine: function () {
      return fieldRow(
        select("patrimonyGoal", "Objectif", [
          { v: "epargne", t: "Epargne" },
          { v: "retraite", t: "Retraite" },
          { v: "protection", t: "Protection famille" },
          { v: "gav", t: "Accidents de la vie" },
        ]) +
          select("riskProfile", "Profil", [
            { v: "prudent", t: "Prudent" },
            { v: "equilibre", t: "Equilibre" },
            { v: "dynamique", t: "Dynamique" },
          ], false)
      );
    },
    animaux: function () {
      return fieldRow(
        select("petSpecies", "Animal", [
          { v: "chien", t: "Chien" },
          { v: "chat", t: "Chat" },
        ]) +
          select("petIdentification", "Identification", [
            { v: "puce", t: "Puce electronique" },
            { v: "tatouage", t: "Tatouage" },
            { v: "en_cours", t: "En cours" },
          ])
      );
    },
    niches: function () {
      return fieldRow(
        select("nicheProduct", "Produit", [
          { v: "chasse", t: "Chasse" },
          { v: "equitation", t: "Equitation" },
          { v: "bateau", t: "Bateau" },
          { v: "autre", t: "Autre niche" },
        ]) +
          input("nicheAssetValue", "Valeur bien (EUR)", "text", "Facultatif", false)
      );
    },
  };

  var BY_NEED = {
    vtc: function () {
      return fieldRow(
        select("vtcStatus", "Statut VTC", [
          { v: "actif", t: "Chauffeur actif" },
          { v: "creation", t: "Creation activite" },
        ]) +
          input("vtcCity", "Ville d activite", "text", "Ex. Paris", true)
      );
    },
    auto: function () {
      return fieldRow(
        select("autoFormula", "Formule", [
          { v: "tiers", t: "Au tiers" },
          { v: "tous_risques", t: "Tous risques" },
        ]) +
          select("autoDriverProfile", "Conducteur", [
            { v: "standard", t: "Experimente" },
            { v: "jeune", t: "Jeune conducteur" },
          ], false)
      );
    },
    emprunteur: function () {
      return fieldRow(
        select("borrowerGoal", "Projet", [
          { v: "nouveau", t: "Nouveau pret" },
          { v: "lemoine", t: "Changement (Lemoine)" },
        ]) +
          input("borrowerRemaining", "Capital restant (EUR)", "text", "Ex. 150000", false)
      );
    },
    "rc-pro": function () {
      return fieldRow(
        input("rcProActivity", "Activite", "text", "Ex. consultant", true) +
          select("rcProTurnover", "CA annuel", [
            { v: "moins50", t: "Moins de 50 kEUR" },
            { v: "50-150", t: "50 a 150 kEUR" },
            { v: "150plus", t: "Plus de 150 kEUR" },
          ], false)
      );
    },
    decennale: function () {
      return fieldRow(
        input("decennaleTrade", "Metier", "text", "Ex. maconnerie", true) +
          input("decennaleCa", "CA travaux (EUR)", "text", "Ex. 200000", true)
      );
    },
    collective: function () {
      return (
        fieldRow(
          input("collectiveCompany", "Raison sociale", "text", "Ex. SARL Dupont", true) +
            input("collectiveHeadcount", "Effectif a couvrir", "number", "Ex. 12", true)
        ) +
        fieldRow(
          select("collectiveStatus", "Statut majoritaire", [
            { v: "cadres", t: "Cadres" },
            { v: "non_cadres", t: "Non-cadres" },
            { v: "ensemble", t: "Ensemble du personnel" },
          ]) +
            select("collectiveCurrent", "Contrat actuel", [
              { v: "aucun", t: "Pas de mutuelle" },
              { v: "en_cours", t: "Mutuelle en cours" },
              { v: "renouvellement", t: "Renouvellement / mise en concurrence" },
            ])
        ) +
        fieldRow(
          input("collectiveSiret", "SIRET (facultatif)", "text", "14 chiffres", false) +
            input("collectiveBudget", "Budget cible par salarie / mois", "text", "Ex. 45 EUR", false)
        )
      );
    },
    chasse: function () {
      return fieldRow(
        select("huntLicense", "Permis de chasser", [
          { v: "oui", t: "Oui, valide" },
          { v: "formation", t: "En formation" },
        ]) +
          select("huntCover", "Couverture", [
            { v: "rc", t: "RC chasseur" },
            { v: "journee", t: "Journee / passage" },
            { v: "saison", t: "Saison complete" },
          ])
      );
    },
    equitation: function () {
      return (
        fieldRow(
          select("equineRole", "Vous etes", [
            { v: "cavalier", t: "Cavalier particulier" },
            { v: "proprietaire", t: "Proprietaire de cheval" },
            { v: "ecurie", t: "Ecurie / centre equestre" },
            { v: "moniteur", t: "Moniteur / enseignant" },
          ]) +
            select("equineCover", "Couverture recherchee", [
              { v: "rc", t: "RC equestre" },
              { v: "mortalite", t: "Mortalite cheval" },
              { v: "veto", t: "Frais veterinaires" },
              { v: "materiel", t: "Materiel equestre" },
              { v: "pack", t: "Pack complet" },
            ])
        ) +
        fieldRow(
          select("equineDiscipline", "Discipline", [
            { v: "loisir", t: "Loisir" },
            { v: "cso", t: "CSO / dressage" },
            { v: "course", t: "Courses / galop" },
          ], false) +
            input("equineHorseCount", "Nombre de chevaux", "number", "Ex. 1", false)
        )
      );
    },
    bateau: function () {
      return fieldRow(
        select("boatType", "Type de bateau", [
          { v: "voilier", t: "Voilier" },
          { v: "moteur", t: "Bateau a moteur" },
          { v: "jet", t: "Jet-ski" },
        ]) +
          select("boatZone", "Zone de navigation", [
            { v: "cotiere", t: "Cotiere" },
            { v: "large", t: "Large" },
            { v: "fluvial", t: "Fluvial" },
          ])
      );
    },
    caravane: function () {
      return fieldRow(
        select("rvType", "Type", [
          { v: "caravane", t: "Caravane" },
          { v: "cc", t: "Camping-car" },
          { v: "fourgon", t: "Fourgon amenage" },
        ]) +
          input("rvYear", "Annee", "text", "Ex. 2018", true)
      );
    },
    instrument: function () {
      return fieldRow(
        input("musicInstrument", "Instrument", "text", "Ex. violon", true) +
          select("musicUsage", "Usage", [
            { v: "perso", t: "Personnel" },
            { v: "pro", t: "Professionnel / scene" },
          ])
      );
    },
    "materiel-photo": function () {
      return fieldRow(
        select("photoUsage", "Usage", [
          { v: "amateur", t: "Amateur passionne" },
          { v: "pro", t: "Professionnel" },
        ]) +
          input("photoKitValue", "Valeur du materiel (EUR)", "text", "Ex. 12000", true)
      );
    },
  };

  function fieldsHtmlForService(service) {
    var need = service.need;
    if (typeof BY_NEED[need] === "function") return BY_NEED[need]();
    var cat = service.category || "patrimoine";
    var fn = BY_CATEGORY[cat];
    if (fn) return fn();
    return BY_CATEGORY.patrimoine();
  }

  global.DEVIS_EXPRESS_CONFIG = {
    fieldsHtmlForService: fieldsHtmlForService,
  };
})(typeof window !== "undefined" ? window : global);
