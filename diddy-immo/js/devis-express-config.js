/**
 * Champs essentiels parcours rapide (devis-express.html) — par categorie et par need.
 */
(function (global) {
  function fieldRow(html) {
    return '<div class="grid">' + html + "</div>";
  }

  function select(name, label, options, required) {
    var req = "";
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
    var req = "";
    var t = type || "text";
    var extra = "";
    if (t === "email" || name === "email") extra = ' autocomplete="email" inputmode="email" enterkeyhint="next"';
    else if (t === "tel" || name === "phone") extra = ' autocomplete="tel-national" inputmode="tel" enterkeyhint="next"';
    else if (name === "fullName") extra = ' autocomplete="name"';
    else if (name === "street") extra = ' autocomplete="street-address"';
    else if (name === "postalCode") extra = ' autocomplete="postal-code" inputmode="numeric"';
    else if (name === "cityFull") extra = ' autocomplete="address-level2"';
    return (
      "<label>" +
      label +
      '<input id="' +
      name +
      '" name="' +
      name +
      '" type="' +
      t +
      '" placeholder="' +
      (placeholder || "") +
      '"' +
      extra +
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
          ], false) +
            input("vehiclePlate", "Plaque d'immatriculation", "text", "AA-123-BB", true)
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
      return (
        fieldRow(
          input("businessActivity", "Activite / metier", "text", "Ex. plombier", true) +
            select("legalForm", "Statut", [
              { v: "ei", t: "EI / micro" },
              { v: "sarl", t: "SARL / EURL" },
              { v: "sas", t: "SAS / SASU" },
            ], false)
        ) +
        fieldRow(
          input("companySiret", "SIREN (9) ou SIRET (14 chiffres)", "text", "123456789 ou 12345678901234", true)
        )
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
            { v: "vsp", t: "Voiture sans permis" },
            { v: "bateau", t: "Bateau" },
            { v: "autre", t: "Autre niche" },
        ]) +
          input("nicheAssetValue", "Valeur bien (EUR)", "text", "Facultatif", false)
      );
    },
  };

  var BY_NEED = {
    vtc: function () {
      return (
        fieldRow(
          select("vtcStatus", "Statut VTC", [
            { v: "actif", t: "Chauffeur actif" },
            { v: "creation", t: "Creation activite" },
          ]) +
            input("vtcCity", "Ville d activite", "text", "Ex. Paris", true)
        ) +
        fieldRow(
          input("vtcVehiclePlate", "Plaque d'immatriculation", "text", "AA-123-BB", true) +
            input("companySiret", "SIREN (9) ou SIRET (14 chiffres)", "text", "123456789 ou 12345678901234", true)
        )
      );
    },
    auto: function () {
      return (
        fieldRow(
          select("autoFormula", "Formule", [
            { v: "tiers", t: "Au tiers" },
            { v: "tous_risques", t: "Tous risques" },
          ]) +
            select("autoDriverProfile", "Conducteur", [
              { v: "standard", t: "Experimente" },
              { v: "jeune", t: "Jeune conducteur" },
            ], false)
        ) +
        fieldRow(input("autoPlate", "Plaque d'immatriculation", "text", "AA-123-BB", true))
      );
    },
    vsp: function () {
      return (
        fieldRow(
          select("vspDriverAgeBand", "Tranche d'age", [
            { v: "14-15", t: "14-15 ans" },
            { v: "16-17", t: "16-17 ans" },
            { v: "18-25", t: "18-25 ans" },
            { v: "26-45", t: "26-45 ans" },
            { v: "46+", t: "46 ans et plus" },
          ]) +
            select("vspBsrAm", "Permis AM / BSR", [
              { v: "oui", t: "Oui" },
              { v: "en_cours", t: "Formation en cours" },
              { v: "non", t: "Pas encore" },
            ])
        ) +
        fieldRow(
          select("vspBrand", "Marque", [
            { v: "aixam", t: "Aixam" },
            { v: "ligier", t: "Ligier" },
            { v: "microcar", t: "Microcar" },
            { v: "chatenet", t: "Chatenet" },
            { v: "autre", t: "Autre / je ne sais pas" },
          ]) +
            input("autoPlate", "Plaque d'immatriculation", "text", "AA-123-BB", true)
        )
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
      return (
        fieldRow(
          input("rcProActivity", "Activite", "text", "Ex. consultant", true) +
            select("rcProTurnover", "CA annuel", [
              { v: "moins50", t: "Moins de 50 kEUR" },
              { v: "50-150", t: "50 a 150 kEUR" },
              { v: "150plus", t: "Plus de 150 kEUR" },
            ], false)
        ) +
        fieldRow(
          input("companySiret", "SIREN (9) ou SIRET (14 chiffres)", "text", "123456789 ou 12345678901234", true)
        )
      );
    },
    decennale: function () {
      return (
        fieldRow(
          input("decennaleTrade", "Metier", "text", "Ex. maconnerie", true) +
            input("decennaleCa", "CA travaux (EUR)", "text", "Ex. 200000", true)
        ) +
        fieldRow(
          input("companySiret", "SIREN (9) ou SIRET (14 chiffres)", "text", "123456789 ou 12345678901234", true)
        )
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
          input("collectiveSiret", "SIREN (9) ou SIRET (14 chiffres)", "text", "123456789 ou 12345678901234", true) +
            input("collectiveBudget", "Budget cible par salarie / mois", "text", "Ex. 45 EUR", false)
        )
      );
    },
  };

  var MOBILITY_NEEDS = ["auto", "moto", "vtc", "vsp", "flotte", "temporaire", "caravane"];
  var PRO_NEEDS = [
    "rc-pro",
    "mrp",
    "decennale",
    "pj-pro",
    "dirigeant",
    "credit-pro",
    "tns",
    "collective",
    "flotte",
    "vtc",
  ];
  var PLATE_NAMES = [
    "autoPlate",
    "vtcVehiclePlate",
    "vehiclePlate",
    "motoPlate",
    "tempVehiclePlate",
    "fleetMainPlate",
    "rvPlate",
  ];
  var SIRET_NAMES = ["companySiret", "collectiveSiret", "siret"];

  function htmlHasName(html, names) {
    return names.some(function (n) {
      return html.indexOf('name="' + n + '"') !== -1;
    });
  }

  function fieldsHtmlForService(service) {
    var need = service.need;
    var html = "";
    if (typeof BY_NEED[need] === "function") html = BY_NEED[need]();
    else {
      var cat = service.category || "patrimoine";
      var fn = BY_CATEGORY[cat];
      html = fn ? fn() : BY_CATEGORY.patrimoine();
    }
    if (MOBILITY_NEEDS.indexOf(need) >= 0 && !htmlHasName(html, PLATE_NAMES)) {
      html += fieldRow(input("vehiclePlate", "Plaque d'immatriculation", "text", "AA-123-BB", true));
    }
    if (PRO_NEEDS.indexOf(need) >= 0 && !htmlHasName(html, SIRET_NAMES)) {
      html += fieldRow(
        input("companySiret", "SIREN (9) ou SIRET (14 chiffres)", "text", "123456789 ou 12345678901234", true)
      );
    }
    return html;
  }

  global.DEVIS_EXPRESS_CONFIG = {
    fieldsHtmlForService: fieldsHtmlForService,
  };
})(typeof window !== "undefined" ? window : global);
