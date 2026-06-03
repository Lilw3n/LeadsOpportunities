/**
 * Genere les etapes du questionnaire devis selon la categorie et le produit (need).
 */
(function (global) {
  var QC = global.QUESTIONNAIRE_CONFIG;

  function fieldRow(html) {
    return QC ? QC.fieldRow(html) : '<div class="grid">' + html + "</div>";
  }

  function select(name, label, options, required) {
    return QC
      ? QC.select(name, label, options, required)
      : "<label>" + label + '<select name="' + name + '"></select></label>';
  }

  function input(name, label, type, placeholder, required) {
    return QC
      ? QC.input(name, label, type, placeholder, required)
      : "<label>" + label + '<input name="' + name + '" /></label>';
  }

  function stepIdentity() {
    return (
      '<section class="wizard-step" data-step="identity" data-step-name="identity">' +
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

  function stepServicePicker(catalog) {
    var categories = catalog.CATEGORIES;
    var services = catalog.SERVICES;
    var catButtons = Object.keys(categories)
      .map(function (k) {
        return (
          '<button type="button" class="picker-cat" data-picker-cat="' +
          k +
          '">' +
          categories[k].label +
          "</button>"
        );
      })
      .join("");

    var options = Object.keys(services)
      .map(function (need) {
        var s = services[need];
        return (
          '<option value="' +
          need +
          '" data-cat="' +
          s.category +
          '">' +
          s.label +
          "</option>"
        );
      })
      .join("");

    return (
      '<section class="wizard-step" data-step="picker" data-step-name="picker">' +
      "<h3>Quel produit recherchez-vous ?</h3>" +
      '<p class="small">Parcourez toutes nos assurances et financements — plus de 30 prestations.</p>' +
      '<div class="picker-cats" role="tablist">' +
      '<button type="button" class="picker-cat is-active" data-picker-cat="all">Tout</button>' +
      catButtons +
      "</div>" +
      fieldRow(
        '<label class="picker-select-label">Prestation<select name="needPicker" id="needPicker" required>' +
          '<option value="">Choisir une prestation...</option>' +
          options +
          "</select></label>"
      ) +
      '<p class="small picker-hint" id="pickerHint">Selectionnez une categorie pour filtrer la liste.</p>' +
      "</section>"
    );
  }

  function stepContextForService(service) {
    if (QC && QC.contextForService) {
      return QC.contextForService(service);
    }
    return "";
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
      fieldRow(
        select("hasAnimaux", "Assurance animaux ?", [
          { v: "", t: "Ne pas repondre" },
          { v: "oui", t: "Oui" },
          { v: "non", t: "Non" },
        ], false) +
          select("hasRcPro", "RC professionnelle ?", [
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
      '<section class="wizard-step" hidden data-step="budget" data-step-name="budget">' +
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
      '<section class="wizard-step" hidden data-step="finalize" data-step-name="finalize">' +
      "<h3>Validation</h3>" +
      '<p class="small">Un conseiller vous rappelle pour finaliser votre devis personnalise.</p>' +
      '<label class="field-check">' +
      '<input type="checkbox" name="rgpd" value="1" required />' +
      "<span>J accepte d etre contacte et j ai lu la <a href=\"../politique-confidentialite.html\">politique de confidentialite</a>.</span>" +
      "</label>" +
      "</section>"
    );
  }

  function buildWizardHtml(service, options) {
    options = options || {};
    var parts = [];

    if (options.includePicker) {
      parts.push(stepServicePicker(options.catalog || { CATEGORIES: {}, SERVICES: {} }));
    }

    parts.push(stepIdentity());
    parts.push(stepContextForService(service));
    parts.push(stepPortefeuille());
    parts.push(stepBudget());
    parts.push(stepFinalize());

    return parts.join("");
  }

  global.DEVIS_STEPS = {
    buildWizardHtml: buildWizardHtml,
    stepServicePicker: stepServicePicker,
  };
})(typeof window !== "undefined" ? window : global);
