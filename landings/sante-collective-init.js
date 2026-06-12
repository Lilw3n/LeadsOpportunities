(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var catalog = window.SERVICE_CATALOG;
    var stepsBuilder = window.DEVIS_STEPS;
    if (!catalog || !stepsBuilder) return;

    var service = catalog.getService("collective");
    if (!service) return;

    var mount = document.getElementById("wizardStepsMount");
    if (mount) {
      mount.innerHTML = stepsBuilder.buildWizardHtml(service);
    }

    var form = document.getElementById("devisForm");
    if (form) {
      form.dataset.vertical = service.vertical || service.need;
      form.dataset.serviceNeed = service.need;
      if (window.DevisDocumentUpload && window.DevisDocumentUpload.mountInForm) {
        window.DevisDocumentUpload.mountInForm(form, service.need);
      }
    }
  });
})();
