(function () {
  function qs(id) {
    return document.getElementById(id);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var catalog = window.SERVICE_CATALOG;
    var stepsBuilder = window.DEVIS_STEPS;
    if (!catalog || !stepsBuilder) return;

    var params = new URLSearchParams(window.location.search);
    var need = params.get("need") || "autre";
    var service = catalog.getService(need) || catalog.getService("autre");

    var forceStandard =
      params.get("journey") === "standard" || params.get("wizard") === "1";
    if (
      !forceStandard &&
      service.landing &&
      service.landing.indexOf("devis.html") === -1 &&
      service.landing.indexOf("questionnaire.html") === -1
    ) {
      var dest = service.landing.replace(/^\.\/landings\//, "./");
      window.location.replace(dest + (window.location.search || ""));
      return;
    }

    var cat = catalog.CATEGORIES[service.category] || { label: "Assurance" };

    document.title = "Devis " + service.label + " | Leads Opportunities";

    var badge = qs("devisBadge");
    if (badge) badge.textContent = cat.label;

    var title = qs("devisTitle");
    if (title) title.textContent = "Devis : " + service.label;

    var subtitle = qs("devisSubtitle");
    if (subtitle) {
      subtitle.textContent =
        "Questionnaire " +
        cat.label.toLowerCase() +
        " — vos reponses permettent de categoriser automatiquement votre demande.";
    }

    var formTitle = qs("formTitle");
    if (formTitle) formTitle.textContent = service.label;

    var formLead = qs("formLead");
    if (formLead) {
      formLead.textContent =
        "Service selectionne : " +
        service.label +
        ". Un conseiller dedie vous rappelle avec une proposition adaptee.";
    }

    var catLabel = document.getElementById("wizardCategoryLabel");
    if (catLabel) catLabel.textContent = cat.label;

    var needField = qs("needField");
    var labelField = qs("serviceLabelField");
    var catField = qs("serviceCategoryField");
    if (needField) needField.value = service.need;
    if (labelField) labelField.value = service.label;
    if (catField) catField.value = service.category;

    var form = document.getElementById("devisForm");
    if (form) {
      form.dataset.vertical = service.vertical || service.need;
      form.dataset.serviceNeed = service.need;
    }

    var mount = document.getElementById("wizardStepsMount");
    if (mount) {
      mount.innerHTML = stepsBuilder.buildWizardHtml(service);
    }

    if (form && window.DevisDocumentUpload && window.DevisDocumentUpload.mountInForm) {
      window.DevisDocumentUpload.mountInForm(form, service.need);
    }

    if (window.LANDING_SEO && window.LANDING_SEO.applyForService) {
      window.LANDING_SEO.applyForService(service);
    }
  });
})();
