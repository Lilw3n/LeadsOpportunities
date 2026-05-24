/**
 * Genere les etapes du questionnaire devis selon la categorie de service.
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
      "><option value=\"\">Choisir...</option>" +
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

  function stepIdentity() {
    return (
      '<section class="wizard-step" data-step="identity">' +
      "<h3>Vos coordonnees</h3>" +
      fieldRow(
        select("civility", "Civilite", [
          { v: "M", t: "M." },
          { v: "Mme", t: "Mme" },
        ]) +
          input("firstName", "Prenom", "text", "Jean", true) +
          input("lastName", "Nom", "text", "Dupont", true)
      ) +
      fieldRow(
        input("email", "E-mail", "email", "vous@email.fr", true) +
          input("phone", "Telephone mobile", "tel", "06 / 07...", true)
      ) +
      fieldRow(input("postalCode", "Code postal", "text", "75001", true)) +
      "</section>"
    );
  }

  function stepContextMobilite() {
    return (
      '<section class="wizard-step" hidden data-step="context">' +
      "<h3>Votre vehicule</h3>" +
      fieldRow(
        select("vehicleType", "Type de vehicule", [
          { v: "auto", t: "Voiture" },
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
        ], false)
      ) +
      "</section>"
    );
  }

  function stepContextSante() {
    return (
      '<section class="wizard-step" hidden data-step="context">' +
      "<h3>Votre profil sante</h3>" +
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
      ) +
      "</section>"
    );
  }

  function stepContextHabitat() {
    return (
      '<section class="wizard-step" hidden data-step="context">' +
      "<h3>Votre logement</h3>" +
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
      ) +
      "</section>"
    );
  }

  function stepContextFinance() {
    return (
      '<section class="wizard-step" hidden data-step="context">' +
      "<h3>Votre projet de financement</h3>" +
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
      ) +
      "</section>"
    );
  }

  function stepContextPro() {
    return (
      '<section class="wizard-step" hidden data-step="context">' +
      "<h3>Votre activite professionnelle</h3>" +
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
      "</div>" +
      "</section>"
    );
  }

  function stepContextPatrimoine() {
    return (
      '<section class="wizard-step" hidden data-step="context">' +
      "<h3>Vos objectifs patrimoniaux</h3>" +
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
      ) +
      "</section>"
    );
  }

  function stepPortefeuille() {
    return (
      '<section class="wizard-step" hidden data-step="portefeuille" data-step-name="portefeuille">' +
      "<h3>Vos autres contrats (optionnel)</h3>" +
      '<p class="small">Confidentiel — opportunites multi-contrats pour votre conseiller.</p>' +
      fieldRow(
        select("hasMutuelle", "Mutuelle sante ?", [
          { v: "", t: "Ne pas repondre" },
          { v: "oui", t: "Oui" },
          { v: "non", t: "Non" },
        ], false) +
          select("hasAutoInsurance", "Assurance auto ?", [
            { v: "", t: "Ne pas repondre" },
            { v: "oui", t: "Oui" },
            { v: "non", t: "Non" },
          ], false)
      ) +
      fieldRow(
        select("hasHabitation", "Assurance habitation ?", [
          { v: "", t: "Ne pas repondre" },
          { v: "oui", t: "Oui" },
          { v: "non", t: "Non" },
        ], false) +
          select("hasCreditImmo", "Credit immobilier ?", [
            { v: "", t: "Ne pas repondre" },
            { v: "oui", t: "Oui" },
            { v: "non", t: "Non" },
          ], false)
      ) +
      "</section>"
    );
  }

  function stepBudget() {
    return (
      '<section class="wizard-step" hidden data-step="budget">' +
      "<h3>Budget et delai</h3>" +
      fieldRow(
        select("monthlyBudget", "Budget mensuel cible", [
          { v: "moins30", t: "Moins de 30 EUR / mois" },
          { v: "30-60", t: "30 a 60 EUR / mois" },
          { v: "60-100", t: "60 a 100 EUR / mois" },
          { v: "plus100", t: "Plus de 100 EUR / mois" },
          { v: "ns", t: "A definir avec le conseiller" },
        ]) +
          select("callbackPreference", "Horaire de rappel prefere", [
            { v: "matin", t: "Matin (9h-12h)" },
            { v: "midi", t: "Midi (12h-14h)" },
            { v: "aprem", t: "Apres-midi (14h-18h)" },
            { v: "soir", t: "Fin de journee" },
          ])
      ) +
      '<label>Precision utile<textarea name="details" rows="4" placeholder="Situation actuelle, echeance, contraintes..."></textarea></label>' +
      "</section>"
    );
  }

  function stepFinalize() {
    return (
      '<section class="wizard-step" hidden data-step="finalize">' +
      "<h3>Validation</h3>" +
      '<p class="small">Un conseiller vous rappelle pour finaliser votre devis personnalise.</p>' +
      '<label class="field-check">' +
      '<input type="checkbox" name="rgpd" value="1" required />' +
      "<span>J accepte d etre contacte et j ai lu la <a href=\"../politique-confidentialite.html\">politique de confidentialite</a>.</span>" +
      "</label>" +
      "</section>"
    );
  }

  function contextStepForCategory(categoryId) {
    if (categoryId === "mobilite") return stepContextMobilite();
    if (categoryId === "sante") return stepContextSante();
    if (categoryId === "habitat") return stepContextHabitat();
    if (categoryId === "finance") return stepContextFinance();
    if (categoryId === "pro") return stepContextPro();
    return stepContextPatrimoine();
  }

  function buildWizardHtml(service) {
    var cat = service.category || "patrimoine";
    return (
      stepIdentity() +
      contextStepForCategory(cat) +
      stepPortefeuille() +
      stepBudget() +
      stepFinalize()
    );
  }

  global.DEVIS_STEPS = {
    buildWizardHtml: buildWizardHtml,
  };
})(typeof window !== "undefined" ? window : global);
