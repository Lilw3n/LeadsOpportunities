/**
 * Configuration questionnaire devis — etapes par categorie et par produit (need).
 * Utilise par landings/devis-steps.js
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

  function textarea(name, label, placeholder, required) {
    var req = required !== false ? " required" : "";
    return (
      "<label>" +
      label +
      '<textarea name="' +
      name +
      '" rows="3" placeholder="' +
      (placeholder || "") +
      '"' +
      req +
      "></textarea></label>"
    );
  }

  function wizardSection(stepName, title, body, hidden) {
    return (
      '<section class="wizard-step"' +
      (hidden !== false ? " hidden" : "") +
      ' data-step="context" data-step-name="' +
      stepName +
      '">' +
      "<h3>" +
      title +
      "</h3>" +
      body +
      "</section>"
    );
  }

  function animauxWizardSection() {
    return wizardSection(
      "animaux",
      "Votre animal de compagnie",
      fieldRow(
        select("petSpecies", "Espece", [
          { v: "chien", t: "Chien" },
          { v: "chat", t: "Chat" },
          { v: "nac", t: "NAC (lapin, furet…)" },
          { v: "autre", t: "Autre" },
        ]) +
          input("petName", "Prenom de l animal (facultatif)", "text", "Ex. Max", false)
      ) +
        fieldRow(
          select("petAge", "Age", [
            { v: "0-1", t: "Moins de 1 an" },
            { v: "1-4", t: "1 a 4 ans" },
            { v: "4-7", t: "4 a 7 ans" },
            { v: "7plus", t: "Plus de 7 ans" },
          ]) +
            input("petBirthDate", "Date de naissance (si connue)", "date", "", false)
        ) +
        fieldRow(
          input("petBreed", "Race (si connue)", "text", "Ex. Labrador", false) +
            select("petSex", "Sexe", [
              { v: "male", t: "Male" },
              { v: "female", t: "Femelle" },
            ])
        ) +
        fieldRow(
          select("petIdentification", "Identification", [
            { v: "puce", t: "Puce electronique" },
            { v: "tatouage", t: "Tatouage" },
            { v: "en_cours", t: "En cours (chiot/chaton)" },
            { v: "aucun", t: "Aucune pour l instant" },
          ]) +
            input("petChipNumber", "Numero de puce (15 chiffres)", "text", "Facultatif", false)
        ) +
        fieldRow(
          select("petSterilized", "Sterilise / castre", [
            { v: "oui", t: "Oui" },
            { v: "non", t: "Non" },
            { v: "ns", t: "Je ne sais pas" },
          ]) +
            select("petVaccinated", "Vaccins a jour", [
              { v: "oui", t: "Oui" },
              { v: "non", t: "Non" },
              { v: "en_cours", t: "Carnet en cours" },
            ], false)
        ) +
        fieldRow(
          select("petCurrentInsurance", "Assurance actuelle", [
            { v: "aucune", t: "Aucune" },
            { v: "en_cours", t: "Contrat en cours" },
            { v: "resiliation", t: "Resiliation / changement" },
          ], false) +
            select("petHealthHistory", "Antecedents sante", [
              { v: "aucun", t: "Aucun probleme connu" },
              { v: "chronique", t: "Maladie chronique" },
              { v: "operation", t: "Operation recente (< 12 mois)" },
              { v: "ns", t: "Je ne sais pas" },
            ], false)
        ) +
        fieldRow(
          select("petCoverageGoal", "Priorite couverture", [
            { v: "accident", t: "Accidents" },
            { v: "maladie", t: "Maladies" },
            { v: "prevention", t: "Prevention (vaccins, vermifuge)" },
            { v: "complet", t: "Formule complete" },
          ]) +
            select("petJourneyPreference", "Parcours souhaite", [
              { v: "complet", t: "Complet avec tarif indicatif" },
              { v: "rapide", t: "Rappel rapide" },
            ], false)
        ) +
        '<p class="small"><strong>Deux parcours :</strong> <a href="./animaux-express.html">Rapide (~1 min)</a> · <a href="./animaux.html">Complet avec comparatif et tarif</a>.</p>'
    );
  }

  /* ——— Contexte par categorie ——— */

  var CATEGORY_CONTEXT = {
    mobilite: function () {
      return wizardSection(
        "mobilite",
        "Votre vehicule",
        fieldRow(
          select("vehicleType", "Type de vehicule", [
            { v: "auto", t: "Voiture" },
            { v: "vsp", t: "Voiture sans permis" },
            { v: "moto", t: "Moto / scooter" },
            { v: "utilitaire", t: "Utilitaire" },
            { v: "autre", t: "Autre" },
          ]) +
            input("vehicleYear", "Annee du vehicule", "text", "Ex. 2019", true)
        ) +
          fieldRow(
            select("vehicleUsage", "Usage principal", [
              { v: "prive", t: "Prive" },
              { v: "pro", t: "Professionnel" },
              { v: "mixte", t: "Mixte" },
            ]) +
              select("currentInsurerMob", "Assureur actuel", [
                { v: "aucun", t: "Pas encore assure" },
                { v: "en_cours", t: "Contrat en cours" },
                { v: "resilie", t: "Resilie recemment" },
              ])
          ) +
          fieldRow(
            select("bonusMalus", "Bonus-malus (si connu)", [
              { v: "", t: "Je ne sais pas" },
              { v: "50", t: "50" },
              { v: "0.50", t: "0,50" },
              { v: "1.00", t: "1,00 et plus" },
            ], false) +
              input("claims24Months", "Sinistres sur 24 mois", "number", "Ex. 0", false)
          ) +
          fieldRow(
            input("driverAge", "Age du conducteur", "number", "Ex. 32", false) +
              input("garageDepartment", "Departement de garage", "text", "Ex. 75", false)
          ) +
          '<label class="field-check"><input type="checkbox" name="isFleet" value="oui" /> <span>Plusieurs vehicules a assurer</span></label>'
      );
    },

    sante: function () {
      return wizardSection(
        "sante",
        "Votre profil sante",
        fieldRow(
          select("householdType", "Qui souhaitez-vous couvrir ?", [
            { v: "solo", t: "Moi seul(e)" },
            { v: "couple", t: "Couple" },
            { v: "famille", t: "Famille avec enfants" },
          ]) +
            input("householdCount", "Nombre de personnes", "text", "Ex. 3", true)
        ) +
          fieldRow(
            select("currentHealthCover", "Couverture actuelle", [
              { v: "secu", t: "Securite sociale seule" },
              { v: "mutuelle", t: "Mutuelle en cours" },
              { v: "employeur", t: "Mutuelle employeur" },
            ]) +
              select("healthPriority", "Priorite principale", [
                { v: "hospitalisation", t: "Hospitalisation" },
                { v: "dentaire", t: "Dentaire / optique" },
                { v: "equilibre", t: "Equilibre global" },
                { v: "budget", t: "Petit budget" },
              ])
          )
      );
    },

    habitat: function () {
      return wizardSection(
        "habitat",
        "Votre logement",
        fieldRow(
          select("propertyType", "Type de bien", [
            { v: "appart", t: "Appartement" },
            { v: "maison", t: "Maison" },
            { v: "local", t: "Local / dependance" },
          ]) +
            select("occupancyStatus", "Vous etes", [
              { v: "locataire", t: "Locataire" },
              { v: "proprio", t: "Proprietaire occupant" },
              { v: "pno", t: "Proprietaire non occupant" },
            ])
        ) +
          fieldRow(
            input("propertySurface", "Surface approximative (m2)", "text", "Ex. 65", true) +
              select("habitationUse", "Usage", [
                { v: "principal", t: "Residence principale" },
                { v: "secondaire", t: "Residence secondaire" },
                { v: "location", t: "Location" },
              ])
          )
      );
    },

    finance: function () {
      return wizardSection(
        "finance",
        "Votre projet de financement",
        fieldRow(
          select("financeProject", "Nature du projet", [
            { v: "achat", t: "Achat immobilier" },
            { v: "rachat", t: "Rachat de credits" },
            { v: "conso", t: "Credit consommation" },
            { v: "pro", t: "Investissement pro" },
            { v: "renegociation", t: "Renegociation" },
          ]) +
            input("financeAmount", "Montant souhaite (EUR)", "text", "Ex. 180000", true)
        ) +
          fieldRow(
            select("employmentStatus", "Situation professionnelle", [
              { v: "cdi", t: "CDI" },
              { v: "cdd", t: "CDD / interim" },
              { v: "indep", t: "Independant / TNS" },
              { v: "retraite", t: "Retraite" },
              { v: "autre", t: "Autre" },
            ]) +
              input("monthlyIncome", "Revenus mensuels nets foyer (EUR)", "text", "Ex. 3500", true)
          )
      );
    },

    pro: function () {
      return wizardSection(
        "pro",
        "Votre activite professionnelle",
        fieldRow(
          input("businessActivity", "Activite / metier", "text", "Ex. consultant IT", true) +
            select("legalForm", "Forme juridique", [
              { v: "ei", t: "Entreprise individuelle" },
              { v: "sarl", t: "SARL / EURL" },
              { v: "sas", t: "SAS / SASU" },
              { v: "autre", t: "Autre" },
            ])
        ) +
          fieldRow(
            input("employeeCount", "Nombre de salaries", "text", "0 si seul", true) +
              input("annualRevenue", "Chiffre d affaires annuel (EUR)", "text", "Facultatif", false)
          ) +
          '<label class="field-check"><input type="checkbox" name="hasCompany" value="1" /> <span>J ai une structure immatriculee (SIRET)</span></label>' +
          '<div data-company-fields hidden>' +
          fieldRow(
            input("companyName", "Raison sociale", "text", "", false) +
              input("companySiret", "SIRET", "text", "14 chiffres", false)
          ) +
          "</div>"
      );
    },

    patrimoine: function () {
      return wizardSection(
        "patrimoine",
        "Vos objectifs patrimoniaux",
        fieldRow(
          select("patrimonyGoal", "Objectif principal", [
            { v: "epargne", t: "Epargner / placer" },
            { v: "retraite", t: "Preparer la retraite" },
            { v: "transmission", t: "Transmission" },
            { v: "protection", t: "Proteger la famille" },
            { v: "gav", t: "Accidents de la vie" },
          ]) +
            select("investHorizon", "Horizon", [
              { v: "court", t: "Moins de 5 ans" },
              { v: "moyen", t: "5 a 10 ans" },
              { v: "long", t: "Plus de 10 ans" },
            ])
        ) +
          fieldRow(
            input("initialAmount", "Montant a placer (EUR)", "text", "Facultatif", false) +
              select("riskProfile", "Profil", [
                { v: "prudent", t: "Prudent" },
                { v: "equilibre", t: "Equilibre" },
                { v: "dynamique", t: "Dynamique" },
              ])
          )
      );
    },

    animaux: function () {
      return animauxWizardSection();
    },

    niches: function () {
      return wizardSection(
        "niches",
        "Votre assurance de niche",
        fieldRow(
          select("nicheProduct", "Produit concerne", [
            { v: "chasse", t: "Chasse" },
            { v: "equitation", t: "Equitation / cheval" },
            { v: "instrument", t: "Instrument de musique" },
            { v: "materiel-photo", t: "Materiel photo / video" },
            { v: "bateau", t: "Bateau plaisance" },
            { v: "caravane", t: "Caravane / camping-car" },
            { v: "autre", t: "Autre niche" },
          ]) +
            select("nicheUsage", "Usage principal", [
              { v: "loisir", t: "Loisir / particulier" },
              { v: "pro", t: "Professionnel" },
              { v: "association", t: "Association / club" },
            ])
        ) +
          fieldRow(
            input("nicheAssetValue", "Valeur du bien assure (EUR)", "text", "Ex. 5000", false) +
              select("nicheExperience", "Experience / anciennete", [
                { v: "debutant", t: "Debutant" },
                { v: "intermediaire", t: "2 a 5 ans" },
                { v: "confirme", t: "Plus de 5 ans" },
              ], false)
          ) +
          textarea("nicheDetails", "Precision sur votre besoin", "Activite, zone, saison, sinistres…", false)
      );
    },
  };

  /* ——— Etapes specifiques par produit (need) ——— */

  var NEED_OVERLAYS = {
    vtc: function () {
      return wizardSection(
        "vtc",
        "Profil chauffeur VTC",
        fieldRow(
          select("vtcStatus", "Statut", [
            { v: "actif", t: "Chauffeur actif (Uber, Bolt…)" },
            { v: "creation", t: "Creation d activite" },
            { v: "reprise", t: "Reprise / changement assureur" },
          ]) +
            select("vtcPlatform", "Plateforme principale", [
              { v: "uber", t: "Uber" },
              { v: "bolt", t: "Bolt" },
              { v: "heetch", t: "Heetch" },
              { v: "autre", t: "Autre / multi-plateformes" },
            ])
        ) +
          fieldRow(
            input("vtcCity", "Ville d activite", "text", "Ex. Paris", true) +
              input("vtcAnnualKm", "Km annuels estimes", "text", "Ex. 35000", false)
          ) +
          fieldRow(
            select("vtcVehicleCover", "Garanties souhaitees", [
              { v: "rc", t: "RC pro minimum" },
              { v: "etendu", t: "Tiers etendu + RC" },
              { v: "tous_risques", t: "Tous risques" },
            ]) +
              input("vtcVehiclePlate", "Immatriculation (facultatif)", "text", "AA-123-BB", false)
          )
      );
    },

    flotte: function () {
      return wizardSection(
        "flotte",
        "Votre flotte",
        fieldRow(
          input("fleetVehicleCount", "Nombre de vehicules", "number", "Ex. 5", true) +
            select("fleetVehicleTypes", "Types de vehicules", [
              { v: "vl", t: "Voitures legères" },
              { v: "util", t: "Utilitaires" },
              { v: "mix", t: "Mixte" },
            ])
        ) +
          fieldRow(
            select("fleetManagement", "Gestion", [
              { v: "interne", t: "Gestion interne" },
              { v: "loueur", t: "Location longue duree" },
              { v: "leasing", t: "Leasing / LOA" },
            ]) +
              input("fleetMainCity", "Ville principale d exploitation", "text", "Ex. Lyon", true)
          )
      );
    },

    temporaire: function () {
      return wizardSection(
        "temporaire",
        "Assurance temporaire",
        fieldRow(
          select("tempDuration", "Duree souhaitee", [
            { v: "1-7", t: "1 a 7 jours" },
            { v: "8-30", t: "8 a 30 jours" },
            { v: "1-3m", t: "1 a 3 mois" },
          ]) +
            input("tempStartDate", "Date de debut souhaitee", "date", "", true)
        ) +
          fieldRow(
            select("tempReason", "Motif", [
              { v: "achat", t: "Achat vehicule" },
              { v: "pret", t: "Pret vehicule" },
              { v: "depannage", t: "Remplacement" },
              { v: "autre", t: "Autre" },
            ]) +
              input("tempVehicleId", "Marque / modele vehicule", "text", "Ex. Peugeot 208", true)
          )
      );
    },

    moto: function () {
      return wizardSection(
        "moto",
        "Deux-roues",
        fieldRow(
          select("motoType", "Type", [
            { v: "moto", t: "Moto" },
            { v: "scooter", t: "Scooter" },
            { v: "cyclo", t: "Cyclomoteur" },
          ]) +
            input("motoCylinder", "Cylindree (cm3)", "text", "Ex. 125", true)
        ) +
          fieldRow(
            select("motoUsage", "Usage", [
              { v: "prive", t: "Prive" },
              { v: "pro", t: "Professionnel (livraison…)" },
            ]) +
              input("motoGarageZip", "Code postal garage", "text", "75001", true)
          )
      );
    },

    auto: function () {
      return wizardSection(
        "auto",
        "Assurance automobile",
        fieldRow(
          input("autoMakeModel", "Marque et modele", "text", "Ex. Renault Clio", true) +
            input("autoYear", "Annee de mise en circulation", "text", "Ex. 2020", true)
        ) +
          fieldRow(
            select("autoFormula", "Formule souhaitee", [
              { v: "tiers", t: "Au tiers" },
              { v: "tiers_etendu", t: "Tiers etendu" },
              { v: "tous_risques", t: "Tous risques" },
            ]) +
              select("autoParking", "Stationnement habituel", [
                { v: "garage", t: "Garage / box" },
                { v: "parking", t: "Parking prive" },
                { v: "voie", t: "Voie publique" },
              ])
          ) +
          fieldRow(
            select("autoDriverProfile", "Profil conducteur principal", [
              { v: "standard", t: "Conducteur experimente" },
              { v: "jeune", t: "Jeune conducteur (- 3 ans permis)" },
              { v: "second", t: "Second conducteur a declarer" },
            ]) +
              select("autoCurrentContract", "Contrat actuel", [
                { v: "aucun", t: "Pas encore assure" },
                { v: "en_cours", t: "Assurance en cours" },
                { v: "resiliation", t: "Resiliation / sans interruption" },
              ])
          ) +
          fieldRow(
            input("autoPlate", "Immatriculation (facultatif)", "text", "AA-123-BB", false) +
              input("autoAnnualKm", "Km annuels estimes", "text", "Ex. 12000", false)
          )
      );
    },

    sante: function () {
      return wizardSection(
        "sante",
        "Mutuelle sante",
        fieldRow(
          select("healthStatus", "Votre statut", [
            { v: "salarie", t: "Salarie" },
            { v: "tns", t: "Independant / TNS" },
            { v: "retraite", t: "Retraite" },
            { v: "etudiant", t: "Etudiant" },
            { v: "autre", t: "Autre" },
          ]) +
            input("healthAge", "Age de l assure principal", "number", "Ex. 38", true)
        ) +
          fieldRow(
            select("healthHousehold", "Qui assurer ?", [
              { v: "solo", t: "Moi seul(e)" },
              { v: "couple", t: "Couple" },
              { v: "famille", t: "Famille (enfants)" },
            ]) +
              select("healthCurrent", "Mutuelle actuelle", [
                { v: "aucune", t: "Aucune / securite sociale seule" },
                { v: "employeur", t: "Mutuelle employeur" },
                { v: "individuelle", t: "Contrat individuel" },
                { v: "changement", t: "Changement / mise en concurrence" },
              ])
          ) +
          fieldRow(
            select("healthNeeds", "Postes prioritaires", [
              { v: "hospitalisation", t: "Hospitalisation" },
              { v: "dentaire", t: "Dentaire" },
              { v: "optique", t: "Optique" },
              { v: "equilibre", t: "Equilibre global" },
            ]) +
              select("healthRenewal", "Echeance du contrat", [
                { v: "immediat", t: "Des que possible" },
                { v: "1-3m", t: "Dans 1 a 3 mois" },
                { v: "plus3m", t: "Plus de 3 mois" },
                { v: "ns", t: "Pas de contrat en cours" },
              ], false)
          )
      );
    },

    habitation: function () {
      return wizardSection(
        "habitation",
        "Assurance habitation",
        fieldRow(
          select("homeType", "Type de logement", [
            { v: "appart", t: "Appartement" },
            { v: "maison", t: "Maison" },
            { v: "studio", t: "Studio / T1" },
          ]) +
            select("homeStatus", "Vous etes", [
              { v: "locataire", t: "Locataire" },
              { v: "proprio", t: "Proprietaire occupant" },
              { v: "coloc", t: "Colocation" },
            ])
        ) +
          fieldRow(
            input("homeSurface", "Surface (m2)", "text", "Ex. 65", true) +
              input("homeCity", "Ville du logement", "text", "Ex. Nantes", true)
          ) +
          fieldRow(
            select("homeOccupancy", "Occupation", [
              { v: "rp", t: "Residence principale" },
              { v: "secondaire", t: "Residence secondaire" },
              { v: "location", t: "Location meublee (bailleur)" },
            ]) +
              select("homeValuables", "Valeur du mobilier estimee", [
                { v: "moins15", t: "Moins de 15 000 EUR" },
                { v: "15-30", t: "15 000 a 30 000 EUR" },
                { v: "plus30", t: "Plus de 30 000 EUR" },
              ], false)
          ) +
          fieldRow(
            select("homeClaims", "Sinistres habitation 3 ans", [
              { v: "aucun", t: "Aucun" },
              { v: "1", t: "1 sinistre" },
              { v: "2plus", t: "2 et plus" },
            ], false) +
              select("homeCurrent", "Contrat actuel", [
                { v: "aucun", t: "Pas encore assure" },
                { v: "en_cours", t: "Contrat en cours" },
                { v: "echeance", t: "Echeance proche" },
              ], false)
          )
      );
    },

    mrh: function () {
      return wizardSection(
        "mrh",
        "Multirisque habitation",
        fieldRow(
          select("mrhProperty", "Bien assure", [
            { v: "appart", t: "Appartement" },
            { v: "maison", t: "Maison individuelle" },
            { v: "dependance", t: "Maison + dependances" },
          ]) +
            select("mrhStatus", "Statut", [
              { v: "locataire", t: "Locataire" },
              { v: "proprio", t: "Proprietaire occupant" },
              { v: "pno", t: "Proprietaire bailleur" },
            ])
        ) +
          fieldRow(
            input("mrhSurface", "Surface habitable (m2)", "text", "Ex. 95", true) +
              input("mrhRebuildValue", "Valeur de reconstruction (EUR)", "text", "Ex. 180000", false)
          ) +
          fieldRow(
            select("mrhOptions", "Garanties recherchees", [
              { v: "standard", t: "Pack standard (incendie, degats eaux, vol)" },
              { v: "etendu", t: "Etendu (objets valeur, piscine…)" },
              { v: "premium", t: "Premium / tous risques habitation" },
            ]) +
              select("mrhAlarm", "Securite du logement", [
                { v: "aucune", t: "Sans alarme" },
                { v: "alarme", t: "Alarme / detecteurs" },
                { v: "videosurveillance", t: "Videosurveillance" },
              ], false)
          )
      );
    },

    rachat: function () {
      return wizardSection(
        "rachat",
        "Rachat de credits",
        fieldRow(
          select("restructureGoal", "Objectif", [
            { v: "mensualites", t: "Baisser les mensualites" },
            { v: "tresorerie", t: "Degager de la tresorerie" },
            { v: "les_deux", t: "Les deux" },
          ]) +
            input("restructureMonthly", "Mensualites actuelles totales (EUR)", "text", "Ex. 1200", true)
        ) +
          fieldRow(
            input("restructureDebt", "Encours total estime (EUR)", "text", "Ex. 85000", true) +
              select("restructureCredits", "Types de credits", [
                { v: "conso", t: "Credits consommation" },
                { v: "immo", t: "Pret immobilier inclus" },
                { v: "mix", t: "Mixte" },
              ])
          ) +
          fieldRow(
            select("restructureSituation", "Situation", [
              { v: "stable", t: "Revenus stables" },
              { v: "baisse", t: "Revenus en baisse" },
              { v: "incident", t: "Incident bancaire / fichage" },
            ], false) +
              input("restructureProperty", "Bien immobilier en garantie ?", "text", "Oui / Non / A preciser", false)
          )
      );
    },

    conso: function () {
      return wizardSection(
        "conso",
        "Credit consommation",
        fieldRow(
          select("consoProject", "Projet", [
            { v: "vehicule", t: "Vehicule" },
            { v: "travaux", t: "Travaux" },
            { v: "personnel", t: "Projet personnel" },
            { v: "autre", t: "Autre" },
          ]) +
            input("consoAmount", "Montant souhaite (EUR)", "text", "Ex. 15000", true)
        ) +
          fieldRow(
            select("consoDuration", "Duree souhaitee", [
              { v: "12-36", t: "12 a 36 mois" },
              { v: "37-60", t: "37 a 60 mois" },
              { v: "60plus", t: "Plus de 60 mois" },
            ]) +
              select("consoEmployment", "Situation pro", [
                { v: "cdi", t: "CDI" },
                { v: "cdd", t: "CDD / interim" },
                { v: "indep", t: "Independant" },
                { v: "retraite", t: "Retraite" },
              ])
          ) +
          fieldRow(
            select("consoExisting", "Credits en cours", [
              { v: "non", t: "Non" },
              { v: "oui_leger", t: "Oui, charge legere" },
              { v: "oui_important", t: "Oui, charge importante" },
            ], false) +
              input("consoDownPayment", "Apport (EUR)", "text", "Facultatif", false)
          )
      );
    },

    "credit-pro": function () {
      return wizardSection(
        "credit-pro",
        "Credit professionnel",
        fieldRow(
          input("proCreditActivity", "Activite financee", "text", "Ex. achat materiel BTP", true) +
            input("proCreditAmount", "Montant (EUR)", "text", "Ex. 50000", true)
        ) +
          fieldRow(
            select("proCreditHorizon", "Horizon de remboursement", [
              { v: "court", t: "Moins de 3 ans" },
              { v: "moyen", t: "3 a 7 ans" },
              { v: "long", t: "Plus de 7 ans" },
            ]) +
              input("proCreditCompanyAge", "Anciennete de l entreprise (ans)", "text", "Ex. 4", true)
          ) +
          fieldRow(
            select("proCreditGuarantee", "Garanties disponibles", [
              { v: "ca", t: "CA / bilans" },
              { v: "hypo", t: "Hypotheque personnelle" },
              { v: "caution", t: "Caution / garantie BPI" },
              { v: "a_definir", t: "A definir avec le conseiller" },
            ], false) +
              textarea("proCreditDetails", "Precision", "Equipement, tresorerie, BFR…", false)
          )
      );
    },

    renegociation: function () {
      return wizardSection(
        "renegociation",
        "Renegociation de pret",
        fieldRow(
          input("renoInitial", "Capital restant du (EUR)", "text", "Ex. 185000", true) +
            input("renoRate", "Taux actuel (%)", "text", "Ex. 3,45", true)
        ) +
          fieldRow(
            input("renoMonthly", "Mensualite actuelle (EUR)", "text", "Ex. 980", true) +
              select("renoBank", "Banque actuelle", [
                { v: "grand_reseau", t: "Grand reseau" },
                { v: "mutuelle", t: "Banque mutualiste" },
                { v: "en_ligne", t: "Banque en ligne" },
                { v: "autre", t: "Autre" },
              ], false)
          ) +
          fieldRow(
            select("renoGoal", "Objectif", [
              { v: "taux", t: "Baisser le taux" },
              { v: "duree", t: "Ajuster la duree" },
              { v: "assurance", t: "Pret + assurance emprunteur" },
            ]) +
              select("renoTiming", "Souhaitez-vous", [
                { v: "urgent", t: "Etude rapide" },
                { v: "echeance", t: "A l echeance du pret" },
                { v: "info", t: "Simple simulation" },
              ], false)
          )
      );
    },

    mrp: function () {
      return wizardSection(
        "mrp",
        "Multirisque professionnelle",
        fieldRow(
          input("mrpActivity", "Activite / secteur", "text", "Ex. restauration", true) +
            select("mrpPremises", "Locaux", [
              { v: "locataire", t: "Locataire" },
              { v: "proprio", t: "Proprietaire" },
              { v: "domicile", t: "Activite au domicile" },
            ])
        ) +
          fieldRow(
            input("mrpSurface", "Surface locaux (m2)", "text", "Ex. 120", false) +
              input("mrpStockValue", "Valeur stock / materiel (EUR)", "text", "Ex. 40000", false)
          ) +
          fieldRow(
            select("mrpTurnover", "CA annuel", [
              { v: "moins100", t: "Moins de 100 kEUR" },
              { v: "100-500", t: "100 a 500 kEUR" },
              { v: "plus500", t: "Plus de 500 kEUR" },
            ]) +
              select("mrpPerteExploit", "Perte d exploitation", [
                { v: "oui", t: "Souhaitee" },
                { v: "non", t: "Non necessaire" },
                { v: "ns", t: "A definir" },
              ], false)
          )
      );
    },

    "pj-pro": function () {
      return wizardSection(
        "pj-pro",
        "Protection juridique professionnelle",
        fieldRow(
          input("pjProActivity", "Activite", "text", "Ex. e-commerce", true) +
            select("pjProSize", "Taille", [
              { v: "solo", t: "Auto-entrepreneur / solo" },
              { v: "tpe", t: "TPE (1-9 salaries)" },
              { v: "pme", t: "PME (10+ salaries)" },
            ])
        ) +
          fieldRow(
            select("pjProRisks", "Risques principaux", [
              { v: "clients", t: "Litiges clients" },
              { v: "fournisseurs", t: "Fournisseurs / sous-traitance" },
              { v: "social", t: "Social / URSSAF" },
              { v: "mix", t: "Plusieurs" },
            ]) +
              select("pjProDispute", "Litige en cours", [
                { v: "non", t: "Non" },
                { v: "oui", t: "Oui" },
              ], false)
          ) +
          textarea("pjProDetails", "Contexte", "Contrats, pays, volume…", false)
      );
    },

    dirigeant: function () {
      return wizardSection(
        "dirigeant",
        "Assurance dirigeant / homme cle",
        fieldRow(
          select("keyPersonRole", "Fonction", [
            { v: "gerant", t: "Gerant / president" },
            { v: "associe", t: "Associe majoritaire" },
            { v: "expert", t: "Expert / homme cle" },
          ]) +
            input("keyPersonAge", "Age du dirigeant", "number", "Ex. 45", true)
        ) +
          fieldRow(
            input("keyPersonIncome", "Revenu ou remuneration annuelle (EUR)", "text", "Ex. 72000", true) +
              select("keyPersonCover", "Couverture recherchee", [
                { v: "deces", t: "Deces" },
                { v: "invalidite", t: "Invalidite" },
                { v: "itt", t: "Arret de travail" },
                { v: "pack", t: "Pack complet" },
              ])
          ) +
          fieldRow(
            select("keyPersonCompany", "Structure", [
              { v: "sasu", t: "SASU / SAS" },
              { v: "sarl", t: "SARL / EURL" },
              { v: "ei", t: "EI / micro" },
              { v: "autre", t: "Autre" },
            ], false) +
              input("keyPersonCapital", "Capital a garantir (EUR)", "text", "Facultatif", false)
          )
      );
    },

    retraite: function () {
      return wizardSection(
        "retraite",
        "Retraite supplementaire",
        fieldRow(
          select("retireGoal", "Objectif", [
            { v: "complement", t: "Completer les revenus" },
            { v: "optimiser", t: "Optimiser la fiscalite" },
            { v: "transmission", t: "Preparer la transmission" },
          ]) +
            input("retireAge", "Age actuel", "number", "Ex. 42", true)
        ) +
          fieldRow(
            select("retireHorizon", "Horizon avant retraite", [
              { v: "moins10", t: "Moins de 10 ans" },
              { v: "10-20", t: "10 a 20 ans" },
              { v: "plus20", t: "Plus de 20 ans" },
            ]) +
              input("retireMonthly", "Versement mensuel envisage (EUR)", "text", "Ex. 200", false)
          ) +
          fieldRow(
            select("retireVehicle", "Support connu", [
              { v: "per", t: "PER" },
              { v: "assurance_vie", t: "Assurance vie" },
              { v: "article83", t: "Article 83 / 39" },
              { v: "ns", t: "A definir avec le conseiller" },
            ], false) +
              select("retireStatus", "Statut", [
                { v: "salarie", t: "Salarie" },
                { v: "tns", t: "TNS" },
                { v: "deja_retraite", t: "Deja retraite" },
              ])
          )
      );
    },

    gav: function () {
      return wizardSection(
        "gav",
        "Garantie accidents de la vie",
        fieldRow(
          select("gavHousehold", "Personnes a couvrir", [
            { v: "solo", t: "Moi seul(e)" },
            { v: "couple", t: "Couple" },
            { v: "famille", t: "Famille" },
          ]) +
            select("gavPriority", "Priorite", [
              { v: "invalidite", t: "Invalidite / dependance" },
              { v: "deces", t: "Capital deces accident" },
              { v: "itt", t: "Incapacite temporaire" },
              { v: "pack", t: "Pack complet" },
            ])
        ) +
          fieldRow(
            select("gavSports", "Sports / loisirs a risque", [
              { v: "non", t: "Non" },
              { v: "oui", t: "Oui (ski, VTT, escalade…)" },
            ], false) +
              select("gavExisting", "Contrat GAV existant", [
                { v: "non", t: "Non" },
                { v: "oui", t: "Oui, a comparer" },
              ], false)
          )
      );
    },

    pj: function () {
      return wizardSection(
        "pj",
        "Protection juridique particulier",
        fieldRow(
          select("pjScope", "Domaines concernes", [
            { v: "habitat", t: "Logement / voisinage" },
            { v: "conso", t: "Consommation" },
            { v: "travail", t: "Travail" },
            { v: "famille", t: "Famille / succession" },
            { v: "multi", t: "Plusieurs domaines" },
          ]) +
            select("pjDispute", "Litige en cours", [
              { v: "non", t: "Non, prevention" },
              { v: "oui", t: "Oui, besoin immediat" },
            ])
        ) +
          fieldRow(
            select("pjHousing", "Statut logement", [
              { v: "locataire", t: "Locataire" },
              { v: "proprio", t: "Proprietaire" },
              { v: "autre", t: "Autre" },
            ], false) +
              textarea("pjDetails", "Precision", "Type de litige, echeance…", false)
          )
      );
    },

    famille: function () {
      return wizardSection(
        "famille",
        "Assurance scolaire et famille",
        fieldRow(
          select("schoolCover", "Besoin", [
            { v: "scolaire", t: "Assurance scolaire" },
            { v: "extra", t: "Extra-scolaire (sport, colonie)" },
            { v: "famille", t: "Pack famille" },
          ]) +
            input("schoolChildren", "Nombre d enfants", "number", "Ex. 2", true)
        ) +
          fieldRow(
            input("schoolLevel", "Niveau scolaire", "text", "Ex. college, lycee", true) +
              select("schoolActivities", "Activites", [
                { v: "standard", t: "Scolarite classique" },
                { v: "sport", t: "Sport intensif" },
                { v: "internat", t: "Internat / etudes a l etranger" },
              ], false)
          ) +
          fieldRow(
            select("schoolStart", "Date de reprise", [
              { v: "rentree", t: "Rentrée scolaire" },
              { v: "immediat", t: "Des maintenant" },
              { v: "info", t: "Information" },
            ], false) +
              select("schoolExisting", "Contrat en cours", [
                { v: "non", t: "Non" },
                { v: "oui", t: "Oui" },
              ], false)
          )
      );
    },

    tns: function () {
      return wizardSection(
        "tns",
        "Profil TNS",
        fieldRow(
          input("tnsProfession", "Profession / activite", "text", "Ex. infirmier liberal", true) +
            select("tnsRegime", "Regime", [
              { v: "ssi", t: "SSI / RSI artisans" },
              { v: "cipav", t: "CIPAV" },
              { v: "carmf", t: "CARMF / CARCDSF…" },
              { v: "autre", t: "Autre" },
            ])
        ) +
          fieldRow(
            select("tnsNeeds", "Besoins", [
              { v: "sante", t: "Mutuelle sante" },
              { v: "prev", t: "Prevoyance" },
              { v: "both", t: "Sante + prevoyance" },
            ]) +
              input("tnsCa", "Revenu annuel (EUR)", "text", "Facultatif", false)
          )
      );
    },

    collective: function () {
      return wizardSection(
        "collective",
        "Mutuelle collective",
        fieldRow(
          input("collectiveCompany", "Raison sociale", "text", "Ex. SARL Dupont", true) +
            input("collectiveSiret", "SIRET (facultatif)", "text", "14 chiffres", false)
        ) +
          fieldRow(
            input("collectiveHeadcount", "Effectif a couvrir", "number", "Ex. 12", true) +
              select("collectiveStatus", "Statut majoritaire", [
                { v: "cadres", t: "Cadres" },
                { v: "non_cadres", t: "Non-cadres" },
                { v: "ensemble", t: "Ensemble du personnel" },
              ])
          ) +
          fieldRow(
            select("collectiveCurrent", "Contrat actuel", [
              { v: "aucun", t: "Pas de mutuelle" },
              { v: "en_cours", t: "Mutuelle en cours" },
              { v: "renouvellement", t: "Renouvellement / mise en concurrence" },
            ]) +
              input("collectiveBudget", "Budget cible par salarie / mois", "text", "Ex. 45 EUR", false)
          )
      );
    },

    deces: function () {
      return wizardSection(
        "deces",
        "Assurance deces et obseques",
        '<p class="small">Capital deces ou contrat obsèques — pas d assurance voyage ni rapatriement sanitaire.</p>' +
          fieldRow(
            select("decesGoal", "Objectif principal", [
              { v: "capital", t: "Capital deces (proteger la famille)" },
              { v: "obseques", t: "Financer les frais d obseques" },
              { v: "both", t: "Capital + obsèques" },
              { v: "pret", t: "Couvrir un pret / emprunt en cours" },
            ]) +
              select("decesContractType", "Type de contrat souhaite", [
                { v: "capital", t: "Contrat en capital (versement aux beneficiaires)" },
                { v: "prestations", t: "Contrat en prestations (organisation funeraire)" },
                { v: "ns", t: "A definir avec le conseiller" },
              ])
          ) +
          fieldRow(
            input("decesCapital", "Capital ou budget obsèques (EUR)", "text", "Ex. 8000", true) +
              select("decesCeremony", "Formule funeraire envisagee", [
                { v: "inhumation", t: "Inhumation" },
                { v: "cremation", t: "Cremation" },
                { v: "nature", t: "Obseques naturelles" },
                { v: "undecided", t: "Pas encore decide" },
              ], false)
          ) +
          fieldRow(
            input("decesInsuredAge", "Age de l assure", "number", "Ex. 55", true) +
              select("decesStatus", "Statut", [
                { v: "salarie", t: "Salarie" },
                { v: "retraite", t: "Retraite" },
                { v: "tns", t: "Independant / TNS" },
                { v: "sans_emploi", t: "Sans emploi" },
                { v: "autre", t: "Autre" },
              ])
          ) +
          fieldRow(
            select("decesSmoker", "Fumeur", [
              { v: "non", t: "Non" },
              { v: "oui", t: "Oui" },
              { v: "ns", t: "Prefere ne pas repondre" },
            ], false) +
              select("decesExistingCover", "Couverture deces existante", [
                { v: "aucune", t: "Aucune" },
                { v: "emprunteur", t: "Assurance emprunteur" },
                { v: "employeur", t: "Prevoyance employeur" },
                { v: "autre", t: "Autre contrat" },
              ], false)
          ) +
          fieldRow(
            input("decesBeneficiary", "Beneficiaire principal", "text", "Conjoint, enfants, pompe funebre…", false) +
              input("decesLoanRemaining", "Capital pret a couvrir (EUR)", "text", "Facultatif", false)
          ) +
          fieldRow(
            textarea(
              "decesWishes",
              "Volontes funeraires (facultatif)",
              "Ceremonie, lieu, prestations souhaitees…",
              false
            )
          )
      );
    },

    prevoyance: function () {
      return wizardSection(
        "prevoyance",
        "Prevoyance",
        fieldRow(
          select("prevStatus", "Statut", [
            { v: "salarie", t: "Salarie" },
            { v: "tns", t: "Independant / TNS" },
            { v: "dirigeant", t: "Dirigeant" },
          ]) +
            select("prevRisks", "Risques a couvrir", [
              { v: "itt", t: "Arret de travail" },
              { v: "invalidite", t: "Invalidite" },
              { v: "deces", t: "Deces" },
              { v: "pack", t: "Pack complet" },
            ])
        ) +
          fieldRow(
            input("prevIncome", "Revenu mensuel a proteger (EUR)", "text", "Ex. 3000", true) +
              select("prevWaitingPeriod", "Franchise ITT acceptable", [
                { v: "30", t: "30 jours" },
                { v: "60", t: "60 jours" },
                { v: "90", t: "90 jours et plus" },
              ], false)
          )
      );
    },

    emprunteur: function () {
      return wizardSection(
        "emprunteur",
        "Assurance emprunteur",
        fieldRow(
          select("borrowerGoal", "Projet", [
            { v: "nouveau", t: "Nouveau pret" },
            { v: "lemoine", t: "Changement (loi Lemoine)" },
            { v: "renégociation", t: "Renegociation pret + assurance" },
          ]) +
            input("borrowerRemaining", "Capital restant du (EUR)", "text", "Ex. 150000", false)
        ) +
          fieldRow(
            input("borrowerRate", "Taux actuel (%)", "text", "Ex. 3,2", false) +
              input("borrowerDuration", "Duree restante (ans)", "text", "Ex. 18", false)
          ) +
          fieldRow(
            select("borrowerSmoker", "Fumeur", [
              { v: "non", t: "Non" },
              { v: "oui", t: "Oui" },
            ]) +
              input("borrowerAge", "Age de l emprunteur", "number", "Ex. 42", true)
          )
      );
    },

    pno: function () {
      return wizardSection(
        "pno",
        "Proprietaire non occupant",
        fieldRow(
          select("pnoRental", "Type de location", [
            { v: "nu", t: "Location nue" },
            { v: "meublee", t: "Meublee" },
            { v: "saisonniere", t: "Saisonniere" },
          ]) +
            input("pnoUnits", "Nombre de biens", "number", "Ex. 1", true)
        ) +
          fieldRow(
            input("pnoAddress", "Ville du bien", "text", "Ex. Bordeaux", true) +
              input("pnoSurface", "Surface (m2)", "text", "Ex. 55", false)
          )
      );
    },

    immo: function () {
      return wizardSection(
        "immo",
        "Credit immobilier",
        fieldRow(
          select("immoProjectStage", "Ou en etes-vous ?", [
            { v: "recherche", t: "En recherche de bien" },
            { v: "offre", t: "Offre acceptee / compromis" },
            { v: "signe", t: "Acte prevu" },
          ]) +
            input("immoPropertyPrice", "Prix du bien (EUR)", "text", "Ex. 280000", true)
        ) +
          fieldRow(
            input("immoContribution", "Apport personnel (EUR)", "text", "Ex. 40000", false) +
              select("immoProjectType", "Type de projet", [
                { v: "rp", t: "Residence principale" },
                { v: "locatif", t: "Investissement locatif" },
                { v: "secondaire", t: "Residence secondaire" },
              ])
          )
      );
    },

    "acheteur-immo": function () {
      return (
        wizardSection(
          "acheteur-immo",
          "Parcours acquereur immobilier",
          '<p class="small">Pret, assurance emprunteur, habitation, PNO ou locataire — indiquez vos besoins.</p>' +
            fieldRow(
              select("buyerNeedPret", "Pret immobilier a etudier ?", [
                { v: "oui", t: "Oui" },
                { v: "non", t: "Non" },
                { v: "peut_etre", t: "A definir" },
              ]) +
                select("buyerNeedEmprunteur", "Assurance emprunteur ?", [
                  { v: "oui", t: "Oui (delegation)" },
                  { v: "non", t: "Non" },
                  { v: "banque", t: "Via la banque" },
                ])
            ) +
            fieldRow(
              select("currentHousingStatus", "Logement actuel", [
                { v: "locataire", t: "Locataire" },
                { v: "proprio", t: "Proprietaire occupant" },
                { v: "bailleur", t: "Proprietaire bailleur (PNO)" },
                { v: "autre", t: "Autre" },
              ]) +
                select("referredBy", "Accompagne par", [
                  { v: "negociateur", t: "Negociateur immobilier" },
                  { v: "agence", t: "Agence / mandataire" },
                  { v: "seul", t: "Seul(e)" },
                ])
            ) +
            fieldRow(
              select("buyerNeedHabitation", "Assurance habitation (future RP) ?", [
                { v: "oui", t: "Oui" },
                { v: "non", t: "Non" },
              ]) +
                select("buyerNeedPno", "PNO (bien loue) ?", [
                  { v: "oui", t: "Oui" },
                  { v: "non", t: "Non" },
                ])
            )
        ) +
        '<p class="small"><a href="../landings/acheteur-immo.html">Questionnaire complet acquereur →</a></p>'
      );
    },

    decennale: function () {
      return wizardSection(
        "decennale",
        "Assurance decennale",
        fieldRow(
          input("decennaleTrade", "Metier / corps d etat", "text", "Ex. maconnerie", true) +
            select("decennaleExperience", "Experience", [
              { v: "0-3", t: "Moins de 3 ans" },
              { v: "3-10", t: "3 a 10 ans" },
              { v: "10plus", t: "Plus de 10 ans" },
            ])
        ) +
          fieldRow(
            input("decennaleCa", "CA annuel travaux (EUR)", "text", "Ex. 250000", true) +
              select("decennaleClaims", "Sinistres decennale", [
                { v: "aucun", t: "Aucun" },
                { v: "ancien", t: "Sinistre ancien" },
                { v: "en_cours", t: "Sinistre en cours" },
              ], false)
          )
      );
    },

    "rc-pro": function () {
      return wizardSection(
        "rc-pro",
        "RC professionnelle",
        fieldRow(
          input("rcProActivity", "Activite declaree", "text", "Ex. coach sportif", true) +
            select("rcProTurnover", "CA annuel", [
              { v: "moins50", t: "Moins de 50 kEUR" },
              { v: "50-150", t: "50 a 150 kEUR" },
              { v: "150plus", t: "Plus de 150 kEUR" },
            ])
        ) +
          fieldRow(
            select("rcProClaims", "Sinistres RC 5 ans", [
              { v: "aucun", t: "Aucun" },
              { v: "1", t: "1 sinistre" },
              { v: "2plus", t: "2 et plus" },
            ], false) +
              textarea("rcProDescription", "Description de l activite", "Clients, sous-traitance, deplacements…", false)
          )
      );
    },

    "assurance-vie": function () {
      return wizardSection(
        "assurance-vie",
        "Assurance vie / epargne",
        fieldRow(
          select("lifeContractType", "Type de contrat", [
            { v: "fonds_euros", t: "Fonds euros securise" },
            { v: "uc", t: "Unités de compte" },
            { v: "mix", t: "Mixte" },
          ]) +
            input("lifeInitial", "Versement initial (EUR)", "text", "Ex. 10000", true)
        ) +
          fieldRow(
            select("lifeGoal", "Objectif", [
              { v: "epargne", t: "Epargne disponible" },
              { v: "retraite", t: "Retraite" },
              { v: "transmission", t: "Transmission" },
            ]) +
              select("lifeTaxOption", "Fiscalite connue", [
                { v: "ns", t: "A definir avec le conseiller" },
                { v: "pfu", t: "PFU / flat tax" },
                { v: "ir", t: "IR / TMI" },
              ], false)
          )
      );
    },

    animaux: function () {
      return animauxWizardSection();
    },

    chasse: function () {
      return wizardSection(
        "chasse",
        "Assurance chasse",
        fieldRow(
          select("huntLicense", "Permis de chasser", [
            { v: "oui", t: "Oui, valide" },
            { v: "formation", t: "En formation" },
          ]) +
            select("huntCover", "Couverture", [
              { v: "rc", t: "RC chasseur" },
              { v: "journee", t: "Journee / passage" },
              { v: "saison", t: "Saison complete" },
            ])
        ) +
          fieldRow(
            select("huntWeapon", "Type d armes", [
              { v: "carabine", t: "Carabine" },
              { v: "fusil", t: "Fusil" },
              { v: "plusieurs", t: "Plusieurs" },
            ], false) +
              input("huntDepartment", "Departement principal", "text", "Ex. 33", false)
          )
      );
    },

    equitation: function () {
      return wizardSection(
        "equitation",
        "Assurance equitation",
        fieldRow(
          select("equineRole", "Vous etes", [
            { v: "cavalier", t: "Cavalier particulier" },
            { v: "proprietaire", t: "Proprietaire de cheval" },
            { v: "ecurie", t: "Ecurie / centre" },
          ]) +
            input("equineHorseValue", "Valeur du cheval (EUR)", "text", "Facultatif", false)
        ) +
          fieldRow(
            select("equineDiscipline", "Discipline", [
              { v: "loisir", t: "Loisir" },
              { v: "csO", t: "CSO / dressage" },
              { v: "course", t: "Courses" },
            ], false) +
              textarea("equineDetails", "Precision", "Nombre de chevaux, competition…", false)
          )
      );
    },

    bateau: function () {
      return wizardSection(
        "bateau",
        "Bateau plaisance",
        fieldRow(
          select("boatType", "Type", [
            { v: "voilier", t: "Voilier" },
            { v: "moteur", t: "Bateau a moteur" },
            { v: "jet", t: "Jet-ski" },
          ]) +
            input("boatLength", "Longueur (m)", "text", "Ex. 8", true)
        ) +
          fieldRow(
            select("boatZone", "Zone de navigation", [
              { v: "cotiere", t: "Cotiere" },
              { v: "large", t: "Large" },
              { v: "fluvial", t: "Fluvial" },
            ]) +
              input("boatValue", "Valeur bateau (EUR)", "text", "Ex. 35000", false)
          )
      );
    },

    caravane: function () {
      return wizardSection(
        "caravane",
        "Caravane / camping-car",
        fieldRow(
          select("rvType", "Type", [
            { v: "caravane", t: "Caravane" },
            { v: "cc", t: "Camping-car" },
            { v: "fourgon", t: "Fourgon amenage" },
          ]) +
            input("rvYear", "Annee", "text", "Ex. 2018", true)
        ) +
          fieldRow(
            input("rvValue", "Valeur (EUR)", "text", "Ex. 45000", false) +
              select("rvUsage", "Usage annuel", [
                { v: "moins30", t: "Moins de 30 jours" },
                { v: "30-90", t: "30 a 90 jours" },
                { v: "plus90", t: "Plus de 90 jours" },
              ], false)
          )
      );
    },

    instrument: function () {
      return wizardSection(
        "instrument",
        "Instrument de musique",
        fieldRow(
          input("musicInstrument", "Instrument", "text", "Ex. violon", true) +
            input("musicValue", "Valeur (EUR)", "text", "Ex. 8000", true)
        ) +
          fieldRow(
            select("musicUsage", "Usage", [
              { v: "perso", t: "Personnel" },
              { v: "pro", t: "Professionnel / scene" },
            ]) +
              select("musicTransport", "Transport frequent", [
                { v: "oui", t: "Oui" },
                { v: "non", t: "Non" },
              ], false)
          )
      );
    },

    "materiel-photo": function () {
      return wizardSection(
        "materiel-photo",
        "Materiel photo / video",
        fieldRow(
          input("photoKitValue", "Valeur totale du materiel (EUR)", "text", "Ex. 12000", true) +
            select("photoUsage", "Usage", [
              { v: "amateur", t: "Amateur passionne" },
              { v: "pro", t: "Professionnel" },
            ])
        ) +
          fieldRow(
            select("photoMobility", "Deplacements", [
              { v: "local", t: "Local" },
              { v: "national", t: "France" },
              { v: "international", t: "International" },
            ], false) +
              textarea("photoGearList", "Liste indicative", "Boitier, objectifs, drone…", false)
          )
      );
    },

    autre: function () {
      return wizardSection(
        "autre",
        "Precisez votre besoin",
        textarea("customNeed", "Decrivez votre besoin assurance ou financement", "Type de risque, echeance, contexte…", true) +
          fieldRow(
            select("customUrgency", "Urgence", [
              { v: "normal", t: "Sous 48h" },
              { v: "urgent", t: "Aujourd hui / demain" },
              { v: "veille", t: "Simple information" },
            ]) +
              input("customBudget", "Budget indicatif (EUR/mois)", "text", "Facultatif", false)
          )
      );
    },
  };

  /** Niches sans overlay dedie utilisent l etape niches generique */
  var NICHE_NEEDS = ["chasse", "equitation", "instrument", "materiel-photo", "bateau", "caravane"];

  function contextForService(service) {
    var need = service.need;
    var cat = service.category || "patrimoine";

    if (typeof NEED_OVERLAYS[need] === "function") {
      return NEED_OVERLAYS[need]();
    }

    if (cat === "niches" || NICHE_NEEDS.indexOf(need) >= 0) {
      return CATEGORY_CONTEXT.niches();
    }

    var fn = CATEGORY_CONTEXT[cat];
    if (fn) return fn();
    return CATEGORY_CONTEXT.patrimoine();
  }

  global.QUESTIONNAIRE_CONFIG = {
    fieldRow: fieldRow,
    select: select,
    input: input,
    textarea: textarea,
    CATEGORY_CONTEXT: CATEGORY_CONTEXT,
    NEED_OVERLAYS: NEED_OVERLAYS,
    contextForService: contextForService,
  };
})(typeof window !== "undefined" ? window : global);
