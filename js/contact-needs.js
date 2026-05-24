/**
 * Remplit les listes « besoin » depuis SERVICE_CATALOG et affiche le lien questionnaire.
 */
(function () {
  var CATEGORY_ORDER = ["mobilite", "sante", "habitat", "finance", "pro", "patrimoine"];

  function populateContactSelect(selectEl) {
    var catalog = window.SERVICE_CATALOG;
    if (!catalog || !selectEl) return;

    var current = selectEl.value;
    selectEl.innerHTML = '<option value="">Quel est votre besoin ?</option>';

    CATEGORY_ORDER.forEach(function (catId) {
      var cat = catalog.CATEGORIES[catId];
      if (!cat) return;
      var group = document.createElement("optgroup");
      group.label = cat.label;
      Object.keys(catalog.SERVICES).forEach(function (key) {
        var svc = catalog.SERVICES[key];
        if (svc.category !== catId) return;
        var opt = document.createElement("option");
        opt.value = svc.need;
        opt.textContent = svc.label;
        group.appendChild(opt);
      });
      if (group.children.length) selectEl.appendChild(group);
    });

    if (current) selectEl.value = current;
  }

  function ensureHint(selectEl) {
    var hint = document.getElementById("contactDevisHint");
    if (hint) return hint;
    hint = document.createElement("p");
    hint.id = "contactDevisHint";
    hint.className = "form-hint";
    hint.hidden = true;
    selectEl.parentNode.insertBefore(hint, selectEl.nextSibling);
    return hint;
  }

  function updateDevisHint(selectEl) {
    var catalog = window.SERVICE_CATALOG;
    var hint = ensureHint(selectEl);
    if (!catalog || !hint) return;

    var need = selectEl.value;
    if (!need) {
      hint.hidden = true;
      return;
    }

    var url = catalog.getDevisUrl(need, { fromServicesPage: true });
    var svc = catalog.getService(need);
    var label = svc ? svc.label : need;

    hint.hidden = false;
    hint.innerHTML =
      'Questionnaire detaille pour <strong>' +
      label +
      '</strong> : <a href="' +
      url +
      '">Remplir le devis en ligne</a>';
  }

  document.addEventListener("DOMContentLoaded", function () {
    var catalog = window.SERVICE_CATALOG;
    if (!catalog) return;

    var selectEl = document.querySelector('#contactForm select[name="need"]');
    if (!selectEl) return;

    populateContactSelect(selectEl);

    var needParam = new URLSearchParams(window.location.search).get("need");
    if (needParam) {
      var safe = needParam.replace(/"/g, "");
      if (catalog.getService(safe)) selectEl.value = safe;
    }

    updateDevisHint(selectEl);
    selectEl.addEventListener("change", function () {
      updateDevisHint(selectEl);
    });

    if (window.location.hash === "#contact" && needParam) {
      var contactEl = document.getElementById("contact");
      if (contactEl) contactEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
})();
